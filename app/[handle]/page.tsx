"use client";

import { useState } from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { FleepBubble, type Service } from "@/components/FleepBubble";

// Mock seller data — in production, fetched from DB by handle
const SELLER = {
  handle: "studiok",
  name: "Studio K",
  tagline: "Digital Architect & Creative Consultant",
  avatar: null,
  isVerified: true,
  stripeConnectedAccountId: process.env.NEXT_PUBLIC_DEMO_CONNECTED_ACCOUNT ?? "",
  services: [
    { id: "s1", title: "1-Hour Strategy Session", description: "Deep-dive into your product, brand, or growth strategy.", amount: 20000, isFlexible: false },
    { id: "s2", title: "UI/UX Design Sprint", description: "Full week of design work. Wireframes to high-fidelity.", amount: 150000, isFlexible: false },
    { id: "s3", title: "Brand Identity Package", description: "Logo, color system, typography, and brand guidelines.", amount: 300000, isFlexible: false },
    { id: "s4", title: "Custom Amount", description: "Send a tip or pay for a custom service.", amount: null, isFlexible: true },
  ] satisfies Service[],
};

export default function PublicProfilePage() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <div className="min-h-screen bg-(--bg-base) relative">
      <div className="mesh-bg" />

      <div className="relative z-10 max-w-lg mx-auto px-6 py-12">
        {/* Profile */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00FFCC] via-[#FFB347] to-[#8B5CF6] mx-auto mb-4" />
          <div className="flex items-center justify-center gap-2 mb-1">
            <h1 className="text-2xl font-black">{SELLER.name}</h1>
            {SELLER.isVerified && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#00FFCC]/10 rounded-full border border-[#00FFCC]/20">
                <ShieldCheck size={10} className="text-[#00FFCC]" />
                <span className="text-[10px] text-[#00FFCC] font-medium">Verified</span>
              </div>
            )}
          </div>
          <p className="text-white/50 text-sm">@{SELLER.handle}</p>
          <p className="text-white/60 text-sm mt-2 max-w-xs mx-auto">{SELLER.tagline}</p>
        </div>

        {/* Services */}
        <div className="space-y-3">
          {SELLER.services.map((service) => (
            <button
              key={service.id}
              onClick={() => setSelectedService(service)}
              className="w-full text-left glass-card p-5 hover:border-[#00FFCC]/30 hover:scale-[1.01] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <p className="font-semibold">{service.title}</p>
                  {service.description && (
                    <p className="text-sm text-white/40 mt-1">{service.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {service.isFlexible ? (
                    <div className="flex items-center gap-2 bg-[#00FFCC]/10 text-[#00FFCC] px-4 py-2 rounded-xl border border-[#00FFCC]/20 font-bold text-sm group-hover:bg-[#00FFCC]/20 transition-colors">
                      Pay
                    </div>
                  ) : (
                    <div>
                      <p className="font-black text-lg">${((service.amount ?? 0) / 100).toFixed(0)}</p>
                      <div className="flex items-center gap-1 bg-[#00FFCC]/10 text-[#00FFCC] px-3 py-1 rounded-lg border border-[#00FFCC]/20 text-xs font-medium mt-1 group-hover:bg-[#00FFCC]/20 transition-colors justify-center">
                        Pay →
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Powered by */}
        <div className="flex items-center justify-center gap-2 mt-10 text-white/20 text-xs font-medium">
          <div className="w-4 h-4 rounded-md overflow-hidden shrink-0 grayscale opacity-30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fleeper.png" alt="" style={{ height: "16px", width: "auto" }} />
          </div>
          <span>Payments handled by Fleeper · Income auto-routed to seller</span>
        </div>
      </div>

      {/* Fleep Bubble — real Stripe Elements checkout */}
      {selectedService && (
        <FleepBubble
          service={selectedService}
          seller={SELLER}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
  );
}
