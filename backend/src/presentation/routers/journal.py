python3 << 'PYEOF'
content = '''from fastapi import APIRouter, Depends, HTTPException
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

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def analyze_with_ai(content: str) -> dict:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    print(f"DEBUG GROQ KEY: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'MISSING'} - journal.py:26")
    if not GROQ_API_KEY:
        return {
            "insights": "Merci pour cette entree. Continue a ecrire regulierement.",
            "questions": ["Comment te sens-tu ?", "Qu est-ce qui pourrait changer demain ?"]
        }
    try:
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Tu es MindFlow, un companion bienveillant. Analyse ce journal et genere une reponse JSON avec: insights (2-3 phrases empathiques) et questions (liste de 2 questions). Reponds UNIQUEMENT avec du JSON valide."},
                {"role": "user", "content": content}
            ],
            temperature=0.7,
            max_tokens=500
        )
        result = response.choices[0].message.content.strip()
        return json.loads(result)
    except Exception as e:
        print(f"GROQ ERROR: {e} - journal.py:46")
        return {
            "insights": "Merci pour cette entree sincere. Prendre le temps d ecrire est deja un acte de soin.",
            "questions": ["Qu est-ce qui t a le plus pese aujourd hui ?", "De quoi aurais-tu besoin pour aller mieux ?"]
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
'''
with open('/Users/amirkharroubi/mindflow-ai/backend/src/presentation/routers/journal.py', 'w') as f:
    f.write(content)
print("OK - journal.py:99")
PYEOF