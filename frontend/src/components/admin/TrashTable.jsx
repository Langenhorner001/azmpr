import React from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { categoryLabel, getImageUrl, timeAgo } from "./adminApi";
import { btn, checkboxCls } from "./ui";

export default function TrashTable({ rows, sel, onRestore, onDelete }) {
  if (!rows.length) {
    return (
      <div className="text-center py-16 rounded-2xl border border-white/[0.08] bg-[#111827]" data-testid="trash-empty">
        <Trash2 size={36} className="text-stone-600 mx-auto mb-3" />
        <p className="text-stone-400 text-sm">Trash is empty.</p>
      </div>
    );
  }
  const allSelected = rows.every((p) => sel.selected.has(p.id));

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-x-auto">
      <table className="w-full min-w-[680px]" data-testid="trash-table">
        <thead>
          <tr className="border-b border-white/[0.08] text-left text-[11px] uppercase tracking-wider text-stone-400">
            <th className="py-3 pl-4 pr-2 w-10">
              <input type="checkbox" className={checkboxCls} checked={allSelected} onChange={() => sel.toggleAll(rows)} aria-label="Select all in trash" data-testid="trash-select-all" />
            </th>
            <th className="py-3 px-3 font-semibold">Product</th>
            <th className="py-3 px-3 font-semibold">Category</th>
            <th className="py-3 px-3 font-semibold">Moved to trash</th>
            <th className="py-3 px-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-white/[0.03]" data-testid={`trash-row-${p.id}`}>
              <td className="py-3 pl-4 pr-2">
                <input type="checkbox" className={checkboxCls} checked={sel.selected.has(p.id)} onChange={() => sel.toggle(p.id)} aria-label={`Select ${p.product_name}`} data-testid={`trash-select-${p.id}`} />
              </td>
              <td className="py-3 px-3">
                <div className="flex items-center gap-3">
                  <img src={getImageUrl(p.image_url)} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10 grayscale opacity-70" />
                  <span className="text-sm font-semibold line-clamp-1">{p.product_name}</span>
                </div>
              </td>
              <td className="py-3 px-3 text-sm text-stone-300">{categoryLabel(p.category)}</td>
              <td className="py-3 px-3 text-sm text-stone-400">{timeAgo(p.deleted_at)}</td>
              <td className="py-3 pl-2 pr-4">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onRestore(p)} className={`${btn.icon} w-auto px-2.5 gap-1.5 text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 text-xs font-semibold`} data-testid={`restore-product-${p.id}`}>
                    <RotateCcw size={14} /> Restore
                  </button>
                  <button onClick={() => onDelete(p)} className={`${btn.icon} hover:text-rose-400 hover:bg-rose-500/10`} title="Delete forever" data-testid={`permanent-delete-${p.id}`}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
