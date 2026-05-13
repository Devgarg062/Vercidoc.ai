import time
import uuid
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.models.verification import (
    VerificationResponse,
    VerificationStatus,
    ExtractedFields,
    DocumentType,
    VerificationFlag
)
from app.services.ocr_service import ocr_service
from app.services.pan_extractor import pan_extractor
from app.services.gemini_extractor import gemini_extractor

router = APIRouter(prefix="/v1", tags=["verification"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg", "application/pdf"}
MAX_FILE_SIZE_MB = 5
OCR_CONFIDENCE_THRESHOLD = 0.75

@router.post(
    "/verify",
    response_model=VerificationResponse,
    summary="Verify a document",
    description="Upload a PAN card or GST certificate image. Returns extracted fields and validation result."
)
async def verify_document(
    document_type: DocumentType = Form(...),
    file: UploadFile = File(..., description="Image (JPEG/PNG) or PDF of the document")
):
    start_time = time.time()

    # --- Validate file type ---
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Use JPEG, PNG, or PDF."
        )

    # --- Read and validate file size ---
    file_bytes = await file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)
    if file_size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"File size {file_size_mb:.1f}MB exceeds {MAX_FILE_SIZE_MB}MB limit."
        )

    # --- Save file ---
    request_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1] if file.filename else "jpg"
    file_path = f"{UPLOAD_DIR}/{request_id}.{file_extension}"
    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # --- Setup ---
    all_flags = []
    fields = ExtractedFields()
    confidence = 0.0
    extraction_method = "ocr"

    # --- Step 1: Try Tesseract OCR first (free, fast) ---
    try:
        ocr_result = ocr_service.extract_text(file_bytes)
    except Exception as e:
        ocr_result = {"raw_text": "", "confidence": 0.0, "word_count": 0}
        all_flags.append(VerificationFlag(
            code="OCR_FAILED",
            message=f"OCR processing failed: {str(e)}",
            severity="warning"
        ))

    # --- Step 2: Extract fields from OCR text ---
    if document_type == DocumentType.PAN:
        fields, ocr_flags = pan_extractor.extract(ocr_result)
        all_flags.extend(ocr_flags)
        confidence = ocr_result.get("confidence", 0.0)

        # --- Step 3: Cascade to Gemini if OCR confidence is low ---
        error_flags = [f for f in ocr_flags if f.severity == "error"]
        should_use_gemini = (
            confidence < OCR_CONFIDENCE_THRESHOLD or
            len(error_flags) > 0 or
            not fields.pan_number  # PAN not found by regex
        )

        if should_use_gemini:
            extraction_method = "gemini_vision"
            try:
                gemini_data, gemini_confidence = gemini_extractor.extract(
                    file_bytes, document_type
                )

                # Merge: prefer Gemini fields over OCR where available
                if gemini_data.get("pan_number"):
                    fields.pan_number = gemini_data["pan_number"]
                if gemini_data.get("name"):
                    fields.name = gemini_data["name"]
                if gemini_data.get("date_of_birth"):
                    fields.date_of_birth = gemini_data["date_of_birth"]

                # Take the higher confidence of the two
                confidence = max(confidence, gemini_confidence)

                # Remove PAN_NOT_FOUND flag if Gemini found it
                if fields.pan_number:
                    all_flags = [
                        f for f in all_flags
                        if f.code != "PAN_NOT_FOUND"
                    ]

            except Exception as e:
                all_flags.append(VerificationFlag(
                    code="GEMINI_FAILED",
                    message=f"AI extraction failed: {str(e)}",
                    severity="warning"
                ))

    elif document_type == DocumentType.GST_CERTIFICATE:
        # GST goes straight to Gemini — regex alone isn't reliable enough
        extraction_method = "gemini_vision"
        try:
            gemini_data, gemini_confidence = gemini_extractor.extract(
                file_bytes, document_type
            )
            if gemini_data.get("gstin"):
                fields.gstin = gemini_data["gstin"]
            if gemini_data.get("legal_name"):
                fields.legal_name = gemini_data["legal_name"]
            confidence = gemini_confidence
        except Exception as e:
            all_flags.append(VerificationFlag(
                code="EXTRACTION_FAILED",
                message=f"GST extraction failed: {str(e)}",
                severity="error"
            ))

    # --- Step 4: Determine final status ---
    has_errors = any(f.severity == "error" for f in all_flags)

    if document_type == DocumentType.PAN:
        if fields.pan_number and not has_errors:
            status = VerificationStatus.VERIFIED
        elif fields.pan_number and has_errors:
            status = VerificationStatus.PARTIAL
        else:
            status = VerificationStatus.FAILED

    elif document_type == DocumentType.GST_CERTIFICATE:
        if fields.gstin and not has_errors:
            status = VerificationStatus.VERIFIED
        elif fields.gstin:
            status = VerificationStatus.PARTIAL
        else:
            status = VerificationStatus.FAILED
    else:
        status = VerificationStatus.FAILED

    processing_time_ms = int((time.time() - start_time) * 1000)

    return VerificationResponse(
        request_id=request_id,
        status=status,
        document_type=document_type,
        confidence_score=round(confidence, 3),
        extracted_fields=fields,
        flags=all_flags,
        processing_time_ms=processing_time_ms
    )