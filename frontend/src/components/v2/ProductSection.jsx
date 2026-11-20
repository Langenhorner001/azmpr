import React, { useEffect, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Frown, Check, Star, Flame, Award } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES } from "./constants";
import { trackCatalogFilter, trackProductInquiry } from "../../utils/analytics";
import { useCart } from "../../context/CartContext";
import { getProductMeta } from "../../lib/productMeta";
import WhatsAppDealButton from "./WhatsAppDealButton";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SORT_KEY = "azdist_sort";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='100%' height='100%' fill='%23f5f5f4'/><text x='50%' y='50%' font-family='sans-serif' font-size='14' fill='%2378716c' text-anchor='middle' dy='.3em'>Image unavailable</text></svg>";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "best-selling", label: "Best Selling" },
  { value: "top-rated", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const formatCategory = (c) =>
  c.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");

// Fixed 5-star row with deterministic fill based on rating value.
const StarRow = ({ rating, reviews }) => {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={12}
            className={
              i <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-stone-200 text-stone-200 dark:fill-stone-700 dark:text-stone-700"
            }
          />
        ))}
      </div>
      <span className="text-[11px] font-bold text-stone-700 dark:text-stone-200">
        {rating.toFixed(1)}
      </span>
      <span className="text-[11px] text-stone-400 dark:text-stone-500">
        ({reviews})
      </span>
    </div>
  );
};

const ProductCard = ({ product, index }) => {
  const [imgErr, setImgErr] = useState(false);
  const { addItem, hasItem, openCart } = useCart();

  const meta = useMemo(() => getProductMeta(product.id), [product.id]);

  const isOutOfStock =
    (product.stock_status && product.stock_status.toLowerCase() === "out of stock") ||
    product.stock === 0;
  const isLowStock =
    !isOutOfStock &&
    typeof product.stock === "number" &&
    product.stock > 0 &&
    product.stock <= 10;

  const inCart = hasItem(product.id);

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem(product);
    toast.success(`Added to cart: ${product.product_name}`, {
      action: {
        label: "View cart",
        onClick: () => openCart(),
      },
      duration: 2400,
    });
    trackProductInquiry(product.id, product.product_name, product.category);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative flex flex-col bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-lg md:hover:-translate-y-1 hover:border-stone-300 dark:hover:border-stone-700 transition-all"
      data-testid={`product-card-${product.id}`}
    >
      <div
        className="relative bg-stone-100 dark:bg-stone-800 overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Top-left badge — discount or stock state */}
        {isOutOfStock ? (
          <span
            className="absolute top-2.5 left-2.5 z-10 px-2 py-1 rounded-full bg-stone-900/90 text-white text-[10px] font-bold tracking-wide"
            data-testid={`product-badge-oos-${product.id}`}
          >
            Out of stock
          </span>
        ) : meta.discountPct > 0 ? (
          <span
            className="absolute top-2.5 left-2.5 z-10 px-2 py-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white text-[10px] font-extrabold tracking-wide shadow-sm"
            data-testid={`product-badge-discount-${product.id}`}
          >
            -{meta.discountPct}% OFF
          </span>
        ) : null}

        {/* Stock urgency text below discount */}
        {!isOutOfStock && isLowStock && (
          <span
            className="absolute top-10 left-2.5 z-10 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold"
            data-testid={`product-badge-low-${product.id}`}
          >
            Only {product.stock} left!
          </span>
        )}

        {/* Top-right: bestseller > trending > category */}
        {meta.isBestseller ? (
          <span
            className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold tracking-wide border border-amber-200"
            data-testid={`product-badge-bestseller-${product.id}`}
          >
            <Award size={10} />
            BESTSELLER
          </span>
        ) : meta.isTrending ? (
          <span
            className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold tracking-wide border border-rose-200"
            data-testid={`product-badge-trending-${product.id}`}
          >
            <Flame size={10} />
            TRENDING
          </span>
        ) : (
          <span className="absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded-full bg-white/95 dark:bg-stone-950/90 backdrop-blur text-[10px] font-bold tracking-wide text-stone-700 dark:text-stone-200 border border-stone-200/70 dark:border-stone-700">
            {formatCategory(product.category)}
          </span>
        )}

        <img
          src={imgErr ? FALLBACK_IMG : product.image_url}
          alt={`${product.product_name} — wholesale ${formatCategory(product.category)} from AZ Distribution`}
          loading="lazy"
          decoding="async"
          width={400}
          height={400}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        <h3 className="font-display font-bold text-[14px] sm:text-[15px] leading-snug text-stone-900 dark:text-white line-clamp-2 min-h-[2.5rem]">
          {product.product_name}
        </h3>

        {/* Star rating — synthetic but deterministic per product id. PLACEHOLDER. */}
        <div className="mt-1.5">
          <StarRow rating={meta.rating} reviews={meta.reviews} />
        </div>

        {/* WhatsApp deal (replaces price) */}
        <div className="mt-2.5">
          <WhatsAppDealButton product={product} />
        </div>

        {/* CTA */}
        <button
          onClick={handleAdd}
          disabled={isOutOfStock}
          className={`mt-3.5 inline-flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-full text-[12.5px] font-semibold transition-all ${
            isOutOfStock
              ? "bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed"
              : inCart
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-sm hover:shadow-md hover:saturate-110"
          }`}
          data-testid={`product-add-btn-${product.id}`}
          aria-label={
            isOutOfStock
              ? "Out of stock"
              : inCart
              ? "Add another to cart"
              : "Add to cart"
          }
        >
          {isOutOfStock ? (
            "Out of stock"
          ) : inCart ? (
            <>
              <Check size={14} />
              In Cart — Add more
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
};

const SkeletonCard = () => (
  <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden bg-white dark:bg-stone-900 animate-pulse">
    <div className="aspect-square bg-stone-100 dark:bg-stone-800" />
    <div className="p-4 space-y-3">
      <div className="h-3.5 bg-stone-100 dark:bg-stone-800 rounded w-4/5" />
      <div className="h-3 bg-stone-100 dark:bg-stone-800 rounded w-2/3" />
      <div className="h-9 bg-stone-100 dark:bg-stone-800 rounded-full" />
    </div>
  </div>
);

const ProductSection = ({ onProductsLoaded }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCat, setActiveCat] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(() => {
    try {
      const saved = localStorage.getItem(SORT_KEY);
      return SORT_OPTIONS.some((o) => o.value === saved) ? saved : "featured";
    } catch {
      return "featured";
    }
  });

  // Persist sort
  useEffect(() => {
    try {
      localStorage.setItem(SORT_KEY, sort);
    } catch {
      // ignore
    }
  }, [sort]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        activeCat === "all"
          ? `${BACKEND_URL}/api/products`
          : `${BACKEND_URL}/api/products?category=${encodeURIComponent(activeCat)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setProducts(list);
      // Share only the full visible catalog (not a category subset) with marquee + purchase toast
      if (onProductsLoaded && activeCat === "all") onProductsLoaded(list);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [activeCat, onProductsLoaded]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = products;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.product_name || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      );
    }
    // Sort
    const enriched = list.map((p) => ({ p, meta: getProductMeta(p.id) }));
    switch (sort) {
      case "best-selling":
        enriched.sort((a, b) => b.meta.salesCount - a.meta.salesCount);
        break;
      case "top-rated":
        enriched.sort((a, b) => b.meta.rating - a.meta.rating);
        break;
      case "newest":
        enriched.sort((a, b) => (b.p.id || 0) - (a.p.id || 0));
        break;
      case "featured":
      default:
        // keep API order
        break;
    }
    return enriched.map((e) => e.p);
  }, [products, query, sort]);

  return (
    <section
      id="products"
      className="bg-white dark:bg-stone-950 py-14 sm:py-20"
      data-testid="product-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[12px] font-bold tracking-wide uppercase text-orange-600 dark:text-amber-400">
              Featured Catalog
            </p>
            <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl text-stone-900 dark:text-white tracking-tight">
              Our{" "}
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
                Premium Products
              </span>
            </h2>
            <p
              className="mt-2 text-[14px] text-stone-500 dark:text-stone-400 max-w-xl"
              data-testid="product-count-line"
            >
              Showing{" "}
              <span className="font-semibold text-stone-800 dark:text-stone-100">
                {loading ? "…" : filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "product" : "products"} — wholesale pricing
              for retailers across Pakistan.
            </p>
          </div>
        </div>

        {/* Controls row: search + sort */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
          <div className="relative w-full sm:max-w-xs">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[14px] text-stone-800 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40"
              data-testid="product-search-input"
              aria-label="Search products"
            />
          </div>

          {/* Sort dropdown — plain styled <select> for simplicity */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <label
              htmlFor="product-sort"
              className="text-[12px] font-semibold text-stone-500 dark:text-stone-400 hidden sm:inline"
            >
              Sort by
            </label>
            <div className="relative w-full sm:w-auto">
              <select
                id="product-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2.5 rounded-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[13.5px] font-semibold text-stone-800 dark:text-stone-100 cursor-pointer hover:border-stone-400 dark:hover:border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40"
                data-testid="product-sort-select"
                aria-label="Sort products"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-[10px]">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x scrollbar-thin"
          data-testid="category-chips"
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCat(c.id);
                trackCatalogFilter(c.id);
              }}
              className={`shrink-0 snap-start px-4 py-2 rounded-full text-[13px] font-semibold transition-all border ${
                activeCat === c.id
                  ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-sm"
                  : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-400 dark:hover:border-stone-600 hover:text-stone-900 dark:hover:text-white"
              }`}
              data-testid={`category-chip-${c.id}`}
              aria-pressed={activeCat === c.id}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-6 sm:mt-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div
              className="text-center py-14 px-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
              data-testid="product-section-error"
            >
              <p className="text-stone-700 dark:text-stone-200 font-semibold">
                Catalog unavailable right now.
              </p>
              <p className="mt-1 text-[13px] text-stone-500 dark:text-stone-400">
                Please try again or contact us on WhatsApp for the latest stock.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="text-center py-14 px-4 rounded-2xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
              data-testid="product-section-empty"
            >
              <Frown size={32} className="mx-auto text-stone-400 dark:text-stone-500 mb-2" />
              <p className="text-stone-700 dark:text-stone-200 font-semibold">
                No products match your search.
              </p>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveCat("all");
                }}
                className="mt-3 text-[13px] font-semibold text-orange-600 dark:text-amber-400 hover:underline"
                data-testid="product-section-clear-filter"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5"
              data-testid="products-grid"
            >
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
