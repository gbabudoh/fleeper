"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, AlertCircle, Wallet, TrendingUp, Landmark, Zap, CheckCircle2, X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [focused,      setFocused]      = useState<string | null>(null);
  const [forgotOpen,   setForgotOpen]   = useState(false);
  const [forgotEmail,  setForgotEmail]  = useState("");
  const [forgotSent,   setForgotSent]   = useState(false);
  const [forgotLoading,setForgotLoading]= useState(false);
  const [forgotError,  setForgotError]  = useState<string | null>(null);

  const handleForgot = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setForgotLoading(true); setForgotError(null);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    });
    setForgotLoading(false);
    setForgotSent(true);
  };

  const closeForgot = () => { setForgotOpen(false); setForgotSent(false); setForgotEmail(""); setForgotError(null); };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); setLoading(false); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#F7F5FF" }}>

      {/* ── Background orbs ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%",  width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.16) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "450px", height: "450px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "40%",   left: "40%",  width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,179,71,0.08)  0%, transparent 70%)" }} />
      </div>

      {/* ── Left panel — brand ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-14 overflow-hidden"
        style={{ background: "linear-gradient(155deg, #EEF9F6 0%, #F0EDFF 40%, #EAF4FF 70%, #F5F0FF 100%)" }}>

        {/* Panel orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: "absolute", top: "-8%",  left: "-8%",  width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,168,0.18) 0%, transparent 65%)" }} />
          <div style={{ position: "absolute", bottom: "-5%", right: "-8%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 65%)" }} />
          <div style={{ position: "absolute", top: "38%",  right: "5%",   width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,179,71,0.12) 0%, transparent 65%)" }} />
        </div>

        {/* Top — logo */}
        <div className="relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fleeper.png" alt="Fleeper" style={{ height: "32px", width: "auto" }} />
        </div>

        {/* Middle — hero copy */}
        <div className="relative z-10 my-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-7"
            style={{ background: "rgba(0,168,130,0.10)", color: "#007A60", border: "1px solid rgba(0,168,130,0.22)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00A882" }} />
            Automated Income Routing
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-black tracking-tighter leading-[0.93] mb-5" style={{ color: "#0E0C22" }}>
            Your income,
            <br />
            <span style={{ background: "linear-gradient(135deg, #00A882 0%, #7C3AED 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              always organized.
            </span>
          </h1>

          {/* Body */}
          <p className="text-base leading-relaxed mb-10" style={{ color: "rgba(14,12,34,0.52)" }}>
            Every payment you receive is instantly split and routed to your Spend, Tax, and Savings accounts. No manual transfers. Ever.
          </p>

          {/* Pool pills */}
          <div className="space-y-2.5">
            {[
              { icon: Wallet,     label: "Main Spend",  amount: "$343.21", color: "#00A882", bg: "rgba(0,168,130,0.07)",  border: "rgba(0,168,130,0.18)",  pct: "70%" },
              { icon: Landmark,   label: "Tax Vault",   amount: "$98.06",  color: "#C47A0A", bg: "rgba(196,122,10,0.07)", border: "rgba(196,122,10,0.18)", pct: "20%" },
              { icon: TrendingUp, label: "Growth Pool", amount: "$49.03",  color: "#7C3AED", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.18)", pct: "10%" },
            ].map(({ icon: Icon, label, amount, color, bg, border, pct }) => (
              <div key={label}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all hover:scale-[1.01]"
                style={{ background: bg, border: `1px solid ${border}`, backdropFilter: "blur(8px)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ background: color, boxShadow: `0 3px 10px ${color}35` }}>
                    <Icon size={14} style={{ color: "#fff" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#0E0C22" }}>{label}</p>
                    <p className="text-xs" style={{ color: `${color}BB` }}>{pct} of net</p>
                  </div>
                </div>
                <span className="text-sm font-black font-mono" style={{ color }}>{amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom — social proof */}
        <div className="relative z-10 flex items-center gap-8 pt-8"
          style={{ borderTop: "1px solid rgba(14,12,34,0.08)" }}>
          {[
            { value: "4,200+", label: "Creators" },
            { value: "$12M+",  label: "Routed"   },
            { value: "< 2s",   label: "Routing"  },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-xl font-black" style={{ color: "#0E0C22" }}>{value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: "rgba(14,12,34,0.40)" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Forgot password modal ── */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(14,12,34,0.40)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeForgot(); }}>
          <div className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(139,92,246,0.18)",
              boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 32px 80px rgba(100,60,220,0.20), 0 4px 16px rgba(0,0,0,0.08)",
            }}>
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #00FFCC, #8B5CF6, #FFB347)" }} />

            <div className="p-7">
              {/* Close button */}
              <button onClick={closeForgot} className="absolute top-5 right-5 cursor-pointer p-1.5 rounded-lg transition-colors hover:bg-black/5"
                style={{ color: "rgba(14,12,34,0.35)" }}>
                <X size={16} />
              </button>

              {forgotSent ? (
                /* Success */
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "rgba(0,212,168,0.10)", border: "1px solid rgba(0,212,168,0.22)" }}>
                    <CheckCircle2 size={26} style={{ color: "#00A882" }} />
                  </div>
                  <h3 className="text-lg font-black text-[#0E0C22] mb-2">Check your inbox</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(14,12,34,0.50)" }}>
                    If <strong>{forgotEmail}</strong> is registered, you&apos;ll receive a reset link shortly.
                  </p>
                  <button onClick={closeForgot}
                    className="w-full py-3 rounded-2xl text-sm font-bold cursor-pointer transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #00FFCC, #00D4A8)", color: "#0A2E28", boxShadow: "0 4px 16px rgba(0,212,168,0.30)" }}>
                    Done
                  </button>
                </div>
              ) : (
                /* Form */
                <>
                  <h3 className="text-xl font-black text-[#0E0C22] mb-1">Reset your password</h3>
                  <p className="text-sm mb-6" style={{ color: "rgba(14,12,34,0.48)" }}>Enter your email and we&apos;ll send you a reset link.</p>

                  {forgotError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl mb-4"
                      style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                      <AlertCircle size={13} className="text-red-400 shrink-0" />
                      <p className="text-sm text-red-400">{forgotError}</p>
                    </div>
                  )}

                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(14,12,34,0.55)" }}>Email address</label>
                      <input
                        type="email" required autoFocus
                        value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                        style={{
                          background: "rgba(245,243,255,0.80)",
                          border: "1.5px solid rgba(139,92,246,0.20)",
                          color: "#0E0C22",
                        }}
                      />
                    </div>
                    <button type="submit" disabled={forgotLoading}
                      className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #00FFCC, #00D4A8)", color: "#0A2E28", boxShadow: "0 4px 16px rgba(0,212,168,0.30)" }}>
                      {forgotLoading
                        ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(10,46,40,0.25)", borderTopColor: "#0A2E28" }} />
                        : "Send reset link"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fleeper.png" alt="Fleeper" style={{ height: "36px", width: "auto" }} />
          </div>

          {/* Card */}
          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(32px)",
              border: "1px solid rgba(139,92,246,0.16)",
              boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 24px 64px rgba(100,60,220,0.12), 0 4px 16px rgba(0,0,0,0.05)",
            }}>

            {/* Card top accent */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #00FFCC, #8B5CF6, #FFB347)" }} />

            <div className="p-8 pt-7">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-black text-[#0E0C22] mb-1">Welcome back</h2>
                <p className="text-sm" style={{ color: "rgba(14,12,34,0.45)" }}>Sign in to your income hub</p>
              </div>

              {/* Demo hint */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl mb-6"
                style={{ background: "rgba(0,255,204,0.08)", border: "1px solid rgba(0,212,168,0.20)" }}>
                <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "rgba(0,212,168,0.15)" }}>
                  <Zap size={10} style={{ color: "#00A882" }} />
                </div>
                <p className="text-xs" style={{ color: "rgba(14,12,34,0.55)" }}>
                  <span className="font-bold" style={{ color: "#00A882" }}>Demo account: </span>
                  demo@fleeper.com · fleeper123
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl mb-5"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(14,12,34,0.55)" }}>Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                    style={{
                      background: focused === "email" ? "#FFFFFF" : "rgba(245,243,255,0.80)",
                      border: focused === "email" ? "1.5px solid rgba(139,92,246,0.50)" : "1.5px solid rgba(139,92,246,0.14)",
                      color: "#0E0C22",
                      boxShadow: focused === "email" ? "0 0 0 3px rgba(139,92,246,0.10)" : "none",
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold" style={{ color: "rgba(14,12,34,0.55)" }}>Password</label>
                    <button type="button" onClick={() => setForgotOpen(true)} className="text-xs font-medium transition-colors cursor-pointer" style={{ color: "#8B5CF6" }}>Forgot password?</button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all duration-200"
                      style={{
                        background: focused === "password" ? "#FFFFFF" : "rgba(245,243,255,0.80)",
                        border: focused === "password" ? "1.5px solid rgba(139,92,246,0.50)" : "1.5px solid rgba(139,92,246,0.14)",
                        color: "#0E0C22",
                        boxShadow: focused === "password" ? "0 0 0 3px rgba(139,92,246,0.10)" : "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                      style={{ color: "rgba(14,12,34,0.30)" }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full flex items-center justify-center gap-2.5 font-bold py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                  style={{
                    background: "linear-gradient(135deg, #00FFCC 0%, #00D4A8 100%)",
                    color: "#0A2E28",
                    boxShadow: "0 6px 24px rgba(0,212,168,0.35)",
                  }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(10,46,40,0.25)", borderTopColor: "#0A2E28" }} />
                  ) : (
                    <>
                      Sign in to Fleeper
                      <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-7 pt-6 text-center text-sm" style={{ borderTop: "1px solid rgba(139,92,246,0.10)" }}>
                <span style={{ color: "rgba(14,12,34,0.45)" }}>New to Fleeper? </span>
                <Link href="/register" className="font-bold transition-colors" style={{ color: "#8B5CF6" }}>
                  Create free account →
                </Link>
              </div>
            </div>
          </div>

          {/* Below card */}
          <p className="text-center text-xs mt-6" style={{ color: "rgba(14,12,34,0.30)" }}>
            Protected by bank-grade encryption · Fleeper Ltd © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
