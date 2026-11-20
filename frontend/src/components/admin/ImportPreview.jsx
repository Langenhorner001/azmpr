import React from "react";
import { categoryLabel } from "./adminApi";

const ACTION_STYLE = {
  create: "bg-emerald-500/15 text-emerald-300",
  update: "bg-sky-500/15 text-sky-300",
  error: "bg-rose-500/15 text-rose-300",
};

export default function ImportPreview({ rows }) {
  return (
    <div className="max-h-[42vh] overflow-auto rounded-xl border border-white/[0.08]" data-testid="import-preview-table">
      <table className="w-full min-w-[720px] text-[13px]">
        <thead className="sticky top-0 bg-[#1F2937]">
          <tr className="text-left text-[11px] uppercase tracking-wider text-stone-400">
            {["Row", "Action", "Name", "Category", "Price", "Stock", "Status", "Issues"].map((h) => (
              <th key={h} className="py-2 px-3 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {rows.map((r) => (
            <tr key={r.row} className={r.action === "error" ? "bg-rose-500/[0.05]" : ""} data-testid={`import-row-${r.row}`}>
              <td className="py-2 px-3 text-stone-500">{r.row}</td>
              <td className="py-2 px-3">
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${ACTION_STYLE[r.action]}`}>
                  {r.action === "update" ? `update #${r.id}` : r.action}
                </span>
              </td>
              <td className="py-2 px-3 max-w-[200px] truncate">{r.product_name || "—"}</td>
              <td className="py-2 px-3">{r.category ? categoryLabel(r.category) : "—"}</td>
              <td className="py-2 px-3">{r.price}</td>
              <td className="py-2 px-3 tabular-nums">{r.stock ?? "—"}</td>
              <td className="py-2 px-3">{r.stock_status || "—"}</td>
              <td className="py-2 px-3 text-xs">
                {r.errors.map((e) => <div key={e} className="text-rose-300">{e}</div>)}
                {r.warnings.map((w) => <div key={w} className="text-amber-300/80">{w}</div>)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
