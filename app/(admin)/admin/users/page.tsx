"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, CheckCircle, XCircle, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface User {
  id: string; email: string; handle: string; name: string | null;
  isVerified: boolean; createdAt: string;
  _count: { transactions: number; paymentLinks: number; apiKeys: number };
}

const MINT      = "#00FFCC";
const MINT_DARK = "#00A882";
const HEAD      = "#071A17";
const MUTED     = "rgba(7,26,23,0.48)";
const FAINT     = "rgba(7,26,23,0.32)";
const CARD      = { background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,255,252,0.94) 100%)", border: "1px solid rgba(0,255,204,0.24)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(0,255,204,0.10), 0 1px 4px rgba(0,0,0,0.04)" };
const INPUT_S   = { background: "linear-gradient(135deg, #FFFFFF 0%, rgba(240,255,252,0.80) 100%)", border: "1px solid rgba(0,255,204,0.30)", color: HEAD, boxShadow: "0 1px 4px rgba(0,255,204,0.10)" };
const TH        = { color: MUTED };

export default function AdminUsersPage() {
  const [users, setUsers]   = useState<User[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoad]  = useState(true);

  const load = useCallback((p: number, q: string) => {
    setLoad(true);
    fetch(`/api/admin/users?page=${p}&q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setUsers(d.users); setTotal(d.total); setPage(d.page); setPages(d.pages); setLoad(false); });
  }, []);

  useEffect(() => { load(1, ""); }, []);

  const toggleVerified = async (id: string, isVerified: boolean) => {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isVerified: !isVerified }) });
    load(page, search);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 rounded-full" style={{ background: "linear-gradient(to bottom, #00FFCC, #00D4A8)" }} />
          <h1 className="text-2xl font-black" style={{ color: HEAD }}>Users</h1>
        </div>
        <p className="text-sm pl-4" style={{ color: MUTED }}>{total.toLocaleString()} registered accounts</p>
      </div>

      <div className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: FAINT }} />
        <input placeholder="Search by email, handle, or name…" value={search}
          onChange={(e) => { setSearch(e.target.value); load(1, e.target.value); }}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none" style={INPUT_S} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC80, #00D4A8, #00FFCC40)" }} />
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,255,204,0.12)", background: "rgba(0,255,204,0.05)" }}>
              {["User", "Handle", "Verified", "Txns", "Links", "Keys", "Joined", ""].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-12" style={{ color: MUTED }}>Loading…</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id}
                style={{ borderBottom: i < users.length - 1 ? "1px solid rgba(0,255,204,0.08)" : undefined }}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(0,255,204,0.04)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = ""}>
                <td className="px-5 py-4">
                  <p className="font-semibold truncate max-w-45" style={{ color: HEAD }}>{u.name ?? u.email}</p>
                  <p className="text-xs truncate max-w-45" style={{ color: MUTED }}>{u.email}</p>
                </td>
                <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>@{u.handle}</td>
                <td className="px-5 py-4">
                  <button onClick={() => toggleVerified(u.id, u.isVerified)} className="cursor-pointer">
                    {u.isVerified ? <CheckCircle size={16} style={{ color: "#059669" }} /> : <XCircle size={16} style={{ color: "#DC2626" }} />}
                  </button>
                </td>
                <td className="px-5 py-4 font-mono text-sm" style={{ color: MUTED }}>{u._count.transactions}</td>
                <td className="px-5 py-4 font-mono text-sm" style={{ color: MUTED }}>{u._count.paymentLinks}</td>
                <td className="px-5 py-4 font-mono text-sm" style={{ color: MUTED }}>{u._count.apiKeys}</td>
                <td className="px-5 py-4 text-xs" style={{ color: FAINT }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4">
                  <a href={`/admin/users/${u.id}`} className="transition-opacity hover:opacity-60" style={{ color: MINT_DARK }}>
                    <ExternalLink size={14} />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid rgba(0,255,204,0.10)" }}>
            <span className="text-xs" style={{ color: FAINT }}>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => load(page - 1, search)}
                className="p-2 rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${MINT}14`}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = ""}><ChevronLeft size={16} /></button>
              <button disabled={page === pages} onClick={() => load(page + 1, search)}
                className="p-2 rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${MINT}14`}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = ""}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
