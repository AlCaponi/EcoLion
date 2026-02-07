# CLAUDE.md — Eco-Löwe Winterthur

## Project

Gamified sustainable mobility PWA for Winterthur. Citizens track walking and public transit usage, level up a virtual lion companion, and compete on leaderboards.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite (Rolldown), PWA
- **API Tests**: Vitest, Zod, Node 22
- **Infra**: Docker Compose, auto-deploy via cron (`deploy.sh`)

## Key Directories

- `eco-loewe-pwa/` — React frontend
- `api-tests/` — API contract tests and seed data
- `docker-compose.yml` — orchestrates all services

## Commands

```bash
docker compose up --build                             # run frontend
docker compose --profile test run --rm api-tests      # run API tests
docker compose --profile test run --rm api-tests npm run test:seed  # seed backend
```

## Adding New Endpoints

See [agents.md](./agents.md) for step-by-step instructions on adding a new API endpoint across frontend types, Zod schemas, fixtures, and contract tests.
