from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.infrastructure.database.connection import get_db
from src.domain.models.user import User
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta, timezone
import bcrypt, os, httpx

router = APIRouter(prefix="/auth", tags=["auth"])
SECRET_KEY = os.getenv("SECRET_KEY", "mindflow-secret")
ALGORITHM = "HS256"

class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str
    last_name: str
    lang: str = "en"

class LoginRequest(BaseModel):
    email: str
    password: str

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=30)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def send_welcome_email(email: str, first_name: str, lang: str = "en"):
    api_key = os.getenv("BREVO_API_KEY", "")
    if not api_key:
        return
    if lang == "fr":
        subject = "Bienvenue sur MindFlow AI"
        body = f"Bonjour {first_name},\n\nBienvenue sur MindFlow AI !\n\nCommence a ecrire ton journal :\nhttps://mindflow-ai-livid.vercel.app\n\nL'equipe MindFlow"
    else:
        subject = "Welcome to MindFlow AI"
        body = f"Hi {first_name},\n\nWelcome to MindFlow AI!\n\nStart journaling now:\nhttps://mindflow-ai-livid.vercel.app\n\nThe MindFlow Team"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.post(
                "https://api.brevo.com/v3/smtp/email",
                headers={"api-key": api_key, "Content-Type": "application/json"},
                json={
                    "sender": {"name": "MindFlow AI", "email": "noreply@mindflow-ai-livid.vercel.app"},
                    "to": [{"email": email, "name": first_name}],
                    "subject": subject,
                    "textContent": body
                }
            )
            print(f"Email sent to {email}  status: {r.status_code} - auth.py:58")
    except Exception as e:
        print(f"Email error: {e} - auth.py:60")

@router.post("/register", status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        first_name=body.first_name,
        last_name=body.last_name
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    await send_welcome_email(body.email, body.first_name, body.lang)
    return {"access_token": create_token(str(user.id)), "token_type": "bearer"}

@router.post("/login")
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": create_token(str(user.id)), "token_type": "bearer"}