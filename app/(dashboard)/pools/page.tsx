"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wallet, Landmark, TrendingUp, Plus, Pencil, Trash2,
  Check, X, AlertCircle, GripVertical, ToggleLeft, ToggleRight,
  Link2, Loader2, Info, ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePlaidLink } from "@/hooks/usePlaidLink";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Pool {
  id: string;
  name: string;
  percentage: number;
  color: string;
  bankName: string | null;
  bankLastFour: string | null;
  isActive: boolean;
  order: number;
  balance: number;
}

// ── Colour presets ────────────────────────────────────────────────────────────

const COLORS = [
  { hex: "#00FFCC", label: "Mint"   },
  { hex: "#FFB347", label: "Amber"  },
  { hex: "#8B5CF6", label: "Violet" },
  { hex: "#3B82F6", label: "Blue"   },
  { hex: "#EC4899", label: "Pink"   },
  { hex: "#10B981", label: "Green"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getIcon(name: string): React.ElementType {
  const n = name.toLowerCase();
  if (n.includes("tax") || n.includes("hmrc") || n.includes("irs"))                                   return Landmark;
  if (n.includes("profit") || n.includes("growth") || n.includes("saving") || n.includes("invest"))   return TrendingUp;
  return Wallet;
}

function totalPct(pools: Pool[]) {
  return pools.filter((p) => p.isActive).reduce((s, p) => s + p.percentage, 0);
}

// ── Edit modal ────────────────────────────────────────────────────────────────

function EditModal({
  pool,
  allPools,
  onSave,
  onClose,
}: {
  pool: Pool;
  allPools: Pool[];
  onSave: (id: string, data: Partial<Pool>) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName]           = useState(pool.name);
  const [color, setColor]         = useState(pool.color);
  const [percentage, setPercentage] = useState(pool.percentage);
  const [bankName, setBankName]   = useState(pool.bankName ?? "");
  const [bankLastFour, setBankLastFour] = useState(pool.bankLastFour ?? "");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // Warn if total would exceed 100
  const otherTotal = allPools
    .filter((p) => p.id !== pool.id && p.isActive)
    .reduce((s, p) => s + p.percentage, 0);
  const remaining = 100 - otherTotal;

  const handleSave = async () => {
    if (percentage > remaining + 0.01) {
      setError(`Max allowed is ${remaining.toFixed(0)}% — other pools use ${otherTotal.toFixed(0)}%`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(pool.id, {
        name,
        color,
        percentage,
        bankName: bankName || null,
        bankLastFour: bankLastFour || null,
      });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={onClose} />
      <div className="relative z-10 glass-card w-full max-w-md p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black">Edit Pool</h2>
          <button onClick={onClose} className="cursor-pointer w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={13} /> {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Pool name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#00FFCC]/40 transition-colors cursor-text"
            />
          </div>

          {/* Colour */}
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Colour</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  title={c.label}
                  className="cursor-pointer w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                  style={{
                    background: c.hex,
                    borderColor: color === c.hex ? "white" : "transparent",
                  }}
                />
              ))}
              {/* Custom hex input */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3">
                <div className="w-4 h-4 rounded" style={{ background: color }} />
                <input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-transparent w-20 text-xs text-white/60 focus:outline-none cursor-text"
                  placeholder="#HEX"
                />
              </div>
            </div>
          </div>

          {/* Percentage */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs text-white/50">Split percentage</label>
              <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={remaining + pool.percentage}
              step={1}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: color }}
            />
            <p className="text-xs text-white/30 mt-1">{remaining.toFixed(0)}% available from other pools</p>
          </div>

          {/* Bank */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Bank name</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Chase"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[#00FFCC]/40 transition-colors cursor-text"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Last 4 digits</label>
              <input
                value={bankLastFour}
                onChange={(e) => setBankLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4821"
                maxLength={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[#00FFCC]/40 transition-colors cursor-text"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="cursor-pointer flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-medium transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name}
            className="cursor-pointer flex-[2] flex items-center justify-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold py-3 rounded-xl hover:bg-[#00FFCC]/90 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add pool modal ────────────────────────────────────────────────────────────

function AddModal({
  allPools,
  onAdd,
  onClose,
}: {
  allPools: Pool[];
  onAdd: (data: { name: string; percentage: number; color: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName]           = useState("");
  const [color, setColor]         = useState("#3B82F6");
  const [percentage, setPercentage] = useState(0);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const used = totalPct(allPools);
  const available = Math.max(0, 100 - used);

  const handleAdd = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    if (percentage <= 0) { setError("Percentage must be greater than 0"); return; }
    if (percentage > available + 0.01) { setError(`Only ${available}% available`); return; }
    setSaving(true);
    try {
      await onAdd({ name: name.trim(), percentage, color });
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add pool");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={onClose} />
      <div className="relative z-10 glass-card w-full max-w-md p-7">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black">Add New Pool</h2>
          <button onClick={onClose} className="cursor-pointer w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <AlertCircle size={13} /> {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Pool name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[#00FFCC]/40 transition-colors cursor-text"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">Colour</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c.hex} onClick={() => setColor(c.hex)} title={c.label}
                  className="cursor-pointer w-8 h-8 rounded-lg border-2 transition-all hover:scale-110"
                  style={{ background: c.hex, borderColor: color === c.hex ? "white" : "transparent" }}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs text-white/50">Split percentage</label>
              <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
            </div>
            <input
              type="range" min={0} max={available} step={1} value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: color }}
            />
            <p className="text-xs text-white/30 mt-1">{available}% available</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="cursor-pointer flex-1 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white text-sm font-medium transition-all">Cancel</button>
          <button onClick={handleAdd} disabled={saving || !name || percentage <= 0}
            className="cursor-pointer flex-[2] flex items-center justify-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold py-3 rounded-xl hover:bg-[#00FFCC]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add pool
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Plaid bank linker ─────────────────────────────────────────────────────────

function PlaidLinker({
  poolId,
  onSuccess,
  onCancel,
}: {
  poolId: string;
  onSuccess: (bankName: string, bankLastFour: string) => void;
  onCancel: () => void;
}) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/plaid/link-token?poolId=${poolId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.linkToken) setLinkToken(d.linkToken);
        else setError(d.error ?? "Failed to initialize bank link");
      })
      .catch(() => setError("Network error — try again"));
  }, [poolId]);

  const handleSuccess = useCallback(
    async (publicToken: string, metadata: { account: { id: string; name: string; mask: string } }) => {
      const res = await fetch("/api/plaid/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poolId,
          publicToken,
          accountId: metadata.account.id,
          accountName: metadata.account.name,
          accountMask: metadata.account.mask,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Bank linking failed"); return; }
      onSuccess(data.bankName, data.bankLastFour);
    },
    [poolId, onSuccess]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: handleSuccess,
    onExit: onCancel,
  });

  // Auto-open as soon as the handler is ready
  useEffect(() => {
    if (ready) open();
  }, [ready, open]);

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={onCancel} />
        <div className="relative z-10 glass-card w-full max-w-sm p-7 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-white/70 mb-4">{error}</p>
          <button onClick={onCancel} className="cursor-pointer px-5 py-2.5 rounded-xl bg-white/10 text-sm font-medium hover:bg-white/20 transition-all">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" />
      <div className="relative z-10 flex flex-col items-center gap-3">
        <Loader2 size={32} className="text-[#00FFCC] animate-spin" />
        <p className="text-sm text-white/50">Opening bank link…</p>
      </div>
    </div>
  );
}

// ── Pool card ─────────────────────────────────────────────────────────────────

function PoolCard({
  pool,
  allPools,
  onEdit,
  onToggle,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onLinkBank,
}: {
  pool: Pool;
  allPools: Pool[];
  onEdit: (p: Pool) => void;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string) => void;
  onLinkBank: (id: string) => void;
}) {
  const Icon = getIcon(pool.name);
  const total = allPools.reduce((s, p) => s + p.balance, 0);
  const pct = total > 0 ? (pool.balance / total) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(pool.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(pool.id)}
      className={`glass-card p-6 transition-all ${pool.isActive ? "" : "opacity-50"}`}
      style={{ borderColor: `${pool.color}25` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <div className="cursor-grab active:cursor-grabbing text-white/20 hover:text-white/50 transition-colors mt-0.5">
            <GripVertical size={16} />
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: pool.color }}>
            <Icon size={18} className="text-[#0A0A0A]" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(pool.id, !pool.isActive)}
            title={pool.isActive ? "Deactivate" : "Activate"}
            className="cursor-pointer w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-all"
            style={{ color: pool.isActive ? pool.color : "rgba(255,255,255,0.3)" }}
          >
            {pool.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
          <button
            onClick={() => onEdit(pool)}
            className="cursor-pointer w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(pool.id)}
            className="cursor-pointer w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/20 hover:text-red-400 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Name + % */}
      <div className="flex items-baseline justify-between mb-1">
        <p className="font-bold">{pool.name}</p>
        <span className="text-2xl font-black" style={{ color: pool.color }}>{pool.percentage}%</span>
      </div>

      {/* Balance */}
      <p className="text-2xl font-black mb-1" style={{ color: pool.color }}>
        {formatCurrency(pool.balance)}
      </p>

      {/* Bank */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          {pool.bankName ? (
            <>
              <Link2 size={11} style={{ color: pool.color }} />
              <p className="text-xs" style={{ color: `${pool.color}80` }}>
                {pool.bankName} ...{pool.bankLastFour}
              </p>
            </>
          ) : (
            <p className="text-xs text-white/25 italic">No bank linked</p>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onLinkBank(pool.id); }}
          className="cursor-pointer flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all hover:scale-105 active:scale-95"
          style={{
            color: pool.color,
            borderColor: `${pool.color}30`,
            background: `${pool.color}08`,
          }}
          title={pool.bankName ? "Change linked bank" : "Link bank account"}
        >
          <ExternalLink size={9} />
          {pool.bankName ? "Change" : "Link bank"}
        </button>
      </div>

      {/* Progress */}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full liquid-fill"
          style={{ width: `${pct}%`, background: pool.color }}
        />
      </div>
      <p className="text-xs text-white/20 mt-1.5 text-right">{pct.toFixed(0)}% of total balance</p>
    </div>
  );
}

// ── Split total indicator ─────────────────────────────────────────────────────

function SplitMeter({ pools }: { pools: Pool[] }) {
  const active = pools.filter((p) => p.isActive);
  const total = active.reduce((s, p) => s + p.percentage, 0);
  const isValid = Math.abs(total - 100) < 0.1;

  return (
    <div className={`glass-card p-5 ${isValid ? "border-[#00FFCC]/20" : "border-red-500/30"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Info size={13} className={isValid ? "text-[#00FFCC]" : "text-red-400"} />
          <p className="text-sm font-semibold">Split allocation</p>
        </div>
        <span className={`text-2xl font-black ${isValid ? "text-[#00FFCC]" : "text-red-400"}`}>
          {total.toFixed(0)}%
        </span>
      </div>

      {/* Bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden flex mb-3">
        {active.map((p) => (
          <div
            key={p.id}
            className="h-full transition-all duration-500"
            style={{ width: `${p.percentage}%`, background: p.color }}
          />
        ))}
        {total < 100 && (
          <div className="h-full flex-1 bg-white/10 rounded-r-full" />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {active.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-white/50">{p.name}</span>
            <span className="text-xs font-bold" style={{ color: p.color }}>{p.percentage}%</span>
          </div>
        ))}
      </div>

      {!isValid && (
        <p className="text-xs text-red-400 mt-3">
          {total < 100
            ? `${(100 - total).toFixed(0)}% unallocated — payments will not route correctly.`
            : `${(total - 100).toFixed(0)}% over 100% — reduce a pool's percentage.`}
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PoolsPage() {
  const [pools, setPools]             = useState<Pool[]>([]);
  const [loading, setLoading]         = useState(true);
  const [editPool, setEditPool]       = useState<Pool | null>(null);
  const [showAdd, setShowAdd]         = useState(false);
  const [dragId, setDragId]           = useState<string | null>(null);
  const [toast, setToast]             = useState<string | null>(null);
  const [linkingPoolId, setLinkingPoolId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    const res = await fetch("/api/pools");
    const data = await res.json();
    setPools(data.pools ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleSave = async (id: string, data: Partial<Pool>) => {
    const res = await fetch(`/api/pools/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await load();
    showToast("Pool updated");
  };

  const handleAdd = async (data: { name: string; percentage: number; color: string }) => {
    const res = await fetch("/api/pools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error);
    await load();
    showToast("Pool added");
  };

  const handleToggle = async (id: string, active: boolean) => {
    await fetch(`/api/pools/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: active }),
    });
    setPools((prev) => prev.map((p) => p.id === id ? { ...p, isActive: active } : p));
    showToast(active ? "Pool activated" : "Pool deactivated");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this pool? This cannot be undone.")) return;
    const res = await fetch(`/api/pools/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { showToast(data.error); return; }
    setPools((prev) => prev.filter((p) => p.id !== id));
    showToast("Pool deleted");
  };

  // ── Drag & drop reorder ────────────────────────────────────────────────────

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = pools.findIndex((p) => p.id === dragId);
    const to   = pools.findIndex((p) => p.id === targetId);
    const next = [...pools];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setPools(next);
    setDragId(null);

    await fetch("/api/pools/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: next.map((p) => p.id) }),
    });
    showToast("Order saved");
  };

  const totalBalance = pools.reduce((s, p) => s + p.balance, 0);

  return (
    <div className="relative min-h-screen">
      <div className="mesh-bg" />
      <div className="relative z-10 px-6 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">Income Pools</h1>
            <p className="text-white/40 text-sm mt-1">Manage where your money flows the moment you earn it.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="cursor-pointer flex items-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#00FFCC]/90 transition-all hover:scale-105 active:scale-95 self-start"
          >
            <Plus size={16} /> Add pool
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Split meter */}
            <SplitMeter pools={pools} />

            {/* Total balance summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-card p-4 sm:col-span-2">
                <p className="text-xs text-white/40 mb-1">Total across all pools</p>
                <p className="text-3xl font-black text-white">{formatCurrency(totalBalance)}</p>
              </div>
              {pools.slice(0, 2).map((p) => (
                <div key={p.id} className="glass-card p-4" style={{ borderColor: `${p.color}20` }}>
                  <p className="text-xs text-white/40 mb-1 truncate">{p.name}</p>
                  <p className="text-xl font-black" style={{ color: p.color }}>{formatCurrency(p.balance)}</p>
                </div>
              ))}
            </div>

            {/* Pool cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  allPools={pools}
                  onEdit={setEditPool}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onDragStart={setDragId}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onLinkBank={setLinkingPoolId}
                />
              ))}

              {/* Empty add slot */}
              <button
                onClick={() => setShowAdd(true)}
                className="cursor-pointer glass-card p-6 border-dashed border-white/10 hover:border-[#00FFCC]/30 hover:bg-[#00FFCC]/5 transition-all flex flex-col items-center justify-center gap-3 min-h-[200px] group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-[#00FFCC]/15 flex items-center justify-center transition-all">
                  <Plus size={18} className="text-white/30 group-hover:text-[#00FFCC] transition-colors" />
                </div>
                <p className="text-sm text-white/30 group-hover:text-[#00FFCC] transition-colors font-medium">Add a new pool</p>
              </button>
            </div>

            {/* Drag hint */}
            <p className="text-xs text-white/20 text-center flex items-center justify-center gap-1.5">
              <GripVertical size={12} /> Drag cards to reorder pools
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {editPool && (
        <EditModal
          pool={editPool}
          allPools={pools}
          onSave={handleSave}
          onClose={() => setEditPool(null)}
        />
      )}
      {showAdd && (
        <AddModal
          allPools={pools}
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {linkingPoolId && (
        <PlaidLinker
          poolId={linkingPoolId}
          onSuccess={(bankName, bankLastFour) => {
            setPools((prev) =>
              prev.map((p) => p.id === linkingPoolId ? { ...p, bankName, bankLastFour } : p)
            );
            setLinkingPoolId(null);
            showToast(`Bank account linked: ${bankName} ...${bankLastFour}`);
          }}
          onCancel={() => setLinkingPoolId(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-(--bg-glass) border border-white/10 shadow-2xl text-sm font-medium animate-count-animate">
          <Check size={14} className="text-[#00FFCC]" /> {toast}
        </div>
      )}
    </div>
  );
}
