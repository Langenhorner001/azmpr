import React, { useEffect, useState } from "react";
import { Package, Trash2, MessageSquare, Palette } from "lucide-react";
import useAdminData from "../hooks/useAdminData";
import { LOGOUT_EVENT, TOKEN_KEY } from "../components/admin/adminApi";
import AdminHeader from "../components/admin/AdminHeader";
import StatsRow from "../components/admin/StatsRow";
import CatalogView from "../components/admin/CatalogView";
import TrashView from "../components/admin/TrashView";
import InquiriesView from "../components/admin/InquiriesView";
import SiteCustomization from "../components/admin/SiteCustomization";

const TABS = [
  { id: "catalog", label: "Products", icon: Package, badge: "products_count" },
  { id: "trash", label: "Trash", icon: Trash2, badge: "trash_count" },
  { id: "inquiries", label: "Inquiries", icon: MessageSquare, badge: "inquiries_count" },
  { id: "customize", label: "Customization", icon: Palette },
];

export default function AdminDashboard({ onLogout }) {
  const data = useAdminData();
  const [tab, setTabState] = useState("catalog");
  const [status, setStatus] = useState("all");
  const [visited, setVisited] = useState({});
  const setTab = (id) => {
    setTabState(id);
    setVisited((v) => (v[id] ? v : { ...v, [id]: true }));
  };

  useEffect(() => {
    window.addEventListener(LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(LOGOUT_EVENT, onLogout);
  }, [onLogout]);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    onLogout();
  };

  const onStatClick = (key) => {
    if (key === "trash") return setTab("trash");
    setTab("catalog");
    setStatus(key);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white font-sans antialiased" data-testid="admin-dashboard">
      <AdminHeader onRefresh={data.refresh} onLogout={logout} />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 pb-32">
        <StatsRow stats={data.stats} active={tab === "catalog" ? status : tab} onSelect={onStatClick} />

        <nav className="mt-8 mb-6 flex gap-1 border-b border-white/[0.08] overflow-x-auto" aria-label="Admin sections">
          {TABS.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-3 -mb-px border-b-2 text-sm font-semibold transition-colors ${
                tab === id ? "border-amber-500 text-amber-400" : "border-transparent text-stone-400 hover:text-white"
              }`}
              data-testid={`tab-${id}`}
            >
              <Icon size={15} />
              {label}
              {data.stats && badge && (
                <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/[0.06] text-stone-300 tabular-nums">
                  {data.stats[badge]}
                </span>
              )}
            </button>
          ))}
        </nav>

        {tab === "catalog" && <CatalogView data={data} status={status} setStatus={setStatus} />}
        {tab === "trash" && <TrashView data={data} />}
        {tab === "inquiries" && <InquiriesView inquiries={data.stats?.recent_inquiries || []} />}
        {/* Kept mounted after first visit so unsaved edits survive tab switches */}
        {visited.customize && (
          <div hidden={tab !== "customize"}>
            <SiteCustomization />
          </div>
        )}
      </main>
    </div>
  );
}
