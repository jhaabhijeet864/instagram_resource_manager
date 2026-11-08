// Custom 404 page: guides visitors back to the library.
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="text-4xl mb-3">📁</div>
      <h2 className="text-lg font-bold text-white mb-1">Resource Not Found</h2>
      <p className="text-xs text-slate-400 mb-6">
        This resource link may have expired or moved. Check the full resource library below.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
      >
        Browse All Free Resources
      </Link>
    </div>
  );
}
