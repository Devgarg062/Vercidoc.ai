import sys
sys.path.append(".")

from app.services.gemini_extractor import gemini_extractor
from app.models.verification import DocumentType

with open("pan_card.jpg", "rb") as f:
    image_bytes = f.read()

print(f"Image size: {len(image_bytes)} bytes")

extracted, confidence = gemini_extractor.extract(image_bytes, DocumentType.PAN)
print("Extracted fields:", extracted)
print("Confidence:", confidence)