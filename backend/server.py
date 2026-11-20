from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Header, Depends, Response
from fastapi.concurrency import run_in_threadpool
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import requests
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from admin_products import build_admin_products_router
from settings_routes import build_settings_router

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

UPLOAD_DIR = ROOT_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.environ['SECRET_KEY']
ALGORITHM = "HS256"

app = FastAPI(title="AZ Distribution API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ── Models ───────────────────────────────────────────────────────────────────

class AdminLoginData(BaseModel):
    password: str

class ContactInquiry(BaseModel):
    full_name: str
    business_name: str
    phone: str
    email: Optional[str] = None
    message: Optional[str] = None

class ContactResponse(BaseModel):
    id: str
    full_name: str
    business_name: str
    phone: str
    email: Optional[str] = None
    message: Optional[str] = None
    timestamp: str

class Product(BaseModel):
    id: int
    product_id: Optional[str] = None
    product_name: str
    product_name_full: Optional[str] = None
    product_name_urdu: Optional[str] = None
    category: str
    price: Optional[str] = "Contact for pricing"
    image_url: Optional[str] = ""
    images: Optional[List[str]] = []
    description: Optional[str] = ""
    variations: Optional[List[str]] = []
    stock: Optional[int] = 0
    stock_status: str = "Available"
    hidden: Optional[bool] = False


# ── Seed Data (loaded from /app/backend/data/products.json — 50 real products from Daraz export) ──

import json as _json
_seed_path = ROOT_DIR / "data" / "products.json"
try:
    with open(_seed_path, "r", encoding="utf-8") as _f:
        SEED_PRODUCTS = _json.load(_f)
except Exception as _e:
    SEED_PRODUCTS = []
    logging.error(f"Could not load seed products: {_e}")


# ── Object Storage ────────────────────────────────────────────────────────────

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "azmpr"
MIME_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif"}
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": init_storage(), "Content-Type": content_type},
        data=data, timeout=120,
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": init_storage()}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ── Auth Helpers ──────────────────────────────────────────────────────────────

def create_admin_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    return jwt.encode({"admin": True, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

async def get_admin_user(authorization: Optional[str] = Header(None)) -> bool:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if not payload.get("admin"):
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return True


# ── Startup Seed (preserves admin overrides: hidden, edits) ───────────────────

# Names of the 20 placeholder/default products that were seeded in the very
# first iteration. These must be purged on startup so they never reappear in
# environments (like production) that were initialised before the real
# Daraz import. Match by exact product_name AND missing product_id field
# to avoid accidentally deleting admin-created products.
_LEGACY_DEFAULT_NAMES = [
    "Shirin Asal Premium Chocolate Box",
    "Golden Milk Chocolate Bars",
    "Patchi Dark Chocolate Collection",
    "Persian Truffle Delight",
    "Hamid Wafer Chocolate Rolls",
    "Rose Cream Chocolate Assortment",
    "Persian Nougat (Gaz-e-Isfahan)",
    "Saffron Rock Candy (Nabat)",
    "Rose Water Turkish Delight",
    "Iranian Halva Premium Tins",
    "Badam Pistachio Mix",
    "Mango Lava Shak Sheet",
    "Sour Plum Lava Sheet",
    "Tamarind Spice Lava Sheet",
    "Mixed Berry Lava Sheet",
    "Watermelon Lava Sheet",
    "Persian Pomegranate Juice",
    "Saffron Rose Water Drink",
    "Cherry Sour Beverage",
    "Mint Lime Sharbat Syrup",
]


@app.on_event("startup")
async def seed_products():
    """
    Seed strategy:
    1. Purge legacy placeholder products (matched by name + missing product_id).
       These shipped in iteration 1 and must not reappear anywhere.
    2. Insert any products from products.json whose `id` is not already in DB.
       Preserves admin edits (hidden flag, custom edits) across restarts.
    """
    # Step 1: purge legacy defaults
    purge_result = await db.products.delete_many({
        "product_name": {"$in": _LEGACY_DEFAULT_NAMES},
        "$or": [
            {"product_id": {"$exists": False}},
            {"product_id": None},
            {"product_id": ""},
        ],
    })
    if purge_result.deleted_count:
        logger.info(f"Purged {purge_result.deleted_count} legacy default products")

    # Step 2: insert new products from JSON (by id, idempotent)
    if not SEED_PRODUCTS:
        logger.warning("SEED_PRODUCTS empty — nothing seeded")
        return
    existing_ids = set(await db.products.distinct("id"))
    # Permanently deleted products are tombstoned so they never get re-seeded
    removed_ids = set(await db.deleted_product_ids.distinct("id"))
    to_insert = [p for p in SEED_PRODUCTS if p.get("id") not in existing_ids | removed_ids]
    if to_insert:
        await db.products.insert_many(to_insert)
        logger.info(f"Inserted {len(to_insert)} products (existing: {len(existing_ids)})")
    else:
        logger.info(f"Products already seeded ({len(existing_ids)} found)")


@app.on_event("startup")
async def ensure_indexes():
    try:
        await db.products.create_index("id", unique=True)
        await db.deleted_product_ids.create_index("id", unique=True)
    except Exception as e:
        logger.error(f"Index creation failed: {e}")


@app.on_event("startup")
async def startup_storage():
    try:
        await run_in_threadpool(init_storage)
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


# ── Public Routes ─────────────────────────────────────────────────────────────

@api_router.get("/health")
async def health():
    return {"status": "ok", "service": "AZ Distribution API"}


@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    # Public endpoint excludes hidden products
    query = {"hidden": {"$ne": True}, "deleted": {"$ne": True}}
    if category and category != "all":
        query["category"] = category
    # Prices stay in DB (admin) but are not exposed publicly — deals via WhatsApp
    products = await db.products.find(query, {"_id": 0, "price": 0}).sort("id", 1).to_list(1000)
    return products


@api_router.post("/contact", response_model=ContactResponse)
async def submit_contact(inquiry: ContactInquiry):
    doc = {
        "id": str(uuid.uuid4()),
        "full_name": inquiry.full_name,
        "business_name": inquiry.business_name,
        "phone": inquiry.phone,
        "email": inquiry.email,
        "message": inquiry.message,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    await db.contact_inquiries.insert_one(doc)
    doc.pop("_id", None)
    return ContactResponse(**doc)


# ── Admin Routes ──────────────────────────────────────────────────────────────

@api_router.post("/admin/login")
async def admin_login(data: AdminLoginData):
    if data.password == os.environ['ADMIN_PASSWORD']:
        token = create_admin_token()
        return {"token": token, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid password")


@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), _: bool = Depends(get_admin_user)):
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if ext not in MIME_TYPES:
        raise HTTPException(400, "Invalid file type. Allowed: jpg, jpeg, png, webp, gif")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}{ext}"
    data = await file.read()
    result = await run_in_threadpool(put_object, path, data, MIME_TYPES[ext])
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": MIME_TYPES[ext],
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"url": f"/api/files/{result['path']}"}


# Public: product images are shown to all visitors
@api_router.get("/files/{path:path}")
async def get_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = await run_in_threadpool(get_object, path)
    return Response(
        content=data,
        media_type=record.get("content_type", content_type),
        headers={"Cache-Control": "public, max-age=86400"},
    )


# ── App Setup ─────────────────────────────────────────────────────────────────

api_router.include_router(build_admin_products_router(db, get_admin_user))
api_router.include_router(build_settings_router(db, get_admin_user))
app.include_router(api_router)

# Serve uploaded images
app.mount("/api/static", StaticFiles(directory=str(ROOT_DIR / "static")), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
