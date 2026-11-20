"""Footer customization settings: public GET, admin PUT auth/validation/persistence.
Restores original state (doc absent -> defaults saved) at the end."""
import os

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
PASSWORD = "azdist2026"

DEFAULTS = {
    "logo_text": "AZ", "brand_name": "AZ Distribution",
    "description": "Pakistan's trusted distributor of imported snacks, sweets, dates and gum — wholesale prices for retailers and bulk buyers.",
    "quick_links_title": "Quick links",
    "quick_links": [{"label": "Home", "href": "#home"}, {"label": "Products", "href": "#products"},
                    {"label": "Why Us", "href": "#why"}, {"label": "Reviews", "href": "#reviews"},
                    {"label": "Contact", "href": "#contact"}],
    "contact_title": "Get in touch", "whatsapp_number": "923184214075", "whatsapp_display": "+92 318 4214075",
    "whatsapp_message": "Hello AZ Distribution, I want to start a wholesale partnership.",
    "email": "contactazdist@gmail.com", "phone_number": "923184214075", "phone_display": "+92 318 4214075",
    "address": "Mirpur, Azad Kashmir, Pakistan", "social_title": "Follow",
    "socials": [{"platform": "facebook", "url": "#"}, {"platform": "instagram", "url": "#"}, {"platform": "linkedin", "url": "#"}],
    "cta_label": "Start order", "copyright_text": "Made in Pakistan 🇵🇰",
    "bottom_links": [{"label": "Privacy", "href": "#"}, {"label": "Terms", "href": "#"}],
    "show_admin_link": True,
}


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    r = sess.post(f"{API}/admin/login", json={"password": PASSWORD})
    if r.status_code != 200:
        pytest.skip("login failed")
    sess.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    original = requests.get(f"{API}/settings/footer").json()
    yield sess
    # restore: previous saved doc, or defaults if none existed
    body = {k: v for k, v in (original or DEFAULTS).items() if k != "updated_at"}
    sess.put(f"{API}/admin/settings/footer", json=body)


# Public GET
def test_public_get_no_auth():
    r = requests.get(f"{API}/settings/footer")
    assert r.status_code == 200
    assert isinstance(r.json(), dict)
    assert "_id" not in r.json()


# Auth
def test_put_without_token_401():
    r = requests.put(f"{API}/admin/settings/footer", json=DEFAULTS)
    assert r.status_code == 401


def test_put_bad_token_401():
    r = requests.put(f"{API}/admin/settings/footer", json=DEFAULTS, headers={"Authorization": "Bearer junk"})
    assert r.status_code == 401


# Persistence
def test_save_and_get_persisted(s):
    body = {**DEFAULTS, "brand_name": "TEST_Brand", "whatsapp_number": "+92 300-1112222",
            "socials": [{"platform": "tiktok", "url": "https://tiktok.com/@x"}, {"platform": "youtube", "url": ""}],
            "show_admin_link": False, "email": ""}
    r = s.put(f"{API}/admin/settings/footer", json=body)
    assert r.status_code == 200, r.text
    d = r.json()
    assert d["whatsapp_number"] == "923001112222"
    assert d["updated_at"]
    g = requests.get(f"{API}/settings/footer").json()
    assert g["brand_name"] == "TEST_Brand"
    assert g["whatsapp_number"] == "923001112222"
    assert g["show_admin_link"] is False
    assert g["email"] == ""
    assert g["socials"][0]["platform"] == "tiktok"
    assert "_id" not in g and "key" not in g


# Validation
@pytest.mark.parametrize("field,val", [
    ("quick_links", [{"label": "x", "href": "javascript:alert(1)"}]),
    ("bottom_links", [{"label": "x", "href": "JaVaScRiPt:alert(1)"}]),
    ("socials", [{"platform": "facebook", "url": "data:text/html,hi"}]),
    ("socials", [{"platform": "myspace", "url": "https://x.com"}]),
    ("brand_name", ""),
    ("logo_text", "ABCDE"),
    ("quick_links", [{"label": "", "href": "#"}]),
])
def test_invalid_rejected_422(s, field, val):
    r = s.put(f"{API}/admin/settings/footer", json={**DEFAULTS, field: val})
    assert r.status_code == 422, r.text


def test_missing_field_422(s):
    body = dict(DEFAULTS)
    body.pop("brand_name")
    assert s.put(f"{API}/admin/settings/footer", json=body).status_code == 422


def test_too_many_quick_links_422(s):
    body = {**DEFAULTS, "quick_links": [{"label": f"L{i}", "href": "#"} for i in range(11)]}
    assert s.put(f"{API}/admin/settings/footer", json=body).status_code == 422


def test_invalid_did_not_overwrite(s):
    g = requests.get(f"{API}/settings/footer").json()
    assert g.get("brand_name") == "TEST_Brand"
