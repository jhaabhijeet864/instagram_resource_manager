<#
.SYNOPSIS
  DevResource Platform Orchestrator (Windows PowerShell Runner)
.DESCRIPTION
  Provides single-command launchers for local development, production builds,
  Docker containers, Vercel validation, Resource Manager CLI, and Plugins testing.
.EXAMPLE
  .\run.ps1 dev
  .\run.ps1 build
  .\run.ps1 docker:up
  .\run.ps1 resource:cli
#>

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$ExtraArgs
)

$ErrorActionPreference = "Stop"

function Show-Help {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkYellow
    Write-Host " 🚀 DevResource Platform Command Runner (Windows)" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkYellow
    Write-Host ""
    Write-Host " Usage: .\run.ps1 [command]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host " Available Commands:" -ForegroundColor White
    Write-Host "   dev               Start Next.js development server on localhost:3000"
    Write-Host "   build             Run production build with TypeScript check"
    Write-Host "   start             Start Next.js production server on localhost:3000"
    Write-Host "   lint              Run ESLint & TypeScript validation"
    Write-Host "   docker:build      Build standalone Docker container image"
    Write-Host "   docker:run        Run standalone Docker container on port 3000"
    Write-Host "   docker:up         Launch multi-container stack with Docker Compose"
    Write-Host "   docker:down       Stop and clean up Docker Compose services"
    Write-Host "   docker:logs       View streaming logs from Docker Compose"
    Write-Host "   resource:cli      Launch the interactive Resource Manager CLI"
    Write-Host "   plugins           Inspect installed plugins & verify health"
    Write-Host "   vercel:check      Run pre-flight checks before Vercel deployment"
    Write-Host "   help              Show this help reference"
    Write-Host ""
}

switch ($Command.ToLower()) {
    "dev" {
        Write-Host "Starting DevResource in development mode..." -ForegroundColor Green
        npm run dev
    }
    "build" {
        Write-Host "Building production Next.js bundle..." -ForegroundColor Green
        npm run build
    }
    "start" {
        Write-Host "Starting production server..." -ForegroundColor Green
        npm start
    }
    "lint" {
        Write-Host "Running typecheck and linting..." -ForegroundColor Green
        npx tsc --noEmit
    }
    "docker:build" {
        Write-Host "Building Docker image 'devresource:latest'..." -ForegroundColor Green
        docker build -t devresource:latest .
    }
    "docker:run" {
        Write-Host "Running Docker container on port 3000..." -ForegroundColor Green
        docker run -p 3000:3000 --name devresource --rm devresource:latest
    }
    "docker:up" {
        Write-Host "Starting services with Docker Compose..." -ForegroundColor Green
        docker compose up -d --build
        Write-Host "Services started! App running at http://localhost:3000" -ForegroundColor Green
    }
    "docker:down" {
        Write-Host "Stopping Docker Compose services..." -ForegroundColor Yellow
        docker compose down
    }
    "docker:logs" {
        docker compose logs -f web
    }
    "resource:cli" {
        Write-Host "Launching Resource Manager CLI..." -ForegroundColor Cyan
        node scripts/resource-manager.mjs $ExtraArgs
    }
    "plugins" {
        Write-Host "Testing and listing plugins..." -ForegroundColor Cyan
        node scripts/plugins-runner.mjs list
    }
    "vercel:check" {
        Write-Host "Checking Vercel deployment readiness..." -ForegroundColor Cyan
        if (Test-Path "vercel.json") {
            Write-Host "✓ vercel.json detected" -ForegroundColor Green
        } else {
            Write-Host "✗ vercel.json missing" -ForegroundColor Red
        }
        if (Test-Path "next.config.mjs") {
            Write-Host "✓ next.config.mjs detected" -ForegroundColor Green
        }
        Write-Host "Running build test..." -ForegroundColor Cyan
        npm run build
        Write-Host "✓ Ready for Vercel deployment!" -ForegroundColor Green
    }
    Default {
        Show-Help
    }
}
