# 📋 Product Requirements Document (PRD)

## Project: DevResource — Instagram Creator AI & Engineering Resource Hub
**Version**: 2.0.0  
**Status**: Ready for Implementation & Production Deployment  
**Target Environments**: Vercel (Production Serverless / Edge), Docker (Containerized Self-Hosted)  
**Primary Aesthetics**: Editorial Cream & Warm White (zero AI neon/purple slop)

---

## 1. Executive Summary & Vision

Technical educators and software engineering creators on Instagram (producing Reels, Carousels, and Broadcast Channels) routinely share high-value technical assets: RAG architecture diagrams, system design cheat-sheets, Jupyter notebooks, Dockerfiles, and prompt libraries.

Today, creators face three critical failure points:
1. **Link-in-Bio & Drive Link Churn**: Raw Google Drive links (`drive.google.com/file/d/...`) get broken, altered, rate-limited, or blacklisted. If a creator changes a file location in Drive, hundreds of existing Instagram posts and Manychat automations immediately point to dead 404 links.
2. **Measurement Blindspots**: Creators conflate "User clicked a link in DM" with "User downloaded the file" with "User read the guide." This creates "analytics fiction."
3. **Wasted Audience Attention**: Instead of landing on a generic Google Drive folder preview, users should land on a branded, elegant editorial web interface where they can preview table of contents, copy sample prompts, inspect code snippets, join the engineering newsletter, and trigger a verified file download.

**DevResource** is the **permanent public interface** and measurement engine between Instagram audience engagement (Reels, Carousels, Manychat DMs) and master file storage (Google Drive, Cloudflare R2, AWS S3).

---

## 2. Core Personas

### Persona A: The Technical Creator (Admin)
- **Role**: Publishes technical content on Instagram, designs guides, manages Manychat automations.
- **Pain Point**: Needs to change master file links without updating hundreds of active posts. Needs to know which specific Instagram post, keyword, and Reel drives real downloads versus passive link clicks.
- **Desired Outcome**: A single dashboard and Resource Manager to organize resources, copy tracked UTM links, configure Meta account webhooks, and toggle plugins.

### Persona B: The Engineering Audience Member (End User)
- **Role**: Software engineer, student, or AI practitioner viewing an Instagram Reel.
- **Pain Point**: Distrusts shady bit.ly redirect links; hates opening raw unstyled Google Drive folders on mobile; wants to see what's in the guide before downloading 50MB files.
- **Desired Outcome**: An ultra-fast, creamy editorial web page previewing the guide, table of contents, code, and prompts, with a 1-click verified download button.

### Persona C: The 3rd-Party Integration Developer
- **Role**: Developer building extensions (e.g., Discord notifier, Zapier bridge, Stripe paywall, Notion sync).
- **Pain Point**: Monolithic codebases make custom integrations brittle.
- **Desired Outcome**: A lightweight Plugin SDK and Registry where plugins can hook into download events, comment triggers, and lead captures.

---

## 3. The 3-Job Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Instagram Audience Surface               │
│       (Comments "RAG" on Reel / Carousel / Story)      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Meta Graph API / Manychat DMs              │
│       Dispatches tracked DM with custom UTM link:      │
│  resources.domain.com/r/rag-starter-kit?utm_campaign=..│
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│              DevResource Public Interface              │
│       • Permanent Public Slug (/r/rag-starter-kit)     │
│       • Editorial Preview (TOC, Code, Prompts)         │
│       • Newsletter Lead Capture                        │
│       • Captures "DOWNLOAD INTENT" event               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Storage Delivery Layer (Decoupled)         │
│       • Master Google Drive copy OR Cloudflare R2      │
│       • Serves verified file response                  │
│       • Captures "DOWNLOAD SUCCESS" event              │
└────────────────────────────────────────────────────────┘
```

### The Measurement Truth Hierarchy
To eliminate analytics fiction, the platform records distinct stages:
1. **Instagram Comments**: Top of funnel engagement captured via Meta Webhook or Manychat.
2. **DMs Sent**: Automated messages sent to user inbox.
3. **DM Button Clicks**: CTR from DM button into the website.
4. **Page Visits**: Unique visitor sessions logged on the web page.
5. **Download Clicks (Intent)**: User actively clicked the download button.
6. **Files Served (Delivery)**: Server or storage proxy confirmed successful stream/redirect.
7. **Email Signups (Leads)**: User voluntarily opted into weekly updates.

---

## 4. Key Functional Requirements

### 4.1 Resource Catalog & Public Pages
- Permanent URL format: `/r/[slug]` (e.g., `/r/rag-starter-kit`, `/r/system-design-primer`).
- Fallback route: If slug does not exist, friendly 404 with search suggestions.
- Editorial resource landing page:
  - Header with Category, Badge, Verified File Type & Size.
  - Table of Contents preview.
  - Interactive Code Snippet with one-click copy and syntax clarity.
  - Sample Prompts box with copy functionality.
  - Primary Download CTA card triggering `/api/download/[slug]` with intent logging.
  - Related resources strip.

### 4.2 Resource Manager (Admin UI & CLI)
- **UI at `/resources/manage`**:
  - Full catalog listing with search, category filtering, and status badges.
  - Modal form to Add or Edit resources (ID, Title, Category, Keyword, Description, Storage URL, Tags).
  - Storage provider selector (Google Drive vs. Cloudflare R2).
  - Tracking link generator: automatic builder for Manychat buttons with UTM parameters (`?utm_source=instagram&utm_medium=dm&utm_campaign=reel_01&utm_term=RAG`).
  - Link verification button: tests if the Google Drive link is public and downloadable without 403/404.
- **CLI tool (`npm run resource:cli`)**:
  - `list`: Show all resources in terminal table.
  - `validate`: Check HTTP status of all configured storage URLs.
  - `add`: Interactive wizard to append a new resource.
  - `export`: Export catalog as JSON or CSV.

### 4.3 Meta Account Linkage Plugin
- OAuth 2.0 flow with Meta App:
  - Exchange authorization code for short-lived user token.
  - Exchange short-lived token for 60-day Long-Lived User Access Token.
  - Fetch connected Instagram Business Account IDs and Facebook Page Access Tokens.
- Real-Time Webhooks:
  - GET `/api/plugins/meta/webhook` for Meta Hub Challenge verification.
  - POST `/api/plugins/meta/webhook` for comment and mention events.
  - Verifies `X-Hub-Signature-256` HMAC SHA-256 using App Secret.
  - Match comment text to Resource trigger keyword (e.g., "RAG", "SYSTEM", "PYTHON").
  - Trigger Manychat or Instagram Graph API Private Reply DM with the tracked resource link.
- Diagnostic Status Card:
  - Token expiration countdown.
  - Permission check (`instagram_basic`, `instagram_manage_comments`, `instagram_manage_messages`, `pages_show_list`).

### 4.4 Plugins Library & Extensibility SDK
- **Plugins Store & Registry at `/plugins`**:
  - Browse installed plugins: Meta Account Linkage, Manychat Automation Bridge, Dual-Storage Provider (R2/Drive), Webhook Dispatcher (Zapier/Make).
  - Enable/Disable toggle per plugin with instant state persistence.
  - Plugin settings modal for credentials and endpoint URLs.
  - "Install Custom Plugin" via JSON manifest URL or local package.
- **Developer Plugin SDK (`lib/plugins/sdk.ts`)**:
  - Standard hooks:
    - `onResourceVisit`: Triggered when an audience member lands on a resource page.
    - `onDownloadIntent`: Triggered when user clicks the download CTA.
    - `onFileServed`: Triggered when storage redirects/delivers file.
    - `onLeadCaptured`: Triggered when newsletter form is submitted.
    - `onCommentReceived`: Triggered when Meta webhook receives an Instagram comment.

### 4.5 Visual Design System: Creamy & White Editorial
- **Strict Anti-Slop Directive**:
  - **NO** dark cyberpunk backgrounds with neon fuchsia/cyan glowing borders.
  - **NO** gratuitous rainbow AI gradients.
  - **YES**: Warm alabaster (`#FAF8F5`), ivory, soft cream paper textures (`#F4EFEA`), rich espresso headings (`#1C1917`), warm stone neutrals (`#44403C`, `#78716C`), elegant cognac/amber accents (`#B45309`), refined borders (`#E7E1D8`), and tactile publication-grade typography.

---

## 5. Non-Functional Requirements & Security
- **Performance**: LCP < 1.2s on mobile 4G networks.
- **SEO & Social Sharing**: OpenGraph tags with custom title, description, and preview image for every resource URL when shared across WhatsApp, Telegram, or LinkedIn.
- **Webhook Security**: All Meta webhook calls verified via HMAC SHA-256 signature against `META_APP_SECRET`.
- **Environment Isolation**: Zero hardcoded secrets. All credentials loaded via `.env` with fallback mocking in sandbox mode.
- **Containerization**: Standalone Docker image < 180MB using multi-stage Alpine Node 20.
- **Serverless / Edge Ready**: Zero blocking filesystem calls on runtime; compatible with Vercel serverless functions.
