import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Filter } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { trackWhatsAppClick, trackCatalogFilter, trackProductInquiry } from "../utils/analytics";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const WHATSAPP_BASE = "https://wa.me/923184214075?text=";

const CATEGORIES = [
  { id: "all", label: "All Products", emoji: "🛍" },
  { id: "chocolates", label: "Chocolates", emoji: "🍫" },
  { id: "candies-toffees", label: "Candies & Toffees", emoji: "🍬" },
  { id: "chewing-gum", label: "Chewing Gum", emoji: "🍃" },
  { id: "dates-dryfruits", label: "Dates & Dry Fruits", emoji: "🌴" },
  { id: "accessories", label: "Accessories", emoji: "🎁" },
];

const ProductCard = ({ product, index }) => {
  const waLink = `${WHATSAPP_BASE}${encodeURIComponent(
    `Hello AZ Distribution, I am interested in ordering: ${product.product_name}. Please share pricing and availability.`
  )}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative bg-card border border-[#D4AF37]/15 hover:border-[#D4AF37]/60 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_14px_36px_-12px_rgba(212,175,55,0.35)]"
      data-testid={`product-card-${product.id}`}
    >
      {/* Bulk Orders Badge */}
      <div className="absolute top-3 right-3 z-10 px-2 py-1 bg-[#D4AF37] text-black text-[10px] font-montserrat font-bold tracking-wide">
        Bulk Orders
      </div>

      {/* Image */}
      <div className="overflow-hidden" style={{ aspectRatio: "1/1" }}>
        <img
          src={product.image_url}
          alt={`${product.product_name} — wholesale ${product.category.replace("-", " ")} from AZ Distribution Mirpur`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          width="400"
          height="400"
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <span className="text-[10px] font-montserrat font-bold tracking-widest text-[#D4AF37] uppercase">
          {product.category.replace("-", " ")}
        </span>
        <h3 className="text-sm md:text-base font-poppins font-semibold text-foreground mt-1 mb-2 line-clamp-2">
          {product.product_name}
        </h3>
        <p className="text-xs font-inter text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>
        {product.price && product.price !== "Contact for pricing" && (
          <p className="text-sm font-poppins font-bold text-[#D4AF37] mb-3" data-testid={`product-price-${product.id}`}>
            {product.price}
          </p>
        )}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 border border-[#D4AF37]/40 bg-[#D4AF37]/5 text-[#D4AF37] text-xs font-montserrat font-bold tracking-widest uppercase hover:bg-[#D4AF37] hover:text-black transition-all duration-300 group-hover:border-[#D4AF37]"
          data-testid={`product-inquire-btn-${product.id}`}
          onClick={() => trackProductInquiry(product.id, product.product_name, product.category)}
        >
          <MessageCircle size={13} />
          Inquire on WhatsApp
        </a>
      </div>
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-card border border-[#D4AF37]/10 animate-pulse">
    <div className="bg-muted" style={{ aspectRatio: "1/1" }} />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-muted w-20 rounded" />
      <div className="h-4 bg-muted w-3/4 rounded" />
      <div className="h-3 bg-muted w-full rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>
  </div>
);

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const { t, lang } = useLanguage();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const url =
        activeCategory === "all"
          ? `${BACKEND_URL}/api/products`
          : `${BACKEND_URL}/api/products?category=${activeCategory}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setProducts(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <section id="products" className="py-16 md:py-24 bg-secondary/40 dark:bg-[#0F0F0F]" data-testid="product-section">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className={`text-[#D4AF37] text-xs font-montserrat font-semibold tracking-widest uppercase mb-4 ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("products.eyebrow")}
          </p>
          <h2 className={`text-4xl md:text-5xl font-poppins font-black text-foreground section-gold-divider ${lang === "ur" ? "font-urdu" : ""}`}>
            {t("products.heading")}
          </h2>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-10" data-testid="category-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                trackCatalogFilter(cat.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-montserrat font-semibold tracking-wide border transition-all duration-300 ${
                activeCategory === cat.id
                  ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  : "border-[#D4AF37]/30 text-foreground hover:border-[#D4AF37] hover:text-[#D4AF37]"
              }`}
              data-testid={`category-btn-${cat.id}`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-20" data-testid="catalog-error">
            <p className="text-muted-foreground mb-2 font-inter text-base">
              Product catalog temporarily updating.
            </p>
            <p className="text-muted-foreground mb-8 font-inter text-sm">
              Please contact us for the latest stock.
            </p>
            <a
              href="https://wa.me/923184214075"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#FFD700] transition-all"
              data-testid="catalog-error-btn"
            >
              <MessageCircle size={16} />
              View Stock on WhatsApp
            </a>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            data-testid="products-grid"
          >
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-16">
            <Filter size={40} className="text-[#D4AF37]/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-inter">No products found in this category.</p>
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && !error && products.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground font-inter text-sm mb-4">
              Don't see what you're looking for? We carry 500+ products.
            </p>
            <a
              href="https://wa.me/923184214075?text=Hello%20AZ%20Distribution%2C%20I%20need%20a%20full%20product%20catalog%20with%20pricing."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#D4AF37] text-black font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#FFD700] transition-all duration-300 hover:scale-105"
              data-testid="full-catalog-btn"
            >
              <MessageCircle size={16} />
              Request Full Catalog
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCatalog;
