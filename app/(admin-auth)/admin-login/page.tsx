"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, AlertCircle, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [focused, setFocused]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); setLoading(false); return; }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0A0A0F" }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.08) 0%, transparent 70%)" }} />
        {/* Grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.30)" }}>
            <Shield size={14} style={{ color: "#8B5CF6" }} />
            <span className="text-xs font-bold" style={{ color: "#8B5CF6" }}>ADMIN PORTAL</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", backdropFilter: "blur(24px)", boxShadow: "0 32px 80px rgba(0,0,0,0.60)" }}>
          {/* Top accent */}
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #8B5CF6, #00FFCC, transparent)" }} />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(139,92,246,0.25), rgba(0,255,204,0.15))", border: "1px solid rgba(139,92,246,0.30)" }}>
                <Lock size={22} style={{ color: "#8B5CF6" }} />
              </div>
              <h1 className="text-xl font-black text-white mb-1">Fleeper Admin</h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.40)" }}>Restricted access — authorised personnel only</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl mb-5" style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)" }}>
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(255,255,255,0.50)" }}>Admin email</label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                  placeholder="admin@fleeper.com"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                  style={{
                    background: focused === "email" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                    border: focused === "email" ? "1.5px solid rgba(139,92,246,0.60)" : "1.5px solid rgba(255,255,255,0.10)",
                    color: "#FFFFFF",
                    boxShadow: focused === "email" ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "rgba(255,255,255,0.50)" }}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-all duration-200"
                    style={{
                      background: focused === "password" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                      border: focused === "password" ? "1.5px solid rgba(139,92,246,0.60)" : "1.5px solid rgba(255,255,255,0.10)",
                      color: "#FFFFFF",
                      boxShadow: focused === "password" ? "0 0 0 3px rgba(139,92,246,0.12)" : "none",
                    }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: "rgba(255,255,255,0.30)" }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)", color: "#FFFFFF", boxShadow: "0 6px 24px rgba(139,92,246,0.40)" }}>
                {loading ? (
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.25)", borderTopColor: "#FFFFFF" }} />
                ) : (
                  <><Shield size={15} /> Sign in to Admin Portal</>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "rgba(255,255,255,0.20)" }}>
          Fleeper Admin · Unauthorized access is prohibited
        </p>
      </div>
    </div>
  );
}
