"use client";

import { useState, useEffect, useCallback } from "react";
import {
  User, Lock, Key, AlertTriangle, CheckCircle2, AlertCircle,
  Loader2, Eye, EyeOff, Copy, Trash2, Plus, Shield,
  Download, ShieldCheck, ShieldOff, Sun, Moon, Palette, X,
  CreditCard, ExternalLink, RefreshCw,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserProfile {
  id:         string;
  name:       string | null;
  email:      string;
  handle:     string;
  isVerified: boolean;
  createdAt:  string;
  _count: { transactions: number; paymentLinks: number; apiKeys: number; incomePools: number };
}

interface ApiKeyRecord {
  id:        string;
  name:      string;
  prefix:    string;
  isActive:  boolean;
  lastUsed:  string | null;
  createdAt: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }: { msg: string; type: "ok" | "err"; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium
      ${type === "ok" ? "bg-[#00FFCC] text-[#0A0A0A]" : "bg-red-500/90 text-white"}`}>
      {type === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────
function Section({ icon: Icon, color, title, description, children }: {
  icon: React.ElementType; color: string; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-5 border-b border-white/5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <h2 className="font-bold">{title}</h2>
          <p className="text-xs text-white/40 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/40 block mb-1.5">{label}</label>
      {children}
      {note && <p className="text-[11px] text-white/20 mt-1">{note}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", disabled, prefix, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; prefix?: string; className?: string;
}) {
  return (
    <div className="relative">
      {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25 text-sm">{prefix}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00FFCC]/50 transition-colors placeholder:text-white/20 disabled:opacity-40 disabled:cursor-not-allowed ${prefix ? "pl-10" : ""} ${className}`}
      />
    </div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ profile, onUpdate }: { profile: UserProfile; onUpdate: (p: UserProfile) => void }) {
  const [name,   setName]   = useState(profile.name ?? "");
  const [handle, setHandle] = useState(profile.handle);
  const [email,  setEmail]  = useState(profile.email);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState<string | null>(null);
  const [ok,     setOk]     = useState(false);

  const dirty = name !== (profile.name ?? "") || handle !== profile.handle || email !== profile.email;

  const save = async () => {
    setErr(null); setOk(false); setSaving(true);
    const res  = await fetch("/api/settings/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, handle, email }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error); return; }
    onUpdate({ ...profile, ...data.user });
    setOk(true);
    setTimeout(() => setOk(false), 3000);
  };

  const initials = (profile.name ?? profile.handle).slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FFCC] via-[#FFB347] to-[#8B5CF6] flex items-center justify-center shrink-0">
          <span className="font-black text-xl text-[#0A0A0A]">{initials}</span>
        </div>
        <div>
          <p className="font-semibold">{profile.name ?? profile.handle}</p>
          <p className="text-xs text-white/40">@{profile.handle}</p>
          {profile.isVerified && (
            <div className="flex items-center gap-1 mt-1.5">
              <ShieldCheck size={11} className="text-[#00FFCC]" />
              <span className="text-[11px] text-[#00FFCC]">Verified account</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Transactions", value: profile._count.transactions },
          { label: "Payment Links", value: profile._count.paymentLinks },
          { label: "Income Pools", value: profile._count.incomePools },
          { label: "API Keys", value: profile._count.apiKeys },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
            <p className="text-xl font-black">{value}</p>
            <p className="text-[11px] text-white/30 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Field label="Display Name">
          <Input value={name} onChange={setName} placeholder="Your name" />
        </Field>
        <Field label="Handle" note="Your public @handle — changing it will break existing profile links.">
          <Input value={handle} onChange={setHandle} placeholder="your-handle" prefix="@" />
        </Field>
        <Field label="Email" note="Changing your email will require re-verification.">
          <Input value={email} onChange={setEmail} placeholder="you@example.com" type="email" />
        </Field>
      </div>

      {err && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14} />{err}</p>}
      {ok  && <p className="text-[#00FFCC] text-sm flex items-center gap-2"><CheckCircle2 size={14} />Profile saved.</p>}

      <button
        onClick={save}
        disabled={saving || !dirty}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#00FFCC] text-[#0A0A0A] font-bold rounded-2xl hover:bg-[#00FFCC]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-sm"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
        {saving ? "Saving…" : "Save Profile"}
      </button>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab({ showToast }: { showToast: (m: string, t?: "ok" | "err") => void }) {
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState<string | null>(null);

  const mismatch  = next && confirm && next !== confirm;
  const tooShort  = next && next.length < 8;
  const strength  = next.length === 0 ? 0 : next.length < 8 ? 1 : next.length < 12 ? 2 : next.length < 16 ? 3 : 4;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#FFB347", "#00FFCC", "#8B5CF6"][strength];

  const save = async () => {
    setErr(null);
    if (next !== confirm) { setErr("Passwords do not match"); return; }
    if (next.length < 8)  { setErr("Password must be at least 8 characters"); return; }
    setSaving(true);
    const res  = await fetch("/api/settings/password", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setErr(data.error); return; }
    showToast("Password changed successfully");
    setCurrent(""); setNext(""); setConfirm("");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Field label="Current Password">
          <div className="relative">
            <input
              type={showCur ? "text" : "password"}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm outline-none focus:border-[#00FFCC]/50 transition-colors placeholder:text-white/20"
            />
            <button onClick={() => setShowCur((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer transition-colors">
              {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </Field>

        <Field label="New Password">
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-white/5 border rounded-xl px-4 py-3 pr-11 text-sm outline-none transition-colors placeholder:text-white/20 ${tooShort ? "border-red-500/40" : "border-white/10 focus:border-[#00FFCC]/50"}`}
            />
            <button onClick={() => setShowNew((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white cursor-pointer transition-colors">
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {next.length > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-300" style={{ width: `${strength * 25}%`, background: strengthColor }} />
              </div>
              <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
            </div>
          )}
        </Field>

        <Field label="Confirm New Password">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/20 ${mismatch ? "border-red-500/40" : "border-white/10 focus:border-[#00FFCC]/50"}`}
          />
          {mismatch && <p className="text-red-400 text-xs mt-1">Passwords do not match</p>}
        </Field>
      </div>

      {err && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14} />{err}</p>}

      <button
        onClick={save}
        disabled={saving || !current || !next || !confirm}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#00FFCC] text-[#0A0A0A] font-bold rounded-2xl hover:bg-[#00FFCC]/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all text-sm"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
        {saving ? "Changing…" : "Change Password"}
      </button>

      {/* Session info */}
      <div className="mt-6 pt-6 border-t border-white/5">
        <p className="text-sm font-semibold mb-3">Active Session</p>
        <div className="bg-white/3 rounded-xl p-4 border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#00FFCC] animate-pulse" />
            <div>
              <p className="text-sm font-medium">Current session</p>
              <p className="text-xs text-white/30">Encrypted httpOnly cookie · 7 days</p>
            </div>
          </div>
          <span className="text-xs text-white/30 font-mono">Active</span>
        </div>
      </div>
    </div>
  );
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────
function ApiKeysTab({ showToast }: { showToast: (m: string, t?: "ok" | "err") => void }) {
  const [keys,       setKeys]       = useState<ApiKeyRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [newName,    setNewName]    = useState("");
  const [creating,   setCreating]   = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [revealed,   setRevealed]   = useState<string | null>(null); // the raw key shown once
  const [revealId,   setRevealId]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings/api-keys")
      .then((r) => r.json())
      .then((d) => setKeys(d.keys ?? []))
      .catch(() => showToast("Failed to load keys", "err"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const create = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    const res  = await fetch("/api/settings/api-keys", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) { showToast(data.error ?? "Failed to create key", "err"); return; }
    setKeys((prev) => [data.key, ...prev]);
    setRevealed(data.rawKey);
    setRevealId(data.key.id);
    setNewName("");
    setShowCreate(false);
  };

  const revoke = async (id: string) => {
    const res = await fetch(`/api/settings/api-keys/${id}`, { method: "DELETE" });
    if (!res.ok) { showToast("Failed to revoke key", "err"); return; }
    setKeys((prev) => prev.filter((k) => k.id !== id));
    showToast("API key revoked");
  };

  const toggle = async (id: string) => {
    const res  = await fetch(`/api/settings/api-keys/${id}`, { method: "PATCH" });
    const data = await res.json();
    if (!res.ok) { showToast("Failed to update key", "err"); return; }
    setKeys((prev) => prev.map((k) => k.id === id ? data.key : k));
    showToast(data.key.isActive ? "Key activated" : "Key disabled");
  };

  const copyKey = async (val: string) => {
    await navigator.clipboard.writeText(val);
    showToast("Copied to clipboard!");
  };

  return (
    <div className="space-y-5">
      {/* Intro callout */}
      <div className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-[#8B5CF6] shrink-0 mt-0.5" />
        <div className="text-xs text-white/50 leading-relaxed">
          API keys allow external services and webhooks to authenticate with Fleeper.
          Keys are shown <strong className="text-white/70">once</strong> at creation — store them in your secrets manager immediately.
          Max 10 active keys.
        </div>
      </div>

      {/* Revealed key banner */}
      {revealed && (
        <div className="bg-[#00FFCC]/10 border border-[#00FFCC]/30 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-[#00FFCC]" />
            <p className="text-sm font-bold text-[#00FFCC]">Key created — copy it now!</p>
            <button onClick={() => { setRevealed(null); setRevealId(null); }} className="ml-auto text-white/30 hover:text-white cursor-pointer transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-(--bg-overlay) rounded-xl px-4 py-3">
            <code className="text-[#00FFCC] font-mono text-sm flex-1 break-all">{revealed}</code>
            <button onClick={() => copyKey(revealed)} className="text-white/30 hover:text-[#00FFCC] cursor-pointer transition-colors shrink-0">
              <Copy size={14} />
            </button>
          </div>
          <p className="text-[11px] text-white/30">This key will never be shown again.</p>
        </div>
      )}

      {/* Create form */}
      {showCreate ? (
        <div className="bg-white/3 border border-white/10 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold">New API Key</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="e.g. Production webhook, CI runner…"
              maxLength={60}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00FFCC]/50 transition-colors placeholder:text-white/20"
            />
            <button
              onClick={create}
              disabled={creating || !newName.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00FFCC] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#00FFCC]/90 disabled:opacity-40 cursor-pointer transition-all text-sm shrink-0"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Generate
            </button>
            <button onClick={() => { setShowCreate(false); setNewName(""); }} className="px-3 py-2.5 text-white/30 hover:text-white rounded-xl hover:bg-white/5 cursor-pointer transition-colors text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all"
        >
          <Plus size={14} /> Generate new API key
        </button>
      )}

      {/* Keys list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 bg-white/3 rounded-2xl animate-pulse border border-white/5" />
          ))}
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-10 text-white/20 text-sm">
          <Key size={28} className="mx-auto mb-3 opacity-30" />
          No API keys yet
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                revealId === key.id ? "border-[#00FFCC]/20 bg-[#00FFCC]/5" : "border-white/8 bg-white/3"
              } ${!key.isActive ? "opacity-50" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: key.isActive ? "#00FFCC20" : "#ffffff10" }}>
                <Key size={15} style={{ color: key.isActive ? "#00FFCC" : "rgba(255,255,255,0.3)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{key.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <code className="text-xs text-white/30 font-mono">{key.prefix}••••••••••••••••••</code>
                  {key.lastUsed ? (
                    <span className="text-[11px] text-white/20">last used {new Date(key.lastUsed).toLocaleDateString()}</span>
                  ) : (
                    <span className="text-[11px] text-white/20">never used</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggle(key.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
                  title={key.isActive ? "Disable key" : "Enable key"}
                >
                  {key.isActive ? <ShieldCheck size={14} /> : <ShieldOff size={14} />}
                </button>
                <button
                  onClick={() => revoke(key.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors"
                  title="Revoke key"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────
function PaymentsTab({ showToast }: { showToast: (m: string, t?: "ok" | "err") => void }) {
  const [status,    setStatus]    = useState<{ connected: boolean; chargesEnabled: boolean; payoutsEnabled: boolean; detailsSubmitted: boolean } | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [launching, setLaunching] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/stripe/onboard");
      const data = await res.json();
      setStatus(data);
    } catch {
      showToast("Failed to load payment status", "err");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const handleOnboard = async () => {
    setLaunching(true);
    try {
      const res  = await fetch("/api/stripe/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { showToast(data.error ?? "Failed to start onboarding", "err"); return; }
      window.location.href = data.url;
    } catch {
      showToast("Network error — try again", "err");
    } finally {
      setLaunching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3">
        <Loader2 size={20} className="animate-spin text-[#00FFCC]" />
        <p className="text-sm text-white/40">Checking Stripe status…</p>
      </div>
    );
  }

  const fullyActive = status?.chargesEnabled && status?.payoutsEnabled;

  return (
    <div className="space-y-5">
      {/* Status card */}
      <div className={`rounded-2xl p-5 border flex items-start gap-4 ${
        fullyActive
          ? "bg-[#00FFCC]/5 border-[#00FFCC]/20"
          : status?.connected
          ? "bg-[#FFB347]/5 border-[#FFB347]/20"
          : "bg-white/3 border-white/10"
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          fullyActive ? "bg-[#00FFCC]/15" : status?.connected ? "bg-[#FFB347]/15" : "bg-white/5"
        }`}>
          <CreditCard size={18} style={{ color: fullyActive ? "#00FFCC" : status?.connected ? "#FFB347" : "rgba(255,255,255,0.3)" }} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">
            {fullyActive ? "Stripe account active" : status?.connected ? "Verification in progress" : "Stripe not connected"}
          </p>
          <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
            {fullyActive
              ? "Your Stripe Connected Account is verified. Payments will be routed to your income pools."
              : status?.connected
              ? "Your Stripe account was created but verification is incomplete. Complete it to receive payouts."
              : "Connect a Stripe account to enable payment routing. Without it, your public profile can't accept live payments."}
          </p>

          {status?.connected && (
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status.chargesEnabled ? "bg-[#00FFCC]" : "bg-white/20"}`} />
                <span className="text-xs text-white/50">Charges {status.chargesEnabled ? "enabled" : "disabled"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${status.payoutsEnabled ? "bg-[#00FFCC]" : "bg-white/20"}`} />
                <span className="text-xs text-white/50">Payouts {status.payoutsEnabled ? "enabled" : "disabled"}</span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={load}
          className="cursor-pointer text-white/20 hover:text-white/60 transition-colors shrink-0 mt-0.5"
          title="Refresh status"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Action */}
      {!fullyActive && (
        <button
          onClick={handleOnboard}
          disabled={launching}
          className="cursor-pointer flex items-center gap-2 px-5 py-3 bg-[#00FFCC] text-[#0A0A0A] font-bold rounded-2xl hover:bg-[#00FFCC]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
        >
          {launching
            ? <Loader2 size={15} className="animate-spin" />
            : <ExternalLink size={15} />}
          {launching
            ? "Redirecting to Stripe…"
            : status?.connected
            ? "Complete Stripe verification"
            : "Connect Stripe account"}
        </button>
      )}

      {/* Info callout */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-4 flex items-start gap-3">
        <Shield size={15} className="text-white/30 mt-0.5 shrink-0" />
        <p className="text-xs text-white/40 leading-relaxed">
          Fleeper uses <strong className="text-white/60">Stripe Connect Express</strong> to route payments directly to your bank accounts.
          Stripe handles all KYC and identity verification — Fleeper never stores your bank credentials.
        </p>
      </div>
    </div>
  );
}

// ─── Danger Zone Tab ──────────────────────────────────────────────────────────
function DangerTab({ profile, showToast }: { profile: UserProfile; showToast: (m: string, t?: "ok" | "err") => void }) {
  const [exporting,    setExporting]    = useState(false);
  const [deleteModal,  setDeleteModal]  = useState(false);
  const [password,     setPassword]     = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [deleting,     setDeleting]     = useState(false);
  const [err,          setErr]          = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res  = await fetch("/api/settings/account");
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `fleeper-export-${profile.handle}.json`; a.click();
      URL.revokeObjectURL(url);
      showToast("Data exported!");
    } catch {
      showToast("Export failed", "err");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setErr(null);
    if (confirmation !== "DELETE MY ACCOUNT") { setErr('Type "DELETE MY ACCOUNT" to confirm'); return; }
    setDeleting(true);
    const res  = await fetch("/api/settings/account", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmation }),
    });
    const data = await res.json();
    setDeleting(false);
    if (!res.ok) { setErr(data.error); return; }
    window.location.href = "/login";
  };

  return (
    <div className="space-y-5">
      {/* Export */}
      <div className="bg-white/3 border border-white/8 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Download size={15} className="text-[#8B5CF6]" />
          </div>
          <div>
            <p className="font-semibold text-sm">Export your data</p>
            <p className="text-xs text-white/40 mt-0.5">Download all your transactions, pools, links, and settings as JSON.</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded-xl text-sm font-medium hover:bg-[#8B5CF6]/30 disabled:opacity-50 cursor-pointer transition-colors shrink-0"
        >
          {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          Export
        </button>
      </div>

      {/* Delete */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={15} className="text-red-400" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-red-400">Delete account</p>
            <p className="text-xs text-white/40 mt-0.5 leading-relaxed">
              Permanently delete your account, pools, payment links, API keys, and all data.
              Completed transactions are retained for compliance. This cannot be undone.
            </p>
            <button
              onClick={() => setDeleteModal(true)}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium hover:bg-red-500/30 cursor-pointer transition-colors"
            >
              <Trash2 size={13} /> Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteModal(false)}>
          <div className="w-full max-w-md glass-card p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h2 className="font-bold text-red-400">Delete your account</h2>
                <p className="text-xs text-white/40">This is permanent and irreversible.</p>
              </div>
              <button onClick={() => setDeleteModal(false)} className="ml-auto text-white/30 hover:text-white cursor-pointer transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Confirm your password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500/50 transition-colors placeholder:text-white/20"
                />
              </Field>
              <Field label={`Type "DELETE MY ACCOUNT" to confirm`}>
                <input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="DELETE MY ACCOUNT"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-500/50 transition-colors placeholder:text-white/20 font-mono"
                />
              </Field>
            </div>

            {err && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14} />{err}</p>}

            <button
              onClick={handleDelete}
              disabled={deleting || !password || confirmation !== "DELETE MY ACCOUNT"}
              className="w-full py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {deleting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Permanently Delete Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Appearance Tab ───────────────────────────────────────────────────────────
function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  const options: { id: "dark" | "light"; label: string; desc: string; icon: React.ElementType; preview: React.ReactNode }[] = [
    {
      id: "dark",
      label: "Dark",
      desc: "Easy on the eyes. Built for night owls and focused work.",
      icon: Moon,
      preview: (
        <div className="w-full h-24 rounded-xl overflow-hidden border border-white/10" style={{ background: "#0A0A0A" }}>
          <div className="flex h-full">
            <div className="w-8 h-full" style={{ background: "#0D0D0D", borderRight: "1px solid rgba(255,255,255,0.05)" }} />
            <div className="flex-1 p-2 space-y-1.5">
              <div className="h-2 rounded-full w-3/4" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="h-2 rounded-full w-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />
              <div className="h-8 rounded-lg mt-2" style={{ background: "rgba(22,22,22,0.9)", border: "1px solid rgba(255,255,255,0.08)" }} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "light",
      label: "Light",
      desc: "Clean and bright. Great for daytime and presentations.",
      icon: Sun,
      preview: (
        <div className="w-full h-24 rounded-xl overflow-hidden border border-black/10" style={{ background: "#EFF1F5" }}>
          <div className="flex h-full">
            <div className="w-8 h-full" style={{ background: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,0.06)" }} />
            <div className="flex-1 p-2 space-y-1.5">
              <div className="h-2 rounded-full w-3/4" style={{ background: "rgba(0,0,0,0.10)" }} />
              <div className="h-2 rounded-full w-1/2" style={{ background: "rgba(0,0,0,0.06)" }} />
              <div className="h-8 rounded-lg mt-2" style={{ background: "rgba(255,255,255,0.90)", border: "1px solid rgba(0,0,0,0.09)" }} />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold mb-1">Interface theme</p>
        <p className="text-xs text-white/40">Choose how Fleeper looks. Your preference is saved locally.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(({ id, label, desc, icon: Icon, preview }) => {
          const active = theme === id;
          return (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className="text-left p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3"
              style={{
                borderColor:      active ? "#00FFCC" : "var(--border-base)",
                background:       active ? "rgba(0,255,204,0.06)" : "var(--bg-input)",
                boxShadow:        active ? "0 0 0 1px rgba(0,255,204,0.2)" : "none",
              }}
            >
              {preview}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={15} style={{ color: active ? "#00FFCC" : undefined }} className="text-white/40" />
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                {active && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#00FFCC]/15 border border-[#00FFCC]/30">
                    <CheckCircle2 size={10} className="text-[#00FFCC]" />
                    <span className="text-[10px] text-[#00FFCC] font-semibold">Active</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
            </button>
          );
        })}
      </div>

      {/* Accent colours reference */}
      <div className="pt-4 border-t border-white/5">
        <p className="text-xs text-white/30 mb-3 font-medium uppercase tracking-wider">Brand Accent Colours</p>
        <div className="flex items-center gap-3">
          {[
            { color: "#00FFCC", label: "Mint" },
            { color: "#FFB347", label: "Amber" },
            { color: "#8B5CF6", label: "Violet" },
          ].map(({ color, label }) => (
            <div key={color} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md" style={{ background: color }} />
              <span className="text-xs text-white/40">{label}</span>
            </div>
          ))}
          <span className="ml-2 text-[11px] text-white/20">Consistent across all themes</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile",    label: "Profile",    icon: User,          color: "#00FFCC" },
  { id: "appearance", label: "Appearance", icon: Palette,       color: "#FFB347" },
  { id: "security",   label: "Security",   icon: Lock,          color: "#8B5CF6" },
  { id: "payments",   label: "Payments",   icon: CreditCard,    color: "#00FFCC" },
  { id: "apikeys",    label: "API Keys",   icon: Key,           color: "#FFB347" },
  { id: "danger",     label: "Danger",     icon: AlertTriangle, color: "#ef4444" },
] as const;

type Tab = typeof TABS[number]["id"];

export default function SettingsPage() {
  const [tab,     setTab]     = useState<Tab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => setToast({ msg, type }), []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setProfile(d.user))
      .catch(() => showToast("Failed to load profile", "err"))
      .finally(() => setLoading(false));
  }, [showToast]);

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <div className="min-h-screen bg-(--bg-base) px-6 py-8">
      <div className="mesh-bg" />
      <div className="relative z-10 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black">Settings</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage your account, security, and integrations.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="lg:w-52 shrink-0">
            <nav className="space-y-1">
              {TABS.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all text-left ${
                    tab === id
                      ? "text-white"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                  style={tab === id ? { background: `${color}18`, boxShadow: `inset 2px 0 0 ${color}` } : undefined}
                >
                  <Icon size={15} style={{ color: tab === id ? color : undefined }} />
                  {label}
                  {id === "danger" && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="glass-card p-8 flex items-center justify-center gap-3">
                <Loader2 size={20} className="animate-spin text-[#00FFCC]" />
                <p className="text-sm text-white/40">Loading settings…</p>
              </div>
            ) : (
              <Section
                icon={activeTab.icon}
                color={activeTab.color}
                title={activeTab.label}
                description={{
                  profile:    "Manage your public profile and contact details.",
                  appearance: "Choose your preferred interface theme.",
                  security:   "Change your password and review active sessions.",
                  payments:   "Connect Stripe to enable payment routing to your bank accounts.",
                  apikeys:    "Generate and manage API keys for integrations.",
                  danger:     "Export your data or permanently close your account.",
                }[tab]}
              >
                {tab === "profile"    && profile && <ProfileTab    profile={profile} onUpdate={setProfile} />}
                {tab === "appearance" && <AppearanceTab />}
                {tab === "security"   && <SecurityTab  showToast={showToast} />}
                {tab === "payments"   && <PaymentsTab  showToast={showToast} />}
                {tab === "apikeys"    && <ApiKeysTab   showToast={showToast} />}
                {tab === "danger"     && profile && <DangerTab profile={profile} showToast={showToast} />}
              </Section>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
