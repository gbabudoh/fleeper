"use client";

import { useState, useEffect, useRef } from "react";
import {
  Link2, Plus, Copy, ExternalLink, Pencil, Trash2,
  CheckCircle2, Eye, DollarSign, ToggleLeft, ToggleRight,
  X, Loader2, AlertCircle, Zap, ChevronDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PaymentLink {
  id:          string;
  title:       string;
  description: string | null;
  amount:      number | null;
  isFlexible:  boolean;
  isActive:    boolean;
  slug:        string;
  views:       number;
  createdAt:   string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCents(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function getLinkUrl(slug: string) {
  if (typeof window !== "undefined") return `${window.location.origin}/pay/${slug}`;
  return `/pay/${slug}`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }: { msg: string; type: "ok" | "err"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium transition-all
      ${type === "ok" ? "bg-[#00FFCC] text-[#0A0A0A]" : "bg-red-500/90 text-white"}`}>
      {type === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
interface ModalProps {
  initial?: PaymentLink | null;
  onClose: () => void;
  onSave:  (link: PaymentLink) => void;
}

function LinkModal({ initial, onClose, onSave }: ModalProps) {
  const isEdit = !!initial;
  const [title,       setTitle]       = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isFlexible,  setIsFlexible]  = useState(initial?.isFlexible ?? false);
  const [amountRaw,   setAmountRaw]   = useState(initial?.amount ? String(initial.amount / 100) : "");
  const [slug,        setSlug]        = useState(initial?.slug ?? "");
  const [slugManual,  setSlugManual]  = useState(isEdit);
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState<string | null>(null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  const handleSubmit = async () => {
    setErr(null);
    const amountCents = isFlexible ? undefined : Math.round(parseFloat(amountRaw) * 100);
    if (!isFlexible && (!amountRaw || isNaN(amountCents!) || amountCents! <= 0)) {
      setErr("Enter a valid amount"); return;
    }
    if (!slug) { setErr("Slug is required"); return; }

    setSaving(true);
    const body: Record<string, unknown> = {
      title, description: description || null,
      isFlexible,
      amount: isFlexible ? null : amountCents,
      slug,
    };
    const url  = isEdit ? `/api/links/${initial!.id}` : "/api/links";
    const method = isEdit ? "PATCH" : "POST";

    const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) { setErr(data.error ?? "Something went wrong"); return; }
    onSave(data.link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) handleSubmit(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md glass-card p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">{isEdit ? "Edit Link" : "New Payment Link"}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 cursor-pointer transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex gap-2">
          {[false, true].map((flex) => (
            <button
              key={String(flex)}
              onClick={() => setIsFlexible(flex)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border ${
                isFlexible === flex
                  ? "bg-[#00FFCC]/15 border-[#00FFCC]/40 text-[#00FFCC]"
                  : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}
            >
              {flex ? "Flexible / Tip" : "Fixed Amount"}
            </button>
          ))}
        </div>

        {/* Title */}
        <div>
          <label className="text-xs text-white/40 block mb-1.5">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g. Strategy Session"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00FFCC]/50 transition-colors placeholder:text-white/20"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-white/40 block mb-1.5">Description <span className="text-white/20">(optional)</span></label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="What does this payment cover?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#00FFCC]/50 transition-colors resize-none placeholder:text-white/20"
          />
        </div>

        {/* Amount (fixed only) */}
        {!isFlexible && (
          <div>
            <label className="text-xs text-white/40 block mb-1.5">Amount (USD) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amountRaw}
                onChange={(e) => setAmountRaw(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-[#00FFCC]/50 transition-colors placeholder:text-white/20"
              />
            </div>
          </div>
        )}

        {/* Slug */}
        <div>
          <label className="text-xs text-white/40 block mb-1.5">Link slug *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs">/pay/</span>
            <input
              value={slug}
              onChange={(e) => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugManual(true); }}
              maxLength={80}
              placeholder="my-service"
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-14 pr-4 py-3 text-sm outline-none focus:border-[#00FFCC]/50 transition-colors font-mono placeholder:text-white/20"
            />
          </div>
          <p className="text-[11px] text-white/20 mt-1 font-mono">{getLinkUrl(slug || "…")}</p>
        </div>

        {err && <p className="text-red-400 text-sm flex items-center gap-2"><AlertCircle size={14} />{err}</p>}

        <button
          onClick={handleSubmit}
          disabled={saving || !title || !slug}
          className="w-full py-3.5 bg-[#00FFCC] text-[#0A0A0A] font-bold rounded-2xl hover:bg-[#00FFCC]/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : (isEdit ? "Save Changes" : "Create Link")}
        </button>
      </div>
    </div>
  );
}

// ─── Link Card ────────────────────────────────────────────────────────────────
interface CardProps {
  link:      PaymentLink;
  onEdit:    (l: PaymentLink) => void;
  onDelete:  (id: string) => void;
  onToggle:  (l: PaymentLink) => void;
  onCopy:    (slug: string) => void;
}

function LinkCard({ link, onEdit, onDelete, onToggle, onCopy }: CardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`glass-card p-5 flex flex-col gap-4 transition-all ${!link.isActive ? "opacity-50" : ""}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold truncate">{link.title}</p>
            {link.isFlexible ? (
              <span className="px-2 py-0.5 text-[10px] bg-[#FFB347]/10 text-[#FFB347] rounded-full border border-[#FFB347]/20 font-medium shrink-0">
                Flexible
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] bg-[#00FFCC]/10 text-[#00FFCC] rounded-full border border-[#00FFCC]/20 font-medium shrink-0 font-mono">
                {formatCents(link.amount ?? 0)}
              </span>
            )}
            {!link.isActive && (
              <span className="px-2 py-0.5 text-[10px] bg-white/5 text-white/30 rounded-full border border-white/10 font-medium shrink-0">
                Inactive
              </span>
            )}
          </div>
          {link.description && (
            <p className="text-xs text-white/40 mt-1 line-clamp-2">{link.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onCopy(link.slug)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-[#00FFCC] hover:bg-[#00FFCC]/10 cursor-pointer transition-colors"
            title="Copy link"
          >
            <Copy size={14} />
          </button>
          <a
            href={`/pay/${link.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            title="Open link"
          >
            <ExternalLink size={14} />
          </a>
          <button
            onClick={() => onEdit(link)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
            title="Edit link"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 cursor-pointer transition-colors"
            title="Delete link"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Stats + slug */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white/30">
            <Eye size={12} />
            <span>{link.views.toLocaleString()} view{link.views !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <p className="font-mono text-white/20 truncate max-w-[160px]">/pay/{link.slug}</p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <span className="text-xs text-white/30">{link.isActive ? "Accepting payments" : "Paused"}</span>
        <button
          onClick={() => onToggle(link)}
          className="flex items-center gap-1.5 text-xs cursor-pointer transition-colors"
          style={{ color: link.isActive ? "#00FFCC" : "rgba(255,255,255,0.3)" }}
        >
          {link.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {link.isActive ? "Active" : "Inactive"}
        </button>
      </div>

      {/* Confirm delete overlay */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-(--bg-glass) rounded-2xl flex flex-col items-center justify-center gap-3 z-10 p-4">
          <AlertCircle size={24} className="text-red-400" />
          <p className="text-sm font-semibold text-center">Delete &quot;{link.title}&quot;?</p>
          <p className="text-xs text-white/40 text-center">This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 text-sm bg-white/10 rounded-xl hover:bg-white/20 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onDelete(link.id); setConfirmDelete(false); }}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 cursor-pointer transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LinksPage() {
  const [links,   setLinks]   = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<PaymentLink | null>(null);
  const [filter,  setFilter]  = useState<"all" | "active" | "inactive">("all");
  const [toast,   setToast]   = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => setToast({ msg, type });

  // Load links
  useEffect(() => {
    fetch("/api/links")
      .then((r) => r.json())
      .then((d) => setLinks(d.links ?? []))
      .catch(() => showToast("Failed to load links", "err"))
      .finally(() => setLoading(false));
  }, []);

  // Stats
  const totalViews   = links.reduce((s, l) => s + l.views, 0);
  const activeCount  = links.filter((l) => l.isActive).length;

  // Filter
  const filtered = links.filter((l) =>
    filter === "all" ? true : filter === "active" ? l.isActive : !l.isActive
  );

  // Handlers
  const handleSave = (link: PaymentLink) => {
    setLinks((prev) => {
      const idx = prev.findIndex((l) => l.id === link.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = link; return next; }
      return [link, ...prev];
    });
    setModal(null);
    setEditing(null);
    showToast(editing ? "Link updated" : "Link created!");
  };

  const handleToggle = async (link: PaymentLink) => {
    const res = await fetch(`/api/links/${link.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !link.isActive }),
    });
    if (!res.ok) { showToast("Failed to update link", "err"); return; }
    const { link: updated } = await res.json();
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
    showToast(updated.isActive ? "Link activated" : "Link paused");
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      showToast(d.error ?? "Failed to delete link", "err"); return;
    }
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToast("Link deleted");
  };

  const handleCopy = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(getLinkUrl(slug));
      showToast("Link copied!");
    } catch {
      showToast("Copy failed", "err");
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-base) px-6 py-8">
      <div className="mesh-bg" />
      <div className="relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">Payment Links</h1>
            <p className="text-white/40 text-sm mt-0.5">
              Create shareable links that accept payments and auto-route to your pools.
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setModal("create"); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00FFCC] text-[#0A0A0A] font-bold rounded-2xl hover:bg-[#00FFCC]/90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-sm shrink-0"
          >
            <Plus size={16} />
            New Link
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Links",   value: links.length,         icon: Link2,       color: "#00FFCC" },
            { label: "Active Links",  value: activeCount,          icon: ToggleRight, color: "#8B5CF6" },
            { label: "Total Views",   value: totalViews,           icon: Eye,         color: "#FFB347" },
            { label: "Flexible Links",value: links.filter(l => l.isFlexible).length, icon: DollarSign, color: "#00FFCC" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <p className="text-xs text-white/40">{label}</p>
              </div>
              <p className="text-2xl font-black">{value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all capitalize ${
                filter === f
                  ? "bg-[#00FFCC]/15 text-[#00FFCC] border border-[#00FFCC]/30"
                  : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {f === "all" ? `All (${links.length})` : f === "active" ? `Active (${activeCount})` : `Inactive (${links.length - activeCount})`}
            </button>
          ))}
        </div>

        {/* Links grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="h-4 bg-white/5 rounded-lg w-3/4 mb-3" />
                <div className="h-3 bg-white/5 rounded-lg w-1/2 mb-4" />
                <div className="h-3 bg-white/5 rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
              <Link2 size={28} className="text-white/20" />
            </div>
            <p className="font-semibold text-lg">
              {filter === "all" ? "No payment links yet" : `No ${filter} links`}
            </p>
            <p className="text-sm text-white/30 max-w-xs">
              {filter === "all"
                ? "Create your first payment link and share it with customers."
                : "Adjust your filter to see other links."}
            </p>
            {filter === "all" && (
              <button
                onClick={() => { setEditing(null); setModal("create"); }}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-[#00FFCC] text-[#0A0A0A] font-bold rounded-2xl hover:bg-[#00FFCC]/90 cursor-pointer transition-all text-sm"
              >
                <Plus size={14} /> Create your first link
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((link) => (
              <div key={link.id} className="relative">
                <LinkCard
                  link={link}
                  onEdit={(l) => { setEditing(l); setModal("edit"); }}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onCopy={handleCopy}
                />
              </div>
            ))}
          </div>
        )}

        {/* Help callout */}
        {links.length > 0 && (
          <div className="mt-8 glass-card p-5 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-0.5">
              <Zap size={14} className="text-[#8B5CF6]" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">Share your links anywhere</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Copy a link and paste it in emails, social media, or embed it on your website.
                When a customer pays, Fleeper automatically routes income to your pools in real time.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {(modal === "create" || modal === "edit") && (
        <LinkModal
          initial={modal === "edit" ? editing : null}
          onClose={() => { setModal(null); setEditing(null); }}
          onSave={handleSave}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
