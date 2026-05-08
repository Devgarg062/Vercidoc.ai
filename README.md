# VeriDoc.ai

AI-powered document verification API for Indian fintechs, HRtech platforms, staffing firms, and NBFCs.

VeriDoc.ai automates verification of Aadhaar, PAN, GST certificates, salary slips, and educational documents using OCR + AI-powered validation.

---

## Problem

Indian companies still manually verify onboarding and KYC documents, which leads to:
- slow verification processes
- compliance risks
- operational inefficiencies
- fraud vulnerabilities

Existing solutions are often expensive and focused on large enterprises.

---

## Solution

VeriDoc.ai provides:
- API-first document verification
- OCR-based data extraction
- AI-powered validation
- structured JSON responses
- fraud and inconsistency detection

---

## Core Features

- Upload PDF/Image documents
- OCR extraction
- AI-based field parsing
- PAN/Aadhaar/GST extraction
- Confidence scoring
- Red flag detection
- Webhook support

---

## Tech Stack

### Backend
- FastAPI
- Python

### AI & OCR
- Claude Vision API
- GPT-4o
- Tesseract OCR
- AWS Textract

### Database & Caching
- PostgreSQL
- Redis

### Infrastructure
- AWS Lambda
- AWS S3
- Docker

---

## Workflow

```text
Document Upload
      ↓
OCR Extraction
      ↓
AI Validation
      ↓
Fraud Detection
      ↓
Structured JSON Response
