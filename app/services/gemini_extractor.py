import os
import json
import base64
from dotenv import load_dotenv
from app.models.verification import DocumentType

load_dotenv()

EXTRACTION_PROMPTS = {
    DocumentType.PAN: """You are analyzing an Indian PAN card image.
Extract the following fields and return ONLY a valid JSON object.
No explanation, no markdown, no backticks. Just the JSON.

{
  "pan_number": "10 character PAN like ABCDE1234F, or null if not visible",
  "name": "full name of cardholder in CAPS as printed, or null",
  "date_of_birth": "date in DD/MM/YYYY format, or null",
  "father_name": "father's name as printed, or null"
}""",

    DocumentType.GST_CERTIFICATE: """You are analyzing an Indian GST Registration Certificate.
Extract fields and return ONLY a valid JSON object.
No explanation, no markdown, no backticks. Just the JSON.

{
  "gstin": "15 character GSTIN or null",
  "legal_name": "legal business name or null",
  "trade_name": "trade name if different or null",
  "registration_date": "date or null",
  "state": "state name or null",
  "pan_number": "associated PAN or null"
}"""
}

class GeminiExtractor:
    """
    Uses Groq's free vision API for document extraction.
    Free tier: 30 requests/minute, 14,400 requests/day.
    No credit card required.
    """

    def __init__(self):
        from groq import Groq
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "meta-llama/llama-4-scout-17b-16e-instruct"

    def extract(
        self,
        image_bytes: bytes,
        document_type: DocumentType
    ) -> tuple[dict, float]:

        prompt = EXTRACTION_PROMPTS.get(document_type)
        if not prompt:
            return {}, 0.0

        try:
            # Convert image to base64
            image_b64 = base64.b64encode(image_bytes).decode("utf-8")

            # Detect image type from bytes header
            if image_bytes[:3] == b'\xff\xd8\xff':
                mime_type = "image/jpeg"
            elif image_bytes[:8] == b'\x89PNG\r\n\x1a\n':
                mime_type = "image/png"
            else:
                mime_type = "image/jpeg"  # default

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{mime_type};base64,{image_b64}"
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ],
                max_tokens=500,
                temperature=0
            )

            response_text = response.choices[0].message.content.strip()

            # Clean backticks if model adds them
            if "```" in response_text:
                parts = response_text.split("```")
                response_text = parts[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]

            response_text = response_text.strip()
            extracted = json.loads(response_text)
            confidence = self._estimate_confidence(extracted)

            return extracted, confidence

        except json.JSONDecodeError as e:
            print(f"[GeminiExtractor] JSON parse failed: {e}")
            print(f"[GeminiExtractor] Raw response: {response_text}")
            return {}, 0.0

        except Exception as e:
            print(f"[GeminiExtractor] Extraction failed: {e}")
            return {}, 0.0

    def _estimate_confidence(self, extracted: dict) -> float:
        if not extracted:
            return 0.0
        non_null = sum(1 for v in extracted.values() if v is not None)
        return round(non_null / len(extracted), 2)


gemini_extractor = GeminiExtractor()