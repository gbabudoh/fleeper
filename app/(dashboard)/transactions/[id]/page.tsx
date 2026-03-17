"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ShieldCheck, Download, Wallet, Landmark,
  TrendingUp, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { formatCents } from "@/lib/split-engine";
import { formatDate } from "@/lib/utils";
import { downloadReceipt } from "@/lib/receipt";

const POOL_ICONS = [Wallet, Landmark, TrendingUp];

interface Pool { name: string; color: string; percentage: number; bankName: string | null; bankLastFour: string | null; }
interface Split { id: string; amount: number; status: string; pool: Pool; }
interface Transaction {
  id: string; description: string | null; grossAmount: number; platformFee: number;
  netAmount: number; currency: string; status: string; customerEmail: string | null;
  paymentRef: string | null; createdAt: string; splits: Split[];
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch(`/api/transactions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setTx(data.transaction);
        setTimeout(() => setAnimated(true), 100);
      })
      .catch(() => setError("Failed to load transaction."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!tx || downloading) return;
    setDownloading(true);
    try {
      await downloadReceipt({
        id: tx.id,
        paymentRef: tx.paymentRef,
        description: tx.description,
        grossAmount: tx.grossAmount,
        platformFee: tx.platformFee,
        netAmount: tx.netAmount,
        currency: tx.currency,
        status: tx.status,
        customerEmail: tx.customerEmail,
        createdAt: tx.createdAt,
        splits: tx.splits.map((s, i) => ({
          name: s.pool.name,
          color: s.pool.color,
          percentage: Number(s.pool.percentage),
          amount: s.amount,
          bankName: s.pool.bankName,
          bankLastFour: s.pool.bankLastFour,
        })),
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg-base) px-6 py-8">
      <div className="mesh-bg" />
      <div className="relative z-10 max-w-lg mx-auto">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to transactions
        </Link>

        {/* Loading */}
        {loading && (
          <div className="glass-card p-12 flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-[#00FFCC]/20 border-t-[#00FFCC] animate-spin" />
            <p className="text-white/40 text-sm">Loading transaction…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="glass-card p-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle size={32} className="text-red-400" />
            <p className="font-semibold">{error}</p>
            <Link href="/transactions" className="text-sm text-[#00FFCC] hover:underline">Back to transactions</Link>
          </div>
        )}

        {/* Data */}
        {tx && (
          <>
            <div className="glass-card p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Total Received</p>
                <div
                  className="text-5xl font-black transition-all duration-700"
                  style={{ opacity: animated ? 1 : 0, transform: animated ? "none" : "translateY(12px)" }}
                >
                  {formatCents(tx.grossAmount)}
                </div>
                <p className="text-white/50 text-sm mt-2">{tx.description ?? "Unnamed payment"}</p>
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                  <ShieldCheck size={12} className="text-[#00FFCC]" />
                  <span className="text-xs text-white/60">
                    Verified Fleep · {formatDate(tx.createdAt)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Platform fee */}
                <div
                  className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 transition-all duration-500"
                  style={{ opacity: animated ? 1 : 0 }}
                >
                  <div>
                    <p className="text-sm text-white/50">Fleeper Provision</p>
                    <p className="text-xs text-white/30">2.9% + $0.30</p>
                  </div>
                  <span className="text-red-400/70 font-mono font-bold">-{formatCents(tx.platformFee)}</span>
                </div>

                <div className="flex justify-center">
                  <div className="animate-bounce-slow text-white/20 text-xl">↓</div>
                </div>

                <div
                  className="flex justify-between items-center px-4 py-2 transition-all duration-500 delay-100"
                  style={{ opacity: animated ? 1 : 0 }}
                >
                  <span className="text-sm text-white/40">Net for routing</span>
                  <span className="font-bold text-white font-mono">{formatCents(tx.netAmount)}</span>
                </div>

                {/* Splits */}
                {tx.splits.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-white/30 uppercase tracking-wider">Automated Routing</p>
                    {tx.splits.map((split, i) => {
                      const Icon = POOL_ICONS[i] || Wallet;
                      const isSettled = split.status === "settled";
                      return (
                        <div
                          key={split.id}
                          className="flex justify-between items-center p-5 rounded-2xl border transition-all duration-500"
                          style={{
                            background: `${split.pool.color}12`,
                            borderColor: `${split.pool.color}30`,
                            transitionDelay: `${150 + i * 100}ms`,
                            opacity: animated ? 1 : 0,
                            transform: animated ? "none" : "translateX(-20px)",
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: split.pool.color }}
                            >
                              <Icon size={18} className="text-[#0A0A0A]" />
                            </div>
                            <div>
                              <p className="font-semibold">{split.pool.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {isSettled ? (
                                  <CheckCircle2 size={10} style={{ color: split.pool.color }} />
                                ) : (
                                  <Loader2 size={10} className="animate-spin" style={{ color: split.pool.color }} />
                                )}
                                <p className="text-xs" style={{ color: `${split.pool.color}80` }}>
                                  {isSettled ? "Settled" : "Processing"}
                                  {split.pool.bankLastFour && ` · ...${split.pool.bankLastFour}`}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black" style={{ color: split.pool.color }}>
                              {formatCents(split.amount)}
                            </p>
                            <p className="text-xs text-white/30">{Number(split.pool.percentage)}%</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 text-xs text-white/40 hover:text-[#00FFCC] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors group"
                >
                  {downloading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Download size={12} className="group-hover:translate-y-0.5 transition-transform" />
                  )}
                  {downloading ? "Generating PDF…" : "Download receipt"}
                </button>
                <span className="text-[10px] text-white/20 font-mono uppercase">{tx.paymentRef}</span>
              </div>
            </div>

            {/* Customer */}
            {tx.customerEmail && (
              <div className="glass-card p-5 mt-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/40">Customer</p>
                  <p className="text-sm font-medium mt-0.5">{tx.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Status</p>
                  <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                    <CheckCircle2 size={12} className="text-[#00FFCC]" />
                    <p className="text-sm text-[#00FFCC] font-medium capitalize">{tx.status}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
