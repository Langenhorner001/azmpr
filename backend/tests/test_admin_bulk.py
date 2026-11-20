"""Admin bulk catalog management tests: CRUD, duplicate, trash/restore/permanent,
bulk ops, import/export, auth, validation, public exclusion. Only TEST_ products are mutated."""
import csv
import io
import os

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
PASSWORD = os.environ.get("ADMIN_PASSWORD") or open("/tmp/.adminpw").read().strip()


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    r = sess.post(f"{API}/admin/login", json={"password": PASSWORD})
    if r.status_code != 200:
        pytest.skip("login failed")
    sess.headers.update({"Authorization": f"Bearer {r.json()['token']}"})
    return sess


@pytest.fixture(scope="module")
def created(s):
    ids = []
    yield ids
    # cleanup: trash then permanently delete only created ids
    if ids:
        s.post(f"{API}/admin/products/bulk-delete", json={"ids": ids})
        s.post(f"{API}/admin/products/bulk-permanent-delete", json={"ids": ids})


def mk(s, created, **kw):
    body = {"product_name": "TEST_prod", "category": "chocolates", "price": "Rs 1,999", "stock": 20,
            "stock_status": "Available", "hidden": True, "image_url": "", "description": "t"}
    body.update(kw)
    r = s.post(f"{API}/admin/products", json=body)
    assert r.status_code == 200, r.text
    created.append(r.json()["id"])
    return r.json()


def admin_get(s, pid, trash=False):
    docs = s.get(f"{API}/admin/products", params={"trash": str(trash).lower()}).json()
    return next((d for d in docs if d["id"] == pid), None)


def public_ids():
    return {p["id"] for p in requests.get(f"{API}/products").json()}


# Auth
@pytest.mark.parametrize("method,path", [
    ("get", "/admin/stats"), ("get", "/admin/products"), ("post", "/admin/products"),
    ("post", "/admin/products/bulk-update"), ("post", "/admin/products/empty-trash"),
    ("get", "/admin/products/export"), ("get", "/admin/products/import-template"),
    ("post", "/admin/products/import"), ("delete", "/admin/products/1"), ("delete", "/admin/products/1/permanent"),
])
def test_requires_auth(method, path):
    r = getattr(requests, method)(f"{API}{path}")
    assert r.status_code == 401


def test_stats_shape(s):
    d = s.get(f"{API}/admin/stats").json()
    for k in ["products_count", "visible_count", "hidden_count", "out_of_stock_count", "low_stock_count", "trash_count"]:
        assert isinstance(d[k], int)
    assert d["visible_count"] + d["hidden_count"] == d["products_count"]


# Create / validation
def test_create_minimal_and_validation(s, created):
    p = mk(s, created, product_name="TEST_min")
    assert p["category"] == "chocolates" and isinstance(p["id"], int)
    assert s.post(f"{API}/admin/products", json={"product_name": "TEST_x", "category": "bogus"}).status_code == 422
    assert s.post(f"{API}/admin/products", json={"product_name": "TEST_x", "category": "chocolates", "stock": -1}).status_code == 422
    assert s.post(f"{API}/admin/products", json={"product_name": " ", "category": "chocolates"}).status_code == 422
    assert s.patch(f"{API}/admin/products/{p['id']}", json={"stock": -5}).status_code == 422
    assert s.patch(f"{API}/admin/products/{p['id']}", json={"category": "nope"}).status_code == 422


def test_patch_stock_zero_sets_oos_and_back(s, created):
    p = mk(s, created, product_name="TEST_patch")
    r = s.patch(f"{API}/admin/products/{p['id']}", json={"stock": 0})
    assert r.json()["stock_status"] == "Out of Stock"
    r = s.patch(f"{API}/admin/products/{p['id']}", json={"stock": 5})
    assert r.json()["stock_status"] == "Available"
    s.patch(f"{API}/admin/products/{p['id']}", json={"price": "Rs 500", "category": "accessories"})
    g = admin_get(s, p["id"])
    assert g["price"] == "Rs 500" and g["category"] == "accessories" and g["stock"] == 5


def test_put_replace(s, created):
    p = mk(s, created, product_name="TEST_put")
    r = s.put(f"{API}/admin/products/{p['id']}", json={"product_name": "TEST_put2", "category": "chewing-gum", "stock": 0})
    assert r.status_code == 200 and r.json()["stock_status"] == "Out of Stock"
    assert admin_get(s, p["id"])["product_name"] == "TEST_put2"


def test_duplicate(s, created):
    p = mk(s, created, product_name="TEST_dup", hidden=False)
    r = s.post(f"{API}/admin/products/{p['id']}/duplicate")
    assert r.status_code == 200
    d = r.json(); created.append(d["id"])
    assert d["product_name"] == "TEST_dup (Copy)" and d["hidden"] is True and d["id"] != p["id"]
    assert d["id"] not in public_ids()


def test_trash_restore_permanent(s, created):
    p = mk(s, created, product_name="TEST_trash", hidden=False)
    assert p["id"] in public_ids()
    # permanent only from trash
    assert s.delete(f"{API}/admin/products/{p['id']}/permanent").status_code == 404
    assert s.delete(f"{API}/admin/products/{p['id']}").status_code == 200
    assert p["id"] not in public_ids()
    assert admin_get(s, p["id"]) is None and admin_get(s, p["id"], trash=True) is not None
    assert s.post(f"{API}/admin/products/{p['id']}/restore").status_code == 200
    assert admin_get(s, p["id"]) is not None and p["id"] in public_ids()
    s.delete(f"{API}/admin/products/{p['id']}")
    assert s.delete(f"{API}/admin/products/{p['id']}/permanent").status_code == 200
    assert admin_get(s, p["id"], trash=True) is None
    # tombstoned id never reused
    p2 = mk(s, created, product_name="TEST_after_perm")
    assert p2["id"] > p["id"]


def test_bulk_visibility_and_update(s, created):
    a = mk(s, created, product_name="TEST_b1", price="Rs 1,999")
    b = mk(s, created, product_name="TEST_b2", price="Rs 1,000 - 2,000")
    ids = [a["id"], b["id"]]
    r = s.post(f"{API}/admin/products/bulk-visibility", json={"ids": ids, "hidden": False})
    assert r.json()["matched"] == 2
    assert set(ids) <= public_ids()
    s.post(f"{API}/admin/products/bulk-visibility", json={"ids": ids, "hidden": True})
    assert not (set(ids) & public_ids())
    r = s.post(f"{API}/admin/products/bulk-update", json={"ids": ids, "price_percent": 10})
    assert r.json()["updated"] == 2
    assert admin_get(s, a["id"])["price"] == "Rs 2,199"
    assert admin_get(s, b["id"])["price"] == "Rs 1,100 - 2,200"
    r = s.post(f"{API}/admin/products/bulk-update", json={"ids": ids, "category": "accessories", "stock": 0})
    assert r.status_code == 200
    g = admin_get(s, a["id"])
    assert g["category"] == "accessories" and g["stock_status"] == "Out of Stock" and g["price"] == "Rs 2,199"
    assert s.post(f"{API}/admin/products/bulk-update", json={"ids": ids, "price": "Rs 1", "price_percent": 5}).status_code == 400
    assert s.post(f"{API}/admin/products/bulk-update", json={"ids": ids}).status_code == 400
    assert s.post(f"{API}/admin/products/bulk-update", json={"ids": [], "hidden": True}).status_code == 400
    assert s.post(f"{API}/admin/products/bulk-update", json={"ids": ids, "category": "bad"}).status_code == 422


def test_bulk_trash_restore_permanent(s, created):
    ids = [mk(s, created, product_name=f"TEST_bt{i}")["id"] for i in range(3)]
    assert s.post(f"{API}/admin/products/bulk-delete", json={"ids": ids}).json()["trashed"] == 3
    assert s.post(f"{API}/admin/products/bulk-restore", json={"ids": ids[:1]}).json()["restored"] == 1
    assert admin_get(s, ids[0]) is not None
    assert s.post(f"{API}/admin/products/bulk-permanent-delete", json={"ids": ids}).json()["deleted"] == 2
    assert admin_get(s, ids[1], trash=True) is None
    assert admin_get(s, ids[0]) is not None  # active one not deleted


def test_export_and_template(s, created):
    p = mk(s, created, product_name="TEST_exp")
    r = s.get(f"{API}/admin/products/export", params={"ids": str(p["id"])})
    assert r.status_code == 200 and "text/csv" in r.headers["content-type"]
    rows = list(csv.DictReader(io.StringIO(r.content.decode("utf-8-sig"))))
    assert len(rows) == 1 and rows[0]["product_name"] == "TEST_exp"
    assert list(rows[0].keys()) == ["id", "product_name", "category", "price", "stock", "stock_status", "hidden", "image_url", "description"]
    t = s.get(f"{API}/admin/products/import-template")
    assert t.status_code == 200 and "product_name" in t.text
    full = s.get(f"{API}/admin/products/export")
    assert len(list(csv.DictReader(io.StringIO(full.content.decode("utf-8-sig"))))) == s.get(f"{API}/admin/stats").json()["products_count"]


def test_import_dry_run_and_commit_roundtrip(s, created):
    p = mk(s, created, product_name="TEST_imp_upd")
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "product_name", "category", "price", "stock", "stock_status", "hidden", "image_url", "description"])
    w.writerow([p["id"], "TEST_imp_upd_EDITED", "chocolates", "2500", "7", "Available", "yes", "", "d"])
    w.writerow(["", "TEST_imp_new", "Candies & Toffees", "", "3", "", "yes", "", "n"])
    w.writerow(["", "TEST_imp_bad", "unknowncat", "", "-2", "", "yes", "", ""])
    w.writerow(["", "TEST_imp_bad2", "chocolates", "", "abc", "", "yes", "", ""])
    data = buf.getvalue().encode()
    r = s.post(f"{API}/admin/products/import", params={"dry_run": "true"}, files={"file": ("x.csv", data, "text/csv")})
    assert r.status_code == 200, r.text
    d = r.json()
    assert (d["to_create"], d["to_update"], d["errors"]) == (1, 1, 2)
    assert admin_get(s, p["id"])["product_name"] == "TEST_prod" or admin_get(s, p["id"])["product_name"] == "TEST_imp_upd"
    r = s.post(f"{API}/admin/products/import", params={"dry_run": "false"}, files={"file": ("x.csv", data, "text/csv")})
    d = r.json()
    assert d["created"] == 1 and d["updated"] == 1
    g = admin_get(s, p["id"])
    assert g["product_name"] == "TEST_imp_upd_EDITED" and g["price"] == "Rs 2,500" and g["stock"] == 7
    new = [x for x in s.get(f"{API}/admin/products").json() if x["product_name"] == "TEST_imp_new"]
    assert len(new) == 1 and new[0]["category"] == "candies-toffees"
    created.extend(x["id"] for x in new)
    assert s.post(f"{API}/admin/products/import", files={"file": ("x.txt", b"a", "text/plain")}).status_code == 400


def test_import_xlsx(s, created):
    from openpyxl import Workbook
    wb = Workbook(); ws = wb.active
    ws.append(["product_name", "category", "stock", "hidden"])
    ws.append(["TEST_xlsx", "chewing-gum", 4, "yes"])
    b = io.BytesIO(); wb.save(b)
    r = s.post(f"{API}/admin/products/import", params={"dry_run": "false"},
               files={"file": ("x.xlsx", b.getvalue(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")})
    assert r.status_code == 200 and r.json()["created"] == 1, r.text
    new = [x for x in s.get(f"{API}/admin/products").json() if x["product_name"] == "TEST_xlsx"]
    created.extend(x["id"] for x in new)
    assert new and new[0]["hidden"] is True


def test_public_price_hidden():
    prods = requests.get(f"{API}/products").json()
    assert prods and all(p["price"] == "Contact for pricing" for p in prods)


def test_null_image_url_does_not_break_public(s, created):
    """Product created with image_url/description null and visible must not 500 public /api/products."""
    p = mk(s, created, product_name="TEST_nullimg", image_url=None, description=None, hidden=False)
    try:
        r = requests.get(f"{API}/products")
        assert r.status_code == 200, f"public products broke: {r.status_code}"
    finally:
        s.delete(f"{API}/admin/products/{p['id']}")
