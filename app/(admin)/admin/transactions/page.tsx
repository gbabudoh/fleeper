"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Tx {
  id: string; grossAmount: number; platformFee: number; netAmount: number;
  currency: string; status: string; customerEmail: string | null; createdAt: string;
  user: { email: string; handle: string };
}

function fmt(c: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100); }

const MINT      = "#00FFCC";
const MINT_DARK = "#00A882";
const HEAD      = "#071A17";
const MUTED     = "rgba(7,26,23,0.48)";
const FAINT     = "rgba(7,26,23,0.32)";
const CARD      = { background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,255,252,0.94) 100%)", border: "1px solid rgba(0,255,204,0.24)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(0,255,204,0.10), 0 1px 4px rgba(0,0,0,0.04)" };
const INPUT_S   = { background: "linear-gradient(135deg, #FFFFFF 0%, rgba(240,255,252,0.80) 100%)", border: "1px solid rgba(0,255,204,0.30)", color: HEAD, boxShadow: "0 1px 4px rgba(0,255,204,0.10)" };
const TH        = { color: MUTED };
const STATUS_C  = { completed: "#059669", pending: "#D97706", failed: "#DC2626", refunded: "#2563EB" } as Record<string,string>;
const STATUS_BG = { completed: "#ECFDF5", pending: "#FFFBEB", failed: "#FEF2F2", refunded: "#EFF6FF" } as Record<string,string>;
const STATUSES  = ["", "completed", "pending", "failed", "refunded"];

export default function AdminTransactionsPage() {
  const [txs, setTxs]       = useState<Tx[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoad]  = useState(true);

  const load = useCallback((p: number, q: string, s: string) => {
    setLoad(true);
    fetch(`/api/admin/transactions?page=${p}&q=${encodeURIComponent(q)}&status=${s}`)
      .then(r => r.json())
      .then(d => { setTxs(d.transactions); setTotal(d.total); setPage(d.page); setPages(d.pages); setLoad(false); });
  }, []);

  useEffect(() => { load(1, "", ""); }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 rounded-full" style={{ background: "linear-gradient(to bottom, #00FFCC, #00D4A8)" }} />
          <h1 className="text-2xl font-black" style={{ color: HEAD }}>Transactions</h1>
        </div>
        <p className="text-sm pl-4" style={{ color: MUTED }}>{total.toLocaleString()} total transactions</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: FAINT }} />
          <input placeholder="Search by ref, email, description…" value={search}
            onChange={(e) => { setSearch(e.target.value); load(1, e.target.value, status); }}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none" style={INPUT_S} />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); load(1, search, e.target.value); }}
          className="px-4 py-3 rounded-xl text-sm outline-none cursor-pointer" style={INPUT_S}>
          {STATUSES.map(s => <option key={s} value={s}>{s || "All statuses"}</option>)}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC80, #00D4A8, #00FFCC40)" }} />
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,255,204,0.12)", background: "rgba(0,255,204,0.05)" }}>
              {["User", "Gross", "Fee", "Net", "Status", "Customer", "Date"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-12" style={{ color: MUTED }}>Loading…</td></tr>
            ) : txs.map((tx, i) => (
              <tr key={tx.id}
                style={{ borderBottom: i < txs.length - 1 ? "1px solid rgba(0,255,204,0.08)" : undefined }}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(0,255,204,0.04)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = ""}>
                <td className="px-5 py-4">
                  <p className="font-semibold" style={{ color: HEAD }}>@{tx.user.handle}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{tx.user.email}</p>
                </td>
                <td className="px-5 py-4 font-mono font-bold" style={{ color: HEAD }}>{fmt(tx.grossAmount)}</td>
                <td className="px-5 py-4 font-mono" style={{ color: "#DC2626" }}>{fmt(tx.platformFee)}</td>
                <td className="px-5 py-4 font-mono font-bold" style={{ color: MINT_DARK }}>{fmt(tx.netAmount)}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: STATUS_BG[tx.status] ?? "#F9FAFB", color: STATUS_C[tx.status] ?? "#6B7280", border: `1px solid ${STATUS_C[tx.status] ?? "#6B7280"}30` }}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-xs" style={{ color: MUTED }}>{tx.customerEmail ?? "—"}</td>
                <td className="px-5 py-4 text-xs" style={{ color: FAINT }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid rgba(0,255,204,0.10)" }}>
            <span className="text-xs" style={{ color: FAINT }}>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => load(page - 1, search, status)} className="p-2 rounded-lg disabled:opacity-30 cursor-pointer" style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${MINT}14`}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = ""}><ChevronLeft size={16} /></button>
              <button disabled={page === pages} onClick={() => load(page + 1, search, status)} className="p-2 rounded-lg disabled:opacity-30 cursor-pointer" style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${MINT}14`}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = ""}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
