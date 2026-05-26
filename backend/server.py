from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordBearer
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import hmac
import hashlib
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt as pyjwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Environment
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
JWT_EXPIRE_MINUTES = int(os.environ.get('JWT_EXPIRE_MINUTES', '10080'))
PAYSTACK_SECRET_KEY = os.environ['PAYSTACK_SECRET_KEY']
PAYSTACK_PUBLIC_KEY = os.environ['PAYSTACK_PUBLIC_KEY']
VIP_PRICE_GHS = float(os.environ.get('VIP_PRICE_GHS', '50'))
ADMIN_EMAIL = os.environ['ADMIN_EMAIL']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

# MongoDB
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Football Predictions API")
api_router = APIRouter(prefix="/api")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ============== Models ==============
class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    vip_active: bool = False
    vip_expires_at: Optional[str] = None
    created_at: str


class GameCreate(BaseModel):
    home_team: str
    away_team: str
    league: str
    match_date: str  # ISO string
    prediction: str  # e.g., "Home Win", "Over 2.5", "BTTS"
    odds: float
    category: Literal["vip", "premium", "fixed_odds"]
    confidence: Optional[int] = 80  # %
    notes: Optional[str] = ""


class GameUpdate(BaseModel):
    home_team: Optional[str] = None
    away_team: Optional[str] = None
    league: Optional[str] = None
    match_date: Optional[str] = None
    prediction: Optional[str] = None
    odds: Optional[float] = None
    category: Optional[Literal["vip", "premium", "fixed_odds"]] = None
    confidence: Optional[int] = None
    notes: Optional[str] = None
    status: Optional[Literal["pending", "won", "lost"]] = None
    score: Optional[str] = None


class GamePublic(BaseModel):
    id: str
    home_team: str
    away_team: str
    league: str
    match_date: str
    prediction: Optional[str] = None
    odds: Optional[float] = None
    category: str
    confidence: Optional[int] = None
    notes: Optional[str] = None
    status: str = "pending"
    score: Optional[str] = None
    locked: bool = False
    created_at: str


class PaymentInitRequest(BaseModel):
    callback_url: str


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


# ============== Utilities ==============
def now_iso():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False


def create_access_token(user_id: str, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "role": role, "exp": expire}
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def get_admin_user(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def is_vip_active(user: dict) -> bool:
    if not user.get("vip_active"):
        return False
    exp = user.get("vip_expires_at")
    if not exp:
        return False
    try:
        return datetime.fromisoformat(exp) > datetime.now(timezone.utc)
    except Exception:
        return False


def user_to_public(u: dict) -> dict:
    return {
        "id": u["id"],
        "name": u["name"],
        "email": u["email"],
        "role": u.get("role", "user"),
        "vip_active": is_vip_active(u),
        "vip_expires_at": u.get("vip_expires_at"),
        "created_at": u.get("created_at", now_iso()),
    }


def game_to_public(g: dict, vip_unlocked: bool) -> dict:
    is_vip = g.get("category") == "vip"
    locked = is_vip and not vip_unlocked
    out = {
        "id": g["id"],
        "home_team": g["home_team"],
        "away_team": g["away_team"],
        "league": g["league"],
        "match_date": g["match_date"],
        "category": g["category"],
        "odds": g.get("odds"),
        "confidence": g.get("confidence"),
        "status": g.get("status", "pending"),
        "score": g.get("score"),
        "locked": locked,
        "created_at": g.get("created_at", now_iso()),
    }
    if locked:
        out["prediction"] = None
        out["notes"] = None
    else:
        out["prediction"] = g.get("prediction")
        out["notes"] = g.get("notes")
    return out


# ============== Routes: Health & Config ==============
@api_router.get("/")
async def root():
    return {"message": "Football Predictions API", "status": "ok"}


@api_router.get("/config")
async def get_config():
    return {
        "vip_price_ghs": VIP_PRICE_GHS,
        "paystack_public_key": PAYSTACK_PUBLIC_KEY,
        "currency": "GHS",
    }


# ============== Routes: Auth ==============
@api_router.post("/auth/signup")
async def signup(data: UserSignup):
    existing = await db.users.find_one({"email": data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "name": data.name.strip(),
        "email": data.email.lower(),
        "password": hash_password(data.password),
        "role": "user",
        "vip_active": False,
        "vip_expires_at": None,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_id, "user")
    return {"token": token, "user": user_to_public(user_doc)}


@api_router.post("/auth/login")
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email.lower()})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user.get("role", "user"))
    return {"token": token, "user": user_to_public(user)}


@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user_to_public(user)


# ============== Routes: Games ==============
@api_router.get("/games")
async def list_games(category: Optional[str] = None, status_filter: Optional[str] = None, token: Optional[str] = Depends(oauth2_scheme)):
    # Determine VIP unlock
    vip_unlocked = False
    if token:
        try:
            payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            user = await db.users.find_one({"id": payload.get("sub")}, {"_id": 0})
            if user and (is_vip_active(user) or user.get("role") == "admin"):
                vip_unlocked = True
        except Exception:
            pass

    query = {}
    if category:
        query["category"] = category
    if status_filter:
        query["status"] = status_filter

    docs = await db.games.find(query, {"_id": 0}).sort("match_date", -1).to_list(500)
    return [game_to_public(g, vip_unlocked) for g in docs]


@api_router.get("/games/results")
async def list_results():
    docs = await db.games.find({"status": {"$in": ["won", "lost"]}}, {"_id": 0}).sort("match_date", -1).to_list(500)
    # Results are visible to all (predictions revealed)
    return [game_to_public(g, vip_unlocked=True) for g in docs]


# Admin game endpoints
@api_router.post("/admin/games")
async def create_game(data: GameCreate, admin=Depends(get_admin_user)):
    game_id = str(uuid.uuid4())
    doc = {
        "id": game_id,
        **data.model_dump(),
        "status": "pending",
        "score": None,
        "created_at": now_iso(),
    }
    await db.games.insert_one(doc)
    return game_to_public(doc, vip_unlocked=True)


@api_router.put("/admin/games/{game_id}")
async def update_game(game_id: str, data: GameUpdate, admin=Depends(get_admin_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.games.update_one({"id": game_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Game not found")
    doc = await db.games.find_one({"id": game_id}, {"_id": 0})
    return game_to_public(doc, vip_unlocked=True)


@api_router.delete("/admin/games/{game_id}")
async def delete_game(game_id: str, admin=Depends(get_admin_user)):
    result = await db.games.delete_one({"id": game_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Game not found")
    return {"status": "deleted"}


@api_router.get("/admin/users")
async def list_users(admin=Depends(get_admin_user)):
    docs = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return [user_to_public(u) for u in docs]


@api_router.get("/admin/stats")
async def admin_stats(admin=Depends(get_admin_user)):
    total_users = await db.users.count_documents({})
    vip_users = await db.users.count_documents({"vip_active": True})
    total_games = await db.games.count_documents({})
    won = await db.games.count_documents({"status": "won"})
    lost = await db.games.count_documents({"status": "lost"})
    total_payments = await db.payments.count_documents({"status": "success"})
    return {
        "total_users": total_users,
        "vip_users": vip_users,
        "total_games": total_games,
        "games_won": won,
        "games_lost": lost,
        "successful_payments": total_payments,
    }


# ============== Routes: Payments (Paystack) ==============
@api_router.post("/payment/initialize")
async def initialize_payment(data: PaymentInitRequest, user=Depends(get_current_user)):
    if PAYSTACK_SECRET_KEY.startswith("sk_test_placeholder"):
        raise HTTPException(
            status_code=503,
            detail="Paystack keys not configured. Please contact the administrator to add real Paystack API keys."
        )
    amount_pesewas = int(VIP_PRICE_GHS * 100)  # GHS smallest unit
    reference = f"vip_{uuid.uuid4().hex[:16]}"
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.post(
                "https://api.paystack.co/transaction/initialize",
                headers={
                    "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "email": user["email"],
                    "amount": amount_pesewas,
                    "currency": "GHS",
                    "reference": reference,
                    "callback_url": data.callback_url,
                    "channels": ["mobile_money", "card"],
                    "metadata": {"user_id": user["id"], "purpose": "vip_unlock"},
                },
            )
            result = response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Paystack request failed: {str(e)}")

    if not result.get("status"):
        raise HTTPException(status_code=400, detail=result.get("message", "Payment init failed"))

    # Save pending payment record
    await db.payments.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "reference": reference,
        "amount_ghs": VIP_PRICE_GHS,
        "status": "pending",
        "created_at": now_iso(),
    })
    return {
        "authorization_url": result["data"]["authorization_url"],
        "reference": result["data"]["reference"],
    }


@api_router.get("/payment/verify/{reference}")
async def verify_payment(reference: str, user=Depends(get_current_user)):
    if PAYSTACK_SECRET_KEY.startswith("sk_test_placeholder"):
        raise HTTPException(status_code=503, detail="Paystack keys not configured")
    try:
        async with httpx.AsyncClient(timeout=30.0) as http_client:
            response = await http_client.get(
                f"https://api.paystack.co/transaction/verify/{reference}",
                headers={"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"},
            )
            result = response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Paystack verify failed: {str(e)}")

    if result.get("status") and result["data"]["status"] == "success":
        # Activate VIP for 30 days
        expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"vip_active": True, "vip_expires_at": expires_at}},
        )
        await db.payments.update_one(
            {"reference": reference},
            {"$set": {"status": "success", "verified_at": now_iso()}},
        )
        updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
        return {"status": "success", "user": user_to_public(updated)}
    return {"status": "failed"}


@api_router.post("/payment/webhook")
async def paystack_webhook(request: Request):
    signature = request.headers.get("x-paystack-signature", "")
    body = await request.body()
    if PAYSTACK_SECRET_KEY.startswith("sk_test_placeholder"):
        return {"status": "ignored", "reason": "no_keys"}
    computed = hmac.new(PAYSTACK_SECRET_KEY.encode('utf-8'), body, hashlib.sha512).hexdigest()
    if not hmac.compare_digest(computed, signature):
        raise HTTPException(status_code=401, detail="Invalid signature")
    event = await request.json()
    if event.get("event") == "charge.success":
        reference = event["data"]["reference"]
        payment = await db.payments.find_one({"reference": reference})
        if payment and payment.get("status") != "success":
            expires_at = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            await db.users.update_one(
                {"id": payment["user_id"]},
                {"$set": {"vip_active": True, "vip_expires_at": expires_at}},
            )
            await db.payments.update_one(
                {"reference": reference},
                {"$set": {"status": "success", "verified_at": now_iso()}},
            )
    return {"status": "ok"}


# ============== Routes: Contact ==============
@api_router.post("/contact")
async def submit_contact(data: ContactMessageCreate):
    doc = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": now_iso(),
    }
    await db.contact_messages.insert_one(doc)
    return {"status": "received", "id": doc["id"]}


@api_router.get("/admin/contact-messages")
async def list_contact_messages(admin=Depends(get_admin_user)):
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


# ============== Startup: seed admin & demo games ==============
# (Moved to lifespan handler above)


# Include router and CORS
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
