from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Header, Depends
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import aiofiles
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

UPLOAD_DIR = ROOT_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

SECRET_KEY = os.environ.get('SECRET_KEY', 'az-distribution-jwt-secret-2026')
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
    image_url: str
    images: Optional[List[str]] = []
    description: str
    variations: Optional[List[str]] = []
    stock: Optional[int] = 0
    stock_status: str = "Available"
    hidden: Optional[bool] = False

class ProductCreate(BaseModel):
    product_name: str
    category: str
    description: str
    price: Optional[str] = "Contact for pricing"
    image_url: str
    images: Optional[List[str]] = []
    variations: Optional[List[str]] = []
    stock: Optional[int] = 0
    stock_status: str = "Available"
    hidden: Optional[bool] = False

class VisibilityToggle(BaseModel):
    hidden: bool

class BulkVisibility(BaseModel):
    ids: List[int]
    hidden: bool

class BulkDelete(BaseModel):
    ids: List[int]


# ── Seed Data (loaded from /app/backend/data/products.json — 50 real products from Daraz export) ──

import json as _json
_seed_path = ROOT_DIR / "data" / "products.json"
try:
    with open(_seed_path, "r", encoding="utf-8") as _f:
        SEED_PRODUCTS = _json.load(_f)
except Exception as _e:
    SEED_PRODUCTS = []
    logging.error(f"Could not load seed products: {_e}")


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
    to_insert = [p for p in SEED_PRODUCTS if p.get("id") not in existing_ids]
    if to_insert:
        await db.products.insert_many(to_insert)
        logger.info(f"Inserted {len(to_insert)} products (existing: {len(existing_ids)})")
    else:
        logger.info(f"Products already seeded ({len(existing_ids)} found)")


# ── Public Routes ─────────────────────────────────────────────────────────────

@api_router.get("/health")
async def health():
    return {"status": "ok", "service": "AZ Distribution API"}


@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    # Public endpoint excludes hidden products
    query = {"hidden": {"$ne": True}}
    if category and category != "all":
        query["category"] = category
    products = await db.products.find(query, {"_id": 0}).sort("id", 1).to_list(1000)
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
    if data.password == os.environ.get('ADMIN_PASSWORD', 'azdist2026'):
        token = create_admin_token()
        return {"token": token, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid password")


@api_router.get("/admin/stats")
async def admin_stats(_: bool = Depends(get_admin_user)):
    products_count = await db.products.count_documents({})
    inquiries_count = await db.contact_inquiries.count_documents({})
    recent = await db.contact_inquiries.find({}, {"_id": 0}).sort("timestamp", -1).limit(5).to_list(5)
    return {
        "products_count": products_count,
        "inquiries_count": inquiries_count,
        "recent_inquiries": recent,
    }


@api_router.get("/admin/products", response_model=List[Product])
async def admin_get_products(_: bool = Depends(get_admin_user)):
    products = await db.products.find({}, {"_id": 0}).sort("id", 1).to_list(1000)
    # Ensure 'hidden' is always present (default False) for API consistency
    for p in products:
        if "hidden" not in p:
            p["hidden"] = False
    return products


@api_router.post("/admin/products")
async def admin_create_product(product: ProductCreate, _: bool = Depends(get_admin_user)):
    all_ids = await db.products.distinct("id")
    new_id = max(all_ids, default=0) + 1
    doc = product.model_dump()
    doc["id"] = new_id
    await db.products.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/admin/products/{product_id}")
async def admin_update_product(product_id: int, product: ProductCreate, _: bool = Depends(get_admin_user)):
    doc = product.model_dump()
    result = await db.products.update_one({"id": product_id}, {"$set": doc})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc["id"] = product_id
    return doc


@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: int, _: bool = Depends(get_admin_user)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}


@api_router.patch("/admin/products/{product_id}/visibility")
async def admin_toggle_visibility(product_id: int, data: VisibilityToggle, _: bool = Depends(get_admin_user)):
    result = await db.products.update_one(
        {"id": product_id}, {"$set": {"hidden": data.hidden}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"id": product_id, "hidden": data.hidden}


@api_router.post("/admin/products/bulk-visibility")
async def admin_bulk_visibility(data: BulkVisibility, _: bool = Depends(get_admin_user)):
    if not data.ids:
        raise HTTPException(status_code=400, detail="ids list cannot be empty")
    result = await db.products.update_many(
        {"id": {"$in": data.ids}}, {"$set": {"hidden": data.hidden}}
    )
    return {"matched": result.matched_count, "modified": result.modified_count, "hidden": data.hidden}


@api_router.post("/admin/products/bulk-delete")
async def admin_bulk_delete(data: BulkDelete, _: bool = Depends(get_admin_user)):
    if not data.ids:
        raise HTTPException(status_code=400, detail="ids list cannot be empty")
    result = await db.products.delete_many({"id": {"$in": data.ids}})
    return {"deleted": result.deleted_count}


@api_router.post("/admin/upload")
async def upload_image(file: UploadFile = File(...), _: bool = Depends(get_admin_user)):
    ext = Path(file.filename).suffix.lower() if file.filename else ".jpg"
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        raise HTTPException(400, "Invalid file type. Allowed: jpg, jpeg, png, webp, gif")
    filename = f"{uuid.uuid4()}{ext}"
    file_path = UPLOAD_DIR / filename
    async with aiofiles.open(str(file_path), "wb") as f:
        content = await file.read()
        await f.write(content)
    return {"url": f"/api/static/uploads/{filename}"}


# ── App Setup ─────────────────────────────────────────────────────────────────

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
