from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.infrastructure.database.connection import init_db
from src.domain.models import user, journal
from src.presentation.routers import auth, journal as journal_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="MindFlow AI", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:3000",
    "https://mindflow-ai-livid.vercel.app",
    "https://mindflow-5vid5zo6s-firstname-s-projects1.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(journal_router.router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status": "healthy"}
