import React from "react";
import { Package, Eye, EyeOff, PackageX, AlertTriangle, Trash2 } from "lucide-react";

const CARDS = [
  { key: "all", stat: "products_count", label: "Total products", icon: Package, tone: "text-amber-400 bg-amber-500/10" },
  { key: "visible", stat: "visible_count", label: "Live on website", icon: Eye, tone: "text-emerald-400 bg-emerald-500/10" },
  { key: "hidden", stat: "hidden_count", label: "Hidden", icon: EyeOff, tone: "text-stone-300 bg-stone-500/15" },
  { key: "out-of-stock", stat: "out_of_stock_count", label: "Out of stock", icon: PackageX, tone: "text-rose-400 bg-rose-500/10" },
  { key: "low-stock", stat: "low_stock_count", label: "Low stock (<10)", icon: AlertTriangle, tone: "text-orange-400 bg-orange-500/10" },
  { key: "trash", stat: "trash_count", label: "In Trash", icon: Trash2, tone: "text-purple-300 bg-purple-500/10" },
];

export default function StatsRow({ stats, active, onSelect }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3" data-testid="admin-stats-row">
      {CARDS.map(({ key, stat, label, icon: Icon, tone }) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`text-left p-4 rounded-2xl border bg-[#111827] transition-[border-color,background-color] duration-200 hover:bg-[#1F2937] ${
            active === key ? "border-amber-500/50" : "border-white/[0.08]"
          }`}
          data-testid={`stat-card-${key}`}
        >
          <span className={`inline-flex w-9 h-9 items-center justify-center rounded-xl ${tone}`}>
            <Icon size={17} />
          </span>
          <div className="mt-3 font-display font-extrabold text-2xl tabular-nums" data-testid={`stat-value-${key}`}>
            {stats ? stats[stat] : "–"}
          </div>
          <div className="text-[12px] text-stone-400">{label}</div>
        </button>
      ))}
    </div>
  );
}
