# 🏗️ System Architecture & Data Flow

## 1. High-Level Architecture Overview

DevResource separates audience traffic, resource metadata, storage delivery, and plugin extensions into independent decoupled tiers:

```mermaid
graph TD
    subgraph ClientLayer["Audience & Admin Clients"]
        IG["Instagram App (Reels / DMs)"]
        MobileUser["Mobile Browser (Audience)"]
        DesktopAdmin["Desktop Browser (Creator Admin)"]
    end

    subgraph EdgeLayer["Edge & Ingress (Vercel / Reverse Proxy)"]
        VercelCDN["Vercel Edge Network / Caching"]
        SecurityHeaders["Security & CSP Layer"]
    end

    subgraph AppLayer["Next.js 14 Application Tier"]
        PublicApp["Public Editorial Pages (/r/[slug], /)"]
        AdminApp["Resource Manager & Plugins Hub (/resources/manage, /plugins)"]
        APIRoutes["Next.js Route Handlers (/api/*)"]
        PluginRegistry["Plugin Engine & Lifecycle Registry"]
    end

    subgraph PluginsTier["Plugin Integration Tier"]
        MetaPlugin["Meta Account Linkage Plugin (OAuth & Webhooks)"]
        ManychatPlugin["Manychat Bridge Plugin"]
        StoragePlugin["Dual Storage Switcher (Drive / R2)"]
        WebhookPlugin["Outbound Webhook Dispatcher"]
    end

    subgraph StorageLayer["Decoupled Storage & External Services"]
        GDrive["Google Drive (Master Copies)"]
        R2["Cloudflare R2 (CDN Object Storage)"]
        Supabase["Supabase / PostgreSQL (Events & Leads)"]
        MetaAPI["Meta Graph API (Instagram Business)"]
    end

    IG -->|Click DM link with UTM| VercelCDN
    MobileUser --> VercelCDN
    DesktopAdmin --> VercelCDN

    VercelCDN --> SecurityHeaders --> PublicApp
    VercelCDN --> SecurityHeaders --> AdminApp
    VercelCDN --> SecurityHeaders --> APIRoutes

    APIRoutes --> PluginRegistry
    PluginRegistry --> MetaPlugin
    PluginRegistry --> ManychatPlugin
    PluginRegistry --> StoragePlugin
    PluginRegistry --> WebhookPlugin

    MetaPlugin <-->|OAuth 2.0 & Webhooks| MetaAPI
    StoragePlugin -->|Proxy / Redirect| GDrive
    StoragePlugin -->|Presigned URLs| R2
    APIRoutes -->|Analytics / Leads| Supabase
```

---

## 2. Request Lifecycles

### 2.1 The Lead-to-Download Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Instagram User
    participant IG as Meta / Instagram
    participant MC as Manychat Automation
    participant Web as DevResource Web (/r/[slug])
    participant API as Download API (/api/download/[slug])
    participant Storage as Google Drive / Cloudflare R2
    participant DB as Analytics DB

    User->>IG: Comments trigger keyword e.g. "RAG"
    IG->>MC: Webhook: Comment detected
    MC->>User: Sends automated DM with tracked link: /r/rag-starter-kit?utm_campaign=reel_rag
    User->>Web: Opens link in mobile browser
    Web->>DB: Logs Page Visit Event (Campaign: reel_rag, Slug: rag-starter-kit)
    Web-->>User: Renders creamy editorial preview (TOC, Code, Prompts)
    User->>Web: Clicks "DOWNLOAD RESOURCE" button
    Web->>API: POST /api/download/rag-starter-kit (with UTM payload)
    API->>DB: Logs "DOWNLOAD_CLICK" (Intent Recorded)
    API->>Storage: Validates file target & resolves direct delivery URL
    API->>DB: Logs "DOWNLOAD_SUCCESS" (Delivery Confirmed)
    API-->>User: 302 Redirect to verified file / Stream binary
```

---

## 3. Meta Account Linkage Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Creator as Creator Admin
    participant App as DevResource Admin (/plugins)
    participant MetaOAuth as Meta OAuth 2.0 Dialog
    participant MetaGraph as Meta Graph API (v19.0+)
    participant WebhookHandler as /api/plugins/meta/webhook

    Creator->>App: Clicks "Connect Meta Account"
    App->>MetaOAuth: Redirects with scopes: instagram_basic, instagram_manage_comments, etc.
    MetaOAuth-->>App: Redirects back to /api/plugins/meta/callback?code=...
    App->>MetaGraph: Exchange code for Short-Lived User Token
    App->>MetaGraph: Exchange for 60-Day Long-Lived User Token
    App->>MetaGraph: GET /me/accounts -> Fetch Facebook Pages
    App->>MetaGraph: GET /{page-id}?fields=instagram_business_account
    App-->>Creator: Account Linked Successfully! Shows Account ID & Expiry

    Note over MetaGraph, WebhookHandler: Real-time Comment Automation
    MetaGraph->>WebhookHandler: POST comment event (Verified with HMAC-SHA256)
    WebhookHandler->>WebhookHandler: Check comment text for Keyword match (e.g. "RAG")
    WebhookHandler->>MetaGraph: POST /{comment-id}/replies (Private Reply DM with link)
```

---

## 4. Storage Decoupling Specification

One of the foundational design rules of DevResource is that **Google Drive is never exposed as an unmanaged hardcoded link across marketing channels**.

| Layer | Implementation | Benefit |
| :--- | :--- | :--- |
| **Public Slug Layer** | `/r/rag-starter-kit` | Permanent public link; safe to post on Instagram Reels, print on QR codes, or automate in DMs. |
| **Catalog Metadata** | `lib/catalog.ts` | Central source of truth for file names, sizes, categories, and keyword triggers. |
| **Storage Resolver** | `plugins/storage-r2-gdrive` | Switches dynamically between Google Drive direct download and Cloudflare R2 presigned URLs. |
| **Delivery Engine** | `/api/download/[slug]` | Logs analytics *before* redirecting, validates storage reachability, and protects direct file URLs from scrapers. |

---

## 5. Security & Threat Model Mitigations

1. **Meta Webhook Signature Verification**:
   - Every inbound POST to `/api/plugins/meta/webhook` validates header `X-Hub-Signature-256`.
   - Uses `crypto.createHmac('sha256', META_APP_SECRET)` against raw request buffer.
   - Rejects mismatched signatures with HTTP 401 Unauthorized.
2. **Preventing Open Redirects**:
   - The `/api/download/[slug]` endpoint strictly matches the slug against the registered resource catalog whitelist.
   - External arbitrary redirect targets are prohibited.
3. **Cross-Site Scripting (XSS) Prevention**:
   - Strict Content Security Policy configured in `vercel.json` and `next.config.mjs`.
   - All sample code and prompts sanitized and rendered safely via React.
4. **Rate Limiting**:
   - Download endpoints and newsletter submission endpoints are rate-limited per IP to prevent storage egress abuse.
