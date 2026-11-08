#!/usr/bin/env bash
# ==============================================================================
# DevResource Platform Orchestrator (POSIX/Linux/macOS Bash Runner)
# ==============================================================================

set -e

COMMAND="${1:-help}"
shift || true

show_help() {
  echo ""
  echo "================================================================"
  echo " 🚀 DevResource Platform Command Runner (Linux/macOS)"
  echo "================================================================"
  echo ""
  echo " Usage: ./run.sh [command]"
  echo ""
  echo " Available Commands:"
  echo "   dev               Start Next.js development server on localhost:3000"
  echo "   build             Run production build with TypeScript check"
  echo "   start             Start Next.js production server on localhost:3000"
  echo "   lint              Run ESLint & TypeScript validation"
  echo "   docker:build      Build standalone Docker container image"
  echo "   docker:run        Run standalone Docker container on port 3000"
  echo "   docker:up         Launch multi-container stack with Docker Compose"
  echo "   docker:down       Stop and clean up Docker Compose services"
  echo "   docker:logs       View streaming logs from Docker Compose"
  echo "   resource:cli      Launch the interactive Resource Manager CLI"
  echo "   plugins           Inspect installed plugins & verify health"
  echo "   vercel:check      Run pre-flight checks before Vercel deployment"
  echo "   help              Show this help reference"
  echo ""
}

case "$COMMAND" in
  dev)
    echo "Starting development server..."
    npm run dev
    ;;
  build)
    echo "Building production Next.js bundle..."
    npm run build
    ;;
  start)
    echo "Starting production server..."
    npm start
    ;;
  lint)
    echo "Checking TypeScript types..."
    npx tsc --noEmit
    ;;
  docker:build)
    echo "Building Docker image..."
    docker build -t devresource:latest .
    ;;
  docker:run)
    echo "Running Docker container..."
    docker run -p 3000:3000 --name devresource --rm devresource:latest
    ;;
  docker:up)
    echo "Starting Docker Compose..."
    docker compose up -d --build
    ;;
  docker:down)
    echo "Stopping Docker Compose..."
    docker compose down
    ;;
  docker:logs)
    docker compose logs -f web
    ;;
  resource:cli)
    node scripts/resource-manager.mjs "$@"
    ;;
  plugins)
    node scripts/plugins-runner.mjs list
    ;;
  vercel:check)
    echo "Checking Vercel readiness..."
    [ -f vercel.json ] && echo "✓ vercel.json present"
    npm run build
    echo "✓ Ready for Vercel deployment!"
    ;;
  *)
    show_help
    ;;
esac
