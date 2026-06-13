from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.infrastructure.database.connection import get_db
from src.domain.models.journal import JournalEntry
from pydantic import BaseModel
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from groq import Groq
import os, json

router = APIRouter(prefix="/journal", tags=["journal"])
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "mindflow-secret")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def analyze_with_ai(content: str) -> dict:
    print(f"DEBUG GROQ KEY: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'MISSING'} - journal.py:25")
    if not GROQ_API_KEY or GROQ_API_KEY == "gsk_your-key-here":
        return {
            "insights": "Merci pour cette entrée. Continue à écrire régulièrement — chaque mot compte.",
            "questions": ["Comment te sens-tu par rapport à ce que tu as écrit ?", "Qu'est-ce qui pourrait changer demain ?"]
        }
    try:
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": """Tu es MindFlow, un companion bienveillant spécialisé en bien-être mental.
Analyse ce journal et génère une réponse JSON avec exactement ces deux champs:
- insights: 2-3 phrases empathiques et pertinentes sur ce que la personne a écrit
- questions: liste de 2 questions de réflexion pour aider la personne à aller plus loin

Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après."""},
                {"role": "user", "content": content}
            ],
            temperature=0.7,
            max_tokens=500
        )
        result = response.choices[0].message.content.strip()
        return json.loads(result)
    except Exception as e:
        return {
            "insights": "Merci pour cette entrée sincère. Prendre le temps d'écrire est déjà un acte de soin envers toi-même.",
            "questions": ["Qu'est-ce qui t'a le plus pesé aujourd'hui ?", "De quoi aurais-tu besoin pour te sentir mieux demain ?"]
        }

class JournalCreate(BaseModel):
    content: str
    mood_score: float = 5.0

@router.post("/", status_code=201)
async def create_entry(
    body: JournalCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    ai = await analyze_with_ai(body.content)
    entry = JournalEntry(
        user_id=user_id,
        content=body.content,
        mood_score=body.mood_score,
        ai_insights=ai["insights"],
        ai_questions=json.dumps(ai["questions"])
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return {
        "id": str(entry.id),
        "content": entry.content,
        "mood_score": entry.mood_score,
        "ai_insights": entry.ai_insights,
        "ai_questions": ai["questions"],
        "created_at": entry.created_at
    }

@router.get("/")
async def get_entries(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(JournalEntry)
        .where(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(20)
    )
    entries = result.scalars().all()
    return [{"id": str(e.id), "content": e.content, "mood_score": e.mood_score,
             "ai_insights": e.ai_insights, "created_at": e.created_at} for e in entries]
