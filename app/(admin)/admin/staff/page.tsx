"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ShieldAlert, ShieldCheck, Shield, Eye, CheckCircle, XCircle } from "lucide-react";

interface StaffMember {
  id: string; email: string; name: string; role: string; isActive: boolean;
  lastLoginAt: string | null; createdAt: string;
  createdBy: { name: string; email: string } | null;
}

const MINT      = "#00FFCC";
const MINT_DARK = "#00A882";
const HEAD      = "#071A17";
const MUTED     = "rgba(7,26,23,0.48)";
const FAINT     = "rgba(7,26,23,0.32)";
const CARD      = { background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,255,252,0.94) 100%)", border: "1px solid rgba(0,255,204,0.24)", boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 20px rgba(0,255,204,0.10), 0 1px 4px rgba(0,0,0,0.04)" };
const INPUT_S   = { background: "linear-gradient(135deg, #FFFFFF 0%, rgba(240,255,252,0.80) 100%)", border: "1px solid rgba(0,255,204,0.30)", color: HEAD };
const TH        = { color: MUTED };

const ROLE_ICON: Record<string, React.ReactNode> = {
  SUPER_ADMIN: <ShieldAlert size={13} />, ADMIN: <ShieldCheck size={13} />,
  STAFF: <Shield size={13} />, READ_ONLY: <Eye size={13} />,
};
const ROLE_COLOR: Record<string, string> = { SUPER_ADMIN: "#DC2626", ADMIN: "#D97706", STAFF: MINT_DARK, READ_ONLY: "#2563EB" };
const ROLE_BG:    Record<string, string> = { SUPER_ADMIN: "#FEF2F2", ADMIN: "#FFFBEB", STAFF: `${MINT}14`, READ_ONLY: "#EFF6FF" };

export default function AdminStaffPage() {
  const [staff, setStaff]   = useState<StaffMember[]>([]);
  const [loading, setLoad]  = useState(true);
  const [showForm, setShow] = useState(false);
  const [form, setForm]     = useState({ email: "", name: "", password: "", role: "STAFF" });
  const [saving, setSaving] = useState(false);
  const [formErr, setErr]   = useState<string | null>(null);

  const load = () => {
    setLoad(true);
    fetch("/api/admin/staff").then(r => r.json()).then(d => { setStaff(d.staff ?? []); setLoad(false); });
  };
  useEffect(() => { load(); }, []);

  const createStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr(null);
    const res  = await fetch("/api/admin/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error); setSaving(false); return; }
    setSaving(false); setShow(false);
    setForm({ email: "", name: "", password: "", role: "STAFF" });
    load();
  };

  const updateStaff = async (id: string, patch: object) => {
    await fetch(`/api/admin/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    load();
  };

  const deleteStaff = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from admin panel?`)) return;
    await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-1 rounded-full" style={{ background: "linear-gradient(to bottom, #00FFCC, #00D4A8)" }} />
            <h1 className="text-2xl font-black" style={{ color: HEAD }}>Staff & Roles</h1>
          </div>
          <p className="text-sm pl-4" style={{ color: MUTED }}>Manage admin team members and their access levels</p>
        </div>
        <button onClick={() => setShow(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all hover:scale-[1.02]"
          style={{ background: `linear-gradient(135deg, ${MINT}, #00D4A8)`, color: "#0A2E28", boxShadow: `0 4px 14px ${MINT}50` }}>
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-2xl p-6"
          style={{ background: `${MINT}0A`, border: `1px solid ${MINT}28` }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: HEAD }}>New Staff Member</h3>
          {formErr && (
            <div className="mb-3 px-4 py-3 rounded-xl text-sm"
              style={{ background: "#FEF2F2", border: "1px solid rgba(220,38,38,0.20)", color: "#DC2626" }}>{formErr}</div>
          )}
          <form onSubmit={createStaff} className="grid grid-cols-2 gap-4">
            {[
              { key: "name",     label: "Full name", type: "text",     ph: "Jane Smith" },
              { key: "email",    label: "Email",     type: "email",    ph: "jane@fleeper.com" },
              { key: "password", label: "Password",  type: "password", ph: "Min 8 characters" },
            ].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>{label}</label>
                <input type={type} placeholder={ph} required value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={INPUT_S} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: MUTED }}>Role</label>
              <select value={form.role} onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none cursor-pointer" style={INPUT_S}>
                {["STAFF", "READ_ONLY", "ADMIN"].map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex gap-3 justify-end">
              <button type="button" onClick={() => setShow(false)}
                className="px-4 py-2 rounded-xl text-sm cursor-pointer font-medium" style={{ color: MUTED }}>Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01]"
                style={{ background: `linear-gradient(135deg, ${MINT}, #00D4A8)`, color: "#0A2E28" }}>
                {saving ? "Creating…" : "Create staff account"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={CARD}>
        <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC80, #00D4A8, #00FFCC40)" }} />
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(0,255,204,0.12)", background: "rgba(0,255,204,0.05)" }}>
              {["Member", "Role", "Active", "Last Login", "Created By", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide" style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12" style={{ color: MUTED }}>Loading…</td></tr>
            ) : staff.map((s, i) => (
              <tr key={s.id}
                style={{ borderBottom: i < staff.length - 1 ? "1px solid rgba(0,255,204,0.08)" : undefined }}
                onMouseEnter={(e) => (e.currentTarget as HTMLTableRowElement).style.background = "rgba(0,255,204,0.04)"}
                onMouseLeave={(e) => (e.currentTarget as HTMLTableRowElement).style.background = ""}>
                <td className="px-5 py-4">
                  <p className="font-semibold" style={{ color: HEAD }}>{s.name}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{s.email}</p>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ background: ROLE_BG[s.role] ?? "#F9FAFB", color: ROLE_COLOR[s.role] ?? "#6B7280", border: `1px solid ${ROLE_COLOR[s.role] ?? "#6B7280"}28` }}>
                    {ROLE_ICON[s.role]} {s.role.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => updateStaff(s.id, { isActive: !s.isActive })} className="cursor-pointer">
                    {s.isActive ? <CheckCircle size={16} style={{ color: "#059669" }} /> : <XCircle size={16} style={{ color: "#DC2626" }} />}
                  </button>
                </td>
                <td className="px-5 py-4 text-xs" style={{ color: MUTED }}>
                  {s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleString() : "Never"}
                </td>
                <td className="px-5 py-4 text-xs" style={{ color: MUTED }}>{s.createdBy?.name ?? "System"}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <select value={s.role} onChange={(e) => updateStaff(s.id, { role: e.target.value })}
                      className="text-xs px-2.5 py-1.5 rounded-lg outline-none cursor-pointer"
                      style={{ background: `${MINT}12`, border: `1px solid ${MINT}28`, color: MINT_DARK }}>
                      {["READ_ONLY", "STAFF", "ADMIN", "SUPER_ADMIN"].map(r => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                    <button onClick={() => deleteStaff(s.id, s.name)}
                      className="p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-red-50">
                      <Trash2 size={14} style={{ color: "#DC2626" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
