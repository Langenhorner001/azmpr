import React from "react";
import { Package } from "lucide-react";
import ProductRow from "./ProductRow";
import { checkboxCls } from "./ui";

const HEADERS = [
  ["Product", ""],
  ["Category", "w-[170px]"],
  ["Price", "w-[170px]"],
  ["Stock", "w-[96px]"],
  ["Status", "w-[150px]"],
  ["Live", "w-[64px]"],
  ["", "w-[130px]"],
];

export default function ProductTable({ rows, allRows, loading, sel, patchProduct, onEdit, onDuplicate, onTrash }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-[#111827] animate-pulse" />
        ))}
      </div>
    );
  }
  if (allRows.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl border border-white/[0.08] bg-[#111827]" data-testid="admin-empty-state">
        <Package size={36} className="text-stone-600 mx-auto mb-3" />
        <p className="text-stone-400 text-sm">No products match these filters.</p>
      </div>
    );
  }
  const allSelected = allRows.every((p) => sel.selected.has(p.id));

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111827] overflow-x-auto">
      <table className="w-full min-w-[1000px] table-fixed" data-testid="products-table">
        <thead>
          <tr className="border-b border-white/[0.08] text-left">
            <th className="py-3 pl-4 pr-2 w-10">
              <input
                type="checkbox"
                className={checkboxCls}
                checked={allSelected}
                onChange={() => sel.toggleAll(allRows)}
                aria-label={`Select all ${allRows.length} filtered products`}
                data-testid="select-all-checkbox"
              />
            </th>
            {HEADERS.map(([h, w]) => (
              <th key={h || "actions"} className={`py-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-stone-400 ${w}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              selected={sel.selected.has(p.id)}
              onToggle={() => sel.toggle(p.id)}
              patchProduct={patchProduct}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onTrash={onTrash}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
