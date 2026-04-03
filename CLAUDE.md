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
- Test files: `*.test.ts` / `*.test.tsx` (unit/component), `apps/web/e2e/*.spec.ts` (E2E)

### E2E Tests
- E2E specs live in `apps/web/e2e/` — plain TypeScript, no `'use client'`
- Shared path constants are exported from `apps/web/e2e/fixtures.ts`
- Use `test.describe` blocks; each test must be fully independent (no shared state)
- Prefer `page.getByRole` and `page.getByLabel` for accessible selectors
- Tests run against a live app connected to ES; use `test.skip()` gracefully when backend data is unavailable
- `BASE_URL` env var overrides the default `http://localhost:3000`

## Workflow Orchestration

- **Always create a plan** for every task: write it to `.claude/tasks/todo.md` with checkable items (change todo.md for your task title), define phases, their order, and dependencies. Check in with the user before implementing.
- **Planning requires Opus model** — the plan must be created by the Opus model. If the current session is not running on Opus, notify the user and ask them to switch before proceeding.
- **Code changes always via Sonnet sub-agents** — never modify code directly in the main context. Run each phase as a sub-agent with Sonnet model. Phases can run sequentially or in parallel if independent. Review and integrate outputs before moving to the next phase.
- Mark plan items complete as you go.
- **Post-implementation review with Opus** — after all code changes are complete, launch a sub-agent with Opus model to review all changes. Give the review sub-agent the task requirements (issue/plan) so it knows *what* should have been done, but do NOT pass the implementer's reasoning or decisions — let it judge the code independently with fresh eyes. Focus the review on: correctness, adherence to project conventions, missing edge cases, test coverage, and security. If the review finds issues, pass the review output to a Sonnet sub-agent to fix them. Repeat the review–fix loop up to **3 iterations**. If 3 iterations pass without approval, proceed anyway but note unresolved issues.
- **Pre-push verification** — before pushing (or amending + force-pushing), always run `pnpm lint`, `pnpm type-check`, and `pnpm test`. All three must pass. Fix any failures before pushing — do not rely on CI to catch lint/type/test errors.
- **Security review before PR** — after all code changes and reviews are complete, run `/security-review` to check for security vulnerabilities before creating the PR.
- **Code review after PR** — after creating the PR, run `/review {pr_number}` for minimum 3 iterations. Continue beyond 3 as long as 🔴 Normal findings persist — all 🔴 must be resolved. 🟡 Nit findings should be fixed or noted in the PR description.
- After ANY correction due to your mistake or wrong guidance in md files: first fix the root source (skill, rule, convention) if editable — only add to `.claude/tasks/lessons.md` if no editable source exists
- Review `.claude/tasks/lessons.md` at session start
- **Cleanup after completion** — once all checklist items in a task file are done and verified, delete the task file from `.claude/tasks/` (do not delete `lessons.md`)

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
