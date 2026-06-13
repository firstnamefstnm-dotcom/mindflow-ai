# STATUS MINDFLOW AI — 13 Juin 2026

## URLS DE PRODUCTION
- Frontend : https://mindflow-ai-livid.vercel.app
- Landing  : https://mindflow-ai-livid.vercel.app/landing
- Backend  : https://mindflow-backend-8kws.onrender.com
- API Docs : https://mindflow-backend-8kws.onrender.com/docs
- GitHub   : https://github.com/firstnamefstnm-dotcom/mindflow-ai

## STACK TECHNIQUE
- Backend  : FastAPI + Python 3.14 + PostgreSQL (Render) + Groq/Llama3
- Frontend : Next.js 16 + TypeScript + Tailwind
- Paiement : Stripe (MODE TEST — pas encore production)
- Email    : Brevo (sender firstnamefstnm@gmail.com NON VERIFIE)
- Analytics: Google Analytics G-RN5GWMDVJ1

## VARIABLES RENDER (backend)
DATABASE_URL      = postgresql+asyncpg://... (Render interne)
SECRET_KEY        = mindflow-secret-key-change-in-production
GROQ_API_KEY      = gsk_HdB9Xu... (actif)
STRIPE_SECRET_KEY = sk_test_51... (MODE TEST)
STRIPE_PRICE_USD  = price_1Thqsz... (2.99 USD)
STRIPE_PRICE_EUR  = price_1Thqv4... (2.99 EUR)
STRIPE_PRICE_GBP  = price_1Thqw1... (2.99 GBP)
STRIPE_PRICE_AUD  = price_1ThpVz... (4.99 AUD)
FRONTEND_URL      = https://mindflow-ai-livid.vercel.app
BREVO_API_KEY     = re_... (configuré, sender non vérifié)

## FONCTIONNALITES ACTIVES
- Inscription / Connexion JWT (30 jours)
- Journal IA (Llama 3 — insights + questions)
- Multilingue FR/EN (détection par IP)
- Prix géolocalisé USD/EUR/GBP/AUD
- Paiements Stripe (4 devises, test)
- Landing page (Hero + Pricing + FAQ)
- Google Analytics actif
- Email bienvenue (sender à vérifier)

## TACHES EN ATTENTE (par priorité)
HAUTE   - Vérifier sender Brevo sur brevo.com/senders
HAUTE   - Passer Stripe en mode PRODUCTION (live keys)
MOYENNE - Dashboard admin (stats utilisateurs)
MOYENNE - Redis en production sur Render
BASSE   - Langues ES/DE/PT
BASSE   - App mobile React Native

## UTILISATEURS
- Inscrits organiquement : elboukili.btissam, anouar.kharroubi, etc.
- Payants : 0 (Stripe en mode test)

## COMMANDES POUR REPRENDRE EN LOCAL
# Terminal 1 — Backend
cd ~/mindflow-ai/backend
source venv/bin/activate
python3 -m uvicorn src.main:app --reload --port 8000

# Terminal 2 — Frontend
cd ~/mindflow-ai/frontend
npm run dev

# Terminal 3 — BDD locale
cd ~/mindflow-ai/infrastructure
docker compose up -d

## DEPLOIEMENT
# Backend : git push → Render redéploie automatiquement
# Frontend :
cd ~/mindflow-ai/frontend
vercel --prod

## PROCHAINES ACTIONS
1. Vérifier sender Brevo → emails automatiques
2. Stripe production → premiers vrais revenus
3. Dashboard admin → suivre la croissance
4. Reddit (7 jours après création compte) → acquisition
