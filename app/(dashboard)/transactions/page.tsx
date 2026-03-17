"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, ArrowUpRight, CheckCircle2, Clock, XCircle,
  Zap, TrendingUp, DollarSign, Percent, ChevronLeft, ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface Split {
  id: string;
  amount: number;
  pool: { name: string; color: string; percentage: number };
}

interface Transaction {
  id: string;
  description: string | null;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  status: string;
  customerEmail: string | null;
  paymentRef: string | null;
  createdAt: string;
  splits: Split[];
}

interface Stats {
  totalGross: number;
  totalFees: number;
  totalNet: number;
  count: number;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS = {
  succeeded: { label: "Settled",    color: "#00FFCC", icon: CheckCircle2 },
  pending:   { label: "Processing", color: "#FFB347", icon: Clock },
  failed:    { label: "Failed",     color: "#EF4444", icon: XCircle },
} as const;

type StatusKey = keyof typeof STATUS;

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/5" />
        <div className="space-y-2">
          <div className="h-3.5 w-36 bg-white/5 rounded-lg" />
          <div className="h-2.5 w-24 bg-white/5 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-2">
          {[70, 20, 10].map((w) => (
            <div key={w} className="h-2 rounded-full bg-white/5" style={{ width: w / 3 + "px" }} />
          ))}
        </div>
        <div className="text-right space-y-2">
          <div className="h-4 w-20 bg-white/5 rounded-lg" />
          <div className="h-2.5 w-14 bg-white/5 rounded-lg ml-auto" />
        </div>
      </div>
    </div>
  );
}

// ── Mini split bar ────────────────────────────────────────────────────────────

function SplitBar({ splits, net }: { splits: Split[]; net: number }) {
  if (!splits.length) return null;
  return (
    <div className="hidden md:flex items-center gap-1.5">
      {splits.map((s) => {
        const pct = net > 0 ? (s.amount / net) * 100 : 0;
        return (
          <div key={s.id} className="flex flex-col items-center gap-1 group relative">
            <div
              className="h-5 rounded-md transition-all group-hover:scale-y-110"
              style={{ width: Math.max(20, pct * 0.6) + "px", background: s.pool.color, opacity: 0.8 }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-(--bg-glass) border border-white/10 rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-xl">
                <span style={{ color: s.pool.color }}>{s.pool.name}</span>
                <span className="text-white/60 ml-1.5">{formatCurrency(s.amount)}</span>
              </div>
              <div className="w-2 h-2 bg-(--bg-glass) border-r border-b border-white/10 rotate-45 -mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page when filter/search changes
  useEffect(() => { setPage(1); }, [statusFilter, debouncedSearch]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        q: debouncedSearch,
        page: String(page),
      });
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.transactions ?? []);
      setStats(data.stats ?? null);
      setPagination(data.pagination ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const totalPages = pagination?.pages ?? 1;

  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />
      <div className="relative z-10 px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black">Transactions</h1>
          <p className="text-white/40 text-sm mt-1">Every Fleep, recorded and split.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue",  value: stats ? formatCurrency(stats.totalGross) : "—", icon: DollarSign, color: "#00FFCC" },
            { label: "Net to Pools",   value: stats ? formatCurrency(stats.totalNet)   : "—", icon: TrendingUp,  color: "#8B5CF6" },
            { label: "Platform Fees",  value: stats ? formatCurrency(stats.totalFees)  : "—", icon: Percent,     color: "#FFB347" },
            { label: "Total Fleeped",  value: stats ? String(stats.count)              : "—", icon: Zap,         color: "#00FFCC" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white/40 text-xs">{label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={13} style={{ color }} />
                </div>
              </div>
              <p className="text-xl font-black" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search by description, email, or ref…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-[#00FFCC]/40 transition-colors"
              />
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 shrink-0">
              {(["all", "succeeded", "pending", "failed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    statusFilter === s
                      ? "bg-[#00FFCC] text-[#0A0A0A]"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {s === "succeeded" ? "Settled" : s === "all" ? "All" : s === "pending" ? "Processing" : "Failed"}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm shrink-0">
              <SlidersHorizontal size={14} />
              <span className="hidden sm:block">Sort</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {/* Column header */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-white/5 text-xs text-white/30 uppercase tracking-wider">
            <span>Description</span>
            <span>Split</span>
            <span className="text-right">Net</span>
            <span className="text-right">Gross</span>
            <span className="text-right">Status</span>
          </div>

          {loading ? (
            <div className="divide-y divide-white/5">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Zap size={22} className="text-white/20" />
              </div>
              <p className="font-semibold text-white/60">No transactions found</p>
              <p className="text-sm text-white/30 mt-1">
                {debouncedSearch || statusFilter !== "all"
                  ? "Try adjusting your filters."
                  : "Share your Fleeper link to get your first payment."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => {
                const s = STATUS[(tx.status as StatusKey)] ?? STATUS.pending;
                const StatusIcon = s.icon;
                const date = new Date(tx.createdAt);

                return (
                  <Link
                    key={tx.id}
                    href={`/transactions/${tx.id}`}
                    className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-4 hover:bg-white/3 transition-colors group"
                  >
                    {/* Description + meta */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                        style={{ background: `${s.color}18` }}
                      >
                        <Zap size={14} style={{ color: s.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {tx.description ?? "Unnamed payment"}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-white/30">
                            {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          {tx.paymentRef && (
                            <span className="text-xs text-white/20 font-mono hidden sm:inline">· {tx.paymentRef}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mini split bar */}
                    <SplitBar splits={tx.splits} net={tx.netAmount} />

                    {/* Net */}
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-bold text-[#00FFCC]">{formatCurrency(tx.netAmount)}</p>
                      <p className="text-xs text-white/30">after fee</p>
                    </div>

                    {/* Gross */}
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(tx.grossAmount)}</p>
                      <p className="text-xs text-white/30 hidden md:block">-{formatCurrency(tx.platformFee)} fee</p>
                    </div>

                    {/* Status + arrow */}
                    <div className="hidden md:flex items-center gap-3">
                      <div
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: `${s.color}15`, color: s.color }}
                      >
                        <StatusIcon size={10} className={tx.status === "pending" ? "animate-spin" : ""} />
                        {s.label}
                      </div>
                      <ArrowUpRight
                        size={14}
                        className="text-white/20 group-hover:text-white/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
              <p className="text-xs text-white/30">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + Math.max(1, Math.min(page - 2, totalPages - 4));
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        p === page
                          ? "bg-[#00FFCC] text-[#0A0A0A]"
                          : "bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
