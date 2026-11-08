# ==============================================================================
# DevResource Build & Automation Makefile
# ==============================================================================

.PHONY: help dev build start lint test clean docker-build docker-up docker-down docker-logs resource-cli plugins check

help:
	@echo "Available targets:"
	@echo "  make dev          Start local development server"
	@echo "  make build        Build production Next.js assets"
	@echo "  make start        Start production Node server"
	@echo "  make lint         Run TypeScript type checks"
	@echo "  make docker-build Build standalone Docker container"
	@echo "  make docker-up    Start Docker Compose stack"
	@echo "  make docker-down  Stop Docker Compose stack"
	@echo "  make resource-cli Run Resource Manager CLI"
	@echo "  make plugins      List installed plugins & health"
	@echo "  make check        Run full pre-deploy verification"

dev:
	npm run dev

build:
	npm run build

start:
	npm start

lint:
	npx tsc --noEmit

docker-build:
	docker build -t devresource:latest .

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f web

resource-cli:
	node scripts/resource-manager.mjs

plugins:
	node scripts/plugins-runner.mjs list

check: lint build
	@echo "All pre-flight checks passed successfully!"
