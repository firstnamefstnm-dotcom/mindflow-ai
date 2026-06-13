from fastapi import APIRouter, Depends, HTTPException, Request
from jose import jwt, JWTError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import stripe, os, httpx

router = APIRouter(prefix="/payments", tags=["payments"])
security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "mindflow-secret")

PRICE_BY_CURRENCY = {
    "USD": os.getenv("STRIPE_PRICE_USD", ""),
    "EUR": os.getenv("STRIPE_PRICE_EUR", ""),
    "GBP": os.getenv("STRIPE_PRICE_GBP", ""),
    "AUD": os.getenv("STRIPE_PRICE_AUD", ""),
}

CURRENCY_BY_COUNTRY = {
    "US": "USD", "CA": "USD", "MX": "USD",
    "FR": "EUR", "DE": "EUR", "ES": "EUR", "IT": "EUR",
    "BE": "EUR", "NL": "EUR", "PT": "EUR", "AT": "EUR",
    "CH": "EUR", "LU": "EUR",
    "GB": "GBP",
    "AU": "AUD", "NZ": "AUD",
}

PRICE_DISPLAY = {
    "USD": "2.99 USD", "EUR": "2.99 EUR",
    "GBP": "2.99 GBP", "AUD": "4.99 AUD",
}

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def detect_country(request: Request) -> str:
    ip = request.headers.get("X-Forwarded-For", "").split(",")[0].strip()
    if not ip or ip.startswith("127.") or ip.startswith("::1"):
        return "AU"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(f"https://ipapi.co/{ip}/country/", timeout=3)
            return r.text.strip()
    except:
        return "AU"

@router.post("/create-checkout")
async def create_checkout(
    request: Request,
    user_id: str = Depends(get_current_user_id)
):
    key = os.getenv("STRIPE_SECRET_KEY", "")
    frontend_url = os.getenv("FRONTEND_URL", "https://mindflow-ai-livid.vercel.app")
    if not key:
        raise HTTPException(status_code=500, detail="Stripe not configured")

    country = await detect_country(request)
    currency = CURRENCY_BY_COUNTRY.get(country, "USD")
    price_id = PRICE_BY_CURRENCY.get(currency, PRICE_BY_CURRENCY["USD"])

    print(f"Country: {country}, Currency: {currency}, Price: {price_id} - payments.py:63")

    stripe.api_key = key
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{frontend_url}?success=true",
            cancel_url=f"{frontend_url}?canceled=true",
            metadata={"user_id": user_id, "country": country}
        )
        return {
            "checkout_url": session.url,
            "country": country,
            "currency": currency,
            "price_display": PRICE_DISPLAY.get(currency, "2.99 USD")
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/pricing")
async def get_pricing(request: Request):
    country = await detect_country(request)
    currency = CURRENCY_BY_COUNTRY.get(country, "USD")
    return {
        "country": country,
        "currency": currency,
        "price": PRICE_DISPLAY.get(currency, "2.99 USD"),
        "period": "mois"
    }

@router.get("/plans")
async def get_plans():
    return {
        "free": {"name": "Gratuit", "price": 0, "features": ["3 entrees/semaine", "Insights basiques"]},
        "premium": {"name": "Premium", "features": ["Journal illimite", "IA 24/7", "Analyses avancees"]}
    }