import time
import uuid
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.models.verification import (
    VerificationRequest,
    VerificationResponse,
    VerificationStatus,
    ExtractedFields,
    DocumentType
)
router = APIRouter(prefix="/v1", tags=["verification"])
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
MAX_FILE_SIZE_MB = 5

@router.post(
    "/verify",
    response_model=VerificationResponse,
    summary="Verify a document",
    description="Upload a PAN card or GST certificate image. Returns extracted fields and validation result."
)
async def verify_document(
    document_type: DocumentType,
    file: UploadFile = File(..., description="Image (JPEG/PNG) or PDF of the document")
):
    start_time = time.time()
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Use JPEG, PNG, or PDF."
        )

    file_bytes = await file.read()

    file_size_mb = len(file_bytes) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File size {file_size_mb:.1f}MB exceeds {MAX_FILE_SIZE_MB}MB limit."
        )
    request_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
    file_path = f"{UPLOAD_DIR}/{request_id}.{file_extension}"

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    processing_time_ms = int((time.time() - start_time) * 1000)

    return VerificationResponse(
        request_id=request_id,
        status=VerificationStatus.PROCESSING,
        document_type=document_type,
        confidence_score=0.0,
        extracted_fields=ExtractedFields(),
        processing_time_ms=processing_time_ms
    )