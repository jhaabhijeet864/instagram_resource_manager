// Editorial Creamy Footer
import Link from "next/link";
import { PROFILE } from "@/lib/catalog";

export function Footer() {
  return (
    <footer className="border-t border-[#E8E2D8] bg-[#FAF8F5] mt-16 py-12 text-stone-600">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
        {/* Brand column */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-stone-900 text-sm">DevResource</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4EFEA] border border-[#E2D9CC] text-stone-600">
              v2.0
            </span>
          </div>
          <p className="text-stone-500 leading-relaxed">
            The decoupled interface and attribution engine between Instagram audience engagement and verified cloud storage.
          </p>
          <p className="text-stone-400 text-[11px]">
            Created by <span className="font-medium text-stone-700">{PROFILE.name}</span> (@{PROFILE.handle})
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <p className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">Platform</p>
          <ul className="space-y-1.5 text-stone-500">
            <li>
              <Link href="/" className="hover:text-stone-900 transition-colors">
                Resource Catalog
              </Link>
            </li>
            <li>
              <Link href="/providers" className="hover:text-stone-900 transition-colors text-amber-800 font-medium">
                Connect Providers (Drive / Notion) ↗
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-stone-900 transition-colors">
                Campaign Analytics
              </Link>
            </li>
            <li>
              <Link href="/resources/manage" className="hover:text-stone-900 transition-colors">
                Resource Manager
              </Link>
            </li>
            <li>
              <Link href="/plugins" className="hover:text-stone-900 transition-colors">
                Plugins &amp; Meta Linkage
              </Link>
            </li>
          </ul>
        </div>

        {/* Architecture & Specs */}
        <div className="space-y-2">
          <p className="font-semibold text-stone-900 uppercase tracking-wider text-[11px]">Documentation</p>
          <ul className="space-y-1.5 text-stone-500">
            <li>
              <span className="hover:text-stone-900 transition-colors">docs/PRD.md</span>
            </li>
            <li>
              <span className="hover:text-stone-900 transition-colors">docs/SYSTEM_ARCHITECTURE.md</span>
            </li>
            <li>
              <span className="hover:text-stone-900 transition-colors">docs/META_INTEGRATION_GUIDE.md</span>
            </li>
            <li>
              <span className="hover:text-stone-900 transition-colors">docs/LAUNCH_AND_COMMANDS.md</span>
            </li>
          </ul>
        </div>

        {/* Measurement Truth Alert */}
        <div className="space-y-2 p-3.5 rounded-xl bg-[#F4EFEA] border border-[#E2D9CC]">
          <p className="font-semibold text-stone-900 text-[11px] flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5" />
            Measurement Precision
          </p>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Download clicks reflect user intent. Files served reflect storage delivery. Neither implies guide completion. No analytics fiction.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-[#E8E2D8] flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
        <p>© {new Date().getFullYear()} DevResource Hub. All rights reserved.</p>
        <p>Built with Next.js 14, Docker, and Meta Graph API.</p>
      </div>
    </footer>
  );
}
