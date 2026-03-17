"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, EyeOff, ArrowRight, Check, AlertCircle,
  Wallet, Landmark, TrendingUp, Sparkles,
  Zap, Shield, BarChart2, Globe,
} from "lucide-react";

const MINT      = "#00FFCC";
const MINT_D    = "#00D4A8";
const MINT_DARK = "#00A882";
const HEAD      = "#0E0C22";
const MUTED     = "rgba(14,12,34,0.46)";
const FAINT     = "rgba(14,12,34,0.24)";

const INPUT = (focused: boolean): React.CSSProperties => ({
  background:  focused ? "#FFFFFF" : "rgba(248,255,252,0.85)",
  border:      focused ? `1.5px solid ${MINT_D}` : "1.5px solid rgba(0,212,168,0.20)",
  color:       HEAD,
  boxShadow:   focused ? `0 0 0 3px rgba(0,212,168,0.09)` : "none",
  outline:     "none",
  transition:  "all 0.16s ease",
});

const POOLS = [
  { key: "spend"  as const, label: "Main Spend",  icon: Wallet,     color: "#00A882", bg: "rgba(0,168,130,0.07)",  border: "rgba(0,168,130,0.17)",  desc: "Spendable profit"     },
  { key: "tax"    as const, label: "Tax Vault",   icon: Landmark,   color: "#C47A0A", bg: "rgba(196,122,10,0.07)", border: "rgba(196,122,10,0.17)", desc: "Set aside for taxes"  },
  { key: "growth" as const, label: "Growth Pool", icon: TrendingUp, color: "#7C3AED", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.17)", desc: "Savings & investments" },
];

const STEPS = ["Account", "Handle", "Split"] as const;

function pwStrength(pw: string) {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 12) return 3;
  return 2;
}
const STR_LABEL = ["", "Weak", "Good", "Strong"];
const STR_COLOR = ["", "#EF4444", "#F59E0B", MINT_DARK];

// ── Left brand panel ──────────────────────────────────────────────────────────
function LeftPanel({ step, splits }: { step: number; splits: Record<"spend"|"tax"|"growth", number> }) {
  const net = 50000 - Math.round(50000 * 0.029) - 30;

  return (
    <div className="hidden lg:flex lg:w-[44%] flex-col justify-between p-10 relative overflow-hidden"
      style={{ background: "linear-gradient(145deg, #E6FFF8 0%, #DAFFF2 28%, #E8F5FF 62%, #EAE6FF 100%)" }}>

      <div className="absolute inset-0 pointer-events-none">
        <div style={{ position:"absolute", top:"-12%", left:"-12%", width:"380px", height:"380px", borderRadius:"50%", background:"radial-gradient(circle, rgba(0,212,168,0.26) 0%, transparent 60%)" }} />
        <div style={{ position:"absolute", bottom:"-8%", right:"-8%", width:"340px", height:"340px", borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.20) 0%, transparent 60%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(0,168,130,0.10) 1px, transparent 1px)", backgroundSize:"22px 22px" }} />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fleeper.png" alt="Fleeper" style={{ height: "28px", width: "auto" }} />
      </div>

      {/* Contextual content */}
      <div className="relative z-10 my-auto py-8">
        {step === 0 && (
          <>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold mb-5 w-fit"
              style={{ background:"rgba(0,168,130,0.12)", color:MINT_DARK, border:"1px solid rgba(0,168,130,0.24)" }}>
              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background:MINT_DARK }} />
              4,200+ creators live
            </div>
            <h2 className="text-[2.6rem] font-black tracking-tight leading-none mb-4" style={{ color:HEAD }}>
              Income,<br />
              <span style={{ background:`linear-gradient(130deg, ${MINT_DARK} 0%, #7C3AED 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                auto-sorted.
              </span>
            </h2>
            <p className="text-sm leading-relaxed mb-7 max-w-60" style={{ color:MUTED }}>
              Every payment splits into Spend, Tax & Savings the moment it lands.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon:Zap,       label:"2s routing"         },
                { icon:Shield,    label:"Bank-grade security" },
                { icon:BarChart2, label:"Live analytics"      },
                { icon:Globe,     label:"Your fleeper URL"    },
              ].map(({ icon:Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background:"rgba(255,255,255,0.55)", border:"1px solid rgba(0,168,130,0.16)", backdropFilter:"blur(8px)" }}>
                  <Icon size={11} style={{ color:MINT_DARK, flexShrink:0 }} />
                  <span className="text-[11px] font-semibold" style={{ color:HEAD }}>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color:MINT_DARK }}>Your payment link</p>
            <h2 className="text-[2.4rem] font-black tracking-tight leading-none mb-3" style={{ color:HEAD }}>
              One link.<br />
              <span style={{ background:`linear-gradient(130deg, ${MINT_DARK} 0%, #7C3AED 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                All payments.
              </span>
            </h2>
            <p className="text-sm leading-relaxed mb-7 max-w-60" style={{ color:MUTED }}>
              Share once. Every payer, every amount — auto-routed instantly.
            </p>
            <div className="rounded-2xl overflow-hidden"
              style={{ background:"rgba(255,255,255,0.88)", backdropFilter:"blur(20px)", border:"1px solid rgba(0,212,168,0.20)", boxShadow:"0 10px 36px rgba(0,212,168,0.12)" }}>
              <div className="h-0.5" style={{ background:`linear-gradient(90deg, ${MINT}, ${MINT_D}, #8B5CF6)` }} />
              <div className="p-5">
                <div className="flex items-center gap-1.5 mb-4">
                  {["#EF4444","#F59E0B","#22C55E"].map(c => <div key={c} className="w-2 h-2 rounded-full" style={{ background:c }} />)}
                  <div className="flex-1 h-5 rounded-md ml-1 flex items-center px-2.5"
                    style={{ background:"rgba(0,212,168,0.08)", border:"1px solid rgba(0,212,168,0.18)" }}>
                    <span className="text-[10px] font-mono" style={{ color:MUTED }}>fleeper.com/<span style={{ color:MINT_DARK }}>yourname</span></span>
                  </div>
                </div>
                <div className="text-center py-2.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color:FAINT }}>Pay me</p>
                  <p className="text-2xl font-black" style={{ color:HEAD }}>$0.00</p>
                  <div className="mt-3.5 py-2.5 rounded-xl text-xs font-bold" style={{ background:`linear-gradient(135deg, ${MINT}, ${MINT_D})`, color:"#0A2E28" }}>Pay now →</div>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color:MINT_DARK }}>Live preview</p>
            <h2 className="text-[2.4rem] font-black tracking-tight leading-none mb-3" style={{ color:HEAD }}>
              Set once,<br />
              <span style={{ background:`linear-gradient(130deg, ${MINT_DARK} 0%, #7C3AED 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                earn forever.
              </span>
            </h2>
            <p className="text-sm leading-relaxed mb-6 max-w-60" style={{ color:MUTED }}>
              Every payment splits exactly like this, in under 2 seconds.
            </p>
            <div className="flex rounded-xl overflow-hidden h-4 mb-4"
              style={{ background:"rgba(14,12,34,0.06)", boxShadow:"inset 0 1px 3px rgba(0,0,0,0.06)" }}>
              {POOLS.map(({ key, color }) => (
                <div key={key} className="transition-all duration-500 flex items-center justify-center"
                  style={{ width:`${splits[key]}%`, background:color, minWidth:splits[key]>0?"3px":0 }}>
                  {splits[key]>=14 && <span className="text-[9px] font-black text-white">{splits[key]}%</span>}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {POOLS.map(({ key, label, icon:Icon, color, bg, border }) => (
                <div key={key} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
                  style={{ background:bg, border:`1px solid ${border}` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:color }}>
                      <Icon size={10} style={{ color:"#fff" }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color:HEAD }}>{label}</span>
                  </div>
                  <div>
                    <span className="text-xs font-black font-mono" style={{ color }}>${((net*splits[key])/100/100).toFixed(2)}</span>
                    <span className="text-[10px] ml-1" style={{ color:`${color}99` }}>{splits[key]}%</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-3 text-center" style={{ color:FAINT }}>Per $500 after fees</p>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="relative z-10">
        <div className="h-px mb-4" style={{ background:"linear-gradient(90deg, rgba(0,168,130,0.28), rgba(124,58,237,0.18), transparent)" }} />
        <div className="flex gap-6">
          {[{ v:"$12M+", l:"Routed" }, { v:"4,200+", l:"Creators" }, { v:"< 2s", l:"Routing" }].map(({ v, l }) => (
            <div key={l}>
              <p className="text-base font-black" style={{ color:HEAD }}>{v}</p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color:FAINT }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step,      setStep]    = useState(0);
  const [showPw,    setShowPw]  = useState(false);
  const [loading,   setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);
  const [focused,   setFocused] = useState<string | null>(null);
  const [splits,    setSplits]  = useState({ spend: 70, tax: 20, growth: 10 });
  const [name,      setName]    = useState("");
  const [email,     setEmail]   = useState("");
  const [password,  setPassword]= useState("");
  const [handle,    setHandle]  = useState("");

  const strength   = pwStrength(password);
  const totalSplit = splits.spend + splits.tax + splits.growth;
  const net        = 50000 - Math.round(50000 * 0.029) - 30;

  const adjustSplit = (key: "spend"|"tax"|"growth", value: number) => {
    const clamped = Math.max(0, Math.min(100, value));
    const diff    = clamped - splits[key];
    const others  = Object.keys(splits).filter(k => k !== key) as ("spend"|"tax"|"growth")[];
    const next    = { ...splits, [key]: clamped };
    let rem = diff;
    others.forEach((o, i) => {
      if (i === others.length - 1) { next[o] = Math.max(0, splits[o] - rem); }
      else { const a = Math.round(rem * (splits[o] / (100 - splits[key]))); next[o] = Math.max(0, splits[o] - a); rem -= a; }
    });
    if (Object.values(next).every(v => v >= 0)) setSplits(next);
  };

  const handleLaunch = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch("/api/auth/register", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ name, email, password, handle, splits }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      router.push("/dashboard"); router.refresh();
    } catch { setError("Network error. Please try again."); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background:"linear-gradient(155deg, #F0FFFA 0%, #E8FFF9 20%, #F5FFFE 42%, #F0EDFF 72%, #F5F3FF 100%)" }}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex:0 }}>
        <div style={{ position:"absolute", top:"-8%", right:"8%", width:"480px", height:"480px", borderRadius:"50%", background:"radial-gradient(circle, rgba(0,255,204,0.13) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", bottom:"-6%", left:"4%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle, rgba(0,212,168,0.10) 1px, transparent 1px)", backgroundSize:"28px 28px" }} />
      </div>

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-4xl">
        <div className="flex rounded-4xl overflow-hidden"
          style={{ boxShadow:"0 2px 0 rgba(255,255,255,0.90) inset, 0 40px 100px rgba(0,212,168,0.14), 0 12px 40px rgba(0,0,0,0.07), 0 2px 8px rgba(0,0,0,0.04)" }}>

          <LeftPanel step={step} splits={splits} />

          {/* Right — form */}
          <div className="flex-1 flex items-center justify-center p-10"
            style={{ background:"linear-gradient(160deg, rgba(255,255,255,0.99) 0%, rgba(242,255,252,0.97) 100%)" }}>
            <div className="w-full max-w-sm">

              {/* Mobile logo */}
              <div className="flex justify-center mb-8 lg:hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/fleeper.png" alt="Fleeper" style={{ height:"28px", width:"auto" }} />
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-1 mb-8">
                {STEPS.map((label, i) => {
                  const done   = i < step;
                  const active = i === step;
                  return (
                    <div key={label} className="flex items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300"
                          style={
                            done   ? { background:`linear-gradient(135deg, ${MINT}, ${MINT_D})`, color:"#0A2E28", boxShadow:`0 3px 10px rgba(0,212,168,0.36)` }
                            : active ? { background:"rgba(0,212,168,0.10)", border:`1.5px solid ${MINT_D}`, color:MINT_DARK }
                            : { background:"rgba(14,12,34,0.05)", border:"1.5px solid rgba(14,12,34,0.09)", color:FAINT }
                          }>
                          {done ? <Check size={10} /> : i + 1}
                        </div>
                        <span className="text-[11px] font-bold transition-colors duration-300"
                          style={{ color: active ? MINT_DARK : done ? MINT_DARK : FAINT }}>{label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className="w-5 h-px mx-1 rounded-full transition-all duration-500"
                          style={{ background: i < step ? `linear-gradient(90deg, ${MINT_D}, ${MINT})` : "rgba(14,12,34,0.09)" }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Form header */}
              <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background:`linear-gradient(135deg, ${MINT}, ${MINT_D})`, boxShadow:`0 5px 16px rgba(0,212,168,0.36)` }}>
                    <Sparkles size={14} style={{ color:"#0A2E28" }} />
                  </div>
                  <div>
                    <h1 className="text-xl font-black leading-tight" style={{ color:HEAD }}>
                      {step === 0 ? "Create account" : step === 1 ? "Claim your handle" : "Set your splits"}
                    </h1>
                    <p className="text-[11px]" style={{ color:MUTED }}>
                      {step === 0 ? "Takes less than 2 minutes" : step === 1 ? "Your permanent payment URL" : "Adjust anytime from dashboard"}
                    </p>
                  </div>
                </div>
                <div className="h-px" style={{ background:"linear-gradient(90deg, rgba(0,212,168,0.20), transparent)" }} />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl mb-4"
                  style={{ background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.16)" }}>
                  <AlertCircle size={13} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              {/* ── Step 0 ── */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color:MUTED }}>Full name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                      onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                      placeholder="Alex Johnson"
                      className="w-full rounded-2xl px-4 py-3.5 text-sm"
                      style={INPUT(focused === "name")} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color:MUTED }}>Email address</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                      placeholder="you@example.com"
                      className="w-full rounded-2xl px-4 py-3.5 text-sm"
                      style={INPUT(focused === "email")} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-semibold" style={{ color:MUTED }}>Password</label>
                      <span className="text-[10px]" style={{ color:FAINT }}>min 8 characters</span>
                    </div>
                    <div className="relative">
                      <input type={showPw ? "text" : "password"} required value={password}
                        onChange={e => setPassword(e.target.value)}
                        onFocus={() => setFocused("pw")} onBlur={() => setFocused(null)}
                        placeholder="••••••••"
                        className="w-full rounded-2xl px-4 py-3.5 pr-12 text-sm"
                        style={INPUT(focused === "pw")} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors"
                        style={{ color:FAINT }}>
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex gap-1 flex-1">
                          {[1,2,3].map(n => (
                            <div key={n} className="h-1 flex-1 rounded-full transition-all duration-300"
                              style={{ background: strength >= n ? STR_COLOR[strength] : "rgba(14,12,34,0.08)" }} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold" style={{ color:STR_COLOR[strength] }}>{STR_LABEL[strength]}</span>
                      </div>
                    )}
                  </div>

                  <button onClick={() => {
                    if (!name.trim() || !email.trim() || password.length < 8) { setError("Fill all fields — password min 8 characters."); return; }
                    setError(null); setStep(1);
                  }}
                    className="group w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    style={{ background:`linear-gradient(135deg, ${MINT}, ${MINT_D})`, color:"#0A2E28", boxShadow:`0 6px 20px rgba(0,212,168,0.32)` }}>
                    Continue <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <div className="text-center pt-1">
                    <span className="text-xs" style={{ color:MUTED }}>Have an account? </span>
                    <Link href="/login" className="text-xs font-bold" style={{ color:MINT_DARK }}>Sign in →</Link>
                  </div>
                </div>
              )}

              {/* ── Step 1 ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color:MUTED }}>Your Fleeper handle</label>
                    <div className="flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                      style={{
                        background:  focused === "handle" ? "#FFFFFF" : "rgba(248,255,252,0.85)",
                        border:      focused === "handle" ? `1.5px solid ${MINT_D}` : "1.5px solid rgba(0,212,168,0.20)",
                        boxShadow:   focused === "handle" ? "0 0 0 3px rgba(0,212,168,0.09)" : "none",
                        transition:  "all 0.16s ease",
                      }}>
                      <span className="pl-4 pr-1 text-xs font-medium whitespace-nowrap shrink-0" style={{ color:FAINT }}>fleeper.com/</span>
                      <input type="text" value={handle}
                        onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        onFocus={() => setFocused("handle")} onBlur={() => setFocused(null)}
                        placeholder="yourname"
                        className="flex-1 py-3.5 pr-4 text-sm bg-transparent"
                        style={{ outline:"none", color:HEAD }} />
                    </div>

                    {handle.length >= 2 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                            style={{ background:"rgba(0,168,130,0.14)" }}>
                            <Check size={8} style={{ color:MINT_DARK }} />
                          </div>
                          <span className="text-xs" style={{ color:MINT_DARK }}>
                            fleeper.com/<strong>{handle}</strong> is available
                          </span>
                        </div>
                        <div className="p-3.5 rounded-2xl"
                          style={{ background:"rgba(0,212,168,0.06)", border:"1px solid rgba(0,212,168,0.15)" }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color:FAINT }}>Your payment link</p>
                          <p className="text-sm font-bold font-mono" style={{ color:HEAD }}>
                            fleeper.com/<span style={{ color:MINT_DARK }}>{handle}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <button onClick={() => { setError(null); setStep(0); }}
                      className="flex-1 py-4 rounded-2xl text-xs font-semibold cursor-pointer transition-all"
                      style={{ background:"rgba(14,12,34,0.04)", color:MUTED, border:"1px solid rgba(14,12,34,0.07)" }}>
                      Back
                    </button>
                    <button onClick={() => { if (handle.length < 2) { setError("Handle must be at least 2 characters."); return; } setError(null); setStep(2); }}
                      disabled={handle.length < 2}
                      className="group flex-2 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{ background:`linear-gradient(135deg, ${MINT}, ${MINT_D})`, color:"#0A2E28", boxShadow:`0 6px 20px rgba(0,212,168,0.28)` }}>
                      Continue <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <div>
                  <div className="flex rounded-xl overflow-hidden h-2 mb-4"
                    style={{ background:"rgba(14,12,34,0.06)" }}>
                    {POOLS.map(({ key, color }) => (
                      <div key={key} className="transition-all duration-500"
                        style={{ width:`${splits[key]}%`, background:color, minWidth:splits[key]>0?"2px":0 }} />
                    ))}
                  </div>

                  <div className="space-y-2.5 mb-4">
                    {POOLS.map(({ key, label, icon:Icon, color, bg, border, desc }) => (
                      <div key={key} className="p-3.5 rounded-2xl"
                        style={{ background:bg, border:`1px solid ${border}` }}>
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                              style={{ background:color, boxShadow:`0 2px 6px ${color}40` }}>
                              <Icon size={11} style={{ color:"#fff" }} />
                            </div>
                            <div>
                              <p className="text-xs font-bold" style={{ color:HEAD }}>{label}</p>
                              <p className="text-[10px]" style={{ color:`${color}AA` }}>{desc}</p>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-lg font-black leading-none" style={{ color }}>{splits[key]}</span>
                            <span className="text-xs font-bold" style={{ color:`${color}66` }}>%</span>
                          </div>
                        </div>
                        <input type="range" min={0} max={100} value={splits[key]}
                          onChange={e => adjustSplit(key, parseInt(e.target.value))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                          style={{ accentColor:color }} />
                        <div className="flex justify-end mt-1">
                          <span className="text-[9px] font-mono" style={{ color:`${color}88` }}>
                            ≈ ${((net*splits[key])/100/100).toFixed(2)} per $500
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between px-4 py-2.5 rounded-xl mb-4"
                    style={{
                      background: totalSplit === 100 ? "rgba(0,168,130,0.07)" : "rgba(239,68,68,0.06)",
                      border:`1px solid ${totalSplit === 100 ? "rgba(0,168,130,0.18)" : "rgba(239,68,68,0.18)"}`,
                    }}>
                    <span className="text-xs font-semibold" style={{ color:MUTED }}>Total allocation</span>
                    <div className="flex items-center gap-1.5">
                      {totalSplit === 100 && <Check size={12} style={{ color:MINT_DARK }} />}
                      <span className="text-sm font-bold" style={{ color: totalSplit === 100 ? MINT_DARK : "#EF4444" }}>{totalSplit}%</span>
                      {totalSplit !== 100 && <span className="text-[10px]" style={{ color:"#EF4444" }}>must equal 100%</span>}
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button onClick={() => { setError(null); setStep(1); }}
                      className="flex-1 py-4 rounded-2xl text-xs font-semibold cursor-pointer transition-all"
                      style={{ background:"rgba(14,12,34,0.04)", color:MUTED, border:"1px solid rgba(14,12,34,0.07)" }}>
                      Back
                    </button>
                    <button onClick={handleLaunch} disabled={loading || totalSplit !== 100}
                      className="flex-2 flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      style={{ background:`linear-gradient(135deg, ${MINT}, ${MINT_D})`, color:"#0A2E28", boxShadow:`0 6px 20px rgba(0,212,168,0.30)` }}>
                      {loading
                        ? <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor:"rgba(10,46,40,0.20)", borderTopColor:"#0A2E28" }} />
                        : <><Sparkles size={13} /> Launch my hub</>}
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-6 pt-5 text-center" style={{ borderTop:"1px solid rgba(0,212,168,0.10)" }}>
                <p className="text-[11px]" style={{ color:FAINT }}>
                  By signing up you agree to our{" "}
                  <Link href="/terms"   className="font-semibold hover:underline" style={{ color:MINT_DARK }}>Terms</Link>
                  {" & "}
                  <Link href="/privacy" className="font-semibold hover:underline" style={{ color:MINT_DARK }}>Privacy</Link>
                </p>
              </div>

            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color:"rgba(14,12,34,0.28)" }}>
          Fleeper · © 2026 Fleeper Ltd
        </p>
      </div>
    </div>
  );
}
