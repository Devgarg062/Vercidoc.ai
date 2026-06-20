from sqlalchemy import Column, String, Float, Integer, DateTime, JSON, Text, Enum as SAEnum
from sqlalchemy.sql import func
from app.core.database import Base
from app.models.verification import DocumentType, VerificationStatus
import uuid

class VerificationJob(Base):
    """
    Every verification request creates a row here.
    This is your audit log - customers may ask "what happened to request xyz?"
    """
    __tablename__ = "verification_jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # Status tracks job lifecycle
    status = Column(SAEnum(VerificationStatus), nullable=False, default=VerificationStatus.PROCESSING)
    document_type = Column(SAEnum(DocumentType), nullable=False)

    # Store extracted fields as JSON - flexible for different doc types
    # JSONB in PostgreSQL is indexed and queryable, unlike plain JSON
    extracted_fields = Column(JSON, nullable=True)
    flags = Column(JSON, nullable=True)  # List of flag dicts
    confidence_score = Column(Float, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)

    # File storage
    file_path = Column(String, nullable=True)
    extraction_method = Column(String, nullable=True)  # 'ocr' or 'claude_vision'

    # Billing tracking (you'll need this later)
    api_key_id = Column(String, nullable=True)

    # Timestamps - created_at is set automatically by DB
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class APIKey(Base):
    """
    Customers authenticate with API keys, not username/password.
    This is standard for developer-facing B2B APIs.
    """
    __tablename__ = "api_keys"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    key_hash = Column(String, nullable=False, unique=True)  # Never store raw keys
    name = Column(String, nullable=False)  # "Production key", "Test key"
    customer_email = Column(String, nullable=False)
    is_active = Column(SAEnum("active", "revoked", name="key_status"), default="active")
    total_requests = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    company_name = Column(String, nullable=True)
    is_verified = Column(SAEnum("verified", "unverified", name="verify_status"), default="unverified")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, nullable=False)
    code = Column(String, nullable=False)
    purpose = Column(String, nullable=False, default="signup")
    is_used = Column(SAEnum("used", "unused", name="otp_status"), default="unused")
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())