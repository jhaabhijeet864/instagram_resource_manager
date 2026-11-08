// ==============================================================================
// MASTER RESOURCE CATALOG & BRAND CONFIGURATION
// Clean Software Engineering, Distributed Systems, Python, and Architectures.
// Zero AI buzzwords.
//
// Google Drive is the verified master copy storage behind this catalog.
// The public URLs (/r/<slug>) remain permanent across all social posts.
// ==============================================================================

export interface TechnicalSpec {
  title: string;
  detail: string;
}

export interface CodeSnippet {
  title: string;
  language: string;
  code: string;
}

export interface Resource {
  slug: string; // public URL slug: /r/<slug>
  id: string;
  resource_id: string; // e.g. RES-001
  title: string;
  category: string;
  badge?: string;
  keyword: string; // Instagram comment trigger keyword
  description: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  storageUrl: string; // Google Drive master copy
  tags: string[];
  specs?: TechnicalSpec[];
  samplePrompts?: { title: string; prompt: string }[]; // backward compatibility
  codeSnippet?: CodeSnippet;
  highlights?: string[];
  tableOfContents?: string[];
  updatedDate: string;
}

export interface Profile {
  name: string;
  handle: string;
  instagramUrl: string;
  tagline: string;
  bio: string;
  avatar: string;
  driveFolder: string;
}

export interface BenchmarkCampaign {
  campaign_id: string;
  resource_id: string;
  resource_slug: string;
  instagram_post: string;
  keyword: string;
  dm_sent: number;
  dm_clicks: number;
  page_visits: number;
  download_clicks: number;
  successful_downloads: number;
  email_signups: number;
}

export const PROFILE: Profile = {
  name: "Engineering & Architecture Creator",
  handle: "tech_architect",
  instagramUrl: "https://instagram.com/tech_architect",
  tagline: "High-scale System Architecture, Distributed Systems & Backend Engineering 🚀",
  bio: "Production architecture diagrams, backend blueprints, and runnable code templates distributed directly from Instagram Reels to verified Google Drive master vaults.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  driveFolder: "https://drive.google.com/drive/folders/your-folder-id-here",
};

export const CATEGORIES: string[] = [
  "All",
  "System Architecture",
  "Python & Automation",
  "Distributed Systems",
  "Software Engineering",
  "Databases & Storage",
  "Templates & Blueprints",
];

// =============================================================================
// MASTER RESOURCES CATALOG (Table A)
// =============================================================================
export const RESOURCES: Resource[] = [
  {
    slug: "distributed-search-pipeline",
    id: "distributed-search-pipeline",
    resource_id: "RES-001",
    title: "Distributed Search & Indexing Engine: Architecture & Pipeline",
    category: "System Architecture",
    badge: "🔥 Flagship Blueprint",
    keyword: "SEARCH",
    description:
      "Production-grade architecture blueprint for low-latency search, hybrid sparse-dense indexing, parent-child document chunking, and distributed cache invalidation.",
    fileName: "Distributed_Search_Pipeline.pdf",
    fileSize: "3.2 MB",
    fileType: "PDF + Blueprint",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Search", "Distributed Systems", "Indexing", "Python"],
    highlights: [
      "Hybrid Indexing: BM25 sparse + inverted index",
      "Hierarchical document chunking strategies",
      "Sub-20ms p99 query latency pipeline",
      "Production Python reference repository",
    ],
    tableOfContents: [
      "High-throughput indexing topologies",
      "Document ingestion & normalization workers",
      "Distributed inverted index partitioning",
      "Cache invalidation with Redis & PubSub",
      "Observability & p99 latency SLOs",
    ],
    codeSnippet: {
      title: "search_indexer.py",
      language: "Python",
      code: `import redis
from dataclasses import dataclass
from typing import List, Dict

@dataclass
class IndexNode:
    partition_id: str
    host: str
    port: int

class SearchClusterRouter:
    def __init__(self, nodes: List[IndexNode]):
        self.nodes = nodes
        self.cache = redis.Redis(host='localhost', port=6379, db=0)

    def route_query(self, query: str, top_k: int = 10) -> Dict:
        cache_key = f"q:{hash(query)}"
        cached = self.cache.get(cache_key)
        if cached:
            return {"source": "cache_hit", "payload": cached}
        # Dispersed scatter-gather across index partitions
        # Aggregates scores and sets TTL cache
        return {"source": "live_partition_gather", "status": "200_OK"}`,
    },
    specs: [
      {
        title: "Latency SLA & Target Throughput",
        detail: "Engineered for 12,000 queries per second with p99 latency strictly < 35ms across 4 distributed partitions.",
      },
      {
        title: "Cache Invalidation Policy",
        detail: "Probabilistic early expiration with Redis single-flight lock to eliminate thundering herd spikes during index refreshes.",
      },
    ],
    updatedDate: "Updated recently",
  },
  {
    slug: "system-design-primer",
    id: "system-design-primer",
    resource_id: "RES-002",
    title: "System Design Blueprint: Microservices, Sharding & Caching",
    category: "System Architecture",
    badge: "⭐ Essential",
    keyword: "DESIGN",
    description:
      "Comprehensive visual diagrams and cheatsheet on Microservices topologies, Redis cache tiers, Layer 7 Load Balancing, and Database Sharding.",
    fileName: "System_Design_Blueprint.pdf",
    fileSize: "4.1 MB",
    fileType: "PDF + Diagram",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["System Design", "Microservices", "Databases", "Caching"],
    highlights: [
      "12 core backend architecture blueprints",
      "Cache invalidation decision tree",
      "Consistent hashing & replication strategies",
      "Zero-downtime database migration schema",
    ],
    tableOfContents: [
      "CAP theorem trade-offs in real production",
      "Distributed rate limiting algorithms (Token Bucket)",
      "Database read replicas and sharding keys",
      "Event-driven architecture with Apache Kafka",
      "Circuit breakers and graceful degradation",
    ],
    codeSnippet: {
      title: "rate_limiter.py",
      language: "Python",
      code: `import time

class TokenBucketRateLimiter:
    def __init__(self, capacity: int, fill_rate: float):
        self.capacity = float(capacity)
        self.tokens = float(capacity)
        self.fill_rate = fill_rate
        self.last_update = time.time()

    def allow_request(self, tokens: int = 1) -> bool:
        now = time.time()
        elapsed = now - self.last_update
        self.last_update = now
        self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate)
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False`,
    },
    specs: [
      {
        title: "Distributed Rate Limiting",
        detail: "Token Bucket algorithm implementation with Redis atomic Lua scripts for sub-millisecond concurrency limits.",
      },
    ],
    updatedDate: "Updated this month",
  },
  {
    slug: "python-automation-scripts",
    id: "python-automation-scripts",
    resource_id: "RES-003",
    title: "Python Automation Vault: 25 Ready-to-Run Production Scripts",
    category: "Python & Automation",
    badge: "🐍 Code Pack",
    keyword: "PYTHON",
    description:
      "25 plug-and-play Python scripts for resilient web scraping, automated database backups, file sorting, and webhook alerting.",
    fileName: "Python_Automation_Vault.zip",
    fileSize: "1.8 MB",
    fileType: "ZIP Archive",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Python", "Automation", "Scripts", "DevOps"],
    highlights: [
      "Asynchronous web scraping with httpx",
      "Automated PostgreSQL backup & S3 sync",
      "Zero-dependency file organizers",
      "Production cron scheduling wrappers",
    ],
    tableOfContents: [
      "Resilient HTTP requests with exponential backoff",
      "Automated CSV & JSON data cleansing",
      "PostgreSQL dump rotation and encryption",
      "System health monitoring & Slack alerts",
    ],
    codeSnippet: {
      title: "resilient_client.py",
      language: "Python",
      code: `import asyncio
import httpx

async def fetch_with_backoff(url: str, max_retries: int = 3):
    async with httpx.AsyncClient(timeout=10.0) as client:
        for attempt in range(max_retries):
            try:
                response = await client.get(url)
                response.raise_for_status()
                return response.json()
            except (httpx.HTTPError, httpx.TimeoutException) as exc:
                if attempt == max_retries - 1:
                    raise exc
                await asyncio.sleep(2 ** attempt)`,
    },
    updatedDate: "Updated recently",
  },
  {
    slug: "algorithms-data-structures-cheatsheet",
    id: "algorithms-data-structures-cheatsheet",
    resource_id: "RES-004",
    title: "High-Performance Algorithms & Data Structures Cheatsheet",
    category: "Software Engineering",
    badge: "📊 Cheatsheet",
    keyword: "ALGO",
    description:
      "Time/space complexities, tree traversals, dynamic programming patterns, and graph algorithms visualized for software engineers.",
    fileName: "Algorithms_DS_Cheatsheet.pdf",
    fileSize: "2.8 MB",
    fileType: "PDF Cheatsheet",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Algorithms", "Data Structures", "Engineering"],
    highlights: [
      "Big-O complexity visual matrix",
      "Top 14 coding interview patterns",
      "Graph shortest path comparison",
    ],
    tableOfContents: [
      "Sliding window & two pointer paradigms",
      "Fast & slow pointer cycle detection",
      "Graph algorithms (BFS, DFS, Dijkstra)",
      "Dynamic programming memoization trees",
    ],
    updatedDate: "Updated recently",
  },
  {
    slug: "technical-creator-storyboards",
    id: "technical-creator-storyboards",
    resource_id: "RES-005",
    title: "Technical Content Architecture & Carousel Storyboards",
    category: "Templates & Blueprints",
    badge: "🚀 High Retention",
    keyword: "CAROUSEL",
    description:
      "High-retention storyboards, code breakdown templates, and architectural carousel frameworks designed for technical engineering educators.",
    fileName: "Technical_Creator_Blueprints.pdf",
    fileSize: "1.4 MB",
    fileType: "PDF + Storyboards",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Content", "Engineering", "Storyboards"],
    highlights: [
      "Technical carousel frame templates",
      "Visual diagram formatting rules",
      "High-retention code slide layouts",
    ],
    tableOfContents: [
      "The 3-second hook for technical topics",
      "Structuring architectural progression",
      "Highlighting code snippets clearly",
      "Effective DM keyword trigger placement",
    ],
    updatedDate: "Updated recently",
  },
  {
    slug: "fullstack-saas-template",
    id: "fullstack-saas-template",
    resource_id: "RES-006",
    title: "Fullstack SaaS Architecture Template & Checklist",
    category: "Software Engineering",
    badge: "🛠️ Template",
    keyword: "SAAS",
    description:
      "Step-by-step production architecture checklist covering authentication, billing (Stripe), database migrations, and CI/CD deployment.",
    fileName: "SaaS_Production_Checklist.pdf",
    fileSize: "1.5 MB",
    fileType: "PDF Checklist",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Software Engineering", "SaaS", "Fullstack", "PostgreSQL"],
    highlights: [
      "Auth & session security audit checklist",
      "Stripe webhook idempotent processing",
      "Zero-downtime database migrations",
      "Dockerized production deployment",
    ],
    tableOfContents: [
      "Authentication and session tokens",
      "Stripe subscription state machines",
      "PostgreSQL connection pooling with PgBouncer",
      "Zero-downtime CI/CD deployment pipelines",
    ],
    updatedDate: "Updated recently",
  },
];

// Helper lookups
export function getResourceBySlug(slug: string): Resource | undefined {
  return RESOURCES.find((r) => r.slug === slug || r.id === slug);
}

export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function matchesKeyword(text: string, keyword: string): boolean {
  if (!text || !keyword) return false;
  const kw = keyword.trim().toLowerCase();
  if (!kw) return false;
  const regex = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, "i");
  return regex.test(text);
}

export function findResourceByKeyword(text: string): Resource | undefined {
  if (!text || !text.trim()) return undefined;
  for (const r of RESOURCES) {
    if (r.keyword && matchesKeyword(text, r.keyword)) {
      return r;
    }
  }
  return undefined;
}

export interface BenchmarkCampaign {
  campaign_id: string;
  resource_id: string;
  resource_slug: string;
  instagram_post: string;
  keyword: string;
  dm_sent: number;
  dm_clicks: number;
  page_visits: number;
  download_clicks: number;
  successful_downloads: number;
  email_signups: number;
  created_at: string;
}

export const BENCHMARK_CAMPAIGNS: BenchmarkCampaign[] = [
  {
    campaign_id: "IG-001",
    resource_id: "RES-001",
    resource_slug: "distributed-search-pipeline",
    instagram_post: "Carousel: Distributed Indexing Topologies",
    keyword: "SEARCH",
    dm_sent: 250,
    dm_clicks: 180,
    page_visits: 145,
    download_clicks: 110,
    successful_downloads: 103,
    email_signups: 42,
    created_at: "2026-10-18",
  },
  {
    campaign_id: "IG-002",
    resource_id: "RES-001",
    resource_slug: "distributed-search-pipeline",
    instagram_post: "Reel: Low-Latency Query Pipelines",
    keyword: "QUERY",
    dm_sent: 320,
    dm_clicks: 240,
    page_visits: 195,
    download_clicks: 155,
    successful_downloads: 148,
    email_signups: 58,
    created_at: "2026-10-22",
  },
  {
    campaign_id: "IG-003",
    resource_id: "RES-001",
    resource_slug: "distributed-search-pipeline",
    instagram_post: "Post: Cache Invalidation with Redis",
    keyword: "CACHE",
    dm_sent: 180,
    dm_clicks: 125,
    page_visits: 98,
    download_clicks: 72,
    successful_downloads: 69,
    email_signups: 26,
    created_at: "2026-10-28",
  },
  {
    campaign_id: "IG-004",
    resource_id: "RES-002",
    resource_slug: "system-design-primer",
    instagram_post: "Carousel: System Design Fundamentals",
    keyword: "DESIGN",
    dm_sent: 410,
    dm_clicks: 310,
    page_visits: 260,
    download_clicks: 215,
    successful_downloads: 202,
    email_signups: 84,
    created_at: "2026-11-01",
  },
  {
    campaign_id: "IG-005",
    resource_id: "RES-003",
    resource_slug: "python-automation-scripts",
    instagram_post: "Reel: 25 Python Automation Scripts",
    keyword: "PYTHON",
    dm_sent: 500,
    dm_clicks: 420,
    page_visits: 380,
    download_clicks: 310,
    successful_downloads: 298,
    email_signups: 112,
    created_at: "2026-11-03",
  },
  {
    campaign_id: "IG-006",
    resource_id: "RES-004",
    resource_slug: "algorithms-data-structures-cheatsheet",
    instagram_post: "Post: Algorithms & Data Structures Cheatsheet",
    keyword: "ALGO",
    dm_sent: 220,
    dm_clicks: 160,
    page_visits: 130,
    download_clicks: 95,
    successful_downloads: 88,
    email_signups: 35,
    created_at: "2026-11-05",
  },
  {
    campaign_id: "IG-007",
    resource_id: "RES-005",
    resource_slug: "technical-creator-storyboards",
    instagram_post: "Carousel: 100+ Viral Prompts for Tech Creators",
    keyword: "CAROUSEL",
    dm_sent: 350,
    dm_clicks: 275,
    page_visits: 220,
    download_clicks: 178,
    successful_downloads: 169,
    email_signups: 62,
    created_at: "2026-11-06",
  },
];
