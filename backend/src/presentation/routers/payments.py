from fastapi import APIRouter, Depends, HTTPException
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import stripe, os

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
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    PRICE_ID = os.getenv("STRIPE_PRICE_ID")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": PRICE_ID, "quantity": 1}],
            mode="subscription",
            success_url=f"{FRONTEND_URL}?success=true",
            cancel_url=f"{FRONTEND_URL}?canceled=true",
            metadata={"user_id": user_id}
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/plans")
async def get_plans():
    return {
        "free": {
            "name": "Gratuit",
            "price": 0,
            "features": ["3 entrées journal/semaine", "Check-in quotidien", "Insights basiques"]
        },
        "premium": {
            "name": "Premium",
            "price": 9.99,
            "currency": "EUR",
            "features": ["Journal illimité", "IA 24/7", "Analyses avancées", "Rapports hebdomadaires"]
        }
    }