from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.verify import router as verify_router
app = FastAPI(
    title = "Veridoc AI",
    description  ="Ai powered d0cument verification",
    version = "0.1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(verify_router)

@app.get("/health")
async def health_check():
    """This is a normal health check endpoint"""
    return {"status" : "ok", "version":"0.1.0"}
    
