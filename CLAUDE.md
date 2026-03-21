# Skeleton FE — Project Instructions

## Read Discipline

**Read ONLY what you need for the current task.** This project has multiple independent areas. Before reading files, determine which area your task belongs to and read only the relevant documentation.

- Working on SDK? → Read `.claude/docs/sdk.md`. Do NOT read ui.md, templates.md, etc.
- Working on UI components? → Read `.claude/docs/ui.md`. Do NOT read sdk.md, routing.md, etc.
- Working on routing? → Read `.claude/docs/routing.md`. Do NOT read ui.md, sdk.md, etc.
- Working on auth? → Read `.claude/docs/auth.md`.
- Working on Docker/infra? → Read `.claude/docs/infrastructure.md`.
- Need a high-level overview? → Read `.claude/docs/project-structure.md` (links to details).

**Never bulk-read all docs.** Each doc is self-contained for its area.

## Project Overview

Frontend e-commerce skeleton on **Next.js (App Router) + TypeScript**. Monorepo via Turborepo + pnpm. Consumes data from Elasticsearch (indexed by Pimcore backend) and Pimcore REST API. Multi-site support with per-site component overrides.

- **Backend repo:** [PavelNecas/pim-skeleton](https://github.com/PavelNecas/pim-skeleton)
- **Design spec:** `docs/superpowers/specs/2026-03-21-fe-app-init-design.md`
- **Implementation issues:** #2 through #9 on GitHub

## Tech Stack

- Next.js (App Router) + TypeScript (strict mode)
- Tailwind CSS + shadcn/ui (Radix UI)
- Turborepo + pnpm workspaces
- Vitest (unit/component tests) + Playwright (E2E)
- Docker (Node 22 Alpine, standalone) + Traefik
- Elasticsearch (direct read access) + Pimcore REST API

## Code Conventions

### TypeScript
- Strict mode everywhere (`strict: true`)
- Prefer `interface` over `type` for object shapes
- Use discriminated unions for polymorphic types (Property, Editable, ContentBlock)
- No `any` — use `unknown` if type is truly unknown
- Export types alongside implementations

### Components
- Server Components by default; add `'use client'` only when needed (interactivity, hooks)
- Co-locate component tests next to components or in `__tests__/`
- shadcn/ui components live in `packages/ui/src/components/`
- App-specific components live in `apps/web/src/core/components/`

### Naming
- Files: kebab-case for utilities (`route-resolver.ts`), PascalCase for components (`ContentPage.tsx`)
- Directories: kebab-case
- Interfaces/types: PascalCase
- Variables/functions: camelCase

### Imports
- Use workspace package names: `@skeleton-fe/sdk-elastic`, `@skeleton-fe/sdk-pimcore`, `@skeleton-fe/ui`
- Use path aliases within apps: `@/core/...`, `@/lib/...`, `@/sites/...`

### Testing
- Unit tests: Vitest, mock external dependencies (ES client, HTTP client)
- Component tests: Testing Library + Vitest, test behavior not implementation
- E2E tests: Playwright, test user flows against running app
- Test files: `*.test.ts` / `*.test.tsx`

## Commands

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages + apps
pnpm dev              # Start dev server
pnpm lint             # ESLint
pnpm type-check       # TypeScript check
pnpm test             # Run unit + component tests (Vitest)
pnpm test:e2e         # Run E2E tests (Playwright)
docker compose build  # Build Docker image
docker compose up     # Start frontend container
```

## Architecture Documentation

Detailed documentation per area in `.claude/docs/`:

- `project-structure.md` — High-level structure overview with links to details
- `sdk.md` — SDK packages (sdk-elastic, sdk-pimcore)
- `routing.md` — Middleware, route resolution, locale detection
- `ui.md` — UI components, content blocks, layouts
- `templates.md` — Page templates, template registry
- `multi-site.md` — Site overrides, theming, component resolver
- `auth.md` — Authentication, session management
- `infrastructure.md` — Docker, Traefik, CI/CD, environment variables
