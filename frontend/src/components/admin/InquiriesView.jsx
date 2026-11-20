import React from "react";
import { MessageSquare } from "lucide-react";

export default function InquiriesView({ inquiries }) {
  if (!inquiries.length) {
    return (
      <div className="text-center py-16 rounded-2xl border border-white/[0.08] bg-[#111827]" data-testid="inquiries-tab">
        <MessageSquare size={36} className="text-stone-600 mx-auto mb-3" />
        <p className="text-stone-400 text-sm">No inquiries yet.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2" data-testid="inquiries-tab">
      {inquiries.map((inq, i) => (
        <article key={inq.id || i} className="p-5 rounded-2xl border border-white/[0.08] bg-[#111827]" data-testid={`inquiry-item-${i}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">{inq.full_name}</p>
              <p className="text-xs text-amber-300">{inq.business_name}</p>
              <p className="text-xs text-stone-400 mt-0.5">{inq.phone}{inq.email ? ` · ${inq.email}` : ""}</p>
            </div>
            <time className="text-[11px] text-stone-500 shrink-0">{new Date(inq.timestamp).toLocaleString("en-PK")}</time>
          </div>
          {inq.message && <p className="mt-3 pt-3 border-t border-white/[0.06] text-sm text-stone-300">{inq.message}</p>}
          <a
            href={`https://wa.me/${String(inq.phone).replace(/\D/g, "")}?text=${encodeURIComponent(`Assalam o Alaikum ${inq.full_name}, AZ Distribution se rabta karne ka shukriya.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex text-xs font-semibold text-[#25D366] hover:underline"
            data-testid={`inquiry-whatsapp-${i}`}
          >
            Reply on WhatsApp →
          </a>
        </article>
      ))}
    </div>
  );
}
