import hashlib
import secrets
import os
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.db_models import APIKey

security = HTTPBearer()

def generate_api_key() -> tuple[str, str]:
    """
    Generate a new API key.
    Returns (raw_key, hashed_key).
    raw_key: shown to customer once, never stored by us
    hashed_key: stored in DB
    
    Format: vd_live_<32 random hex chars>
    The prefix helps customers identify which product the key belongs to
    and what environment it's for (live vs test).
    """
    raw_key = f"vd_live_{secrets.token_hex(32)}"
    hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
    return raw_key, hashed_key

def hash_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode()).hexdigest()

async def get_current_api_key(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = None
) -> APIKey:
    """
    FastAPI dependency: validates the Bearer token in every protected endpoint.
    
    Why a dependency? Because FastAPI's dependency injection system means
    you add 'api_key: APIKey = Depends(get_current_api_key)' to any endpoint
    that needs authentication. No boilerplate, no forgetting.
    """
    raw_key = credentials.credentials
    key_hash = hash_api_key(raw_key)

    result = await db.execute(
        select(APIKey).where(
            APIKey.key_hash == key_hash,
            APIKey.is_active == "active"
        )
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update request count
    api_key.total_requests += 1
    return api_key