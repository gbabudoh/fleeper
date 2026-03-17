"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from "lucide-react";

interface PLink {
  id: string; title: string; slug: string; amount: number | null; isFlexible: boolean;
  isActive: boolean; views: number; createdAt: string;
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

export default function AdminLinksPage() {
  const [links, setLinks]   = useState<PLink[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [pages, setPages]   = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoad]  = useState(true);

  const load = useCallback((p: number, q: string) => {
    setLoad(true);
    fetch(`/api/admin/links?page=${p}&q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => { setLinks(d.links); setTotal(d.total); setPage(d.page); setPages(d.pages); setLoad(false); });
  }, []);

  useEffect(() => { load(1, ""); }, []);

  const toggle = async (id: string, isActive: boolean) => {
    await fetch("/api/admin/links", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !isActive }) });
    load(page, search);
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 rounded-full" style={{ background: "linear-gradient(to bottom, #00FFCC, #00D4A8)" }} />
          <h1 className="text-2xl font-black" style={{ color: HEAD }}>Payment Links</h1>
        </div>
        <p className="text-sm pl-4" style={{ color: MUTED }}>{total.toLocaleString()} payment links</p>
      </div>

      <div className="relative mb-6">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: FAINT }} />
        <input placeholder="Search by title or slug…" value={search}
          onChange={(e) => { setSearch(e.target.value); load(1, e.target.value); }}
          className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none" style={INPUT_S} />
      </div>

      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC80, #00D4A8, #00FFCC40)" }} />
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,255,204,0.12)", background: "rgba(0,255,204,0.05)" }}>
              {["Title / Slug", "Owner", "Amount", "Views", "Active", "Created"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12" style={{ color: MUTED }}>Loading…</td></tr>
            ) : links.map((l, i) => (
              <tr key={l.id}
                style={{ borderBottom: i < links.length - 1 ? "1px solid rgba(0,255,204,0.08)" : undefined }}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(0,255,204,0.04)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = ""}>
                <td className="px-5 py-4">
                  <p className="font-semibold" style={{ color: HEAD }}>{l.title}</p>
                  <p className="text-xs font-mono" style={{ color: MUTED }}>/{l.slug}</p>
                </td>
                <td className="px-5 py-4">
                  <p style={{ color: MUTED }}>@{l.user.handle}</p>
                  <p className="text-xs" style={{ color: FAINT }}>{l.user.email}</p>
                </td>
                <td className="px-5 py-4 font-mono font-bold">
                  {l.isFlexible
                    ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: `${MINT}18`, color: MINT_DARK, border: `1px solid ${MINT}30` }}>Flexible</span>
                    : <span style={{ color: HEAD }}>{fmt(l.amount ?? 0)}</span>}
                </td>
                <td className="px-5 py-4 font-mono" style={{ color: MUTED }}>{l.views.toLocaleString()}</td>
                <td className="px-5 py-4">
                  <button onClick={() => toggle(l.id, l.isActive)} className="cursor-pointer">
                    {l.isActive
                      ? <ToggleRight size={24} style={{ color: MINT_DARK }} />
                      : <ToggleLeft size={24} style={{ color: FAINT }} />}
                  </button>
                </td>
                <td className="px-5 py-4 text-xs" style={{ color: FAINT }}>{new Date(l.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid rgba(0,255,204,0.10)" }}>
            <span className="text-xs" style={{ color: FAINT }}>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => load(page - 1, search)} className="p-2 rounded-lg disabled:opacity-30 cursor-pointer" style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${MINT}14`}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = ""}><ChevronLeft size={16} /></button>
              <button disabled={page === pages} onClick={() => load(page + 1, search)} className="p-2 rounded-lg disabled:opacity-30 cursor-pointer" style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${MINT}14`}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = ""}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
