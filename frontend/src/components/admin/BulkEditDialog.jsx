import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { adminApi, adjustPrice, CATEGORIES, STOCK_OPTIONS } from "./adminApi";
import { btn, checkboxCls, dialogCls, inputCls, selectCls } from "./ui";

const INITIAL = {
  on: { category: false, stock_status: false, stock: false, price: false, hidden: false },
  category: "chocolates",
  stock_status: "Available",
  stock: "",
  priceMode: "percent",
  price: "",
  percent: "10",
  hidden: "false",
};

const FieldRow = ({ id, label, on, toggle, children }) => (
  <div className={`p-3 rounded-xl border transition-colors ${on ? "border-amber-500/40 bg-amber-500/[0.04]" : "border-white/[0.08]"}`}>
    <label className="flex items-center gap-2.5 cursor-pointer">
      <input type="checkbox" className={checkboxCls} checked={on} onChange={toggle} data-testid={`bulk-field-toggle-${id}`} />
      <span className="text-sm font-semibold">{label}</span>
    </label>
    {on && <div className="mt-2.5">{children}</div>}
  </div>
);

export default function BulkEditDialog({ open, onClose, products, run, onDone }) {
  const [s, setS] = useState(INITIAL);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setS(INITIAL);
  }, [open]);

  const set = (k, v) => setS((prev) => ({ ...prev, [k]: v }));
  const toggle = (k) => () => setS((prev) => ({ ...prev, on: { ...prev.on, [k]: !prev.on[k] } }));
  const sample = products.find((p) => /\d/.test(p.price || ""));
  const pct = Number(s.percent);

  const buildPayload = () => {
    const body = { ids: products.map((p) => p.id) };
    if (s.on.category) body.category = s.category;
    if (s.on.stock_status) body.stock_status = s.stock_status;
    if (s.on.stock) body.stock = s.stock === "" ? null : Number(s.stock);
    if (s.on.hidden) body.hidden = s.hidden === "true";
    if (s.on.price && s.priceMode === "fixed") body.price = s.price.trim() || "Contact for pricing";
    if (s.on.price && s.priceMode === "percent") body.price_percent = pct;
    return body;
  };

  const anyOn = Object.values(s.on).some(Boolean);
  const invalid = (s.on.stock && s.stock !== "" && (!Number.isInteger(Number(s.stock)) || Number(s.stock) < 0)) ||
    (s.on.price && s.priceMode === "percent" && (!Number.isFinite(pct) || pct === 0 || pct <= -100));

  const submit = async () => {
    setBusy(true);
    const res = await run(() => adminApi.post("/products/bulk-update", buildPayload()), (d) => `${d.updated} products updated`);
    setBusy(false);
    if (res) {
      onDone();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${dialogCls} max-w-lg`} data-testid="bulk-edit-dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Edit {products.length} products at once</DialogTitle>
          <DialogDescription className="text-stone-400">Tick the fields you want to change. Unticked fields stay as they are.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2.5">
          <FieldRow id="category" label="Category" on={s.on.category} toggle={toggle("category")}>
            <select value={s.category} onChange={(e) => set("category", e.target.value)} className={selectCls} data-testid="bulk-category-select">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FieldRow>
          <FieldRow id="stock_status" label="Stock status" on={s.on.stock_status} toggle={toggle("stock_status")}>
            <select value={s.stock_status} onChange={(e) => set("stock_status", e.target.value)} className={selectCls} data-testid="bulk-status-select">
              {STOCK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </FieldRow>
          <FieldRow id="stock" label="Stock quantity" on={s.on.stock} toggle={toggle("stock")}>
            <input type="number" min="0" value={s.stock} onChange={(e) => set("stock", e.target.value)} placeholder="e.g. 50 (empty = not tracked, 0 = out of stock)" className={inputCls} data-testid="bulk-stock-input" />
          </FieldRow>
          <FieldRow id="price" label="Price" on={s.on.price} toggle={toggle("price")}>
            <div className="flex gap-2 mb-2">
              {[["percent", "Change by %"], ["fixed", "Set same price"]].map(([m, l]) => (
                <button key={m} type="button" onClick={() => set("priceMode", m)} className={`h-8 px-3 rounded-lg text-xs font-semibold border ${s.priceMode === m ? "border-amber-500 text-amber-300 bg-amber-500/10" : "border-white/10 text-stone-400"}`} data-testid={`bulk-price-mode-${m}`}>
                  {l}
                </button>
              ))}
            </div>
            {s.priceMode === "percent" ? (
              <>
                <input type="number" value={s.percent} onChange={(e) => set("percent", e.target.value)} placeholder="10 = +10%, -5 = -5%" className={inputCls} data-testid="bulk-price-percent-input" />
                {sample && Number.isFinite(pct) && (
                  <p className="mt-1.5 text-xs text-stone-400" data-testid="bulk-price-preview">
                    Example: {sample.price} → <span className="text-amber-300 font-semibold">{adjustPrice(sample.price, pct)}</span>
                  </p>
                )}
              </>
            ) : (
              <input value={s.price} onChange={(e) => set("price", e.target.value)} placeholder="e.g. Rs 1,499 or Contact for pricing" className={inputCls} data-testid="bulk-price-input" />
            )}
          </FieldRow>
          <FieldRow id="hidden" label="Website visibility" on={s.on.hidden} toggle={toggle("hidden")}>
            <select value={s.hidden} onChange={(e) => set("hidden", e.target.value)} className={selectCls} data-testid="bulk-visibility-select">
              <option value="false">Show on website</option>
              <option value="true">Hide from website</option>
            </select>
          </FieldRow>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className={`${btn.ghost} flex-1`} data-testid="bulk-edit-cancel-btn">Cancel</button>
          <button onClick={submit} disabled={!anyOn || invalid || busy} className={`${btn.primary} flex-1`} data-testid="bulk-edit-apply-btn">
            {busy && <Loader2 size={15} className="animate-spin" />} Apply to {products.length}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
