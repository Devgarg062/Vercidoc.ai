from app.services.ocr_service import ocr_service

with open("pan_card.jpg", "rb") as f:
    image_bytes = f.read()

result = ocr_service.extract_text(image_bytes)
print(result)
# add this to test_ocr.py temporarily
print("--- RAW TEXT ---")
print(result['raw_text'])
print("--- CONFIDENCE ---")
print(result['confidence'])
print("--- WORD COUNT ---")
print(result['word_count'])