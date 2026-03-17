import Link from "next/link";
import { Shield, Lock, Eye, Zap, Server, AlertCircle } from "lucide-react";

const PILLARS = [
  {
    icon: Lock,
    color: "#00A882",
    bg: "rgba(0,168,130,0.10)",
    border: "rgba(0,168,130,0.22)",
    title: "Encryption at Rest & In Transit",
    body: "All data is encrypted at rest using AES-256. All data in transit is protected by TLS 1.3. Encryption keys are managed via a dedicated key management service with regular rotation.",
  },
  {
    icon: Shield,
    color: "#8B5CF6",
    bg: "rgba(139,92,246,0.10)",
    border: "rgba(139,92,246,0.22)",
    title: "Bank-Grade Authentication",
    body: "Sessions are secured with signed, httpOnly cookies and short-lived tokens. Passwords are hashed with bcrypt (cost factor 12). We support multi-factor authentication for all admin accounts.",
  },
  {
    icon: Eye,
    color: "#C47A0A",
    bg: "rgba(196,122,10,0.10)",
    border: "rgba(196,122,10,0.22)",
    title: "Fraud Detection & Monitoring",
    body: "Real-time transaction monitoring flags suspicious activity patterns. Every admin action is written to an immutable audit log. Anomaly detection alerts fire within seconds.",
  },
  {
    icon: Server,
    color: "#0077CC",
    bg: "rgba(0,119,204,0.10)",
    border: "rgba(0,119,204,0.22)",
    title: "Infrastructure Security",
    body: "Fleeper runs on enterprise cloud infrastructure with SOC 2 Type II certified providers. Network access is restricted via private VPCs, firewalls, and least-privilege IAM policies.",
  },
  {
    icon: Zap,
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    border: "rgba(220,38,38,0.20)",
    title: "Incident Response",
    body: "We maintain a documented incident response plan with defined SLAs. Security incidents are triaged within 1 hour and affected users are notified within 72 hours as required by applicable data protection law.",
  },
  {
    icon: AlertCircle,
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
    border: "rgba(5,150,105,0.20)",
    title: "Vulnerability Management",
    body: "We conduct regular penetration testing with independent third-party security firms. Dependency vulnerabilities are tracked and patched on a rolling basis. Critical fixes are deployed within 24 hours of disclosure.",
  },
];

const PRACTICES = [
  { label: "TLS 1.3 everywhere",             done: true  },
  { label: "AES-256 data encryption",        done: true  },
  { label: "bcrypt password hashing",        done: true  },
  { label: "Signed httpOnly session cookies",done: true  },
  { label: "Immutable audit logging",        done: true  },
  { label: "Role-based access control",      done: true  },
  { label: "Automated dependency scanning",  done: true  },
  { label: "Annual third-party pentest",     done: true  },
  { label: "SOC 2 Type II (in progress)",    done: false },
  { label: "ISO 27001 (planned 2026)",       done: false },
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden"
      style={{ background: "linear-gradient(155deg, #F0FFFA 0%, #E4FFF6 14%, #F8FFFE 30%, #EAFFF8 48%, #F7F5FF 66%, #F0EDFF 82%, #F8F5FF 100%)" }}>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,204,0.16) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-5%", left: "-5%", width: "420px", height: "420px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(0,212,168,0.10) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fleeper.png" alt="Fleeper" style={{ height: "28px", width: "auto" }} />
        </Link>
        <Link href="/" className="text-sm font-medium transition-colors"
          style={{ color: "rgba(14,12,34,0.45)" }}>
          ← Back to home
        </Link>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="mb-14 pt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background: "rgba(0,168,130,0.10)", color: "#00A882", border: "1px solid rgba(0,168,130,0.22)" }}>
            <Shield size={11} /> Trust & Safety
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3" style={{ color: "#0E0C22" }}>Security at Fleeper</h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "rgba(14,12,34,0.52)" }}>
            Your money and data are held to the highest security standards. Here&apos;s exactly how we protect you.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-10">
          {PILLARS.map(({ icon: Icon, color, bg, border, title, body }) => (
            <div key={title} className="rounded-3xl overflow-hidden group hover:scale-[1.01] transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(32px)",
                border: "1px solid rgba(0,212,168,0.14)",
                boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 8px 32px rgba(0,212,168,0.06), 0 2px 8px rgba(0,0,0,0.04)",
              }}>
              <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
              <div className="p-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: bg, border: `1px solid ${border}` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <h3 className="text-base font-black mb-2" style={{ color: "#0E0C22" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(14,12,34,0.55)" }}>{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Security checklist */}
        <div className="rounded-3xl overflow-hidden mb-10"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(32px)",
            border: "1px solid rgba(0,212,168,0.16)",
            boxShadow: "0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(0,212,168,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          }}>
          <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #00FFCC, #00D4A8 40%, #8B5CF6 70%, #FFB347)" }} />
          <div className="p-8">
            <h2 className="text-xl font-black mb-6" style={{ color: "#0E0C22" }}>Our Security Posture</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {PRACTICES.map(({ label, done }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: done ? "rgba(0,168,130,0.06)" : "rgba(14,12,34,0.03)", border: `1px solid ${done ? "rgba(0,168,130,0.16)" : "rgba(14,12,34,0.08)"}` }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: done ? "rgba(0,168,130,0.15)" : "rgba(14,12,34,0.06)" }}>
                    {done
                      ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#00A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="2" fill="rgba(14,12,34,0.25)"/></svg>
                    }
                  </div>
                  <span className="text-sm font-medium" style={{ color: done ? "#0E0C22" : "rgba(14,12,34,0.45)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Responsible disclosure */}
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0E0C22 0%, #1C1648 100%)",
            boxShadow: "0 24px 64px rgba(14,12,34,0.16)",
          }}>
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "rgba(0,255,204,0.12)", border: "1px solid rgba(0,255,204,0.25)" }}>
              <AlertCircle size={20} style={{ color: "#00FFCC" }} />
            </div>
            <h2 className="text-xl font-black text-white mb-2">Found a vulnerability?</h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              We operate a responsible disclosure programme. If you discover a security issue, please report it privately. We aim to acknowledge all reports within 24 hours and resolve critical issues within 72 hours.
            </p>
            <a href="mailto:security@fleeper.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-105"
              style={{ background: "#00FFCC", color: "#0A2E28", boxShadow: "0 6px 20px rgba(0,255,204,0.35)" }}>
              <Shield size={14} />
              security@fleeper.com
            </a>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-10 flex items-center justify-center gap-6 text-sm" style={{ color: "rgba(14,12,34,0.40)" }}>
          <Link href="/privacy" className="font-medium transition-colors hover:text-[#0E0C22]">Privacy Policy</Link>
          <span style={{ color: "rgba(14,12,34,0.18)" }}>·</span>
          <Link href="/terms"   className="font-medium transition-colors hover:text-[#0E0C22]">Terms of Service</Link>
          <span style={{ color: "rgba(14,12,34,0.18)" }}>·</span>
          <Link href="/"        className="font-medium transition-colors hover:text-[#0E0C22]">Home</Link>
        </div>
      </main>
    </div>
  );
}
