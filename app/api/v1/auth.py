from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, EmailStr
from app.core.database import get_db
from app.models.db_models import User, OTPCode, APIKey
from app.services.auth_service import auth_service
from app.services.email_service import email_service
from app.core.auth import generate_api_key

router = APIRouter(prefix="/v1/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str = None


class VerifyOTPRequest(BaseModel):
    email: EmailStr
    code: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
async def signup(req: SignupRequest, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == req.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(400, "Email already registered")

    # Create user (unverified)
    password_hash = auth_service.hash_password(req.password)
    user = User(
        email=req.email,
        password_hash=password_hash,
        full_name=req.full_name,
        company_name=req.company_name,
        is_verified="unverified"
    )
    db.add(user)
    await db.flush()

    # Generate and send OTP
    otp_code = auth_service.generate_otp()
    otp = OTPCode(
        email=req.email,
        code=otp_code,
        purpose="signup",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=10)
    )
    db.add(otp)

    email_service.send_otp_email(req.email, otp_code, "signup")

    return {"message": "OTP sent to your email", "email": req.email}


@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(OTPCode)
        .where(OTPCode.email == req.email, OTPCode.code == req.code, OTPCode.is_used == "unused")
        .order_by(OTPCode.created_at.desc())
    )
    otp = result.scalar_one_or_none()

    if not otp:
        raise HTTPException(400, "Invalid OTP code")

    from datetime import timezone
    if otp.expires_at < datetime.now(timezone.utc):
        raise HTTPException(400, "OTP code expired")

    otp.is_used = "used"

    # Mark user as verified
    user_result = await db.execute(select(User).where(User.email == req.email))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")

    user.is_verified = "verified"

    # Auto-generate API key on first verification
    # Auto-generate API key on first verification
    raw_key, key_hash = generate_api_key()
    api_key = APIKey(key_hash=key_hash, name="Default key", customer_email=user.email, user_id=user.id)
    db.add(api_key)
    token = auth_service.create_jwt_token(user.id, user.email)

    return {
        "message": "Email verified successfully",
        "token": token,
        "api_key": raw_key,
        "user": {"email": user.email, "full_name": user.full_name}
    }


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user or not auth_service.verify_password(req.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")

    if user.is_verified != "verified":
        raise HTTPException(403, "Please verify your email first")

    token = auth_service.create_jwt_token(user.id, user.email)

    return {
        "token": token,
        "user": {"email": user.email, "full_name": user.full_name}
    }


@router.get("/me")
async def get_current_user(authorization: str = Header(...), db: AsyncSession = Depends(get_db)):
    token = authorization.replace("Bearer ", "")
    try:
        payload = auth_service.decode_jwt_token(token)
    except Exception:
        raise HTTPException(401, "Invalid or expired token")

    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")

    return {"email": user.email, "full_name": user.full_name, "company_name": user.company_name}