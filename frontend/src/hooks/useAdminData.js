import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminApi, errMsg } from "../components/admin/adminApi";

export default function useAdminData() {
  const [products, setProducts] = useState([]);
  const [trash, setTrash] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [p, t, s] = await Promise.all([
        adminApi.get("/products"),
        adminApi.get("/products", { params: { trash: true } }),
        adminApi.get("/stats"),
      ]);
      setProducts(p.data);
      setTrash(t.data);
      setStats(s.data);
    } catch (e) {
      if (e.response?.status !== 401) toast.error(errMsg(e, "Could not load admin data"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Runs a request, shows toast, refreshes data. Returns response data or null on failure.
  const run = useCallback(
    async (request, successMsg) => {
      try {
        const res = await request();
        if (successMsg) toast.success(typeof successMsg === "function" ? successMsg(res.data) : successMsg);
        await refresh();
        return res.data;
      } catch (e) {
        toast.error(errMsg(e));
        return null;
      }
    },
    [refresh]
  );

  const patchProduct = useCallback(
    async (id, patch) => {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      try {
        const { data } = await adminApi.patch(`/products/${id}`, patch);
        setProducts((prev) => prev.map((p) => (p.id === id ? data : p)));
        toast.success("Saved");
        adminApi.get("/stats").then((r) => setStats(r.data)).catch(() => {});
      } catch (e) {
        toast.error(errMsg(e));
        refresh();
      }
    },
    [refresh]
  );

  const trashProducts = useCallback(
    async (ids) => {
      const res = await run(() => adminApi.post("/products/bulk-delete", { ids }));
      if (!res) return false;
      toast(`${ids.length} ${ids.length === 1 ? "product" : "products"} moved to Trash`, {
        action: {
          label: "Undo",
          onClick: () => run(() => adminApi.post("/products/bulk-restore", { ids }), "Restored"),
        },
        duration: 7000,
      });
      return true;
    },
    [run]
  );

  return { products, trash, stats, loading, refresh, run, patchProduct, trashProducts };
}
