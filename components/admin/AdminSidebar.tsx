"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ArrowLeftRight, Link2,
  KeyRound, Shield, Settings, FileText, LogOut, ChevronRight,
} from "lucide-react";

const NAV = [
  { label: "Overview",      href: "/admin",             icon: LayoutDashboard, exact: true },
  { label: "Users",         href: "/admin/users",        icon: Users },
  { label: "Transactions",  href: "/admin/transactions", icon: ArrowLeftRight },
  { label: "Payment Links", href: "/admin/links",        icon: Link2 },
  { label: "API Keys",      href: "/admin/api-keys",     icon: KeyRound },
  { label: "Staff & Roles", href: "/admin/staff",        icon: Shield },
  { label: "Audit Logs",    href: "/admin/audit",        icon: FileText },
  { label: "Settings",      href: "/admin/settings",     icon: Settings },
];

const MINT      = "#00FFCC";
const MINT_DARK = "#00A882";
const HEAD      = "#071A17";

interface Props { admin: { name: string; email: string; role: string } }

export function AdminSidebar({ admin }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin-login");
    router.refresh();
  };

  const initials = admin.name.slice(0, 2).toUpperCase();
  const roleBadge: Record<string, string> = {
    SUPER_ADMIN: "#DC2626", ADMIN: "#D97706", STAFF: MINT_DARK, READ_ONLY: "#2563EB",
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 flex flex-col z-20" style={{
      background: "linear-gradient(180deg, #FFFFFF 0%, #F5FFFD 40%, #EAFFF9 80%, #E2FFF6 100%)",
      borderRight: "1px solid rgba(0,255,204,0.25)",
      boxShadow: "4px 0 32px rgba(0,255,204,0.12), 1px 0 0 rgba(0,255,204,0.08)",
    }}>

      {/* Gradient accent bar at top */}
      <div className="h-0.5 w-full shrink-0" style={{ background: "linear-gradient(90deg, transparent 0%, #00FFCC 30%, #00D4A8 70%, transparent 100%)" }} />

      {/* Logo */}
      <div className="px-5 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0" style={{ boxShadow: `0 4px 14px ${MINT}50` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/fleeper.png" alt="Fleeper" style={{ height: "36px", width: "auto", maxWidth: "none" }} />
        </div>
        <div>
          <p className="text-sm font-black tracking-tight" style={{ color: HEAD }}>fleeper admin</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: MINT, boxShadow: `0 0 6px ${MINT}` }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "rgba(7,26,23,0.40)" }}>Control Panel</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px shrink-0" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,204,0.30), transparent)" }} />

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + "/"));
          return (
            <Link key={href} href={href}
              className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden"
              style={{
                color: active ? MINT_DARK : "rgba(7,26,23,0.48)",
                background: active ? "linear-gradient(135deg, rgba(0,255,204,0.14) 0%, rgba(0,255,204,0.06) 100%)" : undefined,
              }}>

              {/* Active: left glowing bar */}
              {active && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{ background: `linear-gradient(to bottom, ${MINT}, #00D4A8)`, boxShadow: `0 0 10px ${MINT}, 0 0 20px ${MINT}60` }} />
              )}

              {/* Inactive: hover bg */}
              {!active && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"
                  style={{ background: "linear-gradient(135deg, rgba(0,255,204,0.08), rgba(0,255,204,0.03))" }} />
              )}

              <Icon size={16} className="shrink-0 relative z-10"
                style={{ color: active ? MINT_DARK : "rgba(7,26,23,0.35)" }} />
              <span className="relative z-10 flex-1">{label}</span>
              {active && (
                <ChevronRight size={13} className="relative z-10 ml-auto" style={{ color: MINT_DARK }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px shrink-0" style={{ background: "linear-gradient(90deg, transparent, rgba(0,255,204,0.30), transparent)" }} />

      {/* User + Logout */}
      <div className="p-3 shrink-0">
        {/* Avatar card */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-1" style={{
          background: "linear-gradient(135deg, rgba(0,255,204,0.12) 0%, rgba(0,212,168,0.06) 100%)",
          border: "1px solid rgba(0,255,204,0.22)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.60)",
        }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs"
            style={{ background: `linear-gradient(135deg, ${MINT} 0%, #00D4A8 100%)`, color: "#071A17", boxShadow: `0 4px 12px ${MINT}50` }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: HEAD }}>{admin.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: roleBadge[admin.role] ?? "#888" }} />
              <p className="text-[10px] font-semibold truncate" style={{ color: roleBadge[admin.role] ?? "#888" }}>
                {admin.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all duration-200"
          style={{ color: "rgba(7,26,23,0.38)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#DC2626";
            (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.04))";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(7,26,23,0.38)";
            (e.currentTarget as HTMLButtonElement).style.background = "";
          }}>
          <LogOut size={15} className="shrink-0" />
          <span className="text-xs font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
