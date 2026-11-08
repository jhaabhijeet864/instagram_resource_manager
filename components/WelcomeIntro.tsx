"use client";

// ==============================================================================
// LAUNCH INTRO ANIMATION: The Tactile Creamy Curtain
// Photorealistic brand aperture, tactile warm paper curtain, and progress sheen.
// Plays on initial website visit; respects sessionStorage to keep UX snappy.
// ==============================================================================

import { useEffect, useState } from "react";

export function WelcomeIntro() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Respect user session: only show on initial site launch/visit
    if (typeof window !== "undefined" && sessionStorage.getItem("has_seen_launch_intro")) {
      setVisible(false);
      return;
    }

    const t1 = setTimeout(() => {
      setFading(true);
    }, 1100);

    const t2 = setTimeout(() => {
      setVisible(false);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("has_seen_launch_intro", "true");
      }
    }, 1600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!mounted || !visible) return null;

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("has_seen_launch_intro", "true");
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FAF8F5] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        fading ? "-translate-y-full opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background radial specular texture */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/70 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm space-y-5 animate-scaleUp">
        {/* Photorealistic tactile camera lens icon */}
        <div className="w-14 h-14 rounded-full bg-stone-900 flex items-center justify-center text-stone-100 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_8px_20px_rgba(28,25,23,0.25)] ring-4 ring-[#EFE8DC]">
          <svg className="w-7 h-7 animate-pulse text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3.5" strokeWidth="2" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
          </svg>
        </div>

        {/* Brand Wordmark & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              DevResource
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-[#F0EAE0] text-stone-700 border border-[#DDD5C7]">
              v2.0
            </span>
          </div>
          <p className="text-xs text-stone-500 font-medium">
            Instagram Creator Vault &amp; Storage Interface
          </p>
        </div>

        {/* Tactile progress bar */}
        <div className="w-48 h-1 bg-[#E8E2D8] rounded-full overflow-hidden relative shadow-inner">
          <div className="h-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-full w-full animate-[progress_1s_cubic-bezier(0.16,1,0.3,1)_forwards]" />
        </div>

        <button
          onClick={handleSkip}
          className="text-[10px] text-stone-400 hover:text-stone-700 underline tracking-wider uppercase pt-2 transition-colors"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}
