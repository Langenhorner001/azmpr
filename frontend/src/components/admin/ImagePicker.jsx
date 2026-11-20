import React, { useRef, useState } from "react";
import { Image as ImageIcon, Link, Loader2, Upload } from "lucide-react";
import { adminApi, errMsg, getImageUrl } from "./adminApi";
import { inputCls, labelCls } from "./ui";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImagePicker({ value, onChange }) {
  const [mode, setMode] = useState("upload");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const upload = async (file) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) return setError("Only JPG, PNG, WebP or GIF.");
    if (file.size > 5 * 1024 * 1024) return setError("Max 5MB.");
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await adminApi.post("/upload", fd);
      onChange(data.url);
    } catch (e) {
      setError(errMsg(e, "Upload failed. Try again or paste a URL."));
    } finally {
      setUploading(false);
    }
  };

  const preview = getImageUrl(value);

  return (
    <div>
      <label className={labelCls}>Product image</label>
      <div className="flex gap-4 items-start">
        <div className="w-24 h-24 shrink-0 rounded-xl border border-white/10 bg-[#0B0F17] overflow-hidden flex items-center justify-center">
          {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" data-testid="product-image-preview" /> : <ImageIcon size={22} className="text-stone-600" />}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex gap-1.5">
            {[["upload", "Upload", Upload], ["url", "Paste URL", Link]].map(([m, l, Icon]) => (
              <button key={m} type="button" onClick={() => setMode(m)} className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border ${mode === m ? "border-amber-500 text-amber-300 bg-amber-500/10" : "border-white/10 text-stone-400 hover:text-white"}`} data-testid={`image-mode-${m}`}>
                <Icon size={12} /> {l}
              </button>
            ))}
          </div>
          {mode === "url" ? (
            <input type="url" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://…/image.jpg" className={inputCls} data-testid="product-image-url" />
          ) : (
            <>
              <input ref={fileRef} type="file" accept={ALLOWED.join(",")} className="hidden" onChange={(e) => upload(e.target.files?.[0])} data-testid="product-image-file" />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-dashed border-amber-500/40 text-amber-300 text-sm font-semibold hover:bg-amber-500/10 disabled:opacity-50" data-testid="product-upload-btn">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Uploading…" : value ? "Replace photo" : "Choose photo"}
              </button>
            </>
          )}
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
