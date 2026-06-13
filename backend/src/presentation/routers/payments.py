from fastapi import APIRouter, Depends, HTTPException
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import stripe, os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/payments", tags=["payments"])
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "mindflow-secret")

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/create-checkout")
async def create_checkout(user_id: str = Depends(get_current_user_id)):
    key = os.getenv("STRIPE_SECRET_KEY", "")
    price_id = os.getenv("STRIPE_PRICE_ID", "")
    frontend_url = os.getenv("FRONTEND_URL", "https://mindflow-ai-livid.vercel.app")
    print(f"STRIPE KEY: {key[:10] if key else 'MISSING'} - payments.py:25")
    print(f"PRICE ID: {price_id} - payments.py:26")
    if not key:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    stripe.api_key = key
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{frontend_url}?success=true",
            cancel_url=f"{frontend_url}?canceled=true",
            metadata={"user_id": user_id}
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/plans")
async def get_plans():
    return {
        "free": {"name": "Gratuit", "price": 0, "features": ["3 entrées/semaine", "Insights basiques"]},
        "premium": {"name": "Premium", "price": 4.99, "currency": "AUD", "features": ["Journal illimité", "IA 24/7", "Analyses avancées"]}
    }