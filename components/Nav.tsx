"use client";

// ==============================================================================
// PHOTOREALISTIC FLOATING CURVED BAR (Curved Dock Navigation)
// Tactile creamy glass, optical specular highlights, physical shadow depth.
// Zero AI buzzwords.
// ==============================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname() || "/";

  const navLinks = [
    { href: "/", label: "Resource Library", active: pathname === "/" },
    { href: "/dashboard", label: "Analytics", active: pathname.startsWith("/dashboard") },
    { href: "/resources/manage", label: "Resource Manager", active: pathname.startsWith("/resources/manage") },
    { href: "/plugins", label: "Plugins & Linkage", active: pathname.startsWith("/plugins") },
  ];

  return (
    <div className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none flex justify-center">
      <header className="pointer-events-auto max-w-4xl w-full photoreal-floating-bar rounded-full px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between transition-all">
        {/* Brand Lens & Identity */}
        <Link href="/" className="flex items-center space-x-2.5 group pl-1">
          {/* Photorealistic tactile camera lens/aperture icon */}
          <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-stone-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_2px_6px_rgba(28,25,23,0.3)] group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
            </svg>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                DevResource
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-[#F0EAE0] text-stone-600 border border-[#DDD5C7]">
                ENGINEERING
              </span>
            </div>
            <span className="hidden sm:inline-block text-[10px] text-stone-500 -mt-0.5">
              Creator Distribution Vault
            </span>
          </div>
        </Link>

        {/* Center Navigation Pills */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                item.active
                  ? "bg-stone-900 text-stone-50 shadow-[0_2px_8px_rgba(28,25,23,0.22),inset_0_1px_1px_rgba(255,255,255,0.18)]"
                  : "text-stone-600 hover:text-stone-900 hover:bg-[#F0EAE0]/70"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Status Capsule */}
        <div className="hidden lg:flex items-center pr-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E5DECE] text-[10px] font-medium text-stone-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Drive Vault Live</span>
          </div>
        </div>
      </header>
    </div>
  );
}
