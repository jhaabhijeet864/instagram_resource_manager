import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "DevResource | AI & Software Engineering Resource Hub",
    template: "%s | DevResource",
  },
  description:
    "Production-grade RAG starter kits, system design blueprints, Python automation scripts, and cheatsheets curated for technical creators and developers.",
  openGraph: {
    title: "DevResource - Production-Grade AI & Engineering Resource Hub",
    description:
      "Production-grade RAG starter kits, system design blueprints, Python automation scripts, and cheatsheets curated for technical creators and developers.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#FAF8F5] text-stone-900 min-h-screen flex flex-col font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
        <Nav />
        <main className="flex-grow w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
