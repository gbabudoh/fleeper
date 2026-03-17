"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, AlertCircle, Lock, CheckCircle2, Activity, Users } from "lucide-react";

const MINT  = "#00FECB";
const MINT2 = "#00D4A8";
const HEAD  = "#071A17";

const TRUST = [
  { icon: Shield,       label: "Role-based access control"     },
  { icon: Lock,         label: "AES-256 encrypted sessions"    },
  { icon: Activity,     label: "Full immutable audit trail"    },
  { icon: CheckCircle2, label: "Two-factor auth ready"         },
  { icon: Users,        label: "Multi-staff management"        },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [focused,      setFocused]      = useState<string | null>(null);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); setLoading(false); return; }
      router.push("/admin"); router.refresh();
    } catch {
      setError("Network error. Check your connection."); setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(155deg, #F0FFFA 0%, #E4FFF6 16%, #F6FFFD 34%, #EAFFF9 52%, #F4FFFC 70%, #E8FFF8 86%, #FAFFFD 100%)" }}>

      {/* ── Ambient canvas ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-18%", left: "-10%",  width: "640px", height: "640px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,254,203,0.20) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: "-12%", right: "-8%", width: "560px", height: "560px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,168,0.16) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "35%", right: "15%",    width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,254,203,0.10) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,212,168,0.14) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      {/* ── Split card ── */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="flex rounded-4xl overflow-hidden"
          style={{
            boxShadow: "0 2px 0 rgba(255,255,255,0.90) inset, 0 40px 100px rgba(0,212,168,0.16), 0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          }}>

          {/* ══ Left — Dark brand panel ══ */}
          <div className="hidden lg:flex lg:w-[46%] flex-col justify-between p-10 relative overflow-hidden"
            style={{ background: "linear-gradient(155deg, #E2FFF8 0%, #CBFFF0 30%, #D6FFF5 60%, #C8FFEE 100%)" }}>

            {/* Panel ambient orbs */}
            <div className="absolute inset-0 pointer-events-none">
              <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "320px", height: "320px", borderRadius: "50%", background: `radial-gradient(circle, rgba(0,168,130,0.20) 0%, transparent 70%)` }} />
              <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "280px", height: "280px", borderRadius: "50%", background: `radial-gradient(circle, rgba(0,212,168,0.18) 0%, transparent 70%)` }} />
              {/* Dot grid */}
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,168,130,0.18) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
            </div>

            {/* Top — logo + badge */}
            <div className="relative z-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fleeper.png" alt="Fleeper" style={{ height: "32px", width: "auto" }} />
              <div className="inline-flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full"
                style={{ background: `rgba(0,168,130,0.12)`, border: `1px solid rgba(0,168,130,0.28)` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#00A882" }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#007A60" }}>Secure Admin Portal</span>
              </div>
            </div>

            {/* Mid — headline */}
            <div className="relative z-10 my-auto py-8">
              <h1 className="text-[2.6rem] font-black leading-none tracking-tighter mb-5">
                <span style={{ color: "#071A17" }}>Admin</span>
                <br />
                <span style={{
                  background: `linear-gradient(135deg, #007A60 0%, ${MINT2} 60%, #00A882 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Control Panel.
                </span>
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(7,26,23,0.52)" }}>
                Manage users, transactions, staff, and platform settings from a single secure dashboard.
              </p>

              {/* Divider */}
              <div className="h-px my-7" style={{ background: "linear-gradient(90deg, rgba(0,168,130,0.30), transparent)" }} />

              {/* Trust features */}
              <div className="space-y-3">
                {TRUST.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(0,168,130,0.12)", border: "1px solid rgba(0,168,130,0.24)" }}>
                      <Icon size={11} style={{ color: "#00A882" }} />
                    </div>
                    <span className="text-xs font-medium" style={{ color: "rgba(7,26,23,0.55)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom — security note */}
            <div className="relative z-10">
              <div className="h-px mb-5" style={{ background: "linear-gradient(90deg, rgba(0,168,130,0.25), transparent)" }} />
              <p className="text-[11px]" style={{ color: "rgba(7,26,23,0.38)" }}>
                Protected by bank-grade encryption · Session expires in 8 hours
              </p>
            </div>
          </div>

          {/* ══ Right — Form panel ══ */}
          <div className="flex-1 flex items-center justify-center p-8 md:p-10"
            style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.98) 0%, rgba(240,255,252,0.96) 100%)" }}>
            <div className="w-full max-w-sm">

              {/* Mobile logo */}
              <div className="flex justify-center mb-8 lg:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/fleeper.png" alt="Fleeper" style={{ height: "32px", width: "auto" }} />
              </div>

              {/* Form header */}
              <div className="mb-8">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${MINT}, ${MINT2})`, boxShadow: `0 6px 18px rgba(0,254,203,0.40)` }}>
                    <Lock size={15} style={{ color: HEAD }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#00A882" }}>Authorised Access Only</p>
                    <h2 className="text-xl font-black leading-tight" style={{ color: HEAD }}>Welcome back</h2>
                  </div>
                </div>
                {/* Accent line */}
                <div className="h-0.5 w-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #00FECB, #00D4A8 50%, transparent)" }} />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-2xl mb-5"
                  style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.22)" }}>
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(7,26,23,0.50)" }}>Admin email</label>
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                    placeholder="admin@fleeper.com"
                    className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all duration-200"
                    style={{
                      background:  focused === "email" ? "#FFFFFF" : "rgba(240,255,252,0.80)",
                      border:      focused === "email" ? `1.5px solid ${MINT}` : "1.5px solid rgba(0,254,203,0.30)",
                      color:       HEAD,
                      boxShadow:   focused === "email" ? `0 0 0 3px rgba(0,254,203,0.12)` : "none",
                    }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(7,26,23,0.50)" }}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl px-4 py-3.5 pr-12 text-sm outline-none transition-all duration-200"
                      style={{
                        background:  focused === "password" ? "#FFFFFF" : "rgba(240,255,252,0.80)",
                        border:      focused === "password" ? `1.5px solid ${MINT}` : "1.5px solid rgba(0,254,203,0.30)",
                        color:       HEAD,
                        boxShadow:   focused === "password" ? `0 0 0 3px rgba(0,254,203,0.12)` : "none",
                      }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                      style={{ color: "rgba(7,26,23,0.32)" }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="group w-full flex items-center justify-center gap-2.5 font-bold py-4 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                  style={{
                    background:  `linear-gradient(135deg, ${MINT} 0%, ${MINT2} 100%)`,
                    color:       HEAD,
                    boxShadow:   `0 6px 24px rgba(0,254,203,0.42), 0 2px 8px rgba(0,254,203,0.20)`,
                  }}>
                  {loading ? (
                    <div className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ borderColor: "rgba(7,26,23,0.20)", borderTopColor: HEAD }} />
                  ) : (
                    <>
                      <Shield size={15} />
                      Sign in to Admin Portal
                    </>
                  )}
                </button>
              </form>

              {/* Security footer */}
              <div className="mt-8 pt-6 flex items-center justify-center gap-1.5"
                style={{ borderTop: "1px solid rgba(0,254,203,0.14)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#00A882" }} />
                <p className="text-[11px]" style={{ color: "rgba(7,26,23,0.32)" }}>
                  Unauthorised access is strictly prohibited and audited
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Below card caption */}
        <p className="text-center text-xs mt-5" style={{ color: "rgba(7,26,23,0.28)" }}>
          Fleeper Admin · © 2026 Fleeper Ltd
        </p>
      </div>
    </div>
  );
}
