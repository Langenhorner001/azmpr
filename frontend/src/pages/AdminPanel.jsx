import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Plus, Search, Edit2, Trash2, LogOut, Package, MessageSquare,
  AlertTriangle, ArrowLeft, RefreshCw, Eye, EyeOff, X, CheckSquare
} from "lucide-react";
import ProductModal from "../components/admin/ProductModal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "chocolates", label: "Chocolates" },
  { id: "candies-toffees", label: "Candies & Toffees" },
  { id: "chewing-gum", label: "Chewing Gum" },
  { id: "dates-dryfruits", label: "Dates & Dry Fruits" },
  { id: "accessories", label: "Accessories" },
];

const CATEGORY_COLORS = {
  chocolates: "bg-amber-900/40 text-amber-400",
  "candies-toffees": "bg-pink-900/40 text-pink-400",
  "chewing-gum": "bg-green-900/40 text-green-400",
  "dates-dryfruits": "bg-orange-900/40 text-orange-400",
  accessories: "bg-blue-900/40 text-blue-400",
};

const STOCK_COLORS = {
  Available: "bg-green-900/40 text-green-400",
  "Limited Stock": "bg-yellow-900/40 text-yellow-400",
  "Out of Stock": "bg-red-900/40 text-red-400",
};

const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("//")) return url;
  return `${BACKEND_URL}${url}`;
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#18181B] border border-[#D4AF37]/15 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 flex items-center justify-center ${color}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-3xl font-poppins font-black text-white">{value}</p>
      <p className="text-xs font-inter text-gray-500 tracking-wide">{label}</p>
    </div>
  </div>
);

const AdminPanel = ({ onLogout }) => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ products_count: 0, inquiries_count: 0, recent_inquiries: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [modal, setModal] = useState({ open: false, product: null });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'inquiries'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAction, setBulkAction] = useState(null); // 'hide' | 'show' | 'delete' | null
  const [bulkBusy, setBulkBusy] = useState(false);

  const token = localStorage.getItem("az-admin-token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, statsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/products`, { headers }),
        axios.get(`${BACKEND_URL}/api/admin/stats`, { headers }),
      ]);
      setProducts(productsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("az-admin-token");
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  }, []);  // eslint-disable-line

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (formData, isEdit) => {
    if (isEdit) {
      await axios.put(`${BACKEND_URL}/api/admin/products/${formData.id}`, formData, { headers });
    } else {
      await axios.post(`${BACKEND_URL}/api/admin/products`, formData, { headers });
    }
    await fetchData();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/products/${deleteConfirm}`, { headers });
      setDeleteConfirm(null);
      await fetchData();
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleVisibility = async (product) => {
    const newHidden = !product.hidden;
    // Optimistic update
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, hidden: newHidden } : p))
    );
    try {
      await axios.patch(
        `${BACKEND_URL}/api/admin/products/${product.id}/visibility`,
        { hidden: newHidden },
        { headers }
      );
    } catch {
      // revert on failure
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, hidden: !newHidden } : p))
      );
    }
  };

  // ── Bulk selection helpers ──────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (visibleProducts) => {
    setSelectedIds((prev) => {
      const allSelected = visibleProducts.length > 0 && visibleProducts.every((p) => prev.has(p.id));
      if (allSelected) return new Set();
      return new Set(visibleProducts.map((p) => p.id));
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const runBulkVisibility = async (hidden) => {
    if (!selectedIds.size) return;
    const ids = Array.from(selectedIds);
    setBulkBusy(true);
    // Optimistic
    setProducts((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, hidden } : p)));
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/products/bulk-visibility`,
        { ids, hidden },
        { headers }
      );
      clearSelection();
    } catch {
      // revert
      setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, hidden: !hidden } : p)));
    } finally {
      setBulkBusy(false);
      setBulkAction(null);
    }
  };

  const runBulkDelete = async () => {
    if (!selectedIds.size) return;
    const ids = Array.from(selectedIds);
    setBulkBusy(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/products/bulk-delete`,
        { ids },
        { headers }
      );
      setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
      clearSelection();
    } catch {
      // silent
    } finally {
      setBulkBusy(false);
      setBulkAction(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#D4AF37]/15 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="text-gray-500 hover:text-[#D4AF37] transition-colors">
              <ArrowLeft size={18} />
            </a>
            <div>
              <div className="font-poppins font-black gold-text tracking-widest text-sm md:text-base">
                AZ DISTRIBUTION
              </div>
              <p className="text-gray-600 text-xs font-inter">Admin Panel</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 text-gray-500 hover:text-[#D4AF37] transition-colors"
              title="Refresh"
              data-testid="admin-refresh-btn"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("az-admin-token");
                onLogout();
              }}
              className="flex items-center gap-2 px-4 py-2 border border-white/15 text-gray-400 text-xs font-montserrat font-semibold tracking-widest hover:border-red-500/50 hover:text-red-400 transition-all"
              data-testid="admin-logout-btn"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={Package}
            label="Total Products"
            value={stats.products_count}
            color="bg-[#D4AF37]/15 text-[#D4AF37]"
          />
          <StatCard
            icon={MessageSquare}
            label="Total Inquiries"
            value={stats.inquiries_count}
            color="bg-green-900/30 text-green-400"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border-b border-[#D4AF37]/15">
          {[
            { id: "products", label: "Products", icon: Package },
            { id: "inquiries", label: "Recent Inquiries", icon: MessageSquare },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-montserrat font-semibold tracking-wide transition-all border-b-2 -mb-px ${
                activeTab === id
                  ? "border-[#D4AF37] text-[#D4AF37]"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
              data-testid={`tab-${id}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#18181B] border border-[#D4AF37]/15 focus:border-[#D4AF37]/50 text-white text-sm font-inter outline-none placeholder:text-gray-600 transition-colors"
                  data-testid="admin-search"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCatFilter(cat.id)}
                    className={`px-3 py-2 text-xs font-montserrat font-semibold border transition-all ${
                      catFilter === cat.id
                        ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                        : "border-[#D4AF37]/20 text-gray-400 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                    }`}
                    data-testid={`admin-cat-${cat.id}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Add Button */}
              <button
                onClick={() => setModal({ open: true, product: null })}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-black font-montserrat font-bold text-xs tracking-widest uppercase hover:bg-[#FFD700] transition-all flex-shrink-0"
                data-testid="add-product-btn"
              >
                <Plus size={15} />
                Add Product
              </button>
            </div>

            {/* Product Count */}
            <p className="text-xs font-inter text-gray-500 mb-4">
              Showing {filteredProducts.length} of {products.length} products
              {selectedIds.size > 0 && (
                <span className="ml-2 text-[#D4AF37]">· {selectedIds.size} selected</span>
              )}
            </p>

            {/* Bulk Action Bar */}
            {selectedIds.size > 0 && (
              <div
                className="sticky top-0 z-20 mb-4 flex flex-wrap items-center gap-2 bg-[#0F0F0F] border border-[#D4AF37]/40 px-4 py-3 shadow-lg"
                data-testid="bulk-action-bar"
              >
                <CheckSquare size={16} className="text-[#D4AF37]" />
                <span className="text-sm font-poppins font-semibold text-white">
                  {selectedIds.size} selected
                </span>
                <span className="text-xs font-inter text-gray-500 mr-auto">
                  Pick a bulk action
                </span>

                <button
                  onClick={() => runBulkVisibility(true)}
                  disabled={bulkBusy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs font-montserrat font-bold tracking-widest uppercase disabled:opacity-50"
                  data-testid="bulk-hide-btn"
                  title="Hide selected products from website"
                >
                  <EyeOff size={14} /> Hide
                </button>

                <button
                  onClick={() => runBulkVisibility(false)}
                  disabled={bulkBusy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10 text-xs font-montserrat font-bold tracking-widest uppercase disabled:opacity-50"
                  data-testid="bulk-show-btn"
                  title="Make selected products visible on website"
                >
                  <Eye size={14} /> Show
                </button>

                <button
                  onClick={() => setBulkAction("delete")}
                  disabled={bulkBusy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs font-montserrat font-bold tracking-widest uppercase disabled:opacity-50"
                  data-testid="bulk-delete-btn"
                  title="Delete selected products permanently"
                >
                  <Trash2 size={14} /> Delete
                </button>

                <button
                  onClick={clearSelection}
                  disabled={bulkBusy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-600 text-gray-400 hover:bg-gray-800 text-xs font-montserrat font-bold tracking-widest uppercase disabled:opacity-50"
                  data-testid="bulk-clear-btn"
                  title="Clear selection"
                >
                  <X size={14} /> Clear
                </button>
              </div>
            )}

            {/* Product Table */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-16 bg-[#18181B] animate-pulse border border-[#D4AF37]/8" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 border border-[#D4AF37]/10 bg-[#18181B]">
                <Package size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 font-inter text-sm">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]" data-testid="products-table">
                  <thead>
                    <tr className="border-b border-[#D4AF37]/15">
                      <th className="pb-3 pl-1 pr-3 w-8">
                        <input
                          type="checkbox"
                          aria-label="Select all visible products"
                          data-testid="select-all-checkbox"
                          checked={
                            filteredProducts.length > 0 &&
                            filteredProducts.every((p) => selectedIds.has(p.id))
                          }
                          onChange={() => toggleSelectAll(filteredProducts)}
                          className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                        />
                      </th>
                      {["Image", "Product Name", "Category", "Status", "Actions"].map((h) => (
                        <th
                          key={h}
                          className="pb-3 text-left text-xs font-montserrat font-semibold tracking-widest text-gray-500 uppercase px-3"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/8">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className={`hover:bg-[#18181B] transition-colors group ${
                          product.hidden ? "opacity-50" : ""
                        } ${selectedIds.has(product.id) ? "bg-[#D4AF37]/5" : ""}`}
                        data-testid={`product-row-${product.id}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3 pl-1 pr-3">
                          <input
                            type="checkbox"
                            aria-label={`Select ${product.product_name}`}
                            data-testid={`select-product-${product.id}`}
                            checked={selectedIds.has(product.id)}
                            onChange={() => toggleSelect(product.id)}
                            className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                          />
                        </td>

                        {/* Image */}
                        <td className="py-3 pr-3">
                          <div className={`w-12 h-12 overflow-hidden border flex-shrink-0 ${
                            product.hidden ? "border-gray-700 grayscale" : "border-[#D4AF37]/10"
                          }`}>
                            <img
                              src={getImageUrl(product.image_url)}
                              alt={product.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "https://images.pexels.com/photos/3735642/pexels-photo-3735642.jpeg?auto=compress&cs=tinysrgb&w=100";
                              }}
                            />
                          </div>
                        </td>

                        {/* Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-poppins font-semibold text-white line-clamp-1">
                              {product.product_name}
                            </p>
                            {product.hidden && (
                              <span
                                className="px-1.5 py-0.5 bg-gray-700/50 text-gray-400 text-[9px] font-montserrat font-bold tracking-widest uppercase border border-gray-600/50"
                                data-testid={`hidden-badge-${product.id}`}
                              >
                                Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-inter text-gray-500 mt-0.5 line-clamp-1">
                            {product.description?.slice(0, 60)}...
                          </p>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded-sm text-xs font-montserrat font-semibold ${CATEGORY_COLORS[product.category] || "bg-gray-800 text-gray-400"}`}>
                            {product.category}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span className={`px-2 py-1 rounded-sm text-xs font-montserrat font-semibold ${STOCK_COLORS[product.stock_status] || "bg-gray-800 text-gray-400"}`}>
                            {product.stock_status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleVisibility(product)}
                              className={`p-2 transition-all ${
                                product.hidden
                                  ? "text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10"
                                  : "text-[#D4AF37] hover:bg-[#D4AF37]/10"
                              }`}
                              title={product.hidden ? "Unhide (show on website)" : "Hide from website"}
                              data-testid={`toggle-visibility-${product.id}`}
                            >
                              {product.hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                            <button
                              onClick={() => setModal({ open: true, product })}
                              className="p-2 text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                              title="Edit"
                              data-testid={`edit-product-${product.id}`}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(product.id)}
                              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                              title="Delete"
                              data-testid={`delete-product-${product.id}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Inquiries Tab */}
        {activeTab === "inquiries" && (
          <div className="space-y-3" data-testid="inquiries-tab">
            {stats.recent_inquiries.length === 0 ? (
              <div className="text-center py-16 border border-[#D4AF37]/10 bg-[#18181B]">
                <MessageSquare size={40} className="text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 font-inter text-sm">No inquiries yet</p>
              </div>
            ) : (
              stats.recent_inquiries.map((inq, i) => (
                <div
                  key={i}
                  className="bg-[#18181B] border border-[#D4AF37]/10 p-5 hover:border-[#D4AF37]/30 transition-all"
                  data-testid={`inquiry-item-${i}`}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-poppins font-semibold text-white text-sm">{inq.full_name}</p>
                      <p className="text-xs font-inter text-[#D4AF37] mt-0.5">{inq.business_name}</p>
                      <p className="text-xs font-inter text-gray-500 mt-0.5">
                        {inq.phone} {inq.email && `• ${inq.email}`}
                      </p>
                    </div>
                    <p className="text-xs font-inter text-gray-600">
                      {new Date(inq.timestamp).toLocaleDateString("en-PK", {
                        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  {inq.message && (
                    <p className="text-xs font-inter text-gray-400 mt-3 pt-3 border-t border-white/5">
                      {inq.message}
                    </p>
                  )}
                  <a
                    href={`https://wa.me/${inq.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(inq.full_name)}%2C%20thank%20you%20for%20your%20inquiry%20at%20AZ%20Distribution.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-montserrat font-semibold text-[#25D366] hover:underline"
                  >
                    Reply on WhatsApp →
                  </a>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Product Modal */}
      {modal.open && (
        <ProductModal
          product={modal.product}
          onSave={handleSave}
          onClose={() => setModal({ open: false, product: null })}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-red-500/30 p-8 max-w-sm w-full text-center" data-testid="delete-confirm">
            <AlertTriangle size={36} className="text-red-400 mx-auto mb-4" />
            <h3 className="font-poppins font-bold text-white text-lg mb-2">Delete Product?</h3>
            <p className="text-sm font-inter text-gray-400 mb-6">
              This action cannot be undone. The product will be permanently removed from the catalog.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white font-montserrat font-bold text-sm hover:bg-red-500 transition-all disabled:opacity-60"
                data-testid="confirm-delete-btn"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 border border-white/20 text-gray-400 font-montserrat font-semibold text-sm hover:border-white/40 transition-all"
                data-testid="cancel-delete-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Delete Confirmation */}
      {bulkAction === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#18181B] border border-red-500/30 p-8 max-w-sm w-full text-center" data-testid="bulk-delete-confirm">
            <AlertTriangle size={36} className="text-red-400 mx-auto mb-4" />
            <h3 className="font-poppins font-bold text-white text-lg mb-2">
              Delete {selectedIds.size} {selectedIds.size === 1 ? "product" : "products"}?
            </h3>
            <p className="text-sm font-inter text-gray-400 mb-6">
              This action cannot be undone. {selectedIds.size === 1 ? "The product" : "All selected products"} will be permanently removed from the catalog.
            </p>
            <div className="flex gap-3">
              <button
                onClick={runBulkDelete}
                disabled={bulkBusy}
                className="flex-1 py-3 bg-red-600 text-white font-montserrat font-bold text-sm hover:bg-red-500 transition-all disabled:opacity-60"
                data-testid="confirm-bulk-delete-btn"
              >
                {bulkBusy ? "Deleting..." : `Yes, Delete ${selectedIds.size}`}
              </button>
              <button
                onClick={() => setBulkAction(null)}
                disabled={bulkBusy}
                className="flex-1 py-3 border border-white/20 text-gray-400 font-montserrat font-semibold text-sm hover:border-white/40 transition-all"
                data-testid="cancel-bulk-delete-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
