import React from "react";
import { Loader2, Save } from "lucide-react";
import { btn } from "./ui";

export default function SaveBar({ dirty, error, busy, onDiscard, onSave, label }) {
  return (
    <div className="sticky bottom-4 z-30 mt-6 flex flex-wrap items-center justify-between gap-3 p-3 pl-5 rounded-2xl bg-[#1F2937]/95 backdrop-blur-xl border border-amber-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
      <span className={`text-sm font-semibold ${error ? "text-rose-400" : dirty ? "text-amber-300" : "text-stone-400"}`} data-testid="settings-save-status">
        {error || (dirty ? "Unsaved changes" : "All changes saved")}
      </span>
      <div className="flex gap-2">
        <button onClick={onDiscard} disabled={!dirty || busy} className={btn.ghost} data-testid="settings-discard-btn">
          Discard
        </button>
        <button onClick={onSave} disabled={!dirty || !!error || busy} className={btn.primary} data-testid="settings-save-btn">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {label}
        </button>
      </div>
    </div>
  );
}
