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

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def analyze_with_ai(content: str, lang: str = "en") -> dict:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    print(f"DEBUG GROQ KEY: {GROQ_API_KEY[:10] if GROQ_API_KEY else 'MISSING'} - journal.py:25")
    if not GROQ_API_KEY:
        return {
            "insights": "Thank you for this entry. Keep writing regularly." if lang == "en" else "Merci pour cette entree. Continue a ecrire regulierement.",
            "questions": ["How do you feel now?", "What could change tomorrow?"] if lang == "en" else ["Comment te sens-tu ?", "Qu est-ce qui pourrait changer demain ?"]
        }
    system_prompt = {
        "fr": "Tu es MindFlow, un companion bienveillant specialise en bien-etre mental. Analyse ce journal et genere une reponse JSON avec exactement: insights (2-3 phrases empathiques et pertinentes) et questions (liste de 2 questions de reflexion). Reponds UNIQUEMENT avec du JSON valide, sans texte avant ou apres.",
        "en": "You are MindFlow, a caring wellness companion specialized in mental well-being. Analyze this journal entry and generate a JSON response with exactly: insights (2-3 empathetic and relevant sentences) and questions (list of 2 reflection questions). Reply ONLY with valid JSON, no text before or after."
    }.get(lang, "You are MindFlow, a caring wellness companion. Analyze this journal entry and generate a JSON response with: insights (2-3 empathetic sentences) and questions (list of 2 reflection questions). Reply ONLY with valid JSON.")

    result = ""
    try:
        client = Groq(api_key=GROQ_API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": content}
            ],
            temperature=0.7,
            max_tokens=500
        )
        result = response.choices[0].message.content.strip()
        print(f"GROQ RAW: {result[:100]} - journal.py:49")
        if "```" in result:
            result = result.split("```")[1]
            if result.startswith("json"):
                result = result[4:]
        return json.loads(result)
    except json.JSONDecodeError as e:
        print(f"JSON ERROR: {e}, raw: {result[:100]} - journal.py:56")
        return {
            "insights": result if result else ("Thank you for this entry." if lang == "en" else "Merci pour cette entree."),
            "questions": ["How do you feel now?", "What would help you tomorrow?"] if lang == "en" else ["Comment te sens-tu maintenant ?", "Qu est-ce qui t aiderait demain ?"]
        }
    except Exception as e:
        print(f"GROQ ERROR: {e} - journal.py:62")
        return {
            "insights": "Thank you for this sincere entry." if lang == "en" else "Merci pour cette entree sincere.",
            "questions": ["What weighed on you most?", "What do you need?"] if lang == "en" else ["Qu est-ce qui t a pese ?", "De quoi as-tu besoin ?"]
        }

class JournalCreate(BaseModel):
    content: str
    mood_score: float = 5.0
    lang: str = "en"

@router.post("/", status_code=201)
async def create_entry(
    body: JournalCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    ai = await analyze_with_ai(body.content, body.lang)
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