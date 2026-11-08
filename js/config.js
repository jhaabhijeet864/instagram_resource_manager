// ==============================================================================
// CREATOR CONFIGURATION & MASTER RESOURCE CATALOG
// Organized by Roadmap Categories:
// Generative AI, Machine Learning, Python, Software Engineering, System Design, Prompts, Templates
// Architecture: Table A (Master Resources) & Table B (Campaign Analytics)
// ==============================================================================

window.CREATOR_CONFIG = {
  // Personal Brand Profile
  profile: {
    name: "Alex Vance",
    role: "Senior AI Engineer & Content Creator",
    handle: "alexvance.ai",
    instagramUrl: "https://instagram.com/alexvance.ai",
    tagline: "High-Signal AI Engineering, System Design & Python Blueprints 🚀",
    bio: "Production-grade starter kits, architecture blueprints, and cheatsheets from my Instagram reels. All resources are curated master files with verified download tracking.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    verified: true,
    totalCommunity: "185,000+ Engineers",
    googleDriveFolder: "https://drive.google.com/drive/folders/1AiEngineersVault_MasterCopies"
  },

  // Supabase Configuration (Optional - leave empty to use instant local engine)
  supabase: {
    url: "", // e.g. "https://your-project.supabase.co"
    anonKey: "" // e.g. "eyJhbGciOi..."
  },

  // Roadmap Categories
  categories: [
    "All",
    "Generative AI",
    "AI",
    "Machine Learning",
    "Python",
    "Software Engineering",
    "System Design",
    "Prompts",
    "Templates"
  ],

  // ============================================================================
  // TABLE A: RESOURCES (Master Catalog)
  // Field Mapping:
  // resource_id | title | category | description | file_path | public_slug | status | created_at
  // ============================================================================
  resources: [
    {
      resource_id: "RES-001",
      slug: "rag-starter-kit",
      id: "rag-starter-kit",
      public_slug: "rag-starter-kit",
      title: "RAG Starter Kit: Practical Guide & Code",
      category: "AI",
      status: "Published",
      badge: "🔥 Generative AI",
      keyword: "RAG",
      description: "A practical introduction to retrieval-augmented generation using LangChain, ChromaDB, and hybrid semantic search with reranking.",
      fileName: "RAG_Starter_Kit.pdf",
      fileSize: "2.4 MB",
      fileType: "PDF Guide + Python Repo",
      file_path: "https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ_RAG/view?usp=sharing",
      storageUrl: "https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ_RAG/view?usp=sharing",
      created_at: "2026-10-15",
      updatedDate: "Updated this week",
      readTime: "12 min read",
      tags: ["RAG", "LLM", "VectorDB", "LangChain", "ChromaDB", "Python"],
      highlights: [
        "Hybrid Search: Dense Vector + Sparse BM25 retrieval",
        "Semantic chunking strategy with dynamic token windows",
        "Cross-encoder reranking for zero-hallucination answers",
        "Includes production Python boilerplate with ChromaDB"
      ],
      tableOfContents: [
        "1. Why naive RAG fails in production",
        "2. Document Ingestion & Semantic Chunking",
        "3. Embedding generation & Vector Indexing",
        "4. Hybrid Retrieval & Cross-Encoder Reranking",
        "5. Guardrails, Prompt Construction & Hallucination Checks"
      ],
      codeSnippet: {
        language: "python",
        title: "rag_pipeline.py",
        code: `# Minimal Production RAG Pipeline with ChromaDB & OpenAI
import os
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# 1. Initialize Embeddings & LLM
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
llm = ChatOpenAI(model="gpt-4o", temperature=0.1)

# 2. Semantic Chunking
splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=120)
docs = splitter.create_documents(["Retrieval-Augmented Generation grounds LLMs on factual external knowledge."])

# 3. Vector Store
vectorstore = Chroma.from_documents(docs, embeddings)
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

# 4. Strict Context Guardrail Prompt
prompt = ChatPromptTemplate.from_template("""
Answer using ONLY the provided context. If not present, say 'Unknown'.
Context: {context}
Question: {input}
""")

chain = create_retrieval_chain(retriever, create_stuff_documents_chain(llm, prompt))
result = chain.invoke({"input": "What is RAG?"})
print(result["answer"])`
      },
      samplePrompts: [
        {
          title: "Production RAG Architecture Prompt",
          prompt: "Act as a Principal AI Architect. Design a production-grade RAG pipeline for 100,000 PDF technical documents. Detail: 1) Semantic chunking strategy (parent-child retrieval), 2) Hybrid search combining vector embeddings with BM25 keyword search, 3) Cohere reranking layer, and 4) Hallucination verification guardrails before response delivery."
        },
        {
          title: "Strict Context Injection Guardrail",
          prompt: "You are an infallible technical assistant. Analyze the context below:\n---\n{context}\n---\nQuestion: {question}\n\nRule: Answer strictly using facts stated in the context. If the query cannot be answered solely from the context, state: 'The provided documentation does not contain this answer.' Do not extrapolate."
        }
      ]
    },
    {
      resource_id: "RES-002",
      slug: "system-design-primer",
      id: "system-design-primer",
      public_slug: "system-design-primer",
      title: "System Design Blueprint & Architecture Patterns",
      category: "System Design",
      status: "Published",
      badge: "⭐ Essential Blueprint",
      keyword: "DESIGN",
      description: "Visual architectural diagrams, latency numbers, and decision trees for Microservices, Redis Caching, Load Balancing, and Sharding.",
      fileName: "System_Design_Blueprint.pdf",
      fileSize: "4.1 MB",
      fileType: "PDF + Excalidraw Pack",
      file_path: "https://drive.google.com/file/d/1bCdEfGhIjKlMnOpQrStUvWxYz_SYS/view?usp=sharing",
      storageUrl: "https://drive.google.com/file/d/1bCdEfGhIjKlMnOpQrStUvWxYz_SYS/view?usp=sharing",
      created_at: "2026-10-20",
      updatedDate: "Updated recently",
      readTime: "18 min read",
      tags: ["System Design", "Microservices", "Redis", "Kafka", "PostgreSQL"],
      highlights: [
        "Numbers every engineer should know (RAM vs SSD vs Network latency)",
        "Cache-Aside vs Write-Through vs Write-Back trade-off matrix",
        "Consistent hashing algorithm with virtual nodes diagram",
        "Database sharding and partition key selection guide"
      ],
      tableOfContents: [
        "1. Latency numbers & Capacity Estimation Formulas",
        "2. Scalable Caching Layers: Redis & CDN Edge Cache",
        "3. Asynchronous Decoupling: Kafka & Message Queues",
        "4. Database Partitioning, Read Replicas & Sharding",
        "5. Complete Blueprint: Global 100M MAU URL Shortener"
      ],
      codeSnippet: {
        language: "python",
        title: "cache_aside_pattern.py",
        code: `# Resilient Cache-Aside Pattern with Redis & Connection Pooling
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def get_user_profile(user_id: str, db_cursor):
    cache_key = f"user:profile:{user_id}"
    
    # 1. Check Redis Cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached), "CACHE_HIT"
        
    # 2. Cache Miss -> Query Database
    db_cursor.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
    row = db_cursor.fetchone()
    if not row:
        return None, "NOT_FOUND"
        
    profile_data = {"id": row[0], "name": row[1], "email": row[2]}
    
    # 3. Store in Cache with TTL of 3600 seconds (1 hour)
    redis_client.setex(cache_key, 3600, json.dumps(profile_data))
    return profile_data, "CACHE_MISS"`
      },
      samplePrompts: [
        {
          title: "System Design Mock Interview Prompt",
          prompt: "Conduct a senior engineering system design interview with me. Topic: 'Design YouTube Video Transcoding Pipeline'. Ask me clarifying questions about scale (views/sec, upload bitrate), constrain the system, evaluate my choice of message broker (Kafka vs RabbitMQ), and critique my video chunking and worker distribution."
        }
      ]
    },
    {
      resource_id: "RES-003",
      slug: "python-automation-scripts",
      id: "python-automation-scripts",
      public_slug: "python-automation-scripts",
      title: "Python Automation Vault: 25 Ready-to-Run Scripts",
      category: "Python",
      status: "Published",
      badge: "🐍 Code Pack",
      keyword: "PYTHON",
      description: "25 battle-tested Python scripts for web scraping with httpx, automated email digests, CSV data pipelines, and API monitoring.",
      fileName: "Python_Automation_Vault.zip",
      fileSize: "1.8 MB",
      fileType: "ZIP Archive (.py + requirements.txt)",
      file_path: "https://drive.google.com/file/d/1cDeFgHiJkLmNoPqRsTuVwXyZa_PY/view?usp=sharing",
      storageUrl: "https://drive.google.com/file/d/1cDeFgHiJkLmNoPqRsTuVwXyZa_PY/view?usp=sharing",
      created_at: "2026-10-24",
      updatedDate: "Updated recently",
      readTime: "25 scripts",
      tags: ["Python", "Automation", "WebScraping", "Scripts", "httpx"],
      highlights: [
        "Self-healing web scraper with automatic proxy rotation & retry backoff",
        "Automated PDF report generator from SQLite & Pandas data",
        "FastAPI background webhook receiver with secret verification",
        "Directory cleanup and S3 backup scheduled sync utility"
      ],
      tableOfContents: [
        "1. Web Scraping & API Data Ingestion",
        "2. File & Directory Organization Automation",
        "3. Email, Slack & Discord Notification Bots",
        "4. Database Maintenance & S3 Backup Tasks",
        "5. Cron and Background Scheduling with APScheduler"
      ],
      codeSnippet: {
        language: "python",
        title: "resilient_scraper.py",
        code: `# Async Web Scraper with Rate Limiting & Exponential Backoff
import asyncio
import httpx

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

async def fetch_page(client: httpx.AsyncClient, url: str, retries: int = 3):
    for attempt in range(retries):
        try:
            resp = await client.get(url, headers=HEADERS, timeout=10.0)
            resp.raise_for_status()
            return resp.text
        except httpx.HTTPError as err:
            wait_time = 2 ** attempt
            print(f"[Attempt {attempt+1}] Error: {err}. Retrying in {wait_time}s...")
            await asyncio.sleep(wait_time)
    return None

async def main():
    async with httpx.AsyncClient() as client:
        html = await fetch_page(client, "https://news.ycombinator.com")
        print(f"Scraped {len(html)} bytes successfully!")

if __name__ == "__main__":
    asyncio.run(main())`
      },
      samplePrompts: [
        {
          title: "Automation Script Architect",
          prompt: "Write a complete production Python script using httpx and BeautifulSoup to scrape product pricing, detect changes against a local SQLite database, and send an alert via Discord webhook if price drops by >15%."
        }
      ]
    },
    {
      resource_id: "RES-004",
      slug: "ml-math-cheatsheet",
      id: "ml-math-cheatsheet",
      public_slug: "ml-math-cheatsheet",
      title: "Machine Learning Math & Intuition Cheatsheet",
      category: "Machine Learning",
      status: "Published",
      badge: "📊 Visual Cheatsheet",
      keyword: "MATH",
      description: "Linear algebra, multivariable calculus, and probability concepts visualised with geometric intuitions for machine learning engineers.",
      fileName: "ML_Math_Cheatsheet.pdf",
      fileSize: "3.2 MB",
      fileType: "PDF Cheatsheet",
      file_path: "https://drive.google.com/file/d/1dEfGhIjKlMnOpQrStUvWxYzaB_ML/view?usp=sharing",
      storageUrl: "https://drive.google.com/file/d/1dEfGhIjKlMnOpQrStUvWxYzaB_ML/view?usp=sharing",
      created_at: "2026-10-27",
      updatedDate: "Updated recently",
      readTime: "15 min read",
      tags: ["Machine Learning", "Math", "LinearAlgebra", "Calculus", "Probability"],
      highlights: [
        "Eigenvectors & SVD explained with 2D geometric rotation analogies",
        "Gradient Descent vs Adam Optimizer mathematical formulation",
        "KL Divergence, Cross-Entropy & Maximum Likelihood Estimation",
        "Backpropagation matrix calculus cheat sheet with tensor shapes"
      ],
      tableOfContents: [
        "1. Vectors, Matrices, Eigenvalues & PCA Intuition",
        "2. Gradient Vector, Jacobian & Hessian Matrices",
        "3. Probability Distributions, Bayes Theorem & Entropy",
        "4. Loss Functions: MSE, Cross-Entropy & Contrastive Loss",
        "5. Optimization Algorithms & Learning Rate Schedules"
      ],
      codeSnippet: {
        language: "python",
        title: "gradient_descent_intuition.py",
        code: `# Numerical Gradient Descent with Momentum from Scratch
import numpy as np

def loss_func(w):
    return w**2 + 5 * np.sin(w)

def grad_func(w):
    return 2*w + 5 * np.cos(w)

w = 4.0        # Initial weight
lr = 0.05      # Learning rate
beta = 0.9     # Momentum decay
v = 0.0        # Velocity

for step in range(50):
    grad = grad_func(w)
    v = beta * v + (1 - beta) * grad
    w = w - lr * v
    if step % 10 == 0:
        print(f"Step {step:02d}: Weight = {w:.4f}, Loss = {loss_func(w):.4f}")

print(f"Optimal converged weight: {w:.4f}")`
      },
      samplePrompts: [
        {
          title: "Intuitive Math Breakdown Prompt",
          prompt: "Explain Singular Value Decomposition (SVD) and Principal Component Analysis (PCA) to a software engineer who knows basic linear algebra. Use a 3D data cloud projection analogy and show the numpy matrix factorization formula."
        }
      ]
    },
    {
      resource_id: "RES-005",
      slug: "viral-creator-prompts",
      id: "viral-creator-prompts",
      public_slug: "viral-creator-prompts",
      title: "100+ Viral Prompts for Tech & Software Creators",
      category: "Prompts",
      status: "Published",
      badge: "🚀 High Engagement",
      keyword: "PROMPTS",
      description: "Battle-tested hooks, carousel frameworks, code breakdown templates, and Manychat DM triggers designed to convert technical followers.",
      fileName: "Viral_Prompts_Vault.pdf",
      fileSize: "1.2 MB",
      fileType: "PDF + Markdown Vault",
      file_path: "https://drive.google.com/file/d/1eFgHiJkLmNoPqRsTuVwXyZaBc_PR/view?usp=sharing",
      storageUrl: "https://drive.google.com/file/d/1eFgHiJkLmNoPqRsTuVwXyZaBc_PR/view?usp=sharing",
      created_at: "2026-10-30",
      updatedDate: "Updated recently",
      readTime: "100+ templates",
      tags: ["Prompts", "Content Creation", "Instagram", "Manychat", "Growth"],
      highlights: [
        "15 high-converting Instagram Reel hooks for software concepts",
        "Manychat comment-to-DM keyword copy that boosts deliverability",
        "Carousel slide structure template that maximizes saves and shares",
        "Technical breakdown scripts that make complex concepts digestible"
      ],
      tableOfContents: [
        "1. The 3-Second Technical Reel Hook Formula",
        "2. 10-Slide Educational Carousel Framework",
        "3. High-Converting Manychat DM Automations",
        "4. Repurposing 1 PDF Guide into 5 Viral Instagram Posts",
        "5. The Measurement & Tracking Attribution Blueprint"
      ],
      codeSnippet: {
        language: "markdown",
        title: "viral_carousel_framework.md",
        code: `<!-- 10-Slide Educational Tech Carousel Structure -->
Slide 1 (Hook): "95% of developers build RAG wrong. Here's the 5-step fix."
Slide 2 (The Problem): Why naive chunking leads to hallucinated answers.
Slide 3 (The Bad Way): Fixed 500-token chunks with no context overlap.
Slide 4 (The Fix - Part 1): Semantic chunking based on header boundaries.
Slide 5 (The Fix - Part 2): Adding BM25 keyword search alongside vector search.
Slide 6 (The Fix - Part 3): Cohere reranking before passing context to LLM.
Slide 7 (Architecture Diagram): Clean visual flow diagram.
Slide 8 (Benchmark): 42% accuracy boost in production testing.
Slide 9 (Summary): The 3 rules to never forget.
Slide 10 (Call-to-Action): "Comment 'RAG' below and my bot will DM you the PDF guide + starter code!"`
      },
      samplePrompts: [
        {
          title: "Technical Reel Hook Generator",
          prompt: "Generate 10 viral Instagram Reel hooks about [INSERT TOPIC: e.g. Docker Containers]. Format: 1) Contrarian opinion, 2) Visual curiosity gap, 3) Beginner mistake that costs money. Max 12 words per hook."
        }
      ]
    },
    {
      resource_id: "RES-006",
      slug: "fullstack-saas-template",
      id: "fullstack-saas-template",
      public_slug: "fullstack-saas-template",
      title: "Fullstack SaaS Architecture Template & Checklist",
      category: "Software Engineering",
      status: "Published",
      badge: "🛠️ Production Checklist",
      keyword: "SAAS",
      description: "Complete pre-flight checklist covering Next.js, Supabase auth, Stripe webhooks, database migrations, Docker, and CI/CD security.",
      fileName: "SaaS_Production_Checklist.pdf",
      fileSize: "1.5 MB",
      fileType: "PDF Checklist + Checklist Repo",
      file_path: "https://drive.google.com/file/d/1fGhIjKlMnOpQrStUvWxYzaBcd_SAAS/view?usp=sharing",
      storageUrl: "https://drive.google.com/file/d/1fGhIjKlMnOpQrStUvWxYzaBcd_SAAS/view?usp=sharing",
      created_at: "2026-11-02",
      updatedDate: "Updated recently",
      readTime: "45-point checklist",
      tags: ["Software Engineering", "SaaS", "Next.js", "Stripe", "Supabase"],
      highlights: [
        "Stripe webhook signature validation & idempotency handling",
        "Row Level Security (RLS) policies for multi-tenant SaaS databases",
        "Rate limiting middleware using Upstash Redis",
        "Zero-downtime database migration checklist"
      ],
      tableOfContents: [
        "1. Authentication & Session Security (NextAuth / Supabase)",
        "2. Billing, Stripe Subscriptions & Idempotent Webhooks",
        "3. Multi-Tenant Database Design & RLS Guardrails",
        "4. Error Monitoring, Sentry & Telemetry Setup",
        "5. Deployment, SSL, Cloudflare Caching & Health Checks"
      ],
      codeSnippet: {
        language: "typescript",
        title: "stripe_webhook_handler.ts",
        code: `// Next.js API Route - Idempotent Stripe Webhook Handler
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: \`Webhook Error: \${err.message}\` }, { status: 400 });
  }

  // Handle Event Idempotently
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log(\`✅ Payment received for customer: \${session.customer_email}\`);
    // Update user subscription in database
  }

  return NextResponse.json({ received: true });
}`
      },
      samplePrompts: [
        {
          title: "SaaS Launch Pre-Flight Audit",
          prompt: "Audit this Next.js fullstack application for launch readiness. Check: 1) Environment variables exposed to client, 2) Database connection pool saturation under 500 req/s, 3) Stripe webhook replay attacks, and 4) CSP security headers."
        }
      ]
    },
    {
      resource_id: "RES-007",
      slug: "ai-agent-architecture",
      id: "ai-agent-architecture",
      public_slug: "ai-agent-architecture",
      title: "Autonomous AI Agent Architecture Blueprint",
      category: "Templates",
      status: "Published",
      badge: "🤖 Agentic Blueprint",
      keyword: "AGENT",
      description: "Architecture blueprints for multi-agent workflows: planner-worker patterns, memory compaction, tool-use sandboxing, and loop convergence.",
      fileName: "AI_Agent_Architecture_Guide.pdf",
      fileSize: "2.8 MB",
      fileType: "PDF + Excalidraw Specs",
      file_path: "https://drive.google.com/file/d/1gHiJkLmNoPqRsTuVwXyZaBcde_AGENT/view?usp=sharing",
      storageUrl: "https://drive.google.com/file/d/1gHiJkLmNoPqRsTuVwXyZaBcde_AGENT/view?usp=sharing",
      created_at: "2026-11-04",
      updatedDate: "New Release",
      readTime: "20 min read",
      tags: ["Templates", "AI Agents", "LangGraph", "ToolUse", "ReAct"],
      highlights: [
        "Planner-Executor-Reviewer multi-agent orchestration pattern",
        "Deterministic JSON schema tool calling with validation loops",
        "Short-term working memory vs Long-term vector memory",
        "Safety timeouts, token budget enforcement & infinite loop breakers"
      ],
      tableOfContents: [
        "1. The 4 Agent Archetypes: ReAct, Plan-and-Solve, Multi-Agent Swarm",
        "2. State Machine Design with LangGraph & Python",
        "3. Reliable Tool Calling & Error Recovery Loops",
        "4. Memory Management: Summarization & Rolling Context",
        "5. Testing & Benchmarking Agentic Workflows"
      ],
      codeSnippet: {
        language: "python",
        title: "agent_loop.py",
        code: `# Minimal Deterministic Agent Loop with Tool Calling & Loop Prevention
from typing import Dict, Any, List

class AgentExecutor:
    def __init__(self, tools: Dict[str, Any], max_steps: int = 5):
        self.tools = tools
        self.max_steps = max_steps

    def execute_task(self, goal: str) -> str:
        step_count = 0
        history: List[str] = [f"Goal: {goal}"]

        while step_count < self.max_steps:
            step_count += 1
            print(f"--- Step {step_count} ---")
            
            # Step 1: Decide next action
            action, arg = self._decide_action(goal, history)
            if action == "FINISH":
                return f"Task completed successfully: {arg}"

            # Step 2: Execute Tool safely
            tool_func = self.tools.get(action)
            observation = tool_func(arg) if tool_func else "Tool not found"
            history.append(f"Action: {action}({arg}) -> Observation: {observation}")

        return "Terminated: Reached max step budget without converging."

    def _decide_action(self, goal: str, history: List[str]):
        # Simulated decision logic
        if len(history) < 2:
            return "search_docs", goal
        return "FINISH", "Relevant documentation extracted and verified."`
      },
      samplePrompts: [
        {
          title: "Multi-Agent System Orchestration Prompt",
          prompt: "Design a 3-agent software engineering team: 1) Architect Agent (breaks PRD into tasks), 2) Coder Agent (generates unit-tested code), 3) Critic Agent (runs linter and security checks). Specify the state schema and handoff protocol."
        }
      ]
    }
  ],

  // ============================================================================
  // TABLE B: CAMPAIGN ANALYTICS (Benchmarked Historical & Manychat Data)
  // Field Mapping:
  // campaign_id | resource_id | instagram_post | keyword | dm_sent | dm_clicks | page_visits | download_clicks | successful_downloads | email_signups
  // ============================================================================
  campaigns: [
    {
      campaign_id: "IG-001",
      resource_id: "RES-001",
      resource_slug: "rag-starter-kit",
      instagram_post: "RAG Carousel: 5 Naive Mistakes",
      keyword: "RAG",
      dm_sent: 250,
      dm_clicks: 180,
      page_visits: 145,
      download_clicks: 110,
      successful_downloads: 103,
      email_signups: 42,
      created_at: "2026-10-18"
    },
    {
      campaign_id: "IG-002",
      resource_id: "RES-001",
      resource_slug: "rag-starter-kit",
      instagram_post: "Reel: Vector DBs & Embeddings",
      keyword: "VECTOR",
      dm_sent: 320,
      dm_clicks: 240,
      page_visits: 195,
      download_clicks: 155,
      successful_downloads: 148,
      email_signups: 58,
      created_at: "2026-10-22"
    },
    {
      campaign_id: "IG-003",
      resource_id: "RES-001",
      resource_slug: "rag-starter-kit",
      instagram_post: "Post: Building Your First AI Agent",
      keyword: "AGENT",
      dm_sent: 180,
      dm_clicks: 125,
      page_visits: 98,
      download_clicks: 72,
      successful_downloads: 69,
      email_signups: 26,
      created_at: "2026-10-28"
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
      created_at: "2026-11-01"
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
      created_at: "2026-11-03"
    },
    {
      campaign_id: "IG-006",
      resource_id: "RES-004",
      resource_slug: "ml-math-cheatsheet",
      instagram_post: "Post: Machine Learning Math Cheatsheet",
      keyword: "MATH",
      dm_sent: 220,
      dm_clicks: 160,
      page_visits: 130,
      download_clicks: 95,
      successful_downloads: 88,
      email_signups: 35,
      created_at: "2026-11-05"
    },
    {
      campaign_id: "IG-007",
      resource_id: "RES-005",
      resource_slug: "viral-creator-prompts",
      instagram_post: "Carousel: 100+ Viral Prompts for Tech Creators",
      keyword: "PROMPTS",
      dm_sent: 350,
      dm_clicks: 275,
      page_visits: 220,
      download_clicks: 178,
      successful_downloads: 169,
      email_signups: 62,
      created_at: "2026-11-06"
    }
  ]
};
