from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.verify import router as verify_router
from app.core.logging import setup_logging, logger
from app.api.v1.auth import router as auth_router
# Setup logging when app starts
setup_logging()

app = FastAPI(
    title="VeriDoc API",
    description="AI-powered document verification for Indian fintechs",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(verify_router)
app.include_router(auth_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "Something went wrong. Please try again."
        }
    )

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}