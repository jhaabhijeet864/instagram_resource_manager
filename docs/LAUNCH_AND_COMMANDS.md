# 🚀 Launch, Build & Operational Commands Reference

This document is the definitive guide for running, building, testing, containerizing, and deploying **DevResource** across local environments, Docker, and Vercel.

---

## 1. Quick Start Commands

| Command | Environment | Description |
| :--- | :--- | :--- |
| `npm run dev` | Local | Starts Next.js development server at `http://localhost:3000` |
| `npm run build` | Local / CI | Compiles TypeScript and builds production Next.js assets |
| `npm start` | Production | Starts production HTTP server on port 3000 |
| `npm run resource:cli` | Local CLI | Interactive Resource Manager CLI (list, validate, add resources) |
| `npm run plugins:list` | Local CLI | Inspect installed plugins and their activation status |
| `npm run docker:build` | Docker | Builds standalone container image `devresource:latest` |
| `npm run docker:compose:up` | Docker | Starts containerized app & services via Docker Compose |

---

## 2. Using the Platform Launch Runners

We provide turnkey scripts for both **Windows PowerShell** and **POSIX/Linux/macOS Bash**:

### Windows (PowerShell): `run.ps1`
```powershell
# Launch Development Server
.\run.ps1 dev

# Build Production Bundle
.\run.ps1 build

# Run Production Server
.\run.ps1 start

# Build & Run with Docker Compose
.\run.ps1 docker:up

# Stop Docker Compose
.\run.ps1 docker:down

# Run the Resource Manager CLI tool
.\run.ps1 resource:cli

# Run Plugins Health Check
.\run.ps1 plugins

# Run Pre-flight Vercel checks
.\run.ps1 vercel:check
```

### Linux / macOS (Bash) or Git Bash: `run.sh`
```bash
chmod +x ./run.sh

# Launch Development Server
./run.sh dev

# Build Production Bundle
./run.sh build

# Docker Compose Up
./run.sh docker:up

# Resource Manager CLI
./run.sh resource:cli
```

### Using Makefile:
```bash
# Start local dev
make dev

# Build bundle
make build

# Build Docker image
make docker-build

# Run Docker Compose
make docker-up

# Stop Docker Compose
make docker-down

# Launch Resource Manager CLI
make resource-cli

# Pre-deploy checks
make check
```

---

## 3. Docker Deployment Guide

The project includes an enterprise-grade multi-stage `Dockerfile` based on `node:20-alpine`, outputting a minimal self-contained runtime under a dedicated non-root user (`nextjs:nodejs`).

### 3.1 Single Container Build & Run
```bash
# 1. Build the Docker image
docker build -t devresource:latest .

# 2. Run the container on port 3000 with your environment variables
docker run -d \
  -p 3000:3000 \
  --name devresource \
  --env-file .env \
  devresource:latest

# 3. Check container logs
docker logs -f devresource

# 4. Stop and remove container
docker stop devresource && docker rm devresource
```

### 3.2 Docker Compose (Multi-Service Stack)
The repository provides `docker-compose.yml` configured for zero-friction launch:
```bash
# Start all services in the background
docker compose up -d --build

# View real-time logs
docker compose logs -f web

# Healthcheck inspection
docker compose ps

# Graceful shutdown
docker compose down
```

---

## 4. Vercel Deployment Guide

DevResource is fully optimized for zero-config Vercel deployment:

### 4.1 Automated Git Deployment (Recommended)
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Log into [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. Vercel will auto-detect Next.js.
4. Set Environment Variables in Project Settings (see Section 6).
5. Click **Deploy**.

### 4.2 Vercel CLI Deployment
```bash
# Install Vercel CLI if not present
npm i -g vercel

# Login to Vercel
vercel login

# Preview Deployment
vercel

# Production Deployment
vercel --prod
```

### 4.3 Custom Routing & Headers Configuration
See `vercel.json` in the project root:
- Automatic security headers (Content Security Policy, X-Frame-Options, Strict-Transport-Security).
- Static asset caching headers for fonts, images, and icons (`Cache-Control: public, max-age=31536000, immutable`).
- Dynamic serverless execution limits.

---

## 5. Resource Manager CLI Commands

You can manage your master resource links and test Google Drive / Cloudflare R2 links directly from the command line:

```bash
# List all resources in the catalog
node scripts/resource-manager.mjs list

# Validate all storage URLs (checks for 403 / 404 / permissions issues)
node scripts/resource-manager.mjs validate

# Add a new resource interactively
node scripts/resource-manager.mjs add

# Export resources to JSON or CSV
node scripts/resource-manager.mjs export --format=json --out=catalog_export.json
```

---

## 6. Environment Variables Reference

Create a `.env` file in the root directory based on `.env.example`:

```ini
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Creator Brand Info
NEXT_PUBLIC_CREATOR_HANDLE=your_handle
NEXT_PUBLIC_CREATOR_NAME="Creator Name"

# Meta / Instagram Graph API Plugin
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_WEBHOOK_VERIFY_TOKEN=your_secure_random_verify_token
META_PAGE_ACCESS_TOKEN=your_long_lived_page_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id

# Storage Provider Configuration (Drive / R2)
DEFAULT_STORAGE_PROVIDER=drive # or "r2"
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=

# Analytics & Lead Storage (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
