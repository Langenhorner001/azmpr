import React, { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { adminApi } from "./adminApi";
import ConfirmDialog from "./ConfirmDialog";
import TrashTable from "./TrashTable";
import useSelection from "./useSelection";
import { btn } from "./ui";

export default function TrashView({ data }) {
  const { trash, run } = data;
  const sel = useSelection(trash);
  const [confirm, setConfirm] = useState(null); // { ids } or { all: true }
  const [busy, setBusy] = useState(false);
  const ids = Array.from(sel.selected);

  const restore = (list) =>
    run(() => adminApi.post("/products/bulk-restore", { ids: list }), `${list.length} restored to catalog`).then((r) => r && sel.clear());

  const doDelete = async () => {
    setBusy(true);
    const res = confirm.all
      ? await run(() => adminApi.post("/products/empty-trash"), (d) => `${d.deleted} deleted forever`)
      : await run(() => adminApi.post("/products/bulk-permanent-delete", { ids: confirm.ids }), (d) => `${d.deleted} deleted forever`);
    setBusy(false);
    if (res) {
      sel.clear();
      setConfirm(null);
    }
  };

  const count = confirm?.all ? trash.length : confirm?.ids?.length || 0;

  return (
    <section data-testid="trash-view">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-stone-400">
          Trash ke products website par nahi dikhte. Restore karein ya hamesha ke liye delete karein.
        </p>
        <div className="flex flex-wrap gap-2">
          {ids.length > 0 && (
            <>
              <button onClick={() => restore(ids)} className={btn.success} data-testid="trash-bulk-restore-btn">
                <RotateCcw size={15} /> Restore {ids.length}
              </button>
              <button onClick={() => setConfirm({ ids })} className={btn.dangerGhost} data-testid="trash-bulk-delete-btn">
                <Trash2 size={15} /> Delete {ids.length} forever
              </button>
            </>
          )}
          <button onClick={() => setConfirm({ all: true })} disabled={!trash.length} className={btn.danger} data-testid="empty-trash-btn">
            <Trash2 size={15} /> Empty Trash
          </button>
        </div>
      </div>
      <TrashTable rows={trash} sel={sel} onRestore={(p) => restore([p.id])} onDelete={(p) => setConfirm({ ids: [p.id] })} />
      <ConfirmDialog
        open={!!confirm}
        title={`Delete ${count} ${count === 1 ? "product" : "products"} forever?`}
        description="Yeh wapas nahi aa sakenge. Product ka record hamesha ke liye mit jayega."
        confirmLabel="Delete forever"
        busy={busy}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}
