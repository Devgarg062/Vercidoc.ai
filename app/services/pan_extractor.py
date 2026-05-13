import re
from typing import Optional
from app.models.verification import ExtractedFields, VerificationFlag

class PANExtractor:
    PAN_PATTERN = re.compile(r'\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b')
    DATE_PATTERN = re.compile(
        r'\b(\d{2}[/\-]\d{2}[/\-]\d{4})\b'
    )

    def extract(self, ocr_result: dict) -> tuple[ExtractedFields, list[VerificationFlag]]:
        
        raw_text = ocr_result.get("raw_text", "")
        flags = []
        fields = ExtractedFields()

        pan_matches = self.PAN_PATTERN.findall(raw_text)
        if pan_matches:
            fields.pan_number = pan_matches[0]  # Take the first strong match
            if len(pan_matches) > 1:
                flags.append(VerificationFlag(
                    code="MULTIPLE_PAN_DETECTED",
                    message=f"Found {len(pan_matches)} PAN-like patterns: {pan_matches}",
                    severity="warning"
                ))
        else:
            flags.append(VerificationFlag(
                code="PAN_NOT_FOUND",
                message="Could not extract PAN number from image",
                severity="error"
            ))

        name = self._extract_name_from_text(raw_text)
        if name:
            fields.name = name
        else:
            flags.append(VerificationFlag(
                code="NAME_NOT_FOUND",
                message="Could not extract cardholder name",
                severity="warning"
            ))

        
        date_matches = self.DATE_PATTERN.findall(raw_text)
        if date_matches:
            fields.date_of_birth = date_matches[0]

        
        if ocr_result.get("confidence", 1.0) < 0.6:
            flags.append(VerificationFlag(
                code="LOW_OCR_CONFIDENCE",
                message=f"OCR confidence is {ocr_result['confidence']:.0%}. Document may be blurry or low quality.",
                severity="warning"
            ))

        return fields, flags

    def _extract_name_from_text(self, text: str) -> Optional[str]:
        lines = [line.strip() for line in text.split('\n') if line.strip()]

        for i, line in enumerate(lines):
            if line.upper() in ("NAME", "NAME:", "FULL NAME"):
                if i + 1 < len(lines):
                    candidate = lines[i + 1]
                    if self._looks_like_a_name(candidate):
                        return candidate.title()
        for line in lines:
            if self._looks_like_a_name(line) and 3 <= len(line.split()) <= 5:
                return line.title()

        return None

    def _looks_like_a_name(self, text: str) -> bool:
        if not text or len(text) < 3:
            return False
        if not re.match(r'^[A-Za-z\s]+$', text):
            return False
        words = text.split()
        if not (2 <= len(words) <= 5):
            return False
        if any(len(w) < 2 for w in words):
            return False
        return True

pan_extractor = PANExtractor()

