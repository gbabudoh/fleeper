"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6">⚠️</div>
        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-[#888] mb-8 text-sm">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-[#00FFCC] text-black font-semibold rounded-lg hover:bg-[#00e6b8] transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
