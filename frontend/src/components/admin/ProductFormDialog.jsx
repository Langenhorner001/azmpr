import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Switch } from "../ui/switch";
import { adminApi, CATEGORIES, errMsg, STOCK_OPTIONS } from "./adminApi";
import ImagePicker from "./ImagePicker";
import { btn, dialogCls, inputCls, labelCls, selectCls } from "./ui";

const EMPTY = {
  product_name: "",
  category: "chocolates",
  description: "",
  price: "Contact for pricing",
  image_url: "",
  stock: "",
  stock_status: "Available",
  hidden: false,
};

const toForm = (p) => (p ? { ...EMPTY, ...p, stock: p.stock ?? "", description: p.description || "" } : { ...EMPTY });

export default function ProductFormDialog({ open, product, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!product;

  useEffect(() => {
    if (open) {
      setForm(toForm(product));
      setError("");
    }
  }, [open, product]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e?.target ? e.target.value : e }));

  const save = async (addAnother) => {
    if (!form.product_name.trim()) return setError("Product name is required.");
    const stock = form.stock === "" ? null : Number(form.stock);
    if (stock !== null && (!Number.isInteger(stock) || stock < 0)) return setError("Stock must be 0 or more.");
    setBusy(true);
    setError("");
    const body = { ...form, stock, price: form.price.trim() || "Contact for pricing" };
    try {
      if (isEdit) await adminApi.put(`/products/${product.id}`, body);
      else await adminApi.post("/products", body);
      toast.success(isEdit ? "Changes saved" : `"${form.product_name}" added`);
      await onSaved();
      if (addAnother) setForm({ ...EMPTY, category: form.category, stock_status: form.stock_status });
      else onClose();
    } catch (e) {
      setError(errMsg(e, "Failed to save."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${dialogCls} max-w-2xl`} data-testid="product-modal">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? `Edit product #${product.id}` : "Add new product"}</DialogTitle>
          <DialogDescription className="text-stone-400">Only the name is required. Everything else can be filled later.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); save(false); }} className="space-y-4">
          <ImagePicker value={form.image_url} onChange={set("image_url")} />
          <div>
            <label className={labelCls}>Product name *</label>
            <input value={form.product_name} onChange={set("product_name")} placeholder="e.g. FOX Choco Wafer 30Pcs" className={inputCls} autoFocus data-testid="product-name-input" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category</label>
              <select value={form.category} onChange={set("category")} className={selectCls} data-testid="product-category-select">
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Price (admin only)</label>
              <input value={form.price} onChange={set("price")} placeholder="Rs 1,499 or Contact for pricing" className={inputCls} data-testid="product-price-input" />
            </div>
            <div>
              <label className={labelCls}>Stock status</label>
              <select value={form.stock_status} onChange={set("stock_status")} className={selectCls} data-testid="product-status-select">
                {STOCK_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Stock quantity</label>
              <input type="number" min="0" value={form.stock} onChange={set("stock")} placeholder="Empty = not tracked" className={inputCls} data-testid="product-stock-input" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={set("description")} rows={3} placeholder="Weight, packaging, flavour…" className={`${inputCls} h-auto py-2.5 resize-none`} data-testid="product-description-input" />
          </div>
          <label className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.08] cursor-pointer">
            <span>
              <span className="block text-sm font-semibold">Show on website</span>
              <span className="block text-xs text-stone-400">Off = saved but hidden from customers</span>
            </span>
            <Switch checked={!form.hidden} onCheckedChange={(v) => setForm((f) => ({ ...f, hidden: !v }))} className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-stone-600" data-testid="product-visible-switch" />
          </label>
          {error && <p className="text-sm text-rose-400" data-testid="modal-error">{error}</p>}
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
            <button type="button" onClick={onClose} className={`${btn.ghost} sm:w-28`} data-testid="product-cancel-btn">Cancel</button>
            {!isEdit && (
              <button type="button" onClick={() => save(true)} disabled={busy} className={`${btn.ghost} flex-1`} data-testid="product-save-add-another-btn">
                Save &amp; add another
              </button>
            )}
            <button type="submit" disabled={busy} className={`${btn.primary} flex-1`} data-testid="product-save-btn">
              {busy && <Loader2 size={15} className="animate-spin" />} {isEdit ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
