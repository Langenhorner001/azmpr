import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { adminApi, downloadFile, errMsg } from "./adminApi";
import filterProducts from "./filterProducts";
import CatalogToolbar from "./CatalogToolbar";
import ProductTable from "./ProductTable";
import BulkActionBar from "./BulkActionBar";
import BulkEditDialog from "./BulkEditDialog";
import ImportDialog from "./ImportDialog";
import ProductFormDialog from "./ProductFormDialog";
import useSelection from "./useSelection";

const PAGE = 50;

export default function CatalogView({ data, status, setStatus }) {
  const { products, loading, run, patchProduct, trashProducts, refresh } = data;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("id-asc");
  const [limit, setLimit] = useState(PAGE);
  const [form, setForm] = useState({ open: false, product: null });
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const filtered = useMemo(
    () => filterProducts(products, { search, category, status, sort }),
    [products, search, category, status, sort]
  );
  const sel = useSelection(products);

  useEffect(() => setLimit(PAGE), [search, category, status, sort]);

  const setFilter = (key, value) => ({ search: setSearch, category: setCategory, status: setStatus, sort: setSort })[key](value);
  const ids = Array.from(sel.selected);

  const exportCsv = async (onlyIds) => {
    try {
      await downloadFile("/products/export", "az_products.csv", onlyIds?.length ? { ids: onlyIds.join(",") } : undefined);
    } catch (e) {
      toast.error(errMsg(e, "Export failed"));
    }
  };

  const duplicate = async (product) => {
    const copy = await run(() => adminApi.post(`/products/${product.id}/duplicate`), "Copy created (hidden) — edit and make it live");
    if (copy) setForm({ open: true, product: copy });
  };

  const bulkVisibility = (hidden) =>
    run(() => adminApi.post("/products/bulk-visibility", { ids, hidden }), `${ids.length} products ${hidden ? "hidden" : "now live"}`).then(
      (r) => r && sel.clear()
    );

  const bulkTrash = async () => {
    if (await trashProducts(ids)) sel.clear();
  };

  return (
    <section data-testid="catalog-view">
      <CatalogToolbar
        filters={{ search, category, status, sort }}
        setFilter={setFilter}
        onAdd={() => setForm({ open: true, product: null })}
        onImport={() => setImportOpen(true)}
        onExport={() => exportCsv()}
      />
      <p className="text-xs text-stone-400 mb-3" data-testid="admin-product-count">
        Showing {Math.min(limit, filtered.length)} of {filtered.length} filtered · {products.length} total
      </p>
      <ProductTable
        rows={filtered.slice(0, limit)}
        allRows={filtered}
        loading={loading}
        sel={sel}
        patchProduct={patchProduct}
        onEdit={(p) => setForm({ open: true, product: p })}
        onDuplicate={duplicate}
        onTrash={(p) => trashProducts([p.id])}
      />
      {filtered.length > limit && (
        <div className="mt-4 flex justify-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="text-sm font-semibold text-amber-400 hover:text-amber-300" data-testid="load-more-btn">
            Show {Math.min(PAGE, filtered.length - limit)} more
          </button>
        </div>
      )}

      <BulkActionBar
        count={ids.length}
        onEdit={() => setBulkEditOpen(true)}
        onShow={() => bulkVisibility(false)}
        onHide={() => bulkVisibility(true)}
        onExport={() => exportCsv(ids)}
        onTrash={bulkTrash}
        onClear={sel.clear}
      />
      <BulkEditDialog
        open={bulkEditOpen}
        onClose={() => setBulkEditOpen(false)}
        products={products.filter((p) => sel.selected.has(p.id))}
        run={run}
        onDone={sel.clear}
      />
      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} onImported={refresh} />
      <ProductFormDialog
        open={form.open}
        product={form.product}
        onClose={() => setForm({ open: false, product: null })}
        onSaved={refresh}
      />
    </section>
  );
}
