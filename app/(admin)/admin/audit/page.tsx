"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LogEntry {
  id: string; action: string; resource: string; resourceId: string | null;
  ipAddress: string | null; createdAt: string;
  admin: { name: string; email: string; role: string };
}

const MINT      = "#00FFCC";
const MINT_DARK = "#00A882";
const HEAD      = "#071A17";
const MUTED     = "rgba(7,26,23,0.48)";
const FAINT     = "rgba(7,26,23,0.32)";
const CARD      = { background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,255,252,0.94) 100%)", border: "1px solid rgba(0,255,204,0.24)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(0,255,204,0.10), 0 1px 4px rgba(0,0,0,0.04)" };
const TH        = { color: MUTED };

const ACTION_STYLE: Record<string, { text: string; bg: string }> = {
  CREATE:  { text: MINT_DARK,  bg: `${MINT}14` },
  UPDATE:  { text: "#D97706",  bg: "#FFFBEB" },
  DELETE:  { text: "#DC2626",  bg: "#FEF2F2" },
  ENABLE:  { text: MINT_DARK,  bg: `${MINT}14` },
  DISABLE: { text: "#DC2626",  bg: "#FEF2F2" },
  REVOKE:  { text: "#DC2626",  bg: "#FEF2F2" },
};

function actionStyle(action: string) {
  for (const [k, v] of Object.entries(ACTION_STYLE)) {
    if (action.includes(k)) return v;
  }
  return { text: MINT_DARK, bg: `${MINT}14` };
}

export default function AdminAuditPage() {
  const [logs, setLogs]    = useState<LogEntry[]>([]);
  const [total, setTotal]  = useState(0);
  const [page, setPage]    = useState(1);
  const [pages, setPages]  = useState(1);
  const [loading, setLoad] = useState(true);

  const load = useCallback((p: number) => {
    setLoad(true);
    fetch(`/api/admin/audit?page=${p}`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs); setTotal(d.total); setPage(d.page); setPages(d.pages); setLoad(false); });
  }, []);

  useEffect(() => { load(1); }, []);

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-6 w-1 rounded-full" style={{ background: "linear-gradient(to bottom, #00FFCC, #00D4A8)" }} />
          <h1 className="text-2xl font-black" style={{ color: HEAD }}>Audit Logs</h1>
        </div>
        <p className="text-sm pl-4" style={{ color: MUTED }}>{total.toLocaleString()} admin actions recorded</p>
      </div>

      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC80, #00D4A8, #00FFCC40)" }} />
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,255,204,0.12)", background: "rgba(0,255,204,0.05)" }}>
              {["Action", "Resource", "Admin", "IP Address", "Timestamp"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12" style={{ color: MUTED }}>Loading…</td></tr>
            ) : logs.map((log, i) => {
              const s = actionStyle(log.action);
              return (
                <tr key={log.id}
                  style={{ borderBottom: i < logs.length - 1 ? "1px solid rgba(0,255,204,0.08)" : undefined }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(0,255,204,0.04)"}
                  onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = ""}>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono"
                      style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}22` }}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium" style={{ color: HEAD }}>{log.resource}</p>
                    {log.resourceId && (
                      <p className="text-xs font-mono mt-0.5" style={{ color: FAINT }}>{log.resourceId.slice(0, 12)}…</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold" style={{ color: HEAD }}>{log.admin.name}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{log.admin.role.replace("_", " ")}</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-mono" style={{ color: MUTED }}>{log.ipAddress ?? "—"}</td>
                  <td className="px-5 py-4 text-xs" style={{ color: FAINT }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid rgba(0,255,204,0.10)" }}>
            <span className="text-xs" style={{ color: FAINT }}>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => load(page - 1)} className="p-2 rounded-lg disabled:opacity-30 cursor-pointer" style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${MINT}14`}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = ""}><ChevronLeft size={16} /></button>
              <button disabled={page === pages} onClick={() => load(page + 1)} className="p-2 rounded-lg disabled:opacity-30 cursor-pointer" style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = `${MINT}14`}
                onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = ""}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
