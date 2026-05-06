"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface PlaidLinkOptions {
  token: string;
  onSuccess: (publicToken: string, metadata: PlaidSuccessMetadata) => void;
  onExit?: () => void;
}

interface PlaidSuccessMetadata {
  account: { id: string; name: string; mask: string };
}

declare global {
  interface Window {
    Plaid?: {
      create: (opts: {
        token: string;
        onSuccess: (publicToken: string, metadata: PlaidSuccessMetadata) => void;
        onExit?: () => void;
        onLoad?: () => void;
        onEvent?: () => void;
      }) => { open: () => void; destroy: () => void };
    };
  }
}

const PLAID_SCRIPT_SRC = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";

function loadPlaidScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Plaid) { resolve(); return; }
    const existing = document.querySelector(`script[src="${PLAID_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.src = PLAID_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Plaid Link script"));
    document.head.appendChild(script);
  });
}

export function usePlaidLink({ token, onSuccess, onExit }: PlaidLinkOptions) {
  const [ready, setReady] = useState(false);
  const handlerRef = useRef<{ open: () => void; destroy: () => void } | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    loadPlaidScript()
      .then(() => {
        if (cancelled || !window.Plaid) return;
        handlerRef.current = window.Plaid.create({
          token,
          onSuccess,
          onExit,
          onLoad: () => setReady(true),
        });
        setReady(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      handlerRef.current?.destroy();
      handlerRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const open = useCallback(() => handlerRef.current?.open(), []);

  return { open, ready };
}
