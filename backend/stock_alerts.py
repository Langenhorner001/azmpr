import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

LOW_STOCK_THRESHOLD = 10


def dropped_below(before: Optional[int], after: Optional[int]) -> bool:
    """True only when stock newly crosses below the threshold (not on every edit while low)."""
    if not isinstance(after, int) or after >= LOW_STOCK_THRESHOLD:
        return False
    return not (isinstance(before, int) and before < LOW_STOCK_THRESHOLD)


async def send_alert(alert: dict) -> Optional[str]:
    """Delivery channel not chosen yet (WhatsApp / email). Return channel name once implemented."""
    return None


class StockAlerts:
    def __init__(self, db):
        self.db = db

    async def check(self, before: dict, update: dict):
        if "stock" not in update or not dropped_below(before.get("stock"), update["stock"]):
            return
        alert = {
            "product_id": before["id"],
            "product_name": update.get("product_name") or before.get("product_name"),
            "stock": update["stock"],
            "threshold": LOW_STOCK_THRESHOLD,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        try:
            channel = await send_alert(alert)
        except Exception as e:
            logger.error(f"Low stock alert send failed: {e}")
            channel = None
        await self.db.stock_alerts.insert_one({**alert, "status": "sent" if channel else "pending", "channel": channel})
        logger.info(f"Low stock alert recorded for product #{alert['product_id']} (stock {alert['stock']})")

    async def recent(self, limit: int = 50):
        return await self.db.stock_alerts.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
