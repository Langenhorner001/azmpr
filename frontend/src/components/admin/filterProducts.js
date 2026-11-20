import { isLowStock, isOutOfStock } from "./adminApi";

const STATUS_FILTERS = {
  all: () => true,
  visible: (p) => !p.hidden,
  hidden: (p) => !!p.hidden,
  "out-of-stock": isOutOfStock,
  "low-stock": isLowStock,
};

const SORTERS = {
  "id-asc": (a, b) => a.id - b.id,
  "id-desc": (a, b) => b.id - a.id,
  "name-asc": (a, b) => a.product_name.localeCompare(b.product_name),
  "stock-asc": (a, b) => (a.stock ?? Infinity) - (b.stock ?? Infinity),
  "updated-desc": (a, b) => String(b.updated_at || "").localeCompare(String(a.updated_at || "")),
};

export const SORT_OPTIONS = [
  { value: "id-asc", label: "Oldest first" },
  { value: "id-desc", label: "Newest first" },
  { value: "updated-desc", label: "Recently edited" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "stock-asc", label: "Stock: low → high" },
];

export const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "visible", label: "Live on website" },
  { value: "hidden", label: "Hidden" },
  { value: "out-of-stock", label: "Out of stock" },
  { value: "low-stock", label: "Low stock" },
];

export default function filterProducts(products, { search, category, status, sort }) {
  const q = search.trim().toLowerCase();
  return products
    .filter((p) => category === "all" || p.category === category)
    .filter(STATUS_FILTERS[status] || STATUS_FILTERS.all)
    .filter(
      (p) =>
        !q ||
        String(p.id) === q ||
        (p.product_name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    )
    .sort(SORTERS[sort] || SORTERS["id-asc"]);
}
