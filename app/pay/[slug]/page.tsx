"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Zap, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { FleepBubble, type Service } from "@/components/FleepBubble";

interface LinkData {
  title: string;
  description: string | null;
  amount: number | null;
  isFlexible: boolean;
  isActive: boolean;
  slug: string;
  seller: {
    handle: string;
    name: string | null;
    isVerified: boolean;
    stripeConnectedAccountId: string | null;
  };
}

export default function PayLinkPage() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<LinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState(false);

  useEffect(() => {
    fetch(`/api/pay/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setError(d.error); return; }
        setData(d);
      })
      .catch(() => setError("Failed to load payment link."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-(--bg-base) flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#00FFCC]/20 border-t-[#00FFCC] animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-(--bg-base) flex items-center justify-center px-6">
        <div className="glass-card p-10 max-w-sm w-full flex flex-col items-center gap-4 text-center">
          <AlertCircle size={40} className="text-red-400" />
          <p className="font-semibold text-lg">{error ?? "Link not found"}</p>
          <p className="text-sm text-white/40">This payment link may have been deactivated or doesn&apos;t exist.</p>
          <a href="/" className="text-sm text-[#00FFCC] hover:underline flex items-center gap-1.5 font-medium">
            <div className="w-4 h-4 rounded-md overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fleeper.png" alt="" style={{ height: "16px", width: "auto" }} />
            </div>
            Powered by Fleeper
          </a>
        </div>
      </div>
    );
  }

  if (!data.isActive) {
    return (
      <div className="min-h-screen bg-(--bg-base) flex items-center justify-center px-6">
        <div className="glass-card p-10 max-w-sm w-full flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fleeper.png" alt="" style={{ height: "48px", width: "auto" }} className="opacity-20 grayscale" />
          </div>
          <p className="font-semibold text-lg">Link Deactivated</p>
          <p className="text-sm text-white/40">This payment link is no longer accepting payments.</p>
        </div>
      </div>
    );
  }

  const service: Service = {
    id: slug,
    title: data.title,
    description: data.description ?? undefined,
    amount: data.amount ?? null,
    isFlexible: data.isFlexible,
  };

  const seller = {
    handle: data.seller.handle,
    name: data.seller.name ?? data.seller.handle,
    tagline: "",
    avatar: null,
    isVerified: data.seller.isVerified,
    stripeConnectedAccountId: data.seller.stripeConnectedAccountId ?? "",
  };

  return (
    <div className="min-h-screen bg-(--bg-base) relative">
      <div className="mesh-bg" />
      <div className="relative z-10 max-w-md mx-auto px-6 py-16">
        {/* Seller badge */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#00FFCC] via-[#FFB347] to-[#8B5CF6]" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm">{data.seller.name ?? `@${data.seller.handle}`}</p>
              {data.seller.isVerified && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#00FFCC]/10 rounded-full border border-[#00FFCC]/20">
                  <ShieldCheck size={8} className="text-[#00FFCC]" />
                  <span className="text-[9px] text-[#00FFCC] font-medium">Verified</span>
                </div>
              )}
            </div>
            <p className="text-xs text-white/30">@{data.seller.handle}</p>
          </div>
        </div>

        {/* Link card */}
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-black mb-3">{data.title}</h1>
          {data.description && (
            <p className="text-white/50 text-sm mb-6 leading-relaxed">{data.description}</p>
          )}

          {data.isFlexible ? (
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-[#FFB347]/10 text-[#FFB347] text-xs rounded-full border border-[#FFB347]/20 font-medium">
                Pay what you want
              </span>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-4xl font-black">${((data.amount ?? 0) / 100).toFixed(2)}</p>
              <p className="text-xs text-white/30 mt-1">USD</p>
            </div>
          )}

          <button
            onClick={() => setCheckout(true)}
            className="w-full py-4 bg-[#00FFCC] text-[#0A0A0A] font-bold rounded-2xl hover:bg-[#00FFCC]/90 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {data.isFlexible ? "Choose Amount & Pay" : "Pay Now →"}
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 mt-8 text-white/20 text-xs">
          <div className="w-4 h-4 rounded-md overflow-hidden shrink-0 grayscale opacity-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fleeper.png" alt="" style={{ height: "16px", width: "auto" }} />
          </div>
          <span>Secured by Fleeper · Income auto-routed to seller</span>
        </div>
      </div>

      {checkout && (
        <FleepBubble
          service={service}
          seller={seller}
          onClose={() => setCheckout(false)}
        />
      )}
    </div>
  );
}
