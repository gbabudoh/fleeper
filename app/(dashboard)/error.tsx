"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mb-5">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
      <p className="text-[#888] text-sm mb-6 text-center max-w-xs">
        An error occurred while loading this page. Your data is safe.
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-[#00FFCC] text-black font-semibold rounded-lg hover:bg-[#00e6b8] transition-colors text-sm"
      >
        Reload
      </button>
    </div>
  );
}
