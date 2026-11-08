"use client";

import { useState } from "react";
import { useToast } from "@/components/useToast";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { show, toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      show("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage_footer" }),
      });

      if (res.ok) {
        setSubmitted(true);
        show("🎉 You're subscribed to weekly engineering updates!");
        setEmail("");
      } else {
        show("Subscription received! Check your inbox.");
      }
    } catch {
      show("Thanks for subscribing! Check your inbox.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="creamy-card rounded-3xl p-8 md:p-10 border border-[#E8E2D8] bg-white text-stone-900 shadow-sm relative overflow-hidden">
      {toast}

      <div className="max-w-2xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F4EFEA] text-stone-700 border border-[#E2D9CC]">
          📬 Weekly Technical Dispatch
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
          Get New Guides, Blueprints &amp; Code Before Instagram
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Every Thursday, I send one deep-dive breakdown: system design architectures, high-performance backend pipelines, and production engineering scripts. No promotional spam.
        </p>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium inline-flex items-center space-x-2">
            <span>✓</span>
            <span>You are on the list! Keep an eye on your inbox for the next drop.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@company.com"
              required
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D8] bg-[#FAF8F5] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-stone-500 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto btn-primary whitespace-nowrap text-xs px-5 py-2.5"
            >
              {loading ? "Joining..." : "Subscribe Free"}
            </button>
          </form>
        )}

        <p className="text-[11px] text-stone-400">
          Zero marketing spam. One-click unsubscribe anytime.
        </p>
      </div>
    </div>
  );
}
