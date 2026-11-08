import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Creator Campaign & Resource Analytics Dashboard",
  description:
    "Track each Instagram Reel or carousel automation individually, compare conversion rates, and audit the difference between download clicks and served files.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
