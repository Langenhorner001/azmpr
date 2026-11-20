import React, { useState } from "react";
import { ExternalLink, LogOut, RefreshCw } from "lucide-react";
import { btn } from "./ui";

export default function AdminHeader({ onRefresh, onLogout }) {
  const [spinning, setSpinning] = useState(false);

  const refresh = async () => {
    setSpinning(true);
    await onRefresh();
    setSpinning(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F17]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center font-display font-extrabold text-sm">
            AZ
          </span>
          <div className="min-w-0">
            <div className="font-display font-extrabold text-[15px] leading-tight truncate">AZ Distribution</div>
            <div className="text-[11px] text-stone-400 leading-tight">Admin Control Center</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a href="/" target="_blank" rel="noopener noreferrer" className={`${btn.ghost} hidden sm:inline-flex`} data-testid="admin-view-site-btn">
            <ExternalLink size={15} /> View site
          </a>
          <button onClick={refresh} className={btn.icon} title="Refresh" data-testid="admin-refresh-btn">
            <RefreshCw size={16} className={spinning ? "animate-spin" : ""} />
          </button>
          <button onClick={onLogout} className={`${btn.ghost} hover:text-rose-300 hover:border-rose-500/40`} data-testid="admin-logout-btn">
            <LogOut size={15} /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
