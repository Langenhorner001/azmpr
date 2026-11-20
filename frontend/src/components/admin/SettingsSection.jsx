import React from "react";
import { labelCls } from "./ui";

export const Section = ({ icon: Icon, title, desc, children, testId }) => (
  <section className="p-5 rounded-2xl border border-white/[0.08] bg-[#111827]" data-testid={testId}>
    <div className="flex items-start gap-3 mb-4">
      <span className="w-9 h-9 shrink-0 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
        <Icon size={17} />
      </span>
      <div>
        <h3 className="font-display font-bold text-[15px]">{title}</h3>
        {desc && <p className="text-xs text-stone-400 mt-0.5">{desc}</p>}
      </div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>
);

export const Field = ({ label, hint, children }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
    {hint && <p className="mt-1 text-[11px] text-stone-500">{hint}</p>}
  </div>
);
