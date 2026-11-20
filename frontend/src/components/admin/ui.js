const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-[background-color,border-color,color,filter,transform] duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

export const btn = {
  primary: `${base} h-10 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_4px_16px_rgba(249,115,22,0.25)] hover:brightness-110`,
  ghost: `${base} h-10 px-4 border border-white/10 bg-white/[0.04] text-stone-200 hover:bg-white/[0.08] hover:border-white/20`,
  danger: `${base} h-10 px-4 bg-rose-600 text-white hover:bg-rose-500`,
  dangerGhost: `${base} h-10 px-4 border border-rose-500/30 text-rose-300 hover:bg-rose-500/10`,
  success: `${base} h-10 px-4 bg-emerald-600 text-white hover:bg-emerald-500`,
  icon: "inline-flex items-center justify-center w-9 h-9 rounded-lg text-stone-400 hover:text-white hover:bg-white/[0.08] transition-colors",
};

export const inputCls =
  "h-10 w-full rounded-lg bg-[#0B0F17] border border-white/10 px-3 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-colors";

export const selectCls = `${inputCls} cursor-pointer`;

export const labelCls = "block text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5";

export const dialogCls =
  "bg-[#111827] border border-amber-500/20 text-white sm:rounded-2xl max-h-[92vh] overflow-y-auto";

export const checkboxCls = "w-4 h-4 accent-amber-500 cursor-pointer";

export const STATUS_BADGE = {
  Available: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  "Limited Stock": "bg-amber-500/15 text-amber-300 border-amber-500/30",
  "Out of Stock": "bg-rose-500/15 text-rose-300 border-rose-500/30",
};
