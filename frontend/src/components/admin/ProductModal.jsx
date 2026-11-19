import React, { useState, useRef } from "react";
import axios from "axios";
import { X, Upload, Link, Image as ImageIcon, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { value: "chocolates", label: "Chocolates" },
  { value: "candies-toffees", label: "Candies & Toffees" },
  { value: "chewing-gum", label: "Chewing Gum" },
  { value: "dates-dryfruits", label: "Dates & Dry Fruits" },
  { value: "accessories", label: "Accessories" },
];

const STOCK_OPTIONS = ["Available", "Limited Stock", "Out of Stock"];

const DEFAULT_FORM = {
  product_name: "",
  category: "chocolates",
  description: "",
  price: "Contact for pricing",
  image_url: "",
  stock_status: "Available",
};

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${BACKEND_URL}${url}`;
};

const ProductModal = ({ product, onSave, onClose }) => {
  const [form, setForm] = useState(product ? { ...product } : { ...DEFAULT_FORM });
  const [imageMode, setImageMode] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const isEdit = !!product;
  const token = localStorage.getItem("az-admin-token");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG, WebP, or GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await axios.post(`${BACKEND_URL}/api/admin/upload`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, image_url: res.data.url }));
    } catch {
      setError("Upload failed. Please try again or use a URL.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_name.trim()) { setError("Product name is required."); return; }
    if (!form.image_url.trim()) { setError("Product image is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(form, isEdit);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = getImageUrl(form.image_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      data-testid="product-modal-overlay"
    >
      <div className="bg-[#18181B] border border-[#D4AF37]/25 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" data-testid="product-modal">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#D4AF37]/20">
          <h2 className="font-poppins font-bold text-white text-lg">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Section */}
          <div>
            <label className="block text-xs font-montserrat font-semibold tracking-widest text-gray-400 uppercase mb-3">
              Product Image *
            </label>
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-3">
              {[
                { mode: "url", label: "URL", icon: Link },
                { mode: "upload", label: "Upload", icon: Upload },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setImageMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-montserrat font-semibold border transition-all ${
                    imageMode === mode
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                      : "border-[#D4AF37]/30 text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                  }`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>

            <div className="flex gap-4 items-start">
              {/* Image Preview */}
              <div className="w-24 h-24 border border-[#D4AF37]/20 flex items-center justify-center bg-[#0F0F0F] flex-shrink-0 overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                ) : (
                  <ImageIcon size={24} className="text-gray-600" />
                )}
              </div>

              {/* Input */}
              <div className="flex-1">
                {imageMode === "url" ? (
                  <input
                    type="url"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full bg-transparent border-b-2 border-[#333] focus:border-[#D4AF37] outline-none py-2 text-white text-sm font-inter placeholder:text-gray-600 transition-colors"
                    data-testid="product-image-url"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      ref={fileRef}
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-montserrat font-semibold hover:bg-[#D4AF37]/10 transition-all disabled:opacity-50"
                      data-testid="product-upload-btn"
                    >
                      {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploading ? "Uploading..." : "Choose Photo"}
                    </button>
                    {form.image_url && !form.image_url.startsWith("http") && (
                      <p className="text-green-400 text-xs mt-1.5 font-inter">
                        Uploaded successfully
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Two-column layout for main fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-montserrat font-semibold tracking-widest text-gray-400 uppercase mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                placeholder="e.g. Shirin Asal Chocolate Box"
                className="w-full bg-transparent border-b-2 border-[#333] focus:border-[#D4AF37] outline-none py-2.5 text-white font-inter placeholder:text-gray-600 transition-colors"
                data-testid="product-name-input"
              />
            </div>

            <div>
              <label className="block text-xs font-montserrat font-semibold tracking-widest text-gray-400 uppercase mb-2">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-[#0F0F0F] border-b-2 border-[#333] focus:border-[#D4AF37] outline-none py-2.5 text-white font-inter transition-colors"
                data-testid="product-category-select"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-montserrat font-semibold tracking-widest text-gray-400 uppercase mb-2">
                Stock Status
              </label>
              <select
                name="stock_status"
                value={form.stock_status}
                onChange={handleChange}
                className="w-full bg-[#0F0F0F] border-b-2 border-[#333] focus:border-[#D4AF37] outline-none py-2.5 text-white font-inter transition-colors"
                data-testid="product-status-select"
              >
                {STOCK_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-montserrat font-semibold tracking-widest text-gray-400 uppercase mb-2">
                Price / Pricing Note
              </label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. Contact for pricing / Rs. 500 per pack"
                className="w-full bg-transparent border-b-2 border-[#333] focus:border-[#D4AF37] outline-none py-2.5 text-white font-inter placeholder:text-gray-600 transition-colors"
                data-testid="product-price-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-montserrat font-semibold tracking-widest text-gray-400 uppercase mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the product — weight, packaging, origin, key features..."
                rows={3}
                className="w-full bg-transparent border-2 border-[#333] focus:border-[#D4AF37] outline-none p-3 text-white font-inter placeholder:text-gray-600 transition-colors resize-none text-sm"
                data-testid="product-description-input"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm font-inter" data-testid="modal-error">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#D4AF37] text-black font-montserrat font-bold text-sm tracking-widest uppercase hover:bg-[#FFD700] transition-all disabled:opacity-60"
              data-testid="product-save-btn"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border border-white/20 text-gray-400 font-montserrat font-semibold text-sm tracking-widest uppercase hover:border-white/40 hover:text-white transition-all"
              data-testid="product-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
