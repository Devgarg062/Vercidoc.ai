from pydantic import BaseModel, Field
from enum import Enum
from typing import Optinal, List
from datetime import datetime
import uuid

class DocumentType(str, Enum):
    PAN = "PAN"
    GST_CERTIFICATE = "GST_CERTIFICATE"
    AADHAR = "AADHAR"

class VerificationStatus(str, Enum):
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"
    PARTIAL = "PARTIAL"
    PROCESSING = "PROCESSING"

class VerificationRequest(BaseModel):
    document_type = DocumentType
    image_base64: Optional[str] = Field(
        None,
        description = "img"
    )

class ExtractedFields(BaseModel):
    pan_number : Optional[str] = None
    name : Optional[str] = None
    date_of_birth : Optional[str] = None
    gstin : Optional[str] = None
    legal_name : Optional[str] = None

class VerificationResponse(BaseModel):
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: VerificationStatus
    document_type: DocumentType
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="0.0 = no confidence, 1.0 = fully verified"
    )
    extracted_fields: ExtractedFields
    flags: List[VerificationFlag] = []
    processing_time_ms: Optional[int] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

