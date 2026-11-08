"use client";

// Top navigation bar styled in elegant creamy white editorial design
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Nav() {
  const pathname = usePathname() || "/";

  const navLinks = [
    { href: "/", label: "Resource Library", active: pathname === "/" },
    { href: "/dashboard", label: "Campaign Analytics", active: pathname.startsWith("/dashboard") },
    { href: "/resources/manage", label: "Resource Manager", active: pathname.startsWith("/resources/manage") },
    { href: "/plugins", label: "Plugins Hub", active: pathname.startsWith("/plugins") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#E8E2D8] bg-[#FAF8F5]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-[#FAF8F5] shadow-sm group-hover:bg-stone-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold tracking-tight text-stone-900 group-hover:text-amber-800 transition-colors">
                DevResource
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F4EFEA] text-stone-600 border border-[#E2D9CC]">
                CREATOR HUB
              </span>
            </div>
            <p className="text-[11px] text-stone-500">Instagram &amp; Manychat Architecture</p>
          </div>
        </Link>

        {/* Center / Right Links */}
        <nav className="flex items-center space-x-1 sm:space-x-2">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                item.active
                  ? "bg-stone-900 text-[#FAF8F5] shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-[#F4EFEA]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
