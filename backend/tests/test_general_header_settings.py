"""General (WhatsApp number) + Header/Hero settings and low stock alert tests.
Never saves the footer section. Resets general+header to defaults at the end.
Stock tests use products created here (then trashed + permanently deleted).
Run with: pytest -n 0 (tests share module fixtures)."""
import io
import os

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"


def _password():
    pw = os.environ.get("ADMIN_PASSWORD")
    if not pw and os.path.exists("/tmp/.adminpw"):
        pw = open("/tmp/.adminpw").read().strip()
    return pw


GENERAL_DEFAULTS = {"whatsapp_number": "923184214075", "whatsapp_display": "+92 318 4214075"}
HEADER_DEFAULTS = {
    "promo_enabled": True,
    "promo_text": "Pakistan-wide delivery via WhatsApp — Order in 30 sec",
    "header_button_label": "WhatsApp",
    "header_whatsapp_message": "Hello AZ Distribution, I would like to know more about your wholesale catalog and pricing.",
    "hero_eyebrow": "50+ premium products in stock",
    "hero_title_before": "Premium Imported",
    "hero_title_highlight": "Snacks & Sweets",
    "hero_title_after": "at Wholesale Prices",
    "hero_subtitle": "Pakistan ka trusted distributor. Authentic Iranian chocolates, candies, dates and gum delivered fast — order on WhatsApp in under 30 seconds.",
    "hero_primary_label": "Order on WhatsApp",
    "hero_primary_message": "Hello AZ Distribution, I would like to start a wholesale order. Please share your latest catalog and pricing.",
    "hero_secondary_label": "Browse Products",
    "hero_secondary_href": "#products",
    "hero_trust_title": "100+ retailers",
    "hero_trust_subtitle": "trust AZ Distribution",
    "hero_chips": ["Pakistan-wide Delivery", "30-sec WhatsApp Order", "100% Authentic"],
}


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    r = sess.post(f"{API}/admin/login", json={"password": _password()})
    if r.status_code != 200:
        pytest.skip("login failed")
    sess.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    footer_before = requests.get(f"{API}/settings/footer").json()
    yield sess
    sess.put(f"{API}/admin/settings/general", json=GENERAL_DEFAULTS)
    sess.put(f"{API}/admin/settings/header", json=HEADER_DEFAULTS)
    assert requests.get(f"{API}/settings/footer").json() == footer_before, "footer changed!"


@pytest.fixture(scope="module")
def created_ids(s):
    ids = []
    yield ids
    for i in ids:
        s.delete(f"{API}/admin/products/{i}")
        s.delete(f"{API}/admin/products/{i}/permanent")


# Public settings
def test_public_get_all_sections():
    r = requests.get(f"{API}/settings")
    assert r.status_code == 200
    d = r.json()
    assert set(d.keys()) == {"general", "header", "footer"}
    for v in d.values():
        assert "_id" not in v and "key" not in v


@pytest.mark.parametrize("sec", ["general", "header", "footer"])
def test_public_get_section(sec):
    assert requests.get(f"{API}/settings/{sec}").status_code == 200


def test_unknown_section_422():
    assert requests.get(f"{API}/settings/bogus").status_code == 422


@pytest.mark.parametrize("sec", ["general", "header", "footer"])
def test_put_requires_auth(sec):
    assert requests.put(f"{API}/admin/settings/{sec}", json={}).status_code == 401


# General
def test_general_save_strips_non_digits(s):
    r = s.put(f"{API}/admin/settings/general", json={"whatsapp_number": "+92 300-111 2222", "whatsapp_display": "+92 300 1112222"})
    assert r.status_code == 200, r.text
    assert r.json()["whatsapp_number"] == "923001112222"
    g = requests.get(f"{API}/settings/general").json()
    assert g["whatsapp_number"] == "923001112222"
    assert g["whatsapp_display"] == "+92 300 1112222"


@pytest.mark.parametrize("num", ["12345", "123456789", "1234567890123456", "", "abc"])
def test_general_invalid_number_422(s, num):
    r = s.put(f"{API}/admin/settings/general", json={"whatsapp_number": num, "whatsapp_display": "x"})
    assert r.status_code == 422
    assert requests.get(f"{API}/settings/general").json()["whatsapp_number"] == "923001112222"


# Header
def test_header_save_and_persist(s):
    body = {**HEADER_DEFAULTS, "promo_text": "TEST_promo", "hero_chips": ["  A  ", "", "B"], "promo_enabled": False}
    r = s.put(f"{API}/admin/settings/header", json=body)
    assert r.status_code == 200, r.text
    h = requests.get(f"{API}/settings/header").json()
    assert h["promo_text"] == "TEST_promo"
    assert h["promo_enabled"] is False
    assert h["hero_chips"] == ["A", "B"]


@pytest.mark.parametrize("patch", [
    {"hero_secondary_href": "javascript:alert(1)"},
    {"hero_secondary_href": "data:text/html,x"},
    {"hero_primary_label": ""},
    {"hero_chips": ["a", "b", "c", "d", "e"]},
    {"hero_chips": ["x" * 41]},
    {"promo_text": "x" * 121},
])
def test_header_invalid_422(s, patch):
    r = s.put(f"{API}/admin/settings/header", json={**HEADER_DEFAULTS, **patch})
    assert r.status_code == 422
    assert requests.get(f"{API}/settings/header").json()["promo_text"] == "TEST_promo"


def test_header_missing_field_422(s):
    body = dict(HEADER_DEFAULTS)
    body.pop("hero_title_before")
    assert s.put(f"{API}/admin/settings/header", json=body).status_code == 422


# Low stock alerts
def test_stock_alerts_requires_auth():
    assert requests.get(f"{API}/admin/stock-alerts").status_code == 401


def _create(s, created_ids, stock):
    r = s.post(f"{API}/admin/products", json={
        "product_name": f"TEST_stock_{stock}", "category": "chocolates", "price": "Rs 100",
        "stock": stock, "stock_status": "Available", "description": "t", "image_url": "",
    })
    assert r.status_code == 200, r.text
    created_ids.append(r.json()["id"])
    return r.json()["id"]


def _alerts_for(s, pid):
    r = s.get(f"{API}/admin/stock-alerts")
    assert r.status_code == 200
    return [a for a in r.json() if a["product_id"] == pid]


def test_patch_crosses_threshold_once(s, created_ids):
    pid = _create(s, created_ids, 20)
    assert _alerts_for(s, pid) == []
    assert s.patch(f"{API}/admin/products/{pid}", json={"stock": 15}).status_code == 200
    assert _alerts_for(s, pid) == []
    assert s.patch(f"{API}/admin/products/{pid}", json={"stock": 5}).status_code == 200
    a = _alerts_for(s, pid)
    assert len(a) == 1
    assert a[0]["status"] == "pending" and a[0]["channel"] is None and a[0]["stock"] == 5
    assert a[0]["threshold"] == 10 and "_id" not in a[0]
    s.patch(f"{API}/admin/products/{pid}", json={"stock": 3})
    assert len(_alerts_for(s, pid)) == 1
    # Back above then below again -> new alert
    s.patch(f"{API}/admin/products/{pid}", json={"stock": 50})
    s.patch(f"{API}/admin/products/{pid}", json={"stock": 9})
    assert len(_alerts_for(s, pid)) == 2


def test_patch_from_null(s, created_ids):
    pid = _create(s, created_ids, None)
    s.patch(f"{API}/admin/products/{pid}", json={"stock": 0})
    a = _alerts_for(s, pid)
    assert len(a) == 1 and a[0]["stock"] == 0


def test_patch_non_stock_field_no_alert(s, created_ids):
    pid = _create(s, created_ids, 5)
    s.patch(f"{API}/admin/products/{pid}", json={"product_name": "TEST_renamed"})
    assert _alerts_for(s, pid) == []


def test_put_triggers_alert(s, created_ids):
    pid = _create(s, created_ids, 30)
    r = s.put(f"{API}/admin/products/{pid}", json={
        "product_name": "TEST_put", "category": "chocolates", "price": "Rs 100",
        "stock": 2, "stock_status": "Available", "description": "t", "image_url": "",
    })
    assert r.status_code == 200, r.text
    assert len(_alerts_for(s, pid)) == 1


def test_bulk_update_triggers_alert(s, created_ids):
    p1 = _create(s, created_ids, 40)
    p2 = _create(s, created_ids, 4)
    r = s.post(f"{API}/admin/products/bulk-update", json={"ids": [p1, p2], "stock": 1})
    assert r.status_code == 200, r.text
    assert len(_alerts_for(s, p1)) == 1
    assert _alerts_for(s, p2) == []


def test_import_triggers_alert(s, created_ids):
    pid = _create(s, created_ids, 60)
    csv = ("id,product_name,category,price,stock,stock_status,hidden,image_url,description\n"
           f"{pid},TEST_import,chocolates,Rs 100,7,Available,no,,\n")
    r = s.post(f"{API}/admin/products/import?dry_run=false",
               files={"file": ("t.csv", io.BytesIO(csv.encode()), "text/csv")})
    assert r.status_code == 200, r.text
    assert r.json()["updated"] == 1, r.json()
    a = _alerts_for(s, pid)
    assert len(a) == 1 and a[0]["stock"] == 7
