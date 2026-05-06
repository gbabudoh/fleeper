"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap, TrendingUp, Wallet, Landmark, ArrowUpRight,
  Copy, ExternalLink, CheckCircle2, AlertCircle, Loader2,
  DollarSign, Percent, Sparkles, ChevronRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Pool {
  id: string; name: string; percentage: number; color: string;
  bankName: string | null; bankLastFour: string | null; balance: number;
}

interface RecentTx {
  id: string; description: string | null; grossAmount: number;
  platformFee: number; netAmount: number; status: string; createdAt: string;
}

interface DashData {
  pools: Pool[];
  stats: {
    totalGross: number; totalNet: number; totalFees: number;
    totalCount: number; monthCount: number; autoSaved: number;
  };
  recent: RecentTx[];
  handle: string;
  name: string | null;
}

// ── Pool icon — inferred from name keywords ───────────────────────────────────

function poolIcon(name: string): React.ElementType {
  const n = name.toLowerCase();
  if (n.includes("tax") || n.includes("hmrc") || n.includes("irs"))   return Landmark;
  if (n.includes("profit") || n.includes("growth") || n.includes("saving") || n.includes("invest")) return TrendingUp;
  return Wallet;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color, icon: Icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ElementType;
}) {
  return (
    <div className="glass-card p-5 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-default">
      {/* Background glow orb */}
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-xl"
        style={{ background: color }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/40 text-xs font-medium tracking-wide uppercase">{label}</p>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: `${color}20`, boxShadow: `0 0 12px ${color}25` }}
          >
            <Icon size={13} style={{ color }} />
          </div>
        </div>
        <p className="text-2xl font-black tracking-tight" style={{ color }}>{value}</p>
        <p className="text-white/30 text-xs mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

// ── Pool Card ─────────────────────────────────────────────────────────────────

function PoolCard({ pool, totalBalance }: { pool: Pool; totalBalance: number }) {
  const Icon = poolIcon(pool.name);
  const pct  = totalBalance > 0 ? (pool.balance / totalBalance) * 100 : 0;

  return (
    <div
      className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 cursor-pointer"
      style={{ borderColor: `${pool.color}30` }}
    >
      {/* Tinted corner gradient */}
      <div
        className="absolute top-0 right-0 w-32 h-32 opacity-8 group-hover:opacity-12 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top right, ${pool.color}40 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${pool.color} 0%, ${pool.color}BB 100%)`, boxShadow: `0 4px 16px ${pool.color}40` }}
          >
            <Icon size={19} className="text-[#0A0A0A]" />
          </div>
          <div className="text-right">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${pool.color}18`, color: pool.color }}
            >
              {pool.percentage}%
            </span>
          </div>
        </div>

        {/* Name */}
        <p className="text-white/50 text-xs font-medium tracking-wide uppercase mb-1">{pool.name}</p>

        {/* Balance */}
        <p className="text-3xl font-black tracking-tight mb-1" style={{ color: pool.color }}>
          {formatCurrency(pool.balance)}
        </p>

        {/* Bank */}
        <p className="text-xs text-white/30 mb-5">
          {pool.bankName ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: pool.color }} />
              {pool.bankName} ···{pool.bankLastFour}
            </span>
          ) : (
            "No bank linked"
          )}
        </p>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-white/25 uppercase tracking-wide">Share of total</span>
            <span className="text-[10px] font-bold" style={{ color: pool.color }}>{pct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${pool.color}15` }}>
            <div
              className="h-full rounded-full liquid-fill"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${pool.color}CC, ${pool.color})`,
                boxShadow: `0 0 8px ${pool.color}60`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Transaction Row ────────────────────────────────────────────────────────────

function TxRow({ tx }: { tx: RecentTx }) {
  const cfg = {
    succeeded: { icon: CheckCircle2, color: "#00FFCC", label: "Settled"    },
    pending:   { icon: Loader2,      color: "#FFB347", label: "Processing" },
    failed:    { icon: AlertCircle,  color: "#EF4444", label: "Failed"     },
  };
  const s          = cfg[tx.status as keyof typeof cfg] ?? cfg.pending;
  const StatusIcon = s.icon;
  const date       = new Date(tx.createdAt);

  return (
    <Link
      href={`/transactions/${tx.id}`}
      className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-white/4 transition-all duration-200 group cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${s.color}18`, boxShadow: `0 2px 8px ${s.color}20` }}
        >
          <Zap size={13} style={{ color: s.color }} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">{tx.description ?? "Payment"}</p>
          <p className="text-xs text-white/30 mt-0.5">
            {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            {" · "}
            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-bold text-sm">{formatCurrency(tx.grossAmount)}</p>
          <div
            className="flex items-center gap-1 justify-end mt-0.5 px-1.5 py-0.5 rounded-full"
            style={{ background: `${s.color}12` }}
          >
            <StatusIcon size={9} style={{ color: s.color }} className={tx.status === "pending" ? "animate-spin" : ""} />
            <span className="text-[10px] font-medium" style={{ color: s.color }}>{s.label}</span>
          </div>
        </div>
        <ArrowUpRight
          size={14}
          className="text-white/15 group-hover:text-white/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
        />
      </div>
    </Link>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="h-28 glass-card rounded-3xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="glass-card h-28" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="glass-card h-44" />)}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data,    setData]    = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const copyLink = () => {
    if (!data) return;
    navigator.clipboard.writeText(`${window.location.origin}/${data.handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalBalance = data?.pools.reduce((s, p) => s + p.balance, 0) ?? 0;
  const greeting     = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />
      <div className="relative z-10 px-6 py-8 max-w-7xl">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={13} className="text-[#FFB347]" />
              <span className="text-xs text-white/30 font-medium">{greeting}{data?.name ? `, ${data.name.split(" ")[0]}` : ""}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Money Map</h1>
            <p className="text-white/35 text-sm mt-1">Your income, split and organized in real-time.</p>
          </div>

          {data && (
            <div className="flex items-center gap-2.5">
              {/* Profile link chip */}
              <div className="flex items-center gap-2 px-3.5 py-2.5 glass-card text-sm text-white/45 min-w-0 cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFCC] animate-pulse shrink-0" />
                <span className="truncate text-xs font-mono">{window.location.hostname}/{data.handle}</span>
                <button
                  onClick={copyLink}
                  className="text-white/25 hover:text-[#00FFCC] transition-colors shrink-0 cursor-pointer"
                >
                  {copied
                    ? <CheckCircle2 size={13} className="text-[#00FFCC]" />
                    : <Copy size={13} />}
                </button>
              </div>
              <Link
                href={`/${data.handle}`}
                target="_blank"
                className="flex items-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold px-4 py-2.5 rounded-2xl text-sm hover:bg-[#00FFCC]/90 transition-all hover:scale-105 active:scale-95 shrink-0 shadow-lg"
                style={{ boxShadow: "0 4px 20px rgba(0,255,204,0.30)" }}
              >
                <ExternalLink size={13} /> View Hub
              </Link>
            </div>
          )}
        </div>

        {loading ? <Skeleton /> : data && (
          <div className="space-y-5">

            {/* ── Hero balance banner ── */}
            <div className="glass-card p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-[#00FFCC]/5 via-transparent to-[#8B5CF6]/5 pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at top right, #00FFCC 0%, transparent 70%)" }}
              />
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-white/35 uppercase tracking-widest font-medium mb-2">Total Portfolio Balance</p>
                  <p className="text-4xl md:text-5xl font-black tracking-tight text-[#00FFCC]" style={{ textShadow: "0 0 40px rgba(0,255,204,0.25)" }}>
                    {formatCurrency(totalBalance)}
                  </p>
                  <p className="text-white/30 text-sm mt-2">
                    across {data.pools.length} pool{data.pools.length !== 1 ? "s" : ""} · {data.stats.totalCount} transactions total
                  </p>
                </div>
                {/* Mini pool bar */}
                {data.pools.length > 0 && (
                  <div className="flex flex-col gap-2 min-w-40">
                    {data.pools.map((p) => (
                      <div key={p.id} className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/8">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${p.percentage}%`, background: p.color, opacity: 0.8 }}
                          />
                        </div>
                        <span className="text-[11px] font-bold w-10 text-right" style={{ color: p.color }}>{p.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Stats row ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Earned"  value={formatCurrency(data.stats.totalGross)} sub="all time"        color="#00FFCC" icon={DollarSign} />
              <StatCard label="Net to Pools"  value={formatCurrency(data.stats.totalNet)}   sub="after fees"      color="#8B5CF6" icon={TrendingUp} />
              <StatCard label="Auto-Saved"    value={formatCurrency(data.stats.autoSaved)}  sub="total distributed" color="#FFB347" icon={Percent}    />
              <StatCard label="This Month"    value={String(data.stats.monthCount)}          sub="transactions"    color="#00FFCC" icon={Zap}        />
            </div>

            {/* ── Pools ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.pools.map((pool) => (
                <PoolCard key={pool.id} pool={pool} totalBalance={totalBalance} />
              ))}
            </div>

            {/* ── Bottom row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Recent transactions */}
              <div className="lg:col-span-2 glass-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                  <div>
                    <h2 className="font-bold">Recent Activity</h2>
                    <p className="text-xs text-white/30 mt-0.5">Latest payments received</p>
                  </div>
                  <Link
                    href="/transactions"
                    className="flex items-center gap-1 text-xs text-white/30 hover:text-[#00FFCC] transition-colors font-medium group"
                  >
                    View all
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="p-3">
                  {data.recent.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
                        <Zap size={18} className="text-white/20" />
                      </div>
                      <p className="text-sm font-semibold text-white/40">No activity yet</p>
                      <p className="text-xs text-white/20 mt-1">Share your Fleeper link to get started.</p>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      {data.recent.map((tx) => <TxRow key={tx.id} tx={tx} />)}
                    </div>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div className="flex flex-col gap-4">

                {/* Platform Provision */}
                <div className="glass-card p-5 relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-20 h-20 opacity-10 blur-xl"
                    style={{ background: "radial-gradient(circle, #EF4444, transparent)" }}
                  />
                  <div className="relative z-10">
                    <p className="text-[10px] text-white/35 mb-3 uppercase tracking-widest font-semibold">Platform Provision</p>
                    <p className="text-2xl font-black text-red-400/80 tracking-tight">{formatCurrency(data.stats.totalFees)}</p>
                    <p className="text-xs text-white/25 mt-0.5 mb-4">total fees paid</p>
                    <div className="space-y-2 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/35">Standard rate</span>
                        <span className="font-medium text-white/55">2.9% + $0.30</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-white/35">Effective rate</span>
                        <span className="font-bold text-white/60">
                          {data.stats.totalGross > 0
                            ? ((data.stats.totalFees / data.stats.totalGross) * 100).toFixed(2)
                            : "0.00"}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Splits */}
                <div className="glass-card p-5 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] text-white/35 uppercase tracking-widest font-semibold">Active Splits</p>
                    <Link href="/pools" className="text-[10px] text-white/25 hover:text-[#00FFCC] transition-colors font-medium">
                      Edit →
                    </Link>
                  </div>
                  <div className="space-y-3.5">
                    {data.pools.map((p) => (
                      <div key={p.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: p.color, boxShadow: `0 0 4px ${p.color}` }} />
                            <span className="text-xs font-medium text-white/60 truncate">{p.name}</span>
                          </div>
                          <span className="text-xs font-black" style={{ color: p.color }}>{p.percentage}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${p.color}15` }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${p.percentage}%`,
                              background: `linear-gradient(90deg, ${p.color}80, ${p.color})`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
