"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight, TrendingUp, Wallet, Landmark,
  CheckCircle2, Shield, BarChart2, ChevronDown, Sparkles, Zap,
  Code2, Key, Globe, Webhook,
} from "lucide-react";

// ── Animated counter ──────────────────────────────────────────────────────────

function Counter({ value, prefix = "$", duration = 1400 }: { value: number; prefix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span>{prefix}{(display / 100).toFixed(2)}</span>;
}

// ── Demo split card ───────────────────────────────────────────────────────────

const GROSS = 50000;
const PROVISION = Math.round(GROSS * 0.029) + 30;
const NET = GROSS - PROVISION;
const POOLS = [
  { label: "Main Spend",  amount: Math.round(NET * 0.70),       color: "#00D4A8", bg: "rgba(0,212,168,0.08)",  border: "rgba(0,212,168,0.20)", icon: Wallet,     bank: "Chase ···4821",      pct: 70 },
  { label: "Tax Vault",   amount: Math.round(NET * 0.20),       color: "#E8920A", bg: "rgba(232,146,10,0.08)", border: "rgba(232,146,10,0.20)", icon: Landmark,   bank: "Ally ···9012",       pct: 20 },
  { label: "Growth Pool", amount: NET - Math.round(NET * 0.90), color: "#7C3AED", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.20)", icon: TrendingUp, bank: "Robinhood ···1120",  pct: 10 },
];

function DemoCard() {
  const [live, setLive] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLive(true), 600); return () => clearTimeout(t); }, []);

  return (
    <div className="relative max-w-sm mx-auto">
      {/* Glow halos */}
      <div className="absolute -inset-8 bg-[#00FFCC] opacity-10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -inset-8 bg-[#8B5CF6] opacity-6 blur-3xl rounded-full pointer-events-none translate-x-8 translate-y-8" />

      {/* Card */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(32px)",
          border: "1px solid rgba(139,92,246,0.18)",
          boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 20px 60px rgba(100,60,220,0.14), 0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b" style={{ borderColor: "rgba(139,92,246,0.10)" }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3"
            style={{ background: "rgba(0,212,168,0.10)", color: "#00A882", border: "1px solid rgba(0,212,168,0.20)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4A8] animate-pulse" />
            Live payment received
          </div>
          <div className="text-4xl font-black tracking-tight text-[#0E0C22]">
            {live ? <Counter value={GROSS} /> : "$500.00"}
          </div>
          <p className="text-sm mt-1" style={{ color: "rgba(14,12,34,0.40)" }}>from client · just now</p>
        </div>

        <div className="px-6 py-4 space-y-3">
          {/* Platform fee row */}
          <div className="flex justify-between items-center px-3.5 py-2.5 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.06)", border: "1px dashed rgba(239,68,68,0.20)" }}>
            <span style={{ color: "rgba(14,12,34,0.50)" }}>Fleeper provision (2.9% + $0.30)</span>
            <span className="font-mono font-semibold text-red-400">−${(PROVISION / 100).toFixed(2)}</span>
          </div>

          {/* Arrow */}
          <div className="flex items-center gap-2 px-2">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)" }} />
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.08)" }}>
              <ChevronDown size={12} style={{ color: "#8B5CF6" }} />
            </div>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)" }} />
          </div>

          {/* Pools */}
          {POOLS.map(({ label, amount, color, bg, border, icon: Icon, bank, pct }) => (
            <div key={label} className="flex items-center justify-between p-3.5 rounded-2xl transition-all"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: color, boxShadow: `0 4px 12px ${color}40` }}>
                  <Icon size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#0E0C22]">{label}</p>
                  <p className="text-xs" style={{ color: `${color}CC` }}>{bank} · {pct}%</p>
                </div>
              </div>
              <span className="text-base font-black font-mono" style={{ color }}>
                {live ? `$${(amount / 100).toFixed(2)}` : "—"}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center" style={{ borderTop: "1px solid rgba(139,92,246,0.08)" }}>
          <p className="text-xs" style={{ color: "rgba(14,12,34,0.30)" }}>
            Routed automatically in under 2 seconds
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

// ── Dev code snippets ─────────────────────────────────────────────────────────

type DevTab = "node" | "curl" | "python";

const CODE: Record<DevTab, ReactNode> = {
  node: (
    <pre className="text-[13px] leading-relaxed font-mono whitespace-pre overflow-x-auto">
      <span style={{ color: "#6C7A8A" }}>{"// npm install @fleeper/sdk\n"}</span>
      <span style={{ color: "#00FFCC" }}>{"import"}</span>
      <span style={{ color: "#E8E8F0" }}>{" Fleeper "}</span>
      <span style={{ color: "#00FFCC" }}>{"from"}</span>
      <span style={{ color: "#A8D8A8" }}>{" \"@fleeper/sdk\";\n\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"const fleeper = "}</span>
      <span style={{ color: "#00FFCC" }}>{"new"}</span>
      <span style={{ color: "#82C4F8" }}>{" Fleeper"}</span>
      <span style={{ color: "#E8E8F0" }}>{"("}</span>
      <span style={{ color: "#A8D8A8" }}>{'"flp_live_sk_••••••••"'}</span>
      <span style={{ color: "#E8E8F0" }}>{");\n\n"}</span>
      <span style={{ color: "#00FFCC" }}>{"const"}</span>
      <span style={{ color: "#82C4F8" }}>{" link"}</span>
      <span style={{ color: "#E8E8F0" }}>{" = "}</span>
      <span style={{ color: "#00FFCC" }}>{"await"}</span>
      <span style={{ color: "#E8E8F0" }}>{" fleeper.links."}</span>
      <span style={{ color: "#82C4F8" }}>{"create"}</span>
      <span style={{ color: "#E8E8F0" }}>{"({\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"  title: "}</span>
      <span style={{ color: "#A8D8A8" }}>{'"Design Invoice #42"'}</span>
      <span style={{ color: "#E8E8F0" }}>{",\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"  amount: "}</span>
      <span style={{ color: "#F0A050" }}>{"150000"}</span>
      <span style={{ color: "#6C7A8A" }}>{", // cents\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"  pools: [\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"    { label: "}</span>
      <span style={{ color: "#A8D8A8" }}>{'"Revenue"'}</span>
      <span style={{ color: "#E8E8F0" }}>{",   percent: "}</span>
      <span style={{ color: "#F0A050" }}>{"70"}</span>
      <span style={{ color: "#E8E8F0" }}>{" },\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"    { label: "}</span>
      <span style={{ color: "#A8D8A8" }}>{'"Tax Vault"'}</span>
      <span style={{ color: "#E8E8F0" }}>{", percent: "}</span>
      <span style={{ color: "#F0A050" }}>{"20"}</span>
      <span style={{ color: "#E8E8F0" }}>{" },\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"    { label: "}</span>
      <span style={{ color: "#A8D8A8" }}>{'"Growth"'}</span>
      <span style={{ color: "#E8E8F0" }}>{",    percent: "}</span>
      <span style={{ color: "#F0A050" }}>{"10"}</span>
      <span style={{ color: "#E8E8F0" }}>{" },\n  ],\n});\n\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"console."}</span>
      <span style={{ color: "#82C4F8" }}>{"log"}</span>
      <span style={{ color: "#E8E8F0" }}>{"(link.url);\n"}</span>
      <span style={{ color: "#6C7A8A" }}>{"// → https://fleeper.com/you/design-invoice-42"}</span>
    </pre>
  ),
  curl: (
    <pre className="text-[13px] leading-relaxed font-mono whitespace-pre overflow-x-auto">
      <span style={{ color: "#82C4F8" }}>{"curl"}</span>
      <span style={{ color: "#E8E8F0" }}>{" -X POST \\\n"}</span>
      <span style={{ color: "#A8D8A8" }}>{'"https://api.fleeper.com/v1/links"'}</span>
      <span style={{ color: "#E8E8F0" }}>{" \\\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"  -H "}</span>
      <span style={{ color: "#A8D8A8" }}>{'"Authorization: Bearer flp_live_sk_••••••••"'}</span>
      <span style={{ color: "#E8E8F0" }}>{" \\\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"  -H "}</span>
      <span style={{ color: "#A8D8A8" }}>{'"Content-Type: application/json"'}</span>
      <span style={{ color: "#E8E8F0" }}>{" \\\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"  -d "}</span>
      <span style={{ color: "#A8D8A8" }}>{`'{\n    "title":  "Design Invoice #42",\n    "amount": 150000,\n    "pools": [\n      { "label": "Revenue",   "percent": 70 },\n      { "label": "Tax Vault", "percent": 20 },\n      { "label": "Growth",    "percent": 10 }\n    ]\n  }'`}</span>
    </pre>
  ),
  python: (
    <pre className="text-[13px] leading-relaxed font-mono whitespace-pre overflow-x-auto">
      <span style={{ color: "#6C7A8A" }}>{"# pip install fleeper\n"}</span>
      <span style={{ color: "#00FFCC" }}>{"import"}</span>
      <span style={{ color: "#E8E8F0" }}>{" fleeper\n\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"client = fleeper."}</span>
      <span style={{ color: "#82C4F8" }}>{"Client"}</span>
      <span style={{ color: "#E8E8F0" }}>{"("}</span>
      <span style={{ color: "#A8D8A8" }}>{'"flp_live_sk_••••••••"'}</span>
      <span style={{ color: "#E8E8F0" }}>{");\n\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"link = client.links."}</span>
      <span style={{ color: "#82C4F8" }}>{"create"}</span>
      <span style={{ color: "#E8E8F0" }}>{"(\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"    title="}</span>
      <span style={{ color: "#A8D8A8" }}>{'"Design Invoice #42"'}</span>
      <span style={{ color: "#E8E8F0" }}>{",\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"    amount="}</span>
      <span style={{ color: "#F0A050" }}>{"150_000"}</span>
      <span style={{ color: "#E8E8F0" }}>{",\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{"    pools=[\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{'        {"label": "Revenue",   "percent": '}</span>
      <span style={{ color: "#F0A050" }}>{"70"}</span>
      <span style={{ color: "#E8E8F0" }}>{"},\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{'        {"label": "Tax Vault", "percent": '}</span>
      <span style={{ color: "#F0A050" }}>{"20"}</span>
      <span style={{ color: "#E8E8F0" }}>{"},\n"}</span>
      <span style={{ color: "#E8E8F0" }}>{'        {"label": "Growth",    "percent": '}</span>
      <span style={{ color: "#F0A050" }}>{"10"}</span>
      <span style={{ color: "#E8E8F0" }}>{"},\n    ],\n)\n\n"}</span>
      <span style={{ color: "#82C4F8" }}>{"print"}</span>
      <span style={{ color: "#E8E8F0" }}>{"(link.url)\n"}</span>
      <span style={{ color: "#6C7A8A" }}>{"# → https://fleeper.com/you/design-invoice-42"}</span>
    </pre>
  ),
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [devTab, setDevTab] = useState<DevTab>("node");
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: "#F7F5FF" }}>

      {/* ── Background canvas ── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", left: "-5%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "20%", right: "-10%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "30%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,179,71,0.10) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", right: "5%", width: "450px", height: "450px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,168,0.12) 0%, transparent 70%)" }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="max-w-6xl mx-auto transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.60)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(139,92,246,0.14)",
            borderRadius: "20px",
            boxShadow: scrolled ? "0 8px 32px rgba(100,60,220,0.10), 0 1px 0 rgba(255,255,255,0.9) inset" : "0 2px 12px rgba(100,60,220,0.06)",
            padding: "10px 20px",
          }}
        >
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/fleeper.png" alt="Fleeper" style={{ height: "28px", width: "auto" }} />
            </Link>

            {/* Links */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium" style={{ color: "rgba(14,12,34,0.50)" }}>
              <a href="#how-it-works" className="hover:text-[#0E0C22] transition-colors">How it works</a>
              <a href="#pricing" className="hover:text-[#0E0C22] transition-colors">Pricing</a>
              <a href="#developers" className="hover:text-[#0E0C22] transition-colors">Developers</a>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-black/5"
                style={{ color: "rgba(14,12,34,0.60)" }}>
                Sign in
              </Link>
              <Link href="/register"
                className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{ background: "#0E0C22", color: "#fff", boxShadow: "0 4px 14px rgba(14,12,34,0.25)" }}>
                Get started →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
              style={{ background: "rgba(0,255,204,0.12)", color: "#008866", border: "1px solid rgba(0,212,168,0.25)" }}>
              <Sparkles size={13} />
              Now live — Automated Income Routing
            </div>

            <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-[0.92] mb-6 text-[#0E0C22]">
              Your income,
              <br />
              <span style={{
                background: "linear-gradient(135deg, #00C4A0 0%, #8B5CF6 50%, #E8920A 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                organized instantly.
              </span>
            </h1>

            <p className="text-lg leading-relaxed mb-10" style={{ color: "rgba(14,12,34,0.55)" }}>
              Fleeper is the first payment gateway that splits your earnings into Spend, Tax, and Savings accounts the moment you get paid. No spreadsheets. No transfers. No tax anxiety.
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/register"
                className="group inline-flex items-center justify-center gap-3 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #00FFCC 0%, #00D4A8 100%)", color: "#0A2E28", boxShadow: "0 6px 24px rgba(0,212,168,0.35)" }}>
                Start earning smarter
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-4 rounded-2xl text-base transition-all hover:bg-black/5"
                style={{ color: "rgba(14,12,34,0.55)", border: "1px solid rgba(14,12,34,0.12)" }}>
                See how it works
                <ChevronDown size={16} />
              </a>
            </div>

            {/* Trust strip */}
            <div className="flex items-center gap-6 mt-10 pt-8" style={{ borderTop: "1px solid rgba(14,12,34,0.08)" }}>
              {[
                { icon: Shield,       label: "Bank-grade encryption" },
                { icon: Zap,          label: "Instant routing"       },
                { icon: BarChart2,    label: "Real-time analytics"   },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={14} style={{ color: "#00A882" }} />
                  <span className="text-xs font-medium" style={{ color: "rgba(14,12,34,0.45)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — demo card */}
          <div className="lg:pl-8">
            <DemoCard />
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: "$12M+",   label: "Routed to date"       },
            { value: "4,200+",  label: "Active creators"      },
            { value: "< 2s",    label: "Routing speed"        },
            { value: "99.99%",  label: "Uptime SLA"           },
          ].map(({ value, label }) => (
            <div key={label} className="text-center p-6 rounded-2xl transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.70)", backdropFilter: "blur(16px)", border: "1px solid rgba(139,92,246,0.12)", boxShadow: "0 4px 20px rgba(100,60,220,0.06)" }}>
              <p className="text-3xl font-black text-[#0E0C22] mb-1">{value}</p>
              <p className="text-xs font-medium" style={{ color: "rgba(14,12,34,0.45)" }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#00A882" }}>How it works</p>
          <h2 className="text-4xl font-black tracking-tight text-[#0E0C22] mb-4">Three steps to financial clarity</h2>
          <p className="max-w-xl mx-auto" style={{ color: "rgba(14,12,34,0.50)" }}>From setup to organized income in minutes.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Link your accounts", desc: "Connect your business, tax savings, and personal accounts. Fleeper uses bank-grade OAuth — your credentials stay private.", color: "#00D4A8", glow: "rgba(0,212,168,0.12)" },
            { step: "02", title: "Set your splits",    desc: "Use the visual sliders to decide where each dollar goes. 70/20/10 is a popular starting point for freelancers.", color: "#8B5CF6", glow: "rgba(139,92,246,0.12)" },
            { step: "03", title: "Get Fleeped",        desc: "Share your fleeper.com/yourname link. Every payment auto-routes to your accounts in under 2 seconds.",          color: "#E8920A", glow: "rgba(232,146,10,0.12)" },
          ].map(({ step, title, desc, color, glow }) => (
            <div key={step} className="relative p-8 rounded-3xl group hover:scale-[1.02] transition-all duration-300 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(20px)", border: "1px solid rgba(139,92,246,0.12)", boxShadow: "0 4px 24px rgba(100,60,220,0.07)" }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top right, ${glow} 0%, transparent 70%)` }} />
              <div className="relative z-10">
                <div className="text-6xl font-black mb-5 leading-none" style={{ color, opacity: 0.18 }}>{step}</div>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-5 shadow-md"
                  style={{ background: color, boxShadow: `0 6px 20px ${color}40` }}>
                  <CheckCircle2 size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#0E0C22] mb-3">{title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: "rgba(14,12,34,0.52)" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#8B5CF6" }}>Pricing</p>
          <h2 className="text-4xl font-black tracking-tight text-[#0E0C22] mb-4">Simple, transparent pricing</h2>
          <p style={{ color: "rgba(14,12,34,0.50)" }}>One flat fee covers routing, accounting, and transfers.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              tier: "Starter", volume: "$0 – $5k / mo", fee: "2.9% + $0.30",
              features: ["3 income pools", "Standard payouts", "Basic analytics", "Email support"],
              highlight: false, color: "#00D4A8",
            },
            {
              tier: "Growth",  volume: "$5k – $50k / mo", fee: "2.5% + $0.20",
              features: ["Unlimited pools", "Priority payouts", "Advanced analytics", "Webhook API"],
              highlight: true,  color: "#00ffcc",
            },
            {
              tier: "Scale",   volume: "$50k+ / mo", fee: "2.2% + $0.10",
              features: ["Custom routing logic", "Dedicated support", "Full API access", "SLA guarantee"],
              highlight: false, color: "#E8920A",
            },
          ].map(({ tier, volume, fee, features, highlight, color }) => (
            <div key={tier}
              className="relative p-8 rounded-3xl flex flex-col transition-all hover:scale-[1.02] duration-300"
              style={highlight ? {
                background: "linear-gradient(145deg, #0E0C22 0%, #1A1540 100%)",
                border: `1px solid ${color}40`,
                boxShadow: `0 20px 60px rgba(139,92,246,0.25), 0 4px 16px rgba(0,0,0,0.15)`,
              } : {
                background: "rgba(255,255,255,0.80)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(139,92,246,0.12)",
                boxShadow: "0 4px 24px rgba(100,60,220,0.07)",
              }}>
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#00ffcc", color: "#0A2E28", boxShadow: "0 4px 12px rgba(0,255,204,0.50)" }}>
                  Most popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1" style={{ color: highlight ? "#fff" : "#0E0C22" }}>{tier}</h3>
                <p className="text-sm mb-5" style={{ color: highlight ? "rgba(255,255,255,0.45)" : "rgba(14,12,34,0.45)" }}>{volume}</p>
                <div className="text-3xl font-black" style={{ color }}>{fee}</div>
                <p className="text-xs mt-1" style={{ color: highlight ? "rgba(255,255,255,0.35)" : "rgba(14,12,34,0.35)" }}>per transaction</p>
              </div>
              <ul className="space-y-2.5 flex-1 mb-8">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
                      <CheckCircle2 size={10} style={{ color }} />
                    </div>
                    <span style={{ color: highlight ? "rgba(255,255,255,0.70)" : "rgba(14,12,34,0.65)" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register"
                className="block text-center py-3.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                style={highlight
                  ? { background: color, color: "#0A0A0A", boxShadow: `0 6px 20px ${color}45` }
                  : { background: `${color}12`, color, border: `1px solid ${color}25` }}>
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Developers ── */}
      <section id="developers" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#00A882" }}>Developers</p>
          <h2 className="text-4xl font-black tracking-tight text-[#0E0C22] mb-4">Built for builders</h2>
          <p className="max-w-xl mx-auto" style={{ color: "rgba(14,12,34,0.50)" }}>
            Full REST API, real-time webhooks, and SDKs. Embed Fleeper&apos;s intelligent routing into your product in minutes.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* Left — feature cards */}
          <div className="space-y-4">
            {[
              {
                icon: Code2,
                color: "#00D4A8",
                glow: "rgba(0,212,168,0.10)",
                title: "REST API",
                desc: "Every Fleeper action is available over HTTPS. Idempotent endpoints, versioned routes, and predictable JSON responses you can rely on.",
              },
              {
                icon: Webhook,
                color: "#8B5CF6",
                glow: "rgba(139,92,246,0.10)",
                title: "Webhooks",
                desc: "Subscribe to payment.received, split.completed, pool.updated, and more. We retry with exponential backoff so you never miss an event.",
              },
              {
                icon: Globe,
                color: "#E8920A",
                glow: "rgba(232,146,10,0.10)",
                title: "SDKs",
                desc: "Official clients for Node.js, Python, and Go. Type-safe, zero-dependency, and fully documented with inline examples.",
              },
              {
                icon: Key,
                color: "#00A882",
                glow: "rgba(0,168,130,0.10)",
                title: "Scoped API keys",
                desc: "Generate keys with fine-grained permissions (read / write / webhook) straight from your dashboard. Rotate or revoke in one click.",
              },
            ].map(({ icon: Icon, color, glow, title, desc }) => (
              <div key={title}
                className="group flex gap-5 p-6 rounded-2xl transition-all hover:scale-[1.01] duration-300"
                style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(20px)", border: "1px solid rgba(139,92,246,0.10)", boxShadow: "0 4px 20px rgba(100,60,220,0.05)" }}>
                <div className="shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm transition-shadow group-hover:shadow-lg"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${color}, ${color}CC)`, boxShadow: `0 4px 14px ${color}40` }}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#0E0C22] mb-1">{title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(14,12,34,0.52)" }}>{desc}</p>
                </div>
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 0% 50%, ${glow}, transparent 70%)` }} />
              </div>
            ))}

            {/* Docs CTA */}
            <div className="flex items-center gap-4 mt-2 px-2">
              <a href="#"
                className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                style={{ color: "#00A882" }}>
                Read the docs <ArrowRight size={15} />
              </a>
              <span style={{ color: "rgba(14,12,34,0.15)" }}>·</span>
              <a href="#"
                className="inline-flex items-center gap-2 text-sm font-medium transition-all"
                style={{ color: "rgba(14,12,34,0.40)" }}>
                API reference
              </a>
              <span style={{ color: "rgba(14,12,34,0.15)" }}>·</span>
              <a href="#"
                className="inline-flex items-center gap-2 text-sm font-medium transition-all"
                style={{ color: "rgba(14,12,34,0.40)" }}>
                Changelog
              </a>
            </div>
          </div>

          {/* Right — code block */}
          <div className="relative">
            {/* Glow behind editor */}
            <div className="absolute -inset-6 rounded-3xl pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,255,204,0.12) 0%, transparent 70%)" }} />

            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: "linear-gradient(160deg, #0E0C22 0%, #12102A 100%)", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 64px rgba(14,12,34,0.28), 0 1px 0 rgba(255,255,255,0.05) inset" }}>

              {/* Traffic lights + title */}
              <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#FFBD2E" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
                </div>
                <span className="text-xs font-mono mx-auto" style={{ color: "rgba(255,255,255,0.25)" }}>fleeper-quickstart</span>
              </div>

              {/* Language tabs */}
              <div className="flex gap-1 px-5 pt-4 pb-0">
                {(["node", "curl", "python"] as DevTab[]).map((tab) => (
                  <button key={tab} onClick={() => setDevTab(tab)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer"
                    style={devTab === tab
                      ? { background: "rgba(0,255,204,0.12)", color: "#00FFCC", border: "1px solid rgba(0,255,204,0.20)" }
                      : { background: "transparent", color: "rgba(255,255,255,0.30)", border: "1px solid transparent" }}>
                    {tab === "node" ? "Node.js" : tab === "curl" ? "cURL" : "Python"}
                  </button>
                ))}
              </div>

              {/* Code */}
              <div className="p-5 pt-4">
                {CODE[devTab]}
              </div>

              {/* Response preview */}
              <div className="mx-5 mb-5 p-4 rounded-xl" style={{ background: "rgba(0,255,204,0.05)", border: "1px solid rgba(0,255,204,0.12)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#00FFCC] animate-pulse" />
                  <span className="text-[11px] font-bold font-mono" style={{ color: "#00FFCC" }}>200 OK · 142ms</span>
                </div>
                <pre className="text-[12px] font-mono leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
                  {`{
  "id":     "lnk_01J8...",
  "url":    "https://fleeper.com/you/design-invoice-42",
  "status": "active",
  "pools":  3
}`}
                </pre>
              </div>
            </div>

            {/* Webhook event card — floating below */}
            <div className="mt-4 p-4 rounded-2xl flex items-start gap-3"
              style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(20px)", border: "1px solid rgba(139,92,246,0.12)", boxShadow: "0 4px 20px rgba(100,60,220,0.07)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(139,92,246,0.10)", border: "1px solid rgba(139,92,246,0.20)" }}>
                <Zap size={14} style={{ color: "#8B5CF6" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-sm font-bold text-[#0E0C22]">payment.received</p>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "rgba(0,212,168,0.10)", color: "#00A882" }}>just now</span>
                </div>
                <p className="text-xs font-mono truncate" style={{ color: "rgba(14,12,34,0.40)" }}>{"{ amount: 150000, split: \"70/20/10\", status: \"routed\" }"}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl px-10 py-16 text-center"
          style={{ background: "linear-gradient(135deg, #0E0C22 0%, #1C1648 100%)", boxShadow: "0 24px 80px rgba(14,12,34,0.20)" }}>
          <div className="absolute inset-0 pointer-events-none">
            <div style={{ position: "absolute", top: 0, left: "10%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.12) 0%, transparent 70%)" }} />
            <div style={{ position: "absolute", bottom: 0, right: "10%", width: "250px", height: "250px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-4 text-[#00FFCC]">Start today</p>
            <h2 className="text-4xl font-black mb-4 tracking-tight" style={{ color: "#ffffff" }}>Ready to organize your income?</h2>
            <p className="mb-8 max-w-md mx-auto" style={{ color: "#ffffff" }}>Join thousands of creators and freelancers who never worry about tax season again.</p>
            <Link href="/register"
              className="inline-flex items-center gap-3 font-bold px-8 py-4 rounded-2xl text-base transition-all hover:scale-105 active:scale-95"
              style={{ background: "#00FFCC", color: "#0A2E28", boxShadow: "0 8px 28px rgba(0,255,204,0.35)" }}>
              Create free account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 py-12 mt-8" style={{ borderTop: "1px solid rgba(14,12,34,0.08)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fleeper.png" alt="Fleeper" style={{ height: "36px", width: "auto" }} />
          <p className="text-sm" style={{ color: "rgba(14,12,34,0.30)" }}>© 2026 Fleeper Ltd. All rights reserved.</p>
          <div className="flex gap-6 text-sm font-medium" style={{ color: "rgba(14,12,34,0.40)" }}>
            <Link href="/privacy"  className="hover:text-[#0E0C22] transition-colors">Privacy</Link>
            <Link href="/terms"    className="hover:text-[#0E0C22] transition-colors">Terms</Link>
            <Link href="/security" className="hover:text-[#0E0C22] transition-colors">Security</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
