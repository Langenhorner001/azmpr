import React from "react";
import { Copy, Edit2, Trash2 } from "lucide-react";
import { Switch } from "../ui/switch";
import InlineField from "./InlineField";
import { CATEGORIES, STOCK_OPTIONS, getImageUrl, isLowStock } from "./adminApi";
import { STATUS_BADGE, btn, checkboxCls } from "./ui";

const FALLBACK =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' fill='%231F2937'/></svg>";

const cellSelect = "h-9 rounded-lg bg-transparent border border-white/10 px-2 text-[13px] text-white cursor-pointer hover:border-white/25 focus:outline-none focus:border-amber-500/60";

export default function ProductRow({ product: p, selected, onToggle, patchProduct, onEdit, onDuplicate, onTrash }) {
  const save = (field) => (value) => patchProduct(p.id, { [field]: value });

  return (
    <tr className={`group transition-colors hover:bg-white/[0.03] ${selected ? "bg-amber-500/[0.06]" : ""}`} data-testid={`product-row-${p.id}`}>
      <td className="py-3 pl-4 pr-2">
        <input type="checkbox" className={checkboxCls} checked={selected} onChange={onToggle} aria-label={`Select ${p.product_name}`} data-testid={`select-product-${p.id}`} />
      </td>
      <td className="py-3 px-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={getImageUrl(p.image_url) || FALLBACK}
            alt=""
            onError={(e) => (e.currentTarget.src = FALLBACK)}
            className={`w-11 h-11 shrink-0 rounded-lg object-cover border border-white/10 ${p.hidden ? "grayscale opacity-60" : ""}`}
          />
          <div className="min-w-0">
            <button onClick={() => onEdit(p)} className="block text-left text-sm font-semibold text-white hover:text-amber-300 line-clamp-1" data-testid={`product-name-${p.id}`}>
              {p.product_name}
            </button>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-stone-500">
              <span>#{p.id}</span>
              {p.hidden && <span className="px-1.5 rounded bg-stone-500/20 text-stone-300" data-testid={`hidden-badge-${p.id}`}>Hidden</span>}
              {isLowStock(p) && <span className="px-1.5 rounded bg-orange-500/15 text-orange-300">Low stock</span>}
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-3">
        <select value={p.category} onChange={(e) => save("category")(e.target.value)} className={`${cellSelect} w-full`} data-testid={`inline-category-${p.id}`}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value} className="bg-[#111827]">{c.label}</option>
          ))}
        </select>
      </td>
      <td className="py-3 px-3 w-[170px]">
        <InlineField value={p.price || ""} onSave={save("price")} placeholder="Contact for pricing" testId={`inline-price-${p.id}`} />
      </td>
      <td className="py-3 px-3 w-[96px]">
        <InlineField type="number" value={p.stock ?? ""} onSave={save("stock")} placeholder="—" testId={`inline-stock-${p.id}`} />
      </td>
      <td className="py-3 px-3">
        <select
          value={p.stock_status}
          onChange={(e) => save("stock_status")(e.target.value)}
          className={`${cellSelect} w-full border ${STATUS_BADGE[p.stock_status] || ""}`}
          data-testid={`inline-status-${p.id}`}
        >
          {STOCK_OPTIONS.map((s) => (
            <option key={s} value={s} className="bg-[#111827] text-white">{s}</option>
          ))}
        </select>
      </td>
      <td className="py-3 px-3">
        <Switch
          checked={!p.hidden}
          onCheckedChange={(live) => save("hidden")(!live)}
          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-stone-600"
          aria-label={p.hidden ? "Show on website" : "Hide from website"}
          data-testid={`toggle-visibility-${p.id}`}
        />
      </td>
      <td className="py-3 pl-2 pr-4">
        <div className="flex items-center justify-end gap-0.5">
          <button onClick={() => onEdit(p)} className={btn.icon} title="Edit" data-testid={`edit-product-${p.id}`}>
            <Edit2 size={15} />
          </button>
          <button onClick={() => onDuplicate(p)} className={btn.icon} title="Duplicate" data-testid={`duplicate-product-${p.id}`}>
            <Copy size={15} />
          </button>
          <button onClick={() => onTrash(p)} className={`${btn.icon} hover:text-rose-400 hover:bg-rose-500/10`} title="Move to Trash" data-testid={`delete-product-${p.id}`}>
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}
