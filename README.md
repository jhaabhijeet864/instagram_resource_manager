# 🚀 DevResource — Instagram Creator AI Resource Hub & Campaign Analytics (Next.js)

A production-ready **Next.js** website and analytics system for Instagram creators.
It is the **permanent public interface** for your resources — the branded measurement
layer between Instagram Reels / Manychat automations and your underlying file storage
(Google Drive now, Cloudflare R2 later).

Built with the stack from the architecture plan:

| Component      | Implementation                        |
| -------------- | ------------------------------------- |
| Frontend       | Next.js 14 (App Router) + TypeScript  |
| Styling        | Tailwind CSS (no CDN, compiled)       |
| Backend        | Next.js API Routes (real tracking!)   |
| Database       | Supabase / PostgreSQL (optional)      |
| File storage   | Google Drive (Cloudflare R2 later)    |
| Charts         | Recharts                              |
| Automation     | Manychat                              |
| Analytics | Browser LocalStorage engine + Supabase sync |

> **Why this architecture wins:** Google Drive is just replaceable storage behind
> the scenes. You can switch to Cloudflare R2 later without changing a single link
> across hundreds of Instagram posts or Manychat automations — every public URL is
> `/r/<slug>` and it never changes.

---

## 🏛️ System Architecture

```text
Instagram Reel: "Comment RAG for link"
      │
      ▼
Manychat Automation: sends tracked URL
      │  /r/rag-starter-kit?utm_campaign=rag_carousel_01
      ▼
Your Branded Website (Next.js):
      │  • Logs PAGE_VISIT + campaign source     (js browser event)
      │  • Shows preview, file specs, prompts    (app/r/[slug]/page.tsx)
      │  • "DOWNLOAD RESOURCE" → CLICK logged    (browser event)
      ▼
Next.js API Route: GET /api/download/[slug]
      │  • Logs DOWNLOAD_SUCCESS — server truth (Supabase, if configured)
      │  • 302 redirects to the actual file in storage
      ▼
Replaceable File Storage (Google Drive ↔ Cloudflare R2)
      │
      ▼
Analytics Dashboard: /dashboard
      • Funnel chart, per-Reel conversion comparison, event audit trail
```

**Analytics precision** (this is deliberately split into three different metrics):

| Metric                     | Meaning                       | Where it's recorded                     |
| -------------------------- | ----------------------------- | --------------------------------------- |
| `DOWNLOAD_CLICK`           | Someone clicked the button    | Browser, `lib/analytics.ts`             |
| `DOWNLOAD_SUCCESS`         | Server served the file        | `app/api/download/[slug]/route.ts`      |
| *(opened the PDF)*         | **Not proven by either**      | — (don't report all three as "downloads") |

---

## 📁 Project Structure

```text
Insta_Res_Webiste/
├── app/
│   ├── layout.tsx                  # Global shell: fonts (Plus Jakarta Sans + JetBrains Mono), Nav, Footer
│   ├── page.tsx                    # Homepage: hero, featured spotlight, 3-tier architecture, newsletter
│   ├── globals.css                 # Glassmorphism design system + Tailwind
│   ├── not-found.tsx               # Custom 404 → back to library
│   ├── dashboard/
│   │   └── page.tsx                # Campaign analytics dashboard (Recharts)
│   ├── r/[slug]/
│   │   └── page.tsx                # Branded resource landing page /r/[slug] (+metadata, SSG)
│   └── api/                        # ===== Backend (measurement layer) =====
│       ├── track/route.ts          #   POST → syncs browser events to Supabase
│       ├── download/[slug]/route.ts#   GET → logs DOWNLOAD_SUCCESS + 302 → storage
│       └── newsletter/route.ts     #   POST → email lead capture
├── components/
│   ├── Nav.tsx / Footer.tsx        # Shared shell
│   ├── useToast.tsx                # Toast notifications
│   ├── home/
│   │   ├── ResourceExplorer.tsx    # Search, filter, grid, quick-preview modal
│   │   └── NewsletterForm.tsx      # Email lead capture
│   ├── resource/ResourceDetail.tsx # Tabs (overview/code/prompts/diagram), downloads, UTM banner
│   └── dashboard/DashboardClient.tsx # KPIs, funnel + campaign charts, URL builder, tables
├── lib/
│   ├── catalog.ts                  # ⭐ MASTER RESOURCE CATALOG + brand profile + benchmarks
│   ├── analytics.ts                # Tracking engine (LocalStorage + server sync + metrics)
│   └── server/supabase.ts          # Server-side Supabase REST helpers (service key, never exposed)
├── supabase/
│   └── schema.sql                  # Full DB schema: Table A (resources), Table B (campaigns), events, leads
├── .env.example                    # Environment variable template
├── next.config.mjs / tailwind.config.ts / tsconfig.json
└── _legacy/                        # Original static HTML/JS version (kept for reference)
```

---

## ⚡ Quickstart

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

| URL                                        | What you'll see                                    |
| ------------------------------------------ | -------------------------------------------------- |
| `/`                                        | Searchable resource library + featured spotlight   |
| `/r/rag-starter-kit`                       | Branded landing page for a resource                |
| `/r/rag-starter-kit?utm_campaign=ig_test`  | Same page with the purple **UTM campaign banner**  |
| `/dashboard`                               | Campaign funnel & analytics dashboard              |
| `/api/download/python-automation-scripts`  | Tracked download (redirects to storage file)       |

Production build:

```bash
npm run build
npm start
```

---

## 🎛️ Configure Your Catalog

Everything is driven by **one file**: `lib/catalog.ts`

- `PROFILE` — your name, handle, Instagram URL, avatar, Drive folder link.
- `RESOURCES` — add a new resource by appending an object:

```ts
{
  slug: "claude-prompt-hacks",        // public URL: /r/claude-prompt-hacks
  id: "claude-prompt-hacks",
  resource_id: "RES-007",             // display ID
  title: "50+ Claude Prompt Hacks",
  category: "Prompts",                // appears in the filter pills
  keyword: "HACKS",                   // Instagram comment trigger
  description: "Turn Claude into an elite pair-programmer.",
  fileName: "Claude_Prompt_Hacks.pdf",
  fileSize: "2.0 MB",
  fileType: "PDF Guide",
  storageUrl: "https://drive.google.com/file/d/YOUR_FILE/view",  // ⚠️ replace!
  tags: ["Claude", "Prompts"],
  samplePrompts: [{ title: "Prompt Sprint", prompt: "..." }],
  highlights: ["What you get 1", "What you get 2"],
  updatedDate: "Just added",
}
```

The homepage grid, `/r/[slug]` page, dashboard Table A, and the download API all
update automatically.

---

## 🤖 1. Manychat Setup with Tracked URLs

1. Open **`/dashboard`** → **Manychat Campaign URL Generator**.
2. Pick the **Target Resource**, enter a **Campaign ID** (e.g. `rag_carousel_01`)
   and the **Comment Keyword** (e.g. `RAG`).
3. Copy the generated URL — it looks like:
   ```
   https://resources.yourdomain.com/r/rag-starter-kit?utm_source=instagram&utm_medium=comment_dm&utm_campaign=rag_carousel_01
   ```
   (Set `NEXT_PUBLIC_SITE_URL` in `.env.local` so the builder shows your domain.)
4. In **Manychat**:
   - **Trigger:** user comments keyword `RAG` on the reel
   - **Action:** send Instagram DM with the copied URL:
     > *"Hey! Here is the RAG Starter Kit you requested: [PASTE_COPIED_URL]"*

Each campaign gets its own ID even when the underlying file is the same — so you
can compare carousel vs reel vs post performance for one PDF.

---

## 📊 2. What the Dashboard Tracks

| Metric               | How it's measured                                          |
| -------------------- | ---------------------------------------------------------- |
| **DMs Sent**         | Seeded benchmark rows (`supabase/schema.sql`) + Supabase   |
| **DM Clicks**        | Manychat link click-through (seeded / Supabase)            |
| **Page Visits**      | `PAGE_VISIT` event logged on every `/r/[slug]` view        |
| **Download Clicks**  | `DOWNLOAD_CLICK` on button press (browser)                 |
| **Files Served**     | `DOWNLOAD_SUCCESS` in `/api/download/[slug]` (server truth)|
| **Conversion %**     | Download clicks ÷ visits                                   |
| **Email Leads**      | Newsletter forms → `EMAIL_SIGNUP` + `/api/newsletter`      |

Features:
- **Funnel bar chart** (Recharts) and **per-campaign comparison chart**.
- **Table A** — master resource catalog with test links.
- **Table B** — campaign analytics with per-campaign conversion, filterable.
- **Live event audit trail** + JSON/CSV export + reset.
- **"Simulate Reel Click"** button to generate test traffic instantly.

Storage of events: dual engine.
1. **Instant LocalStorage** — works immediately in every visitor's browser and in
   your dashboard with zero configuration.
2. **Supabase cloud sync** — every event is also POSTed to `/api/track`, which
   writes to `analytics_events` using your **service role key kept server-side
   only**. Nothing is exposed to the browser.

---

## 🗄️ 3. Supabase Setup (Optional but Recommended)

1. Create a free project at [supabase.com](https://supabase.com).
2. SQL Editor → paste **`supabase/schema.sql`** → Run.
   (Creates Table A, Table B, `analytics_events`, `email_signups`, RLS policies,
   indexes and seed data.)
3. Project Settings → API → copy your **Project URL** and **service_role** key.
4. Create `.env.local` (copy from `.env.example`):
   ```bash
   NEXT_PUBLIC_SITE_URL="https://resources.yourdomain.com"
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."
   ```
5. Restart `npm run dev`. The dashboard status pill and events will now sync to
   the cloud. **No Supabase? Everything still works 100% locally.**

---

## 🌐 4. Deploying to Vercel (Free Tier)

```bash
git init
git add .
git commit -m "DevResource Hub - Next.js edition"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Then:
1. [vercel.com](https://vercel.com) → **Import** the repo (it auto-detects Next.js).
2. Add the env variables from `.env.example` in Project Settings → Environment Variables.
3. Deploy. Done — your Manychat links now point at your production domain.

(Netlify or any Node host works too: `npm run build && npm start`.)

---

## 🧪 Testing the Tracking Flow (1 minute)

1. Open `/dashboard` → click **🚀 Simulate Reel Click & Visit** → watch KPIs +
   audit trail react, and the funnel chart update.
2. Open `/r/rag-starter-kit?utm_campaign=test_campaign` → see the purple UTM banner.
3. Click **DOWNLOAD RESOURCE** → the API route logs `DOWNLOAD_SUCCESS` server-side,
   then redirects to the Google Drive URL.
4. Check the **Live Event Audit Trail** on `/dashboard` — you'll see both the
   `DOWNLOAD_CLICK` (browser) and the visit with your campaign. With Supabase
   configured, verify rows appear in the `analytics_events` table.

Legacy in-browser test suite for the old static version is kept at
`_legacy/tests/index.html`.

---

## 🗂️ About `_legacy/`

This project was migrated **from a static HTML/CSS/JS version** into Next.js.
The original site (`index.html`, `r/`, `dashboard.html`, `js/`, `css/`, `tests/`)
is preserved under `_legacy/` for reference — it is not part of the Next.js build
(excluded in `tsconfig.json`). You can delete it once you're comfortable.

---

## 🛣️ Roadmap

- [ ] Replace `storageUrl` placeholders with real Google Drive file links (`lib/catalog.ts`)
- [ ] Set `NEXT_PUBLIC_SITE_URL` and personalize `PROFILE`
- [ ] Run `supabase/schema.sql` and add credentials to `.env.local`
- [ ] Wire Manychat keyword triggers per resource (`keyword` field)
- [ ] Migrate file storage to Cloudflare R2 later — only `storageUrl` in the
      catalog changes; every public `/r/<slug>` link and every Instagram
      automation stays untouched. That is the point of this architecture.
- [ ] Email lead export → your ESP of choice
