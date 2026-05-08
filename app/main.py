from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
@app.get("/health")
async def health_check():
    """This is a normal health check endpoint"""
    return {"status" : "ok", "version":"0.1.0"}