from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.infrastructure.database.connection import get_db
from src.domain.models.user import User
from pydantic import BaseModel
from jose import jwt
from datetime import datetime, timedelta, timezone
import bcrypt, os, resend

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
    resend.api_key = os.getenv("RESEND_API_KEY", "")
    if not resend.api_key:
        return
    if lang == "fr":
        subject = "Bienvenue sur MindFlow AI 🧠"
        body = f"""Bonjour {first_name},

Bienvenue sur MindFlow AI !

Tu as fait le premier pas vers une meilleure comprehension de toi-meme.

Pour commencer :
1. Ecris ta premiere entree de journal
2. Laisse l'IA analyser tes emotions
3. Reponds aux questions de reflexion

👉 https://mindflow-ai-livid.vercel.app

L'equipe MindFlow"""
    else:
        subject = "Welcome to MindFlow AI 🧠"
        body = f"""Hi {first_name},

Welcome to MindFlow AI!

You've taken the first step toward better understanding yourself.

To get started:
1. Write your first journal entry
2. Let the AI analyze your emotions
3. Answer the reflection questions

👉 https://mindflow-ai-livid.vercel.app

The MindFlow Team"""
    try:
        resend.Emails.send({
            "from": os.getenv("FROM_EMAIL", "onboarding@resend.dev"),
            "to": email,
            "subject": subject,
            "text": body
        })
        print(f"Welcome email sent to {email} - auth.py:79")
    except Exception as e:
        print(f"Email error: {e} - auth.py:81")

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