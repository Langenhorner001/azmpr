import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { btn, dialogCls } from "./ui";

export default function ConfirmDialog({ open, title, description, confirmLabel, busy, onConfirm, onCancel }) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && !busy && onCancel()}>
      <AlertDialogContent className={`${dialogCls} max-w-md border-rose-500/30`} data-testid="confirm-dialog">
        <AlertDialogHeader>
          <span className="w-11 h-11 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
            <AlertTriangle size={20} />
          </span>
          <AlertDialogTitle className="font-display text-white">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-stone-400">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 pt-2">
          <button onClick={onCancel} disabled={busy} className={`${btn.ghost} flex-1`} data-testid="confirm-cancel-btn">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={busy} className={`${btn.danger} flex-1`} data-testid="confirm-ok-btn">
            {busy && <Loader2 size={15} className="animate-spin" />} {confirmLabel}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
