"use client";

// Toast notification hook styled in creamy editorial aesthetic
import { useCallback, useEffect, useRef, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 3000);
  }, []);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const toast = (
    <div
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 max-w-sm ${
        message ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-stone-900 text-[#FAF8F5] px-4 py-3 rounded-xl shadow-warm-lg border border-stone-800 flex items-center space-x-2.5 text-xs md:text-sm font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
        <span>{message ?? ""}</span>
      </div>
    </div>
  );

  return { show, toast };
}
