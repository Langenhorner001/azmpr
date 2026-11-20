import csv
import io
import re
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse
from openpyxl import load_workbook
from pydantic import BaseModel, field_validator
from pymongo.errors import DuplicateKeyError

from stock_alerts import LOW_STOCK_THRESHOLD, StockAlerts

CATEGORIES = {
    "chocolates": "Chocolates",
    "candies-toffees": "Candies & Toffees",
    "chewing-gum": "Chewing Gum",
    "dates-dryfruits": "Dates & Dry Fruits",
    "accessories": "Accessories",
}
STOCK_STATUSES = ["Available", "Limited Stock", "Out of Stock"]
CSV_COLUMNS = ["id", "product_name", "category", "price", "stock", "stock_status", "hidden", "image_url", "description"]
ACTIVE = {"deleted": {"$ne": True}}
TRASH = {"deleted": True}
MAX_IMPORT_BYTES = 5 * 1024 * 1024
MAX_IMPORT_ROWS = 2000


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_category(value) -> Optional[str]:
    v = str(value or "").strip().lower()
    for slug, label in CATEGORIES.items():
        if v in (slug, label.lower(), slug.replace("-", " ")):
            return slug
    return None


def normalize_status(value) -> Optional[str]:
    v = str(value or "").strip().lower()
    return next((s for s in STOCK_STATUSES if s.lower() == v), None)


def adjust_price(price: Optional[str], pct: float) -> Optional[str]:
    if not price:
        return price

    def repl(m):
        n = float(m.group(0).replace(",", ""))
        return f"{max(0, round(n * (1 + pct / 100))):,}"

    return re.sub(r"\d[\d,]*(?:\.\d+)?", repl, price)


def sync_stock_status(update: dict, current: Optional[dict] = None) -> dict:
    """Keep stock qty and stock status consistent (landing treats stock 0 as out of stock)."""
    current = current or {}
    if "stock" in update and "stock_status" not in update:
        if update["stock"] == 0:
            update["stock_status"] = "Out of Stock"
        elif update["stock"] and current.get("stock_status") == "Out of Stock":
            update["stock_status"] = "Available"
    elif update.get("stock_status") in ("Available", "Limited Stock") and "stock" not in update:
        if current.get("stock") == 0:
            update["stock"] = None
    return update


class ProductIn(BaseModel):
    product_name: str
    category: str
    description: Optional[str] = ""
    price: Optional[str] = "Contact for pricing"
    image_url: Optional[str] = ""
    images: Optional[List[str]] = []
    variations: Optional[List[str]] = []
    stock: Optional[int] = None
    stock_status: str = "Available"
    hidden: Optional[bool] = False

    @field_validator("image_url", "description", mode="before")
    @classmethod
    def none_to_empty(cls, v):
        return "" if v is None else v

    @field_validator("price", mode="before")
    @classmethod
    def default_price(cls, v):
        return v if v and str(v).strip() else "Contact for pricing"

    @field_validator("product_name")
    @classmethod
    def name_required(cls, v):
        if not v or not v.strip():
            raise ValueError("Product name is required")
        return v.strip()

    @field_validator("category")
    @classmethod
    def valid_category(cls, v):
        slug = normalize_category(v)
        if not slug:
            raise ValueError("Invalid category")
        return slug

    @field_validator("stock_status")
    @classmethod
    def valid_status(cls, v):
        s = normalize_status(v)
        if not s:
            raise ValueError("Invalid stock status")
        return s

    @field_validator("stock")
    @classmethod
    def valid_stock(cls, v):
        if v is not None and v < 0:
            raise ValueError("Stock cannot be negative")
        return v


class ProductPatch(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    image_url: Optional[str] = None
    stock: Optional[int] = None
    stock_status: Optional[str] = None
    hidden: Optional[bool] = None

    @field_validator("image_url", "description", mode="before")
    @classmethod
    def none_to_empty(cls, v):
        return "" if v is None else v

    @field_validator("price", mode="before")
    @classmethod
    def default_price(cls, v):
        return v if v and str(v).strip() else "Contact for pricing"

    @field_validator("hidden", mode="before")
    @classmethod
    def hidden_bool(cls, v):
        return bool(v)

    @field_validator("category")
    @classmethod
    def valid_category(cls, v):
        if v is None:
            return v
        slug = normalize_category(v)
        if not slug:
            raise ValueError("Invalid category")
        return slug

    @field_validator("stock_status")
    @classmethod
    def valid_status(cls, v):
        if v is None:
            return v
        s = normalize_status(v)
        if not s:
            raise ValueError("Invalid stock status")
        return s

    @field_validator("stock")
    @classmethod
    def valid_stock(cls, v):
        if v is not None and v < 0:
            raise ValueError("Stock cannot be negative")
        return v


class BulkIds(BaseModel):
    ids: List[int]


class BulkVisibility(BulkIds):
    hidden: bool


class VisibilityToggle(BaseModel):
    hidden: bool


class BulkUpdate(ProductPatch):
    ids: List[int]
    price_percent: Optional[float] = None


def require_ids(ids: List[int]):
    if not ids:
        raise HTTPException(status_code=400, detail="ids list cannot be empty")


def parse_rows(filename: str, content: bytes) -> List[dict]:
    name = (filename or "").lower()
    if name.endswith(".xlsx"):
        try:
            wb = load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        except Exception:
            raise HTTPException(status_code=400, detail="Could not read Excel file")
        rows = list(wb.active.iter_rows(values_only=True))
        if not rows:
            return []
        header = [str(h or "").strip() for h in rows[0]]
        data = [dict(zip(header, r)) for r in rows[1:]]
    elif name.endswith(".csv"):
        try:
            text = content.decode("utf-8-sig")
        except UnicodeDecodeError:
            text = content.decode("latin-1")
        data = list(csv.DictReader(io.StringIO(text)))
    else:
        raise HTTPException(status_code=400, detail="Only .csv or .xlsx files are allowed")
    normalized = []
    for row in data:
        clean = {str(k or "").strip().lower().replace(" ", "_"): ("" if v is None else str(v).strip()) for k, v in row.items()}
        if any(clean.values()):
            normalized.append(clean)
    return normalized


def to_int(value) -> Optional[int]:
    if value in ("", None):
        return None
    return int(float(str(value).replace(",", "")))


def validate_row(row: dict, existing_ids: set, trashed_ids: set) -> dict:
    errors, warnings = [], []
    name = row.get("product_name") or row.get("name") or ""
    if not name:
        errors.append("Product name missing")
    category = normalize_category(row.get("category"))
    if not category:
        errors.append(f"Invalid category '{row.get('category', '')}'")
    status_raw = row.get("stock_status", "")
    status = normalize_status(status_raw) if status_raw else "Available"
    if not status:
        errors.append(f"Invalid stock status '{status_raw}'")
    stock = None
    try:
        stock = to_int(row.get("stock"))
        if stock is not None and stock < 0:
            errors.append("Stock cannot be negative")
    except ValueError:
        errors.append(f"Stock must be a number ('{row.get('stock')}')")
    price = row.get("price") or "Contact for pricing"
    m = re.fullmatch(r"(?:rs\.?\s*)?(\d[\d,]*(?:\.\d+)?)", price.strip(), re.IGNORECASE)
    if m:
        price = f"Rs {round(float(m.group(1).replace(',', ''))):,}"
    hidden = str(row.get("hidden", "")).lower() in ("1", "true", "yes", "y", "hidden")
    image_url = row.get("image_url", "")
    pid = None
    try:
        pid = to_int(row.get("id"))
    except ValueError:
        errors.append(f"Invalid id '{row.get('id')}'")
    if pid in trashed_ids:
        errors.append(f"Product #{pid} is in Trash — restore it first")
    if not image_url and pid not in existing_ids:
        warnings.append("No image — placeholder will show")
    action = "error" if errors else ("update" if pid in existing_ids else "create")
    doc = {
        "product_name": name,
        "category": category,
        "price": price,
        "stock": stock,
        "stock_status": status,
        "hidden": hidden,
        "image_url": image_url,
        "description": row.get("description", ""),
    }
    if stock == 0:
        doc["stock_status"] = "Out of Stock"
    return {"id": pid if action == "update" else None, "action": action, "errors": errors, "warnings": warnings, **doc}


def csv_response(rows: List[dict], filename: str) -> StreamingResponse:
    buf = io.StringIO()
    buf.write("\ufeff")
    writer = csv.DictWriter(buf, fieldnames=CSV_COLUMNS, extrasaction="ignore")
    writer.writeheader()
    for r in rows:
        writer.writerow({**r, "hidden": "yes" if r.get("hidden") else "no", "stock": "" if r.get("stock") is None else r.get("stock")})
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def build_admin_products_router(db, auth_dep) -> APIRouter:
    router = APIRouter(prefix="/admin", dependencies=[Depends(auth_dep)])
    alerts = StockAlerts(db)

    async def next_id() -> int:
        ids = await db.products.distinct("id")
        tomb = await db.deleted_product_ids.distinct("id")
        return max([*ids, *tomb], default=0) + 1

    async def get_or_404(product_id: int, query: Optional[dict] = None) -> dict:
        doc = await db.products.find_one({"id": product_id, **(query or {})}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Product not found")
        return doc

    async def insert_new(doc: dict) -> dict:
        # products.id has a unique index; retry if a concurrent create took the same id
        for _ in range(5):
            doc["id"] = await next_id()
            try:
                await db.products.insert_one(doc)
                doc.pop("_id", None)
                return doc
            except DuplicateKeyError:
                doc.pop("_id", None)
        raise HTTPException(status_code=409, detail="Could not allocate product id, please retry")

    async def permanently_delete(query: dict) -> int:
        ids = await db.products.distinct("id", query)
        if not ids:
            return 0
        for i in ids:
            await db.deleted_product_ids.update_one({"id": i}, {"$set": {"deleted_at": now_iso()}}, upsert=True)
        result = await db.products.delete_many({"id": {"$in": ids}})
        return result.deleted_count

    @router.get("/stats")
    async def stats():
        active = ACTIVE
        oos = {"$or": [{"stock_status": "Out of Stock"}, {"stock": 0}]}
        return {
            "products_count": await db.products.count_documents(active),
            "visible_count": await db.products.count_documents({**active, "hidden": {"$ne": True}}),
            "hidden_count": await db.products.count_documents({**active, "hidden": True}),
            "out_of_stock_count": await db.products.count_documents({**active, **oos}),
            "low_stock_count": await db.products.count_documents(
                {**active, "stock": {"$gt": 0, "$lt": LOW_STOCK_THRESHOLD}, "stock_status": {"$ne": "Out of Stock"}}
            ),
            "trash_count": await db.products.count_documents(TRASH),
            "inquiries_count": await db.contact_inquiries.count_documents({}),
            "recent_inquiries": await db.contact_inquiries.find({}, {"_id": 0}).sort("timestamp", -1).limit(50).to_list(50),
        }

    @router.get("/stock-alerts")
    async def stock_alerts():
        return await alerts.recent()

    @router.get("/products")
    async def list_products(trash: bool = False):
        docs = await db.products.find(TRASH if trash else ACTIVE, {"_id": 0}).sort("id", 1).to_list(5000)
        for d in docs:
            d.setdefault("hidden", False)
        return docs

    @router.post("/products")
    async def create_product(product: ProductIn):
        doc = product.model_dump()
        if doc["stock"] == 0:
            doc["stock_status"] = "Out of Stock"
        doc.update({"created_at": now_iso(), "updated_at": now_iso()})
        return await insert_new(doc)

    @router.put("/products/{product_id}")
    async def replace_product(product_id: int, product: ProductIn):
        current = await get_or_404(product_id)
        doc = {**product.model_dump(), "updated_at": now_iso()}
        if doc["stock"] == 0:
            doc["stock_status"] = "Out of Stock"
        await db.products.update_one({"id": product_id}, {"$set": doc})
        await alerts.check(current, doc)
        return await get_or_404(product_id)

    @router.patch("/products/{product_id}")
    async def patch_product(product_id: int, patch: ProductPatch):
        current = await get_or_404(product_id)
        update = patch.model_dump(exclude_unset=True)
        if not update:
            raise HTTPException(status_code=400, detail="Nothing to update")
        if "product_name" in update and not (update["product_name"] or "").strip():
            raise HTTPException(status_code=400, detail="Product name is required")
        update = sync_stock_status(update, current)
        update["updated_at"] = now_iso()
        await db.products.update_one({"id": product_id}, {"$set": update})
        await alerts.check(current, update)
        return await get_or_404(product_id)

    @router.patch("/products/{product_id}/visibility")
    async def toggle_visibility(product_id: int, data: VisibilityToggle):
        await get_or_404(product_id)
        await db.products.update_one({"id": product_id}, {"$set": {"hidden": data.hidden, "updated_at": now_iso()}})
        return {"id": product_id, "hidden": data.hidden}

    @router.post("/products/{product_id}/duplicate")
    async def duplicate_product(product_id: int):
        src = await get_or_404(product_id, ACTIVE)
        for key in ("product_id", "deleted", "deleted_at"):
            src.pop(key, None)
        src.update({
            "product_name": f"{src['product_name']} (Copy)",
            "hidden": True,
            "created_at": now_iso(),
            "updated_at": now_iso(),
        })
        return await insert_new(src)

    @router.delete("/products/{product_id}")
    async def trash_product(product_id: int):
        await get_or_404(product_id, ACTIVE)
        await db.products.update_one({"id": product_id}, {"$set": {"deleted": True, "deleted_at": now_iso()}})
        return {"id": product_id, "trashed": True}

    @router.post("/products/{product_id}/restore")
    async def restore_product(product_id: int):
        await get_or_404(product_id, TRASH)
        await db.products.update_one({"id": product_id}, {"$set": {"deleted": False, "deleted_at": None}})
        return {"id": product_id, "restored": True}

    @router.delete("/products/{product_id}/permanent")
    async def delete_permanently(product_id: int):
        await get_or_404(product_id, TRASH)
        await permanently_delete({"id": product_id, **TRASH})
        return {"id": product_id, "deleted": True}

    @router.post("/products/bulk-visibility")
    async def bulk_visibility(data: BulkVisibility):
        require_ids(data.ids)
        r = await db.products.update_many(
            {"id": {"$in": data.ids}, **ACTIVE}, {"$set": {"hidden": data.hidden, "updated_at": now_iso()}}
        )
        return {"matched": r.matched_count, "modified": r.modified_count, "hidden": data.hidden}

    @router.post("/products/bulk-update")
    async def bulk_update(data: BulkUpdate):
        require_ids(data.ids)
        fields = data.model_dump(exclude_unset=True, exclude={"ids", "price_percent"})
        fields.pop("product_name", None)
        fields.pop("description", None)
        fields.pop("image_url", None)
        if not fields and data.price_percent is None:
            raise HTTPException(status_code=400, detail="Choose at least one field to change")
        if data.price_percent is not None and "price" in fields:
            raise HTTPException(status_code=400, detail="Use either a fixed price or a % change, not both")
        docs = await db.products.find({"id": {"$in": data.ids}, **ACTIVE}, {"_id": 0}).to_list(5000)
        for doc in docs:
            update = sync_stock_status(dict(fields), doc)
            if data.price_percent is not None:
                update["price"] = adjust_price(doc.get("price"), data.price_percent)
            update["updated_at"] = now_iso()
            await db.products.update_one({"id": doc["id"]}, {"$set": update})
            await alerts.check(doc, update)
        return {"updated": len(docs)}

    @router.post("/products/bulk-delete")
    async def bulk_trash(data: BulkIds):
        require_ids(data.ids)
        r = await db.products.update_many(
            {"id": {"$in": data.ids}, **ACTIVE}, {"$set": {"deleted": True, "deleted_at": now_iso()}}
        )
        return {"trashed": r.modified_count}

    @router.post("/products/bulk-restore")
    async def bulk_restore(data: BulkIds):
        require_ids(data.ids)
        r = await db.products.update_many(
            {"id": {"$in": data.ids}, **TRASH}, {"$set": {"deleted": False, "deleted_at": None}}
        )
        return {"restored": r.modified_count}

    @router.post("/products/bulk-permanent-delete")
    async def bulk_permanent(data: BulkIds):
        require_ids(data.ids)
        return {"deleted": await permanently_delete({"id": {"$in": data.ids}, **TRASH})}

    @router.post("/products/empty-trash")
    async def empty_trash():
        return {"deleted": await permanently_delete(TRASH)}

    @router.get("/products/export")
    async def export_products(ids: Optional[str] = Query(None)):
        query = dict(ACTIVE)
        if ids:
            id_list = [int(i) for i in ids.split(",") if i.strip().isdigit()]
            if not id_list:
                raise HTTPException(status_code=400, detail="No valid product ids to export")
            query["id"] = {"$in": id_list}
        docs = await db.products.find(query, {"_id": 0}).sort("id", 1).to_list(5000)
        return csv_response(docs, "az_products_export.csv")

    @router.get("/products/import-template")
    async def import_template():
        samples = [
            {"product_name": "FOX Choco Wafer 30Pcs", "category": "chocolates", "price": "Rs 1,999", "stock": 25,
             "stock_status": "Available", "hidden": False, "image_url": "https://example.com/fox.jpg",
             "description": "Crispy wafer chocolate bar, imported box of 30"},
            {"product_name": "Ajwa Dates 500g", "category": "dates-dryfruits", "price": "Contact for pricing", "stock": None,
             "stock_status": "Limited Stock", "hidden": True, "image_url": "",
             "description": "Premium dates — leave id empty to add new; fill id to update an existing product"},
        ]
        return csv_response(samples, "az_products_template.csv")

    @router.post("/products/import")
    async def import_products(file: UploadFile = File(...), dry_run: bool = True):
        content = await file.read()
        if len(content) > MAX_IMPORT_BYTES:
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")
        rows = parse_rows(file.filename, content)
        if not rows:
            raise HTTPException(status_code=400, detail="File has no product rows")
        if len(rows) > MAX_IMPORT_ROWS:
            raise HTTPException(status_code=400, detail=f"Too many rows (max {MAX_IMPORT_ROWS})")
        existing = set(await db.products.distinct("id", ACTIVE))
        trashed = set(await db.products.distinct("id", TRASH))
        results = [{"row": i + 2, **validate_row(r, existing, trashed)} for i, r in enumerate(rows)]
        summary = {
            "total": len(results),
            "to_create": sum(r["action"] == "create" for r in results),
            "to_update": sum(r["action"] == "update" for r in results),
            "errors": sum(r["action"] == "error" for r in results),
            "rows": results,
            "dry_run": dry_run,
            "created": 0,
            "updated": 0,
        }
        if dry_run:
            return summary
        keys = ["product_name", "category", "price", "stock", "stock_status", "hidden", "image_url", "description"]
        update_ids = [r["id"] for r in results if r["action"] == "update"]
        before = {d["id"]: d for d in await db.products.find({"id": {"$in": update_ids}}, {"_id": 0}).to_list(5000)}
        for r in results:
            doc = {k: r[k] for k in keys}
            if r["action"] == "update":
                # Blank image/description in the sheet keeps the existing value
                for k in ("image_url", "description"):
                    if not doc[k]:
                        doc.pop(k)
                await db.products.update_one({"id": r["id"]}, {"$set": {**doc, "updated_at": now_iso()}})
                await alerts.check(before[r["id"]], doc)
                summary["updated"] += 1
            elif r["action"] == "create":
                doc.update({"images": [], "variations": [], "created_at": now_iso(), "updated_at": now_iso()})
                await insert_new(doc)
                summary["created"] += 1
        return summary

    return router
