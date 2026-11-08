import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WelcomeIntro } from "@/components/WelcomeIntro";

export const metadata: Metadata = {
  title: {
    default: "DevResource | Software Engineering & System Architecture Hub",
    template: "%s | DevResource",
  },
  description:
    "Production-grade distributed system blueprints, backend architecture templates, Python automation vaults, and cheatsheets curated for engineering creators.",
  openGraph: {
    title: "DevResource - Production Engineering & Architecture Hub",
    description:
      "Production-grade distributed system blueprints, backend architecture templates, Python automation vaults, and cheatsheets curated for engineering creators.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#FAF8F5] text-stone-900 min-h-screen flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
        <WelcomeIntro />
        <Nav />
        {/* Top padding ensures the photorealistic floating curved bar has clear headroom */}
        <main className="flex-grow w-full pt-20 sm:pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
