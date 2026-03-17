"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from "lucide-react";

function ResetPasswordForm() {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get("token") ?? "";

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [focused,   setFocused]   = useState<string | null>(null);

  useEffect(() => { if (!token) setError("Missing or invalid reset link."); }, [token]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true); setError(null);
    const res  = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); return; }
    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  };

  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 12 ? 3
    : 2;
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#EF4444", "#F59E0B", "#00A882"];

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(155deg, #F0FFFA 0%, #E2FFF8 18%, #F5FFFD 36%, #E8FFF9 54%, #F7F5FF 72%, #F3F0FF 88%, #F8F5FF 100%)" }}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: "absolute", top: "-15%", left: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.16) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-8%", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,254,203,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fleeper.png" alt="Fleeper" style={{ height: "32px", width: "auto" }} />
        </div>

        <div className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(32px)",
            border: "1px solid rgba(0,212,168,0.20)",
            boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 24px 64px rgba(0,212,168,0.12), 0 4px 16px rgba(0,0,0,0.05)",
          }}>
          <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #00FFCC, #8B5CF6, #FFB347)" }} />

          <div className="p-8">
            {done ? (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "rgba(0,212,168,0.12)", border: "1px solid rgba(0,212,168,0.25)" }}>
                  <CheckCircle2 size={30} style={{ color: "#00A882" }} />
                </div>
                <h2 className="text-2xl font-black text-[#0E0C22] mb-2">Password updated!</h2>
                <p className="text-sm mb-6" style={{ color: "rgba(14,12,34,0.50)" }}>
                  Your password has been reset. Redirecting you to sign in…
                </p>
                <Link href="/login"
                  className="inline-block text-sm font-bold transition-colors"
                  style={{ color: "#00A882" }}>
                  Go to sign in →
                </Link>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-7">
                  <div className="w-11 h-11 rounded-2xl mb-4 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #00FFCC, #00D4A8)", boxShadow: "0 6px 18px rgba(0,212,168,0.30)" }}>
                    <Lock size={18} style={{ color: "#071A17" }} />
                  </div>
                  <h2 className="text-2xl font-black text-[#0E0C22] mb-1">Set new password</h2>
                  <p className="text-sm" style={{ color: "rgba(14,12,34,0.45)" }}>Choose a strong password for your account</p>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2.5 p-3.5 rounded-2xl mb-5"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* New password */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(14,12,34,0.55)" }}>New password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"} required
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocused("pw")} onBlur={() => setFocused(null)}
                        placeholder="Min. 8 characters"
                        className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all duration-200"
                        style={{
                          background: focused === "pw" ? "#FFFFFF" : "rgba(245,243,255,0.80)",
                          border: focused === "pw" ? "1.5px solid rgba(0,212,168,0.60)" : "1.5px solid rgba(0,212,168,0.20)",
                          color: "#0E0C22",
                          boxShadow: focused === "pw" ? "0 0 0 3px rgba(0,212,168,0.10)" : "none",
                        }}
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                        style={{ color: "rgba(14,12,34,0.30)" }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {password.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex gap-1 flex-1">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{ background: strength >= n ? strengthColor[strength] : "rgba(14,12,34,0.10)" }} />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: strengthColor[strength] }}>
                          {strengthLabel[strength]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(14,12,34,0.55)" }}>Confirm password</label>
                    <input
                      type="password" required
                      value={confirm} onChange={(e) => setConfirm(e.target.value)}
                      onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)}
                      placeholder="Re-enter password"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                      style={{
                        background: focused === "confirm" ? "#FFFFFF" : "rgba(245,243,255,0.80)",
                        border: confirm && confirm !== password
                          ? "1.5px solid rgba(239,68,68,0.50)"
                          : focused === "confirm" ? "1.5px solid rgba(0,212,168,0.60)" : "1.5px solid rgba(0,212,168,0.20)",
                        color: "#0E0C22",
                        boxShadow: focused === "confirm" ? "0 0 0 3px rgba(0,212,168,0.10)" : "none",
                      }}
                    />
                    {confirm && confirm !== password && (
                      <p className="text-xs mt-1.5" style={{ color: "#EF4444" }}>Passwords do not match</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading || !token}
                    className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                    style={{ background: "linear-gradient(135deg, #00FFCC 0%, #00D4A8 100%)", color: "#0A2E28", boxShadow: "0 6px 24px rgba(0,212,168,0.35)" }}>
                    {loading
                      ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(10,46,40,0.25)", borderTopColor: "#0A2E28" }} />
                      : "Reset password"}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm" style={{ borderTop: "1px solid rgba(0,212,168,0.12)", paddingTop: "1.5rem" }}>
                  <Link href="/login" className="font-medium transition-colors" style={{ color: "rgba(14,12,34,0.45)" }}>
                    ← Back to sign in
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
