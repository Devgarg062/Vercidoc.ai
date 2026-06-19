
import pytesseract
from PIL import Image
import cv2
import numpy as np
import io
from typing import Optional
import platform
if platform.system() == "Windows":
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
# On Linux (Railway), tesseract is in PATH after nixpacks install — no need to set path
class OCRService:
    """
    Responsible for extracting raw text from document images.
    We separate this into its own service class so that later,
    if we switch from Tesseract to AWS Textract, we only change
    this file — not the endpoint code. This is the Single Responsibility
    Principle in practice.
    """

    def preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        """
        Preprocessing dramatically improves OCR accuracy.
        These steps are standard for document OCR.
        """
        # Convert bytes to numpy array (OpenCV format)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Convert to grayscale - OCR works on pixel intensity, not color
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Denoise - reduces salt-and-pepper noise from phone camera photos
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # Adaptive thresholding - converts to black/white
        # Better than simple thresholding for documents with uneven lighting
        # (e.g., phone photo of a card with a shadow on one side)
        thresh = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )

        return thresh

    def extract_text(self, image_bytes: bytes) -> dict:
        """
        Extract raw text using Tesseract.
        Returns both the full text and word-level data with positions.
        """
        processed = self.preprocess_image(image_bytes)
        pil_image = Image.fromarray(processed)

        # config explanation:
        # --oem 3: Use LSTM + legacy OCR engine (most accurate)
        # --psm 6: Assume a single uniform block of text
        # For structured docs like PAN cards, psm 6 works well
        custom_config = r'--oem 3 --psm 6 -l eng'

        raw_text = pytesseract.image_to_string(pil_image, config=custom_config)

        # Also get word-level data - useful for debugging
        # and for building position-aware extraction later
        word_data = pytesseract.image_to_data(
            pil_image,
            config=custom_config,
            output_type=pytesseract.Output.DICT
        )

        return {
            "raw_text": raw_text.strip(),
            "word_count": len([w for w in word_data["text"] if w.strip()]),
            "confidence": self._calculate_confidence(word_data)
        }

    def _calculate_confidence(self, word_data: dict) -> float:
        """
        Tesseract gives a confidence (0-100) per word.
        We average these to get an overall extraction confidence.
        Filter out empty strings and -1 values (Tesseract uses -1 for non-text regions)
        """
        confidences = [
            conf for conf, text in zip(word_data["conf"], word_data["text"])
            if text.strip() and conf != -1
        ]
        if not confidences:
            return 0.0
        return round(sum(confidences) / len(confidences) / 100, 3)


ocr_service = OCRService()