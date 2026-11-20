import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Eye, EyeOff, SlidersHorizontal, Trash2, X } from "lucide-react";

const action =
  "inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] font-semibold transition-colors whitespace-nowrap";

export default function BulkActionBar({ count, onEdit, onShow, onHide, onExport, onTrash, onClear }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="fixed bottom-4 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40"
          data-testid="bulk-action-bar"
        >
          <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-[#1F2937]/95 backdrop-blur-xl border border-amber-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-x-auto">
            <span className="px-3 text-sm font-bold text-amber-300 whitespace-nowrap tabular-nums" data-testid="bulk-selected-count">
              {count} selected
            </span>
            <button onClick={onEdit} className={`${action} bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:brightness-110`} data-testid="bulk-edit-btn">
              <SlidersHorizontal size={14} /> Edit fields
            </button>
            <button onClick={onShow} className={`${action} text-emerald-300 hover:bg-emerald-500/10`} data-testid="bulk-show-btn">
              <Eye size={14} /> Show
            </button>
            <button onClick={onHide} className={`${action} text-stone-200 hover:bg-white/10`} data-testid="bulk-hide-btn">
              <EyeOff size={14} /> Hide
            </button>
            <button onClick={onExport} className={`${action} text-stone-200 hover:bg-white/10`} data-testid="bulk-export-btn">
              <Download size={14} /> Export
            </button>
            <button onClick={onTrash} className={`${action} text-rose-300 hover:bg-rose-500/10`} data-testid="bulk-delete-btn">
              <Trash2 size={14} /> Trash
            </button>
            <button onClick={onClear} className={`${action} text-stone-400 hover:bg-white/10 px-2`} aria-label="Clear selection" data-testid="bulk-clear-btn">
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
