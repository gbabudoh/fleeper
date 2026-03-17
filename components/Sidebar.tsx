"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart2, Clock, Wallet, ExternalLink,
  Settings, LogOut, Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const NAV = [
  { icon: BarChart2,    label: "Dashboard",     href: "/dashboard",     color: "#00FFCC" },
  { icon: Clock,        label: "Transactions",  href: "/transactions",  color: "#8B5CF6" },
  { icon: Wallet,       label: "Pools",         href: "/pools",         color: "#FFB347" },
  { icon: ExternalLink, label: "Payment Links", href: "/links",         color: "#00FFCC" },
  { icon: Settings,     label: "Settings",      href: "/settings",      color: "#8B5CF6" },
];

interface SidebarProps {
  user?: { name?: string | null; handle?: string; email?: string };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname        = usePathname();
  const router          = useRouter();
  const { theme, toggle } = useTheme();
  const isDark          = theme === "dark";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = (user?.name ?? user?.handle ?? "?").slice(0, 2).toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-full w-16 md:w-64 bg-(--bg-sidebar) border-r border-white/5 z-20 flex flex-col transition-colors duration-300">

      {/* ── Logo ── */}
      <div className="px-4 py-5 flex items-center gap-2">
        {/* Icon mark — overflow-hidden crops to just the "f" square */}
        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/fleeper.png"
            alt="Fleeper"
            style={{ height: "36px", width: "auto", maxWidth: "none" }}
            className={isDark ? "invert hue-rotate-180" : ""}
          />
        </div>
        {/* Brand name + live indicator */}
        <div className="hidden md:flex md:items-center md:gap-2">
          <span className="font-black text-lg tracking-tight">fleeper</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FFCC] animate-pulse" />
            <span className="text-[10px] text-white/30 font-medium tracking-wide">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-linear-to-r from-transparent via-white/8 to-transparent mb-3" />

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ icon: Icon, label, href, color }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group overflow-hidden ${
                active ? "text-white" : "text-white/40 hover:text-white"
              }`}
              style={active ? {
                background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
              } : undefined}
            >
              {/* Active left bar */}
              {active && (
                <div
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                  style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                />
              )}

              {/* Hover bg */}
              {!active && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl bg-white/5" />
              )}

              <Icon
                size={17}
                className="shrink-0 relative z-10 transition-colors duration-200"
                style={{ color: active ? color : undefined }}
              />
              <span className="hidden md:block relative z-10">{label}</span>

              {active && (
                <div
                  className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full relative z-10"
                  style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-4 h-px bg-linear-to-r from-transparent via-white/8 to-transparent mt-3" />

      {/* ── Theme toggle ── */}
      <div className="px-3 py-3">
        <button
          onClick={toggle}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-white transition-all duration-200 text-sm font-medium cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl bg-white/5" />
          {isDark ? (
            <Sun size={17} className="shrink-0 relative z-10 group-hover:text-[#FFB347] transition-colors" />
          ) : (
            <Moon size={17} className="shrink-0 relative z-10 group-hover:text-[#8B5CF6] transition-colors" />
          )}
          <span className="hidden md:flex md:items-center md:justify-between md:flex-1 relative z-10">
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
            <div className="w-8 h-4 rounded-full bg-white/8 border border-white/10 flex items-center px-0.5 transition-colors">
              <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isDark ? "translate-x-0 bg-white/30" : "translate-x-4 bg-[#8B5CF6]"}`} />
            </div>
          </span>
        </button>
      </div>

      {/* ── User + Logout ── */}
      <div className="p-3 border-t border-white/5">
        {/* Avatar + info */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#00FFCC] via-[#FFB347] to-[#8B5CF6] flex items-center justify-center">
              <span className="text-[#0A0A0A] font-black text-xs">{initials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00FFCC] border-2 border-(--bg-sidebar)" />
          </div>
          <div className="hidden md:block overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-bold truncate">{user?.name ?? user?.handle ?? "—"}</p>
            <p className="text-[11px] text-white/30 truncate">@{user?.handle ?? "—"}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/25 hover:text-red-400 hover:bg-red-400/5 transition-all duration-200 text-sm cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl bg-red-400/5" />
          <LogOut size={15} className="shrink-0 relative z-10" />
          <span className="hidden md:block relative z-10 text-xs">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
