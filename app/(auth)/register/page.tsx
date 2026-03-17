"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Eye, EyeOff, ArrowRight, Check, AlertCircle } from "lucide-react";

const steps = ["Account", "Your Handle", "Split Setup"];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splits, setSplits] = useState({ spend: 70, tax: 20, growth: 10 });

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");

  const adjustSplit = (key: "spend" | "tax" | "growth", value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    const diff = clamped - splits[key];
    const others = Object.keys(splits).filter((k) => k !== key) as ("spend" | "tax" | "growth")[];
    const newSplits = { ...splits, [key]: clamped };
    let remaining = diff;
    for (let i = 0; i < others.length; i++) {
      const other = others[i];
      if (i === others.length - 1) {
        newSplits[other] = Math.max(0, splits[other] - remaining);
      } else {
        const adj = Math.round(remaining * (splits[other] / (100 - splits[key])));
        newSplits[other] = Math.max(0, splits[other] - adj);
        remaining -= adj;
      }
    }
    if (Object.values(newSplits).every((v) => v >= 0)) setSplits(newSplits);
  };

  const handleLaunch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, handle, splits }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const demo = 50000;
  const provision = Math.round(demo * 0.029) + 30;
  const net = demo - provision;
  const totalSplit = splits.spend + splits.tax + splits.growth;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="mesh-bg" />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/fleeper.png"
              alt="Fleeper"
              style={{ height: "40px", width: "auto" }}
            />
          </div>
          <span className="text-2xl font-black tracking-tight">fleeper</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${i < step ? "bg-[#00FFCC] text-[#0A0A0A]" : i === step ? "bg-[#00FFCC]/20 text-[#00FFCC] border border-[#00FFCC]/40" : "bg-white/5 text-white/30"}`}>
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px transition-all ${i < step ? "bg-[#00FFCC]" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Step 0: Account */}
          {step === 0 && (
            <div>
              <h1 className="text-2xl font-black mb-2">Create your account</h1>
              <p className="text-white/40 text-sm mb-8">Join the automated income revolution</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Full name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 text-sm focus:border-[#00FFCC]/40 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 text-sm focus:border-[#00FFCC]/40 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Password <span className="text-white/30">(min 8 characters)</span></label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/20 text-sm focus:border-[#00FFCC]/40 transition-colors" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!name || !email || password.length < 8) { setError("Please fill in all fields (password min 8 chars)."); return; }
                    setError(null); setStep(1);
                  }}
                  className="group w-full flex items-center justify-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold py-3.5 rounded-xl hover:bg-[#00FFCC]/90 transition-all hover:scale-[1.02] active:scale-95"
                >
                  Continue <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Handle */}
          {step === 1 && (
            <div>
              <h1 className="text-2xl font-black mb-2">Claim your hub</h1>
              <p className="text-white/40 text-sm mb-8">This is your public payment URL</p>
              <div className="mb-6">
                <label className="block text-sm text-white/60 mb-2">Your Fleeper handle</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#00FFCC]/40 transition-colors">
                  <span className="pl-4 pr-2 text-white/30 text-sm whitespace-nowrap">fleeper.com/</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="yourname"
                    className="flex-1 bg-transparent py-3 pr-4 text-white placeholder:text-white/20 text-sm focus:outline-none"
                  />
                </div>
                {handle.length >= 2 && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-[#00FFCC]">
                    <Check size={12} /> fleeper.com/{handle} looks great!
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setError(null); setStep(0); }} className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors text-sm font-medium">Back</button>
                <button
                  onClick={() => {
                    if (handle.length < 2) { setError("Handle must be at least 2 characters."); return; }
                    setError(null); setStep(2);
                  }}
                  disabled={handle.length < 2}
                  className="flex-2 group flex items-center justify-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold py-3.5 rounded-xl hover:bg-[#00FFCC]/90 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Splits */}
          {step === 2 && (
            <div>
              <h1 className="text-2xl font-black mb-2">Design your streams</h1>
              <p className="text-white/40 text-sm mb-6">How should each $100 be split?</p>

              <div className="space-y-4 mb-6">
                {([
                  { key: "spend" as const, label: "Main Spend",  color: "#00FFCC", desc: "Spendable profit" },
                  { key: "tax"   as const, label: "Tax Vault",   color: "#FFB347", desc: "Set aside for taxes" },
                  { key: "growth" as const, label: "Growth Pool", color: "#8B5CF6", desc: "Savings & investments" },
                ]).map(({ key, label, color, desc }) => (
                  <div key={key} className="p-4 rounded-2xl border" style={{ background: `${color}10`, borderColor: `${color}25` }}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-semibold text-sm">{label}</p>
                        <p className="text-xs" style={{ color: `${color}80` }}>{desc}</p>
                      </div>
                      <span className="text-2xl font-black" style={{ color }}>{splits[key]}%</span>
                    </div>
                    <input
                      type="range" min={0} max={100} value={splits[key]}
                      onChange={(e) => adjustSplit(key, parseInt(e.target.value))}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{ accentColor: color }}
                    />
                    <div className="mt-2 text-right text-xs text-white/30 font-mono">
                      ≈ ${((net * splits[key]) / 100 / 100).toFixed(2)} per $500
                    </div>
                  </div>
                ))}
              </div>

              <div className={`flex justify-between items-center p-3 rounded-xl text-sm mb-4 ${totalSplit === 100 ? "bg-[#00FFCC]/10 border border-[#00FFCC]/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <span className="text-white/60">Total</span>
                <span className={`font-bold ${totalSplit === 100 ? "text-[#00FFCC]" : "text-red-400"}`}>{totalSplit}%</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setError(null); setStep(1); }} className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors text-sm font-medium">Back</button>
                <button
                  onClick={handleLaunch}
                  disabled={loading || totalSplit !== 100}
                  className="flex-2 flex items-center justify-center gap-2 bg-[#00FFCC] text-[#0A0A0A] font-bold py-3.5 rounded-xl hover:bg-[#00FFCC]/90 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-[#0A0A0A]/30 border-t-[#0A0A0A] rounded-full animate-spin" /> : <>Launch my hub <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-[#00FFCC]/70 hover:text-[#00FFCC] transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
