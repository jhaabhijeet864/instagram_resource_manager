// ============================================================================
// BRANDED RESOURCE LANDING PAGE: /r/[slug]
// Every Instagram / Manychat automation points here. This URL is permanent -
// the underlying storage (Google Drive / Cloudflare R2) can change freely.
// ============================================================================
import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RESOURCES, getResourceBySlug } from "@/lib/catalog";
import { ResourceDetail } from "@/components/resource/ResourceDetail";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return RESOURCES.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const resource = getResourceBySlug(params.slug);
  if (!resource) return { title: "Resource Not Found" };
  return {
    title: `${resource.title} | Free Download`,
    description: resource.description,
    openGraph: {
      title: resource.title,
      description: resource.description,
      type: "website",
    },
  };
}

export default function ResourcePage({ params }: Props) {
  const resource = getResourceBySlug(params.slug);
  if (!resource) notFound();

  return (
    // Suspense boundary is required because the client component reads the
    // UTM campaign via useSearchParams (campaign attribution banner).
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400 font-medium">Preparing verified master file preview...</p>
        </div>
      }
    >
      <ResourceDetail resource={resource} />
    </Suspense>
  );
}
