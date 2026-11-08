// ==============================================================================
// MASTER RESOURCE CATALOG & BRAND CONFIGURATION
// Organized by Roadmap Categories:
// AI, Machine Learning, Python, Software Engineering, System Design, Prompts, Templates
//
// Google Drive is just the replaceable backend storage behind this catalog!
// The public URLs (/r/<slug>) never change even when storage migrates.
//
// To add a resource: append an entry to RESOURCES below. The homepage,
// resource page, dashboard and download API all read from this single source.
// ==============================================================================

export interface SamplePrompt {
  title: string;
  prompt: string;
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
  storageUrl: string; // Google Drive master copy (later: Cloudflare R2)
  tags: string[];
  samplePrompts?: SamplePrompt[];
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
  name: "AI & Tech Creator",
  handle: "yourhandle", // without @
  instagramUrl: "https://instagram.com/yourhandle",
  tagline: "Helping you master AI, System Design & Python 🚀",
  bio: "Free guides, cheatsheets, and code templates from my Instagram reels. All resources are stored securely and updated weekly.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  driveFolder: "https://drive.google.com/drive/folders/your-folder-id-here",
};

export const CATEGORIES: string[] = [
  "All",
  "AI",
  "Machine Learning",
  "Python",
  "Software Engineering",
  "System Design",
  "Prompts",
  "Templates",
];

// =============================================================================
// MASTER RESOURCES CATALOG (Table A)
// Replace `storageUrl` placeholders with your real Google Drive file links.
// =============================================================================
export const RESOURCES: Resource[] = [
  {
    slug: "rag-starter-kit",
    id: "rag-starter-kit",
    resource_id: "RES-001",
    title: "RAG Starter Kit: Practical Guide & Code",
    category: "AI",
    badge: "🔥 Featured",
    keyword: "RAG",
    description:
      "A practical, production-ready guide to Retrieval-Augmented Generation using LangChain, ChromaDB, and OpenAI embeddings with hybrid semantic search and reranking.",
    fileName: "RAG_Starter_Kit.pdf",
    fileSize: "2.4 MB",
    fileType: "PDF Guide",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["RAG", "LLM", "VectorDB", "Generative AI"],
    highlights: [
      "Hybrid Search: Dense Vector + BM25",
      "Parent-child semantic chunking",
      "Cohere reranking integration",
      "Production Python repo included",
    ],
    tableOfContents: [
      "Why RAG beats fine-tuning",
      "Chunking strategies that actually work",
      "Building the vector index (ChromaDB)",
      "Hybrid retrieval & reranking",
      "Zero-hallucination prompt guards",
    ],
    codeSnippet: {
      title: "rag_pipeline.py",
      language: "Python",
      code: `import chromadb
from chromadb.utils import embedding_functions

client = chromadb.PersistentClient(path="./vectors")
openai_ef = embedding_functions.OpenAIEmbeddingFunction(
    model_name="text-embedding-3-small"
)
collection = client.get_or_create_collection("docs", embedding_function=openai_ef)

def hybrid_retrieve(query: str, top_k: int = 5):
    # 1) Dense semantic search
    dense = collection.query(query_texts=[query], n_results=top_k)
    # 2) Splice in BM25 sparse keyword results (see guide Ch. 3)
    # 3) Rerank merged candidates and inject context into prompt guard
    return dense["documents"][0]`,
    },
    samplePrompts: [
      {
        title: "RAG System Architecture Prompt",
        prompt:
          "Act as a Senior AI Architect. Design a production-grade RAG pipeline for processing 50,000 PDF technical documents. Include chunking strategy (semantic vs fixed-size), hybrid search (dense + sparse BM25), reranking, and hallucination reduction mechanisms.",
      },
      {
        title: "Context Injection Template",
        prompt:
          "Given the following extracted context fragments:\\n--- \\n{context}\\n---\\nAnswer the user query accurately: '{question}'. If the answer cannot be deduced strictly from the context, respond with 'Information not found in provided sources'.",
      },
    ],
    updatedDate: "Updated recently",
  },
  {
    slug: "system-design-primer",
    id: "system-design-primer",
    resource_id: "RES-002",
    title: "System Design Blueprint & Architecture Patterns",
    category: "System Design",
    badge: "⭐ Essential",
    keyword: "DESIGN",
    description:
      "Comprehensive visual diagrams and cheatsheet on Microservices, Caching (Redis), Load Balancing, and Database Sharding.",
    fileName: "System_Design_Blueprint.pdf",
    fileSize: "4.1 MB",
    fileType: "PDF + Diagram",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["System Design", "Architecture", "Microservices"],
    highlights: [
      "12 core architecture patterns",
      "Cache invalidation decision tree",
      "Sharding & replication strategies",
    ],
    samplePrompts: [
      {
        title: "System Design Interview Prep",
        prompt:
          "Walk me through designing a global URL shortener (like TinyURL) capable of handling 100M new URLs created per month. Detail API endpoints, data models, cache invalidation, and collision avoidance.",
      },
    ],
    updatedDate: "Updated this month",
  },
  {
    slug: "python-automation-scripts",
    id: "python-automation-scripts",
    resource_id: "RES-003",
    title: "Python Automation Vault: 25 Ready-to-Run Scripts",
    category: "Python",
    badge: "🐍 Code Pack",
    keyword: "PYTHON",
    description:
      "25 plug-and-play Python scripts for web scraping, automated email reporting, file sorting, and API data extraction.",
    fileName: "Python_Automation_Vault.zip",
    fileSize: "1.8 MB",
    fileType: "ZIP Archive",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Python", "Automation", "Scripts"],
    highlights: [
      "Web scraping with httpx + BeautifulSoup",
      "Automated email & report generation",
      "Zero-dependency file organizers",
    ],
    samplePrompts: [
      {
        title: "Web Scraper Script Template",
        prompt:
          "Write a resilient Python script using httpx and BeautifulSoup that scrapes a product catalog, handles pagination, respects robots.txt, and exports cleaned data to a CSV file.",
      },
    ],
    updatedDate: "Updated recently",
  },
  {
    slug: "ml-math-cheatsheet",
    id: "ml-math-cheatsheet",
    resource_id: "RES-004",
    title: "Machine Learning Math & Intuition Cheatsheet",
    category: "Machine Learning",
    badge: "📊 Cheatsheet",
    keyword: "ML",
    description:
      "Linear algebra, calculus, and probability concepts visualised for machine learning practitioners and interviewees.",
    fileName: "ML_Math_Cheatsheet.pdf",
    fileSize: "3.2 MB",
    fileType: "PDF Cheatsheet",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Machine Learning", "Math", "Cheatsheet"],
    highlights: [
      "Gradient descent visualized",
      "Every ML interview formula in one page",
    ],
    samplePrompts: [
      {
        title: "Gradient Descent Intuition",
        prompt:
          "Explain Gradient Descent with momentum and Adam optimizer using a ball rolling down a hilly terrain analogy. Include the mathematical formulation and why learning rate annealing helps convergence.",
      },
    ],
    updatedDate: "Updated recently",
  },
  {
    slug: "viral-creator-prompts",
    id: "viral-creator-prompts",
    resource_id: "RES-005",
    title: "100+ Viral Prompts for Tech & Software Creators",
    category: "Prompts",
    badge: "🚀 High Retention",
    keyword: "PROMPT",
    description:
      "Hooks, carousel scripts, and code breakdown prompts designed to turn complex technical topics into viral social posts.",
    fileName: "Viral_Prompts_Vault.pdf",
    fileSize: "1.2 MB",
    fileType: "PDF + Prompts",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Prompts", "Content Creation", "ChatGPT"],
    highlights: [
      "Hook formulas with retention data",
      "Carousel storyboarding prompts",
    ],
    samplePrompts: [
      {
        title: "Technical Reel Hook Generator",
        prompt:
          "Generate 5 high-converting Instagram reel hooks about [TECHNICAL TOPIC]. Each hook must state a common beginner misconception and tease a 10x better alternative.",
      },
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
      "Step-by-step production checklist covering authentication, billing (Stripe), database migrations, and CI/CD deployment.",
    fileName: "SaaS_Production_Checklist.pdf",
    fileSize: "1.5 MB",
    fileType: "PDF Checklist",
    storageUrl: "https://drive.google.com/drive/folders/your-folder-id-here",
    tags: ["Software Engineering", "SaaS", "Fullstack"],
    highlights: [
      "Auth & security audit checklist",
      "Stripe billing edge cases",
    ],
    samplePrompts: [
      {
        title: "Security & Auth Audit Checklist",
        prompt:
          "Provide a comprehensive 10-point checklist for auditing JWT session handling, CSRF protection, and database connection pooling before launching a web application.",
      },
    ],
    updatedDate: "Updated recently",
  },
];

// =============================================================================
// BENCHMARK CAMPAIGN DATA (Table B - seed from supabase/schema.sql)
// Used to seed the analytics dashboard with comparison benchmarks. Live events
// from real visitors are aggregated alongside these in the dashboard.
// =============================================================================
export const BENCHMARK_CAMPAIGNS: BenchmarkCampaign[] = [
  { campaign_id: "IG-001", resource_id: "RES-001", resource_slug: "rag-starter-kit", instagram_post: "RAG carousel", keyword: "RAG", dm_sent: 250, dm_clicks: 180, page_visits: 145, download_clicks: 110, successful_downloads: 103, email_signups: 42 },
  { campaign_id: "IG-002", resource_id: "RES-001", resource_slug: "rag-starter-kit", instagram_post: "Reel: Vector DBs Explained", keyword: "VECTOR", dm_sent: 320, dm_clicks: 240, page_visits: 195, download_clicks: 155, successful_downloads: 148, email_signups: 58 },
  { campaign_id: "IG-003", resource_id: "RES-001", resource_slug: "rag-starter-kit", instagram_post: "Post: Building Your First AI Agent", keyword: "AGENT", dm_sent: 180, dm_clicks: 125, page_visits: 98, download_clicks: 72, successful_downloads: 69, email_signups: 26 },
  { campaign_id: "IG-004", resource_id: "RES-002", resource_slug: "system-design-primer", instagram_post: "System Design Carousel", keyword: "DESIGN", dm_sent: 410, dm_clicks: 310, page_visits: 260, download_clicks: 215, successful_downloads: 202, email_signups: 84 },
  { campaign_id: "IG-005", resource_id: "RES-003", resource_slug: "python-automation-scripts", instagram_post: "25 Python Scripts Reel", keyword: "PYTHON", dm_sent: 500, dm_clicks: 420, page_visits: 380, download_clicks: 310, successful_downloads: 298, email_signups: 112 },
];

// Helper lookups
export function getResourceBySlug(slug: string): Resource | undefined {
  return RESOURCES.find((r) => r.slug === slug || r.id === slug);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
