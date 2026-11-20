# Price hiding feature: public API must not expose prices; admin API keeps real prices
import os
import re
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD") or open("/tmp/.adminpw").read().strip()


@pytest.fixture(scope="module")
def s():
    return requests.Session()


@pytest.fixture(scope="module")
def token(s):
    r = s.post(f"{BASE_URL}/api/admin/login", json={"password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"login failed {r.status_code}")
    return r.json()["token"]


# Health
def test_health(s):
    r = s.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200 and r.json()["status"] == "ok"


# Public products hide price
def test_public_products_no_price(s):
    r = s.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    for p in data:
        assert p.get("price") in (None, "Contact for pricing"), p
        assert "_id" not in p
        assert "Rs" not in str(p.get("price"))


# Raw body should not contain any Rs amounts
def test_public_products_raw_no_rs(s):
    r = s.get(f"{BASE_URL}/api/products")
    assert not re.search(r"Rs\.?\s?\d", r.text)


# Category filter still works and hides price
def test_public_category_filter(s):
    r = s.get(f"{BASE_URL}/api/products", params={"category": "chocolates"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) > 0
    assert all(p["category"] == "chocolates" for p in data)
    assert all(p.get("price") == "Contact for pricing" for p in data)


# Admin login invalid
def test_admin_login_invalid(s):
    r = s.post(f"{BASE_URL}/api/admin/login", json={"password": "wrong"})
    assert r.status_code == 401


# Admin products keep real prices
def test_admin_products_have_real_prices(s, token):
    r = s.get(f"{BASE_URL}/api/admin/products", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    priced = [p for p in data if p.get("price") and str(p["price"]).startswith("Rs")]
    assert len(priced) > 0, "No real prices found in admin products"
    print(f"admin products: {len(data)}, priced: {len(priced)}")


# Admin requires auth
def test_admin_products_requires_auth(s):
    r = s.get(f"{BASE_URL}/api/admin/products")
    assert r.status_code in (401, 403)
