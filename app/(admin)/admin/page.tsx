"use client";

import { useEffect, useState } from "react";
import { Users, ArrowLeftRight, Link2, KeyRound, TrendingUp, DollarSign } from "lucide-react";

interface Overview {
  totalUsers: number; totalTransactions: number; totalLinks: number;
  totalApiKeys: number; totalVolume: number;
  recentTransactions: Array<{
    id: string; grossAmount: number; status: string; createdAt: string;
    user: { email: string; handle: string };
  }>;
}

function fmt(c: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100); }

const MINT      = "#00FFCC";
const MINT_DARK = "#00A882";
const HEAD      = "#071A17";
const MUTED     = "rgba(7,26,23,0.48)";
const STATUS_C  = { completed: "#059669", pending: "#D97706", failed: "#DC2626", refunded: "#2563EB" } as Record<string, string>;
const STATUS_BG = { completed: "#ECFDF5", pending: "#FFFBEB", failed: "#FEF2F2", refunded: "#EFF6FF" } as Record<string, string>;

const CARD = {
  background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,255,252,0.95) 100%)",
  border: "1px solid rgba(0,255,204,0.24)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(0,255,204,0.10), 0 1px 4px rgba(0,0,0,0.04)",
};

const STATS_CFG = [
  { key: "totalUsers",        label: "Total Users",      icon: Users,          tint: MINT_DARK, orbColor: MINT,      bg: "linear-gradient(135deg, rgba(0,255,204,0.14) 0%, rgba(0,212,168,0.06) 100%)" },
  { key: "totalTransactions", label: "Transactions",     icon: ArrowLeftRight, tint: "#059669", orbColor: "#00C875", bg: "linear-gradient(135deg, rgba(0,200,117,0.12) 0%, rgba(5,150,105,0.06) 100%)" },
  { key: "totalVolume",       label: "Volume Processed", icon: DollarSign,     tint: "#B45309", orbColor: "#F59E0B", bg: "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(217,119,6,0.06) 100%)", isMoney: true },
  { key: "totalLinks",        label: "Payment Links",    icon: Link2,          tint: "#BE185D", orbColor: "#EC4899", bg: "linear-gradient(135deg, rgba(236,72,153,0.10) 0%, rgba(190,24,93,0.04) 100%)" },
  { key: "totalApiKeys",      label: "API Keys",         icon: KeyRound,       tint: "#1D4ED8", orbColor: "#3B82F6", bg: "linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(29,78,216,0.04) 100%)" },
  { key: "_growth",           label: "MoM Growth",       icon: TrendingUp,     tint: MINT_DARK, orbColor: MINT,      bg: "linear-gradient(135deg, rgba(0,255,204,0.14) 0%, rgba(0,212,168,0.06) 100%)" },
];

export default function AdminOverviewPage() {
  const [data, setData]    = useState<Overview | null>(null);
  const [loading, setLoad] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview").then(r => r.json()).then(d => { setData(d); setLoad(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: `${MINT}40`, borderTopColor: MINT }} />
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 rounded-full" style={{ background: `linear-gradient(to bottom, ${MINT}, #00D4A8)` }} />
          <h1 className="text-2xl font-black" style={{ color: HEAD }}>Platform Overview</h1>
        </div>
        <p className="text-sm pl-4" style={{ color: MUTED }}>Real-time metrics across the entire Fleeper platform</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {STATS_CFG.map(({ key, label, icon: Icon, tint, orbColor, bg, isMoney }) => {
          const raw   = data ? (key === "_growth" ? null : (data as unknown as Record<string, number>)[key]) : null;
          const value = key === "_growth" ? "+—%" : (raw !== null && raw !== undefined) ? (isMoney ? fmt(raw) : raw.toLocaleString()) : "—";
          return (
            <div key={key}
              className="relative rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-default"
              style={{
                background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,255,252,0.92) 100%)",
                border: "1px solid rgba(0,255,204,0.22)",
                boxShadow: `0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(0,255,204,0.10), 0 1px 4px rgba(0,0,0,0.04)`,
              }}>

              {/* Large background orb */}
              <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${orbColor}28 0%, ${orbColor}10 40%, transparent 70%)` }} />

              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${tint}60, transparent)` }} />

              <div className="flex items-start justify-between relative z-10">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-2.5" style={{ color: MUTED }}>{label}</p>
                  <p className="text-[26px] font-black leading-none" style={{ color: HEAD }}>{value}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: bg, border: `1px solid ${tint}25`, boxShadow: `0 4px 12px ${tint}18` }}>
                  <Icon size={19} style={{ color: tint }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent transactions */}
      <div className="rounded-2xl overflow-hidden" style={CARD}>
        {/* Card top accent */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${MINT}80, #00D4A8, ${MINT}40)` }} />

        <div className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(0,255,204,0.12)", background: "linear-gradient(180deg, rgba(0,255,204,0.04) 0%, transparent 100%)" }}>
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(to bottom, ${MINT}, #00D4A8)` }} />
            <h2 className="text-sm font-bold" style={{ color: HEAD }}>Recent Transactions</h2>
          </div>
          <a href="/admin/transactions" className="text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: MINT_DARK }}>
            View all →
          </a>
        </div>

        <div>
          {data?.recentTransactions.length === 0 && (
            <p className="text-center py-10 text-sm" style={{ color: MUTED }}>No transactions yet</p>
          )}
          {data?.recentTransactions.map((tx, i) => (
            <div key={tx.id}
              className="flex items-center justify-between px-6 py-4 transition-all duration-150"
              style={{ borderBottom: i < (data.recentTransactions.length - 1) ? "1px solid rgba(0,255,204,0.08)" : undefined }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "linear-gradient(90deg, rgba(0,255,204,0.05), rgba(0,255,204,0.02))"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: HEAD }}>
                  {tx.user.handle ? `@${tx.user.handle}` : tx.user.email}
                </p>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>{new Date(tx.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-black" style={{ color: HEAD }}>{fmt(tx.grossAmount)}</span>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ background: STATUS_BG[tx.status] ?? "#F9FAFB", color: STATUS_C[tx.status] ?? "#6B7280", border: `1px solid ${STATUS_C[tx.status] ?? "#6B7280"}25` }}>
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
