import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const TOKEN_KEY = "az-admin-token";
export const LOGOUT_EVENT = "az-admin-logout";

export const adminApi = axios.create({ baseURL: `${BACKEND_URL}/api/admin` });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(LOGOUT_EVENT));
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err, fallback = "Something went wrong. Please try again.") => {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => String(d.msg || "").replace("Value error, ", "")).join(", ");
  }
  return detail || fallback;
};

export const getImageUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|\/\/|data:|blob:)/.test(url)) return url;
  return `${BACKEND_URL}${url}`;
};

export const CATEGORIES = [
  { value: "chocolates", label: "Chocolates" },
  { value: "candies-toffees", label: "Candies & Toffees" },
  { value: "chewing-gum", label: "Chewing Gum" },
  { value: "dates-dryfruits", label: "Dates & Dry Fruits" },
  { value: "accessories", label: "Accessories" },
];
export const categoryLabel = (v) => CATEGORIES.find((c) => c.value === v)?.label || v;

export const STOCK_OPTIONS = ["Available", "Limited Stock", "Out of Stock"];

export const LOW_STOCK_THRESHOLD = 10;
export const isOutOfStock = (p) => p.stock_status === "Out of Stock" || p.stock === 0;
export const isLowStock = (p) =>
  !isOutOfStock(p) && typeof p.stock === "number" && p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD;

export const adjustPrice = (price, pct) =>
  !price
    ? price
    : price.replace(/\d[\d,]*(?:\.\d+)?/g, (m) =>
        Math.max(0, Math.round(Number(m.replace(/,/g, "")) * (1 + pct / 100))).toLocaleString("en-US")
      );

export const downloadFile = async (path, filename, params) => {
  const res = await adminApi.get(path, { responseType: "blob", params });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const timeAgo = (iso) => {
  if (!iso) return "";
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} days ago`;
};
