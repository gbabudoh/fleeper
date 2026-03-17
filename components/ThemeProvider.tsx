"use client";

import { createContext, useContext, useState } from "react";

export type Theme = "dark" | "light";

interface ThemeCtx { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void; }

const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {}, setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const apply = (t: Theme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (t === "light") { root.classList.add("light"); root.classList.remove("dark"); }
    else               { root.classList.remove("light"); root.classList.add("dark"); }
  };

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = (localStorage.getItem("fleeper-theme") ?? "dark") as Theme;
    apply(stored);
    return stored;
  });

  const setTheme = (t: Theme) => {
    localStorage.setItem("fleeper-theme", t);
    apply(t);
    setThemeState(t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return <Ctx.Provider value={{ theme, toggle, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
