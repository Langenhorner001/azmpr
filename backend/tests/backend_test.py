"""
Backend API tests for AZ Distribution
Covers: health, public products (list+filter+hidden exclusion), contact,
admin (login+stats+products CRUD), product visibility toggle (hide/unhide).
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://azdist-preview.preview.emergentagent.com").rstrip("/")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
EXPECTED_CATEGORIES = {"chocolates", "candies-toffees", "chewing-gum", "dates-dryfruits", "accessories"}
EXPECTED_TOTAL = 50


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json().get("token")


@pytest.fixture
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ── Health ──
class TestHealth:
    def test_health_ok(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"


# ── Public Products ──
class TestProducts:
    def test_get_all_products(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        products = r.json()
        assert isinstance(products, list)
        assert len(products) == EXPECTED_TOTAL, f"Expected {EXPECTED_TOTAL} products, got {len(products)}"
        cats = {p["category"] for p in products}
        assert cats.issubset(EXPECTED_CATEGORIES), f"Unexpected categories: {cats - EXPECTED_CATEGORIES}"
        sample = products[0]
        for f in ("id", "product_name", "category", "image_url", "description", "stock_status"):
            assert f in sample
        # Hidden products MUST NOT appear in public list
        for p in products:
            assert p.get("hidden") in (False, None), f"Hidden product leaked: {p['id']}"

    def test_filter_chocolates(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products", params={"category": "chocolates"})
        assert r.status_code == 200
        prods = r.json()
        assert len(prods) > 0
        assert all(p["category"] == "chocolates" for p in prods)

    def test_filter_all_returns_all(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/products", params={"category": "all"})
        assert r.status_code == 200
        assert len(r.json()) == EXPECTED_TOTAL


# ── Contact ──
class TestContact:
    def test_submit_contact(self, api_client):
        payload = {
            "full_name": "TEST_Ali Khan",
            "business_name": "TEST_Khan Mart",
            "phone": "+92-300-1234567",
            "email": "test_ali@example.com",
            "message": "Wholesale inquiry test",
        }
        r = api_client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "id" in data and isinstance(data["id"], str) and len(data["id"]) > 0
        assert data["full_name"] == payload["full_name"]
        assert "timestamp" in data

    def test_submit_contact_minimal(self, api_client):
        payload = {"full_name": "TEST_Min User", "business_name": "TEST_Min Biz", "phone": "+92-318-0000000"}
        r = api_client.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200, r.text

    def test_submit_contact_missing_required(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/contact", json={"full_name": "x"})
        assert r.status_code == 422


# ── Admin Auth + Stats ──
class TestAdmin:
    def test_login_success(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert "token" in d and len(d["token"]) > 20

    def test_login_wrong_password(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong"})
        assert r.status_code == 401

    def test_stats_no_token(self):
        r = requests.get(f"{BASE_URL}/api/admin/stats")
        assert r.status_code == 401

    def test_stats_invalid_token(self):
        r = requests.get(f"{BASE_URL}/api/admin/stats", headers={"Authorization": "Bearer not-a-real-token"})
        assert r.status_code == 401

    def test_stats_valid_token(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "products_count" in data and data["products_count"] >= EXPECTED_TOTAL
        assert "inquiries_count" in data and isinstance(data["inquiries_count"], int)
        assert "recent_inquiries" in data and isinstance(data["recent_inquiries"], list)

    def test_admin_products_list_includes_all(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        assert r.status_code == 200
        products = r.json()
        assert len(products) >= EXPECTED_TOTAL
        # 'hidden' field is optional in DB but treated as False if missing.
        # Confirm hidden is either absent OR a boolean.
        for p in products:
            if "hidden" in p:
                assert isinstance(p["hidden"], bool)

    def test_admin_product_crud(self, auth_headers):
        new_prod = {
            "product_name": "TEST_Temp Product",
            "category": "chocolates",
            "description": "TEST product",
            "price": "Contact for pricing",
            "image_url": "https://example.com/x.jpg",
            "stock_status": "Available",
        }
        r = requests.post(f"{BASE_URL}/api/admin/products", json=new_prod, headers=auth_headers)
        assert r.status_code == 200, r.text
        created = r.json()
        pid = created["id"]
        assert created["product_name"] == "TEST_Temp Product"

        upd = {**new_prod, "product_name": "TEST_Temp Product Updated"}
        r = requests.put(f"{BASE_URL}/api/admin/products/{pid}", json=upd, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["product_name"] == "TEST_Temp Product Updated"

        r = requests.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers)
        assert r.status_code == 200

        r = requests.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers)
        assert r.status_code == 404


# ── NEW: Visibility Toggle (Hide/Unhide) ──
class TestVisibility:
    """Test PATCH /api/admin/products/{id}/visibility endpoint and public exclusion."""

    def test_visibility_requires_auth(self):
        r = requests.patch(f"{BASE_URL}/api/admin/products/1/visibility", json={"hidden": True})
        assert r.status_code == 401

    def test_visibility_invalid_token(self):
        r = requests.patch(
            f"{BASE_URL}/api/admin/products/1/visibility",
            json={"hidden": True},
            headers={"Authorization": "Bearer bogus"},
        )
        assert r.status_code == 401

    def test_visibility_nonexistent_product(self, auth_headers):
        r = requests.patch(
            f"{BASE_URL}/api/admin/products/999999/visibility",
            json={"hidden": True},
            headers=auth_headers,
        )
        assert r.status_code == 404

    def test_hide_unhide_flow(self, api_client, auth_headers):
        """Full lifecycle: public count baseline → hide one → public count drops →
        admin still sees it with hidden=true → unhide → public count restored."""
        # 1. Baseline public count
        baseline = api_client.get(f"{BASE_URL}/api/products").json()
        baseline_count = len(baseline)
        target = baseline[0]  # pick the first product
        target_id = target["id"]

        # 2. Hide the product
        try:
            r = requests.patch(
                f"{BASE_URL}/api/admin/products/{target_id}/visibility",
                json={"hidden": True},
                headers=auth_headers,
            )
            assert r.status_code == 200, r.text
            body = r.json()
            assert body["id"] == target_id
            assert body["hidden"] is True

            # 3. Public list should no longer include it
            after_hide = api_client.get(f"{BASE_URL}/api/products").json()
            assert len(after_hide) == baseline_count - 1, (
                f"Public count should drop by 1: was {baseline_count}, got {len(after_hide)}"
            )
            assert all(p["id"] != target_id for p in after_hide), "Hidden product still in public list"

            # 4. Admin list still includes it with hidden=true
            admin_list = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers).json()
            hidden_match = next((p for p in admin_list if p["id"] == target_id), None)
            assert hidden_match is not None, "Admin should still see hidden product"
            assert hidden_match["hidden"] is True

        finally:
            # 5. Always unhide to restore state
            r = requests.patch(
                f"{BASE_URL}/api/admin/products/{target_id}/visibility",
                json={"hidden": False},
                headers=auth_headers,
            )
            assert r.status_code == 200
            assert r.json()["hidden"] is False

        # 6. Public count restored
        restored = api_client.get(f"{BASE_URL}/api/products").json()
        assert len(restored) == baseline_count, (
            f"Public count should restore to {baseline_count}, got {len(restored)}"
        )
        assert any(p["id"] == target_id for p in restored), "Unhidden product should reappear"



# ── NEW: Bulk Visibility + Bulk Delete ──
class TestBulkVisibility:
    """POST /api/admin/products/bulk-visibility — bulk hide / show."""

    def test_bulk_visibility_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/products/bulk-visibility",
            json={"ids": [1, 2, 3], "hidden": True},
        )
        assert r.status_code == 401

    def test_bulk_visibility_invalid_token(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/products/bulk-visibility",
            json={"ids": [1, 2, 3], "hidden": True},
            headers={"Authorization": "Bearer bogus"},
        )
        assert r.status_code == 401

    def test_bulk_visibility_empty_ids(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/products/bulk-visibility",
            json={"ids": [], "hidden": True},
            headers=auth_headers,
        )
        assert r.status_code == 400
        assert "empty" in r.json().get("detail", "").lower()

    def test_bulk_hide_show_flow(self, api_client, auth_headers):
        """Hide 3 products → public count -3 → unhide → public count restored."""
        baseline = api_client.get(f"{BASE_URL}/api/products").json()
        baseline_count = len(baseline)
        ids = [baseline[0]["id"], baseline[1]["id"], baseline[2]["id"]]

        try:
            # Bulk hide
            r = requests.post(
                f"{BASE_URL}/api/admin/products/bulk-visibility",
                json={"ids": ids, "hidden": True},
                headers=auth_headers,
            )
            assert r.status_code == 200, r.text
            body = r.json()
            assert body["matched"] == 3
            assert body["hidden"] is True
            # modified can be 0 if already hidden, but matched must be 3
            assert "modified" in body

            # Public list excludes them
            after = api_client.get(f"{BASE_URL}/api/products").json()
            assert len(after) == baseline_count - 3, (
                f"Expected {baseline_count - 3}, got {len(after)}"
            )
            after_ids = {p["id"] for p in after}
            for hid in ids:
                assert hid not in after_ids, f"Hidden product {hid} leaked"
        finally:
            # Bulk show (always restore)
            r = requests.post(
                f"{BASE_URL}/api/admin/products/bulk-visibility",
                json={"ids": ids, "hidden": False},
                headers=auth_headers,
            )
            assert r.status_code == 200
            body = r.json()
            assert body["matched"] == 3
            assert body["hidden"] is False

        restored = api_client.get(f"{BASE_URL}/api/products").json()
        assert len(restored) == baseline_count, (
            f"Public count not restored: {len(restored)} vs {baseline_count}"
        )


class TestBulkDelete:
    """POST /api/admin/products/bulk-delete — permanent removal."""

    def test_bulk_delete_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/products/bulk-delete",
            json={"ids": [99991, 99992]},
        )
        assert r.status_code == 401

    def test_bulk_delete_empty_ids(self, auth_headers):
        r = requests.post(
            f"{BASE_URL}/api/admin/products/bulk-delete",
            json={"ids": []},
            headers=auth_headers,
        )
        assert r.status_code == 400
        assert "empty" in r.json().get("detail", "").lower()

    def test_bulk_delete_flow_with_recreate(self, api_client, auth_headers):
        """Create 2 TEST_ products → bulk delete them → confirm not in admin list →
        public count back to baseline."""
        baseline_public = len(api_client.get(f"{BASE_URL}/api/products").json())

        # Create 2 throwaway products
        new_ids = []
        for i in range(2):
            payload = {
                "product_name": f"TEST_Bulk Del {i}",
                "category": "chocolates",
                "description": "TEST bulk delete",
                "price": "Contact for pricing",
                "image_url": "https://example.com/x.jpg",
                "stock_status": "Available",
            }
            r = requests.post(f"{BASE_URL}/api/admin/products", json=payload, headers=auth_headers)
            assert r.status_code == 200, r.text
            new_ids.append(r.json()["id"])

        # Bulk delete
        r = requests.post(
            f"{BASE_URL}/api/admin/products/bulk-delete",
            json={"ids": new_ids},
            headers=auth_headers,
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["deleted"] == 2

        # Confirm they're gone from admin list
        admin_list = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers).json()
        admin_ids = {p["id"] for p in admin_list}
        for nid in new_ids:
            assert nid not in admin_ids, f"Bulk-deleted product {nid} still present"

        # Public count must be back to baseline (50)
        final_public = len(api_client.get(f"{BASE_URL}/api/products").json())
        assert final_public == baseline_public, (
            f"Public count drift: baseline {baseline_public} vs final {final_public}"
        )
