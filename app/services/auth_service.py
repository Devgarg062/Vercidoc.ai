import bcrypt
import random
import os
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv
from fastapi import Header, HTTPException

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7  # 7 days

class AuthService:

    def hash_password(self, password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    def verify_password(self, password: str, password_hash: str) -> bool:
        return bcrypt.checkpw(password.encode(), password_hash.encode())

    def generate_otp(self) -> str:
        return str(random.randint(100000, 999999))

    def create_jwt_token(self, user_id: str, email: str) -> str:
        payload = {
            "sub": user_id,
            "email": email,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS)
        }
        return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

    def decode_jwt_token(self, token: str) -> dict:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


auth_service = AuthService()


def get_current_user_id(authorization: str = Header(...)) -> str:
    """
    FastAPI dependency that extracts and validates the user_id from a JWT Bearer token.
    Use this on any dashboard endpoint that needs to know which user is logged in.
    """
    token = authorization.replace("Bearer ", "")
    try:
        payload = auth_service.decode_jwt_token(token)
        return payload["sub"]
    except Exception:
        raise HTTPException(401, "Invalid or expired token")