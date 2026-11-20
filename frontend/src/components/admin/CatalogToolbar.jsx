import React from "react";
import { Plus, Search, Upload, Download } from "lucide-react";
import { CATEGORIES } from "./adminApi";
import { SORT_OPTIONS, STATUS_OPTIONS } from "./filterProducts";
import { btn, inputCls, selectCls } from "./ui";

export default function CatalogToolbar({ filters, setFilter, onAdd, onImport, onExport }) {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div className="flex flex-wrap gap-2 justify-end">
        <button onClick={onExport} className={btn.ghost} data-testid="export-csv-btn">
          <Download size={15} /> Export CSV
        </button>
        <button onClick={onImport} className={btn.ghost} data-testid="import-btn">
          <Upload size={15} /> Import CSV / Excel
        </button>
        <button onClick={onAdd} className={btn.primary} data-testid="add-product-btn">
          <Plus size={16} /> Add product
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_190px_180px_180px] gap-2">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search by name, description or ID…"
            className={`${inputCls} pl-9`}
            data-testid="admin-search"
          />
        </div>
        <select value={filters.category} onChange={(e) => setFilter("category", e.target.value)} className={selectCls} data-testid="admin-category-filter">
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={filters.status} onChange={(e) => setFilter("status", e.target.value)} className={selectCls} data-testid="admin-status-filter">
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)} className={selectCls} data-testid="admin-sort-select">
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
