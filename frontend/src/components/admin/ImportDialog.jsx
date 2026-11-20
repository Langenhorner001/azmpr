import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Loader2, UploadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { adminApi, downloadFile, errMsg } from "./adminApi";
import ImportPreview from "./ImportPreview";
import { btn, dialogCls } from "./ui";

export default function ImportDialog({ open, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
    }
  }, [open]);

  const send = (f, dryRun) => {
    const fd = new FormData();
    fd.append("file", f);
    return adminApi.post("/products/import", fd, { params: { dry_run: dryRun } });
  };

  const pick = async (f) => {
    if (!f) return;
    if (!/\.(csv|xlsx)$/i.test(f.name)) return toast.error("Please choose a .csv or .xlsx file");
    setFile(f);
    setBusy(true);
    try {
      setPreview((await send(f, true)).data);
    } catch (e) {
      toast.error(errMsg(e, "Could not read file"));
      setFile(null);
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const { data } = await send(file, false);
      toast.success(`Import done: ${data.created} added, ${data.updated} updated`);
      await onImported();
      onClose();
    } catch (e) {
      toast.error(errMsg(e, "Import failed"));
    } finally {
      setBusy(false);
    }
  };

  const valid = preview ? preview.to_create + preview.to_update : 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={`${dialogCls} max-w-4xl`} data-testid="import-dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Import products from CSV / Excel</DialogTitle>
          <DialogDescription className="text-stone-400">
            Empty <code className="text-amber-300">id</code> = new product. Existing <code className="text-amber-300">id</code> = update that product. Tip: Export CSV, edit in Excel, import back.
          </DialogDescription>
        </DialogHeader>

        <button onClick={() => downloadFile("/products/import-template", "az_products_template.csv").catch((e) => toast.error(errMsg(e)))} className={`${btn.ghost} justify-self-start`} data-testid="download-template-btn">
          <Download size={15} /> Download sample template
        </button>

        {!preview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${drag ? "border-amber-500 bg-amber-500/5" : "border-white/15 hover:border-amber-500/50"}`}
            data-testid="import-dropzone"
          >
            {busy ? <Loader2 className="mx-auto animate-spin text-amber-400" size={32} /> : <UploadCloud className="mx-auto text-amber-400" size={32} />}
            <p className="mt-3 font-semibold">{busy ? "Checking file…" : "Drop your file here or click to choose"}</p>
            <p className="mt-1 text-xs text-stone-400">.csv or .xlsx · max 5MB · up to 2000 rows</p>
            <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => pick(e.target.files?.[0])} data-testid="import-file-input" />
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-sm" data-testid="import-summary">
              <FileSpreadsheet size={16} className="text-amber-400" />
              <span className="font-semibold truncate max-w-[220px]">{file?.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300">{preview.to_create} new</span>
              <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-300">{preview.to_update} {preview.to_update === 1 ? "update" : "updates"}</span>
              <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300">{preview.errors} {preview.errors === 1 ? "error" : "errors"} (skipped)</span>
            </div>
            <ImportPreview rows={preview.rows} />
            <div className="flex gap-2">
              <button onClick={() => { setPreview(null); setFile(null); }} className={`${btn.ghost} flex-1`} data-testid="import-change-file-btn">Choose another file</button>
              <button onClick={confirm} disabled={!valid || busy} className={`${btn.primary} flex-1`} data-testid="import-confirm-btn">
                {busy && <Loader2 size={15} className="animate-spin" />} Import {valid} {valid === 1 ? "product" : "products"}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
