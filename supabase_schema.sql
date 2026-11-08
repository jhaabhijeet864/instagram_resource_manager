-- ==============================================================================
-- SUPABASE / POSTGRESQL DATABASE SCHEMA
-- For Instagram Creator Resource Hub & Campaign Analytics
-- Directly implements Table A (Resources) & Table B (Campaign Analytics)
-- ==============================================================================

-- ==============================================================================
-- 1. TABLE A: RESOURCES (Master Resource Catalog)
-- Field Mapping:
-- resource_id | title | category | description | file_path | public_slug | status | created_at
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.resources (
    resource_id VARCHAR(50) PRIMARY KEY, -- e.g. 'RES-001'
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'Generative AI', 'Machine Learning', 'Python', 'Software Engineering', 'System Design', 'Prompts', 'Templates'
    description TEXT,
    file_path TEXT NOT NULL, -- Google Drive master file reference or Cloudflare R2 path
    public_slug VARCHAR(100) UNIQUE NOT NULL, -- e.g. 'rag-starter-kit'
    file_name VARCHAR(255),
    file_size VARCHAR(50),
    file_type VARCHAR(50) DEFAULT 'PDF',
    status VARCHAR(50) DEFAULT 'Published',
    highlights JSONB DEFAULT '[]'::jsonb,
    sample_prompts JSONB DEFAULT '[]'::jsonb,
    code_snippet JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABLE B: CAMPAIGN ANALYTICS (Instagram Posts & Manychat Automations)
-- Field Mapping:
-- campaign_id | resource_id | instagram_post | keyword | dm_sent | dm_clicks | page_visits | download_clicks | successful_downloads
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_analytics (
    campaign_id VARCHAR(50) PRIMARY KEY, -- e.g. 'IG-001'
    resource_id VARCHAR(50) REFERENCES public.resources(resource_id) ON DELETE CASCADE,
    public_slug VARCHAR(100) NOT NULL,
    instagram_post VARCHAR(255) NOT NULL, -- e.g. 'RAG carousel'
    keyword VARCHAR(50) NOT NULL, -- e.g. 'RAG'
    dm_sent INTEGER DEFAULT 0,
    dm_clicks INTEGER DEFAULT 0,
    page_visits INTEGER DEFAULT 0,
    download_clicks INTEGER DEFAULT 0,
    successful_downloads INTEGER DEFAULT 0,
    email_signups INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backwards compatibility view/alias for campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name VARCHAR(100) UNIQUE NOT NULL,
    resource_slug VARCHAR(100),
    instagram_keyword VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ANALYTICS EVENTS (Individual Request & Click Event Stream)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL, -- 'PAGE_VISIT', 'DOWNLOAD_CLICK', 'DOWNLOAD_SUCCESS', 'EMAIL_SIGNUP'
    resource_slug VARCHAR(100) NOT NULL,
    campaign_name VARCHAR(100) DEFAULT 'direct',
    utm_source VARCHAR(100) DEFAULT 'instagram',
    utm_medium VARCHAR(100) DEFAULT 'comment_dm',
    referrer TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. EMAIL SIGNUPS (Lead Generation Database)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.email_signups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    resource_slug VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resources_slug ON public.resources(public_slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_resource ON public.campaign_analytics(resource_id);
CREATE INDEX IF NOT EXISTS idx_analytics_slug ON public.analytics_events(resource_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_campaign ON public.analytics_events(campaign_name);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at);

-- Row Level Security (RLS)
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read resources" ON public.resources FOR SELECT USING (status = 'Published');
CREATE POLICY "Public can read campaign analytics" ON public.campaign_analytics FOR SELECT USING (true);
CREATE POLICY "Public can insert analytics events" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read analytics events" ON public.analytics_events FOR SELECT USING (true);
CREATE POLICY "Public can submit email signups" ON public.email_signups FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 5. INITIAL SEED DATA (Table A & Table B Benchmarks)
-- ==============================================================================

-- Seed Table A
INSERT INTO public.resources (resource_id, title, category, description, file_path, public_slug, file_name, file_size, file_type, status)
VALUES
('RES-001', 'RAG Starter Kit: Practical Guide & Code', 'Generative AI', 'A practical introduction to retrieval-augmented generation using LangChain, ChromaDB, and OpenAI embeddings.', 'https://drive.google.com/file/d/1aBcDeFgHiJkLmNoPqRsTuVwXyZ_RAG/view', 'rag-starter-kit', 'RAG_Starter_Kit.pdf', '2.4 MB', 'PDF Guide', 'Published'),
('RES-002', 'System Design Blueprint & Architecture Patterns', 'System Design', 'Visual diagrams and cheatsheet on Microservices, Caching (Redis), Load Balancing, and Sharding.', 'https://drive.google.com/file/d/1bCdEfGhIjKlMnOpQrStUvWxYz_SYS/view', 'system-design-primer', 'System_Design_Blueprint.pdf', '4.1 MB', 'PDF + Diagrams', 'Published'),
('RES-003', 'Python Automation Vault: 25 Ready-to-Run Scripts', 'Python', '25 plug-and-play Python scripts for web scraping, automated reporting, file sorting, and API extraction.', 'https://drive.google.com/file/d/1cDeFgHiJkLmNoPqRsTuVwXyZa_PY/view', 'python-automation-scripts', 'Python_Automation_Vault.zip', '1.8 MB', 'ZIP Archive', 'Published')
ON CONFLICT (resource_id) DO NOTHING;

-- Seed Table B
INSERT INTO public.campaign_analytics (campaign_id, resource_id, public_slug, instagram_post, keyword, dm_sent, dm_clicks, page_visits, download_clicks, successful_downloads, email_signups)
VALUES
('IG-001', 'RES-001', 'rag-starter-kit', 'RAG carousel', 'RAG', 250, 180, 145, 110, 103, 42),
('IG-002', 'RES-001', 'rag-starter-kit', 'Reel: Vector DBs Explained', 'VECTOR', 320, 240, 195, 155, 148, 58),
('IG-003', 'RES-001', 'rag-starter-kit', 'Post: Building Your First AI Agent', 'AGENT', 180, 125, 98, 72, 69, 26),
('IG-004', 'RES-002', 'system-design-primer', 'System Design Carousel', 'DESIGN', 410, 310, 260, 215, 202, 84),
('IG-005', 'RES-003', 'python-automation-scripts', '25 Python Scripts Reel', 'PYTHON', 500, 420, 380, 310, 298, 112)
ON CONFLICT (campaign_id) DO NOTHING;
