# AGENTS.md

## Project overview

PersistDev.Blog is a personal programming blog built with Next.js App Router, React, TypeScript, MDX, Tailwind CSS, Prisma/PostgreSQL, and SendGrid.

Blog posts live in `content/<slug>/index.mdx`; the application reads and enriches them at runtime through `src/content/generated.ts`.

## Agent workflow

This repository uses repository-wide instructions, specialized agents, task-specific implementation plans, and structured project knowledge.

### Repository-wide instructions

This `AGENTS.md` file defines the global rules and conventions that apply to any agent working in this repository.

All specialized agents must follow this file in addition to their own role-specific instructions.

If a specialized agent instruction conflicts with this file, repository-wide constraints in `AGENTS.md` take precedence unless the user explicitly overrides them.

### Specialized agents

Specialized agent definitions live under:

`.github/agents/`

Examples:

- `.github/agents/planner.agent.md`
- `.github/agents/coder.agent.md`
- `.github/agents/reviewer.agent.md`
- `.github/agents/post-creator.agent.md`

Each specialized agent defines the responsibilities, workflow, and boundaries for a specific role.

Do not duplicate general repository knowledge in agent files when it already belongs in `AGENTS.md` or OKF documentation.

### Implementation plans

Task-specific implementation plans live under:

`.agents/plans/`

Plans are created by the Planner and consumed by the Coder.

A plan describes how a specific requested change should be implemented. It is not permanent architecture documentation.

When implementing from a plan, the Coder must:

1. Read this `AGENTS.md`.
2. Read the exact plan associated with the task.
3. Inspect the relevant repository state before modifying code.
4. Treat confirmed requirements, non-goals, domain rules, public behavior, and fixed architectural decisions in the plan as constraints.
5. Return to planning if repository evidence materially invalidates the plan instead of silently redesigning the solution.

Do not treat arbitrary files in `.agents/plans/` as active work. Use the plan explicitly associated with the current task.

### OKF knowledge

OKF documentation lives under:

`docs/okf/`

Start from the closest relevant OKF index and follow its relationships to discover the knowledge relevant to the task.

OKF documentation represents durable knowledge about how the system works.

Use OKF for knowledge such as:

- architecture;
- domain rules;
- terminology;
- public behavior;
- data ownership;
- persistence rules;
- integration boundaries;
- routing invariants;
- security constraints;
- other project knowledge that future contributors or agents need to understand.

Do not use OKF for task-specific implementation instructions or transient coding details.

Before making significant changes, discover and read the OKF documents relevant to the affected behavior.

Validate important OKF claims against the current implementation where practical. If OKF and implementation disagree, investigate the discrepancy instead of silently assuming either is correct.

Update relevant OKF documentation when a change establishes or modifies durable architectural, domain, or product knowledge.

## Repository map

- `src/app/` — App Router pages, layouts, route handlers, and global styles.
- `src/components/` — reusable UI components, grouped by feature.
- `src/Hooks/` — client-side custom React hooks.
- `src/utils/`, `src/schemas/`, `src/types/`, and `src/constants/` — shared utilities, validation, types, and constants.
- `content/` — MDX blog posts and their front matter.
- `public/` — static assets; post images are normally stored in `public/posts/`.
- `prisma/schema.prisma` — database schema; `generated/prisma/` is generated client code and must not be edited manually.
- `__tests__/` — Jest component tests.
- `.github/agents/` — specialized agent definitions.
- `.agents/plans/` — task-specific implementation plans created during planning.
- `docs/okf/` — durable structured knowledge describing the system, domain rules, architectural decisions, and important relationships.

Use the `@/` alias for imports rooted at the repository root, following the existing codebase convention, for example:

`@/src/components/...`

## Setup and commands

Use npm and commit `package-lock.json` when dependencies change.

```bash
npm install                 # installs dependencies and runs prisma generate
npm run dev                 # starts Next.js and restarts it when a content .mdx file changes
npm run lint                # runs ESLint, including Next.js Core Web Vitals rules
npm test                    # runs the Jest suite once
npm run test:watch          # runs Jest in watch mode
npx tsc --noEmit            # checks TypeScript without emitting files
npm run build               # production build; also generates the sitemap
npm run start               # serves an existing production build
```

For database changes, update `prisma/schema.prisma`, run the appropriate Prisma migration command, and regenerate the client with:

```bash
npx prisma generate
```

Never hand-edit `generated/prisma/`.

## Environment and security

Keep secrets only in local environment files.

Never commit values from `.env` or `.env.local`, and never print them in logs or documentation.

Current server-side integrations require configuration such as:

- `DATABASE_URL` and `DIRECT_URL` for Prisma/PostgreSQL.
- `SENDGRID_API_KEY` and `SENDGRID_VERIFIED_SENDER` for subscriptions.
- `NEXT_PUBLIC_SITE_URL` for public site metadata.
- `VIEWS_PERSISTENCE_ENABLED=false` to intentionally use the views API fallback.

Validate request data at route boundaries with Zod.

Treat database and email operations as server-only.

Do not expose private environment variables in client components or use the `NEXT_PUBLIC_` prefix for secrets.

## Code and React conventions

- Prefer small, focused components and functions with a single clear responsibility.
- Reuse existing components, hooks, utilities, schemas, and constants before adding new abstractions.
- Use TypeScript types for component props, API payloads, and non-trivial return values.
- Avoid `any`, unsafe assertions, and duplicated types.
- Default to Server Components.
- Add `"use client"` only when a component needs browser APIs, state, effects, or event handlers.
- Keep the client boundary as low in the tree as practical.
- Use Next.js primitives and conventions:
  - App Router route files;
  - `next/image` for images;
  - `next/link` for internal navigation;
  - `next/navigation` helpers;
  - `Metadata` and `generateMetadata` for page metadata.

- Keep API handlers explicit about validation, success status, and failure behaviour.
- Return safe error messages.
- Never leak implementation details or secrets.
- Preserve accessibility:
  - semantic HTML;
  - useful image `alt` text;
  - labels for form controls;
  - keyboard-operable interactions;
  - clear focus states.

- Use Tailwind utility classes consistent with nearby components.
- Avoid inline styles.
- Avoid introducing a styling library unless the task requires it.
- Do not refactor unrelated code, rename public routes, or change content URLs as part of a focused change.

### JSDoc

Write short, meaningful JSDoc for:

- exported functions;
- custom hooks;
- non-obvious utilities;
- code with important side effects or constraints.

Explain intent, inputs and outputs when helpful, and noteworthy assumptions.

Do not document syntax already conveyed by TypeScript.

Keep comments current and remove comments that no longer describe the code.

## Content workflow

Each post lives at:

`content/<slug>/index.mdx`

Maintain the existing front matter fields:

- `title`
- `description`
- `image` when used
- `publishedAt`
- `updatedAt`
- `author`
- `isPublished`
- `tags`

Use ISO dates:

`YYYY-MM-DD`

Update `updatedAt` when materially revising a published post.

Reference post images with a path that resolves to `public/`.

Add assets under `public/posts/` when appropriate.

New post hero images must be 16:9 and at least 1920×1080 pixels. Verify their
dimensions before adding the image path to front matter.

Keep slugs stable because they define:

`/post/<slug>`

If a slug must change, add a redirect in `next.config.js`.

Ensure MDX code examples are valid, headings are meaningful, and front matter accurately represents the post.

When asked to create a LinkedIn post for a specific article, write a short,
simple promotion of no more than 75 words. Focus on one practical takeaway,
use plain language, and include the article's canonical URL. Do not turn it
into a full article summary or add unnecessary marketing language.

## Tests and verification

Add or update Jest tests in `__tests__/` for changed:

- user-visible component behavior;
- hooks;
- utilities;
- route logic;

when practical.

Follow the existing Testing Library style and test behavior rather than implementation details.

Before handing off a change:

1. Run the narrowest relevant checks.
2. Run `npm run lint`.
3. Run `npx tsc --noEmit`.
4. Run relevant Jest tests.
5. Run `npm run build` for routing, content-pipeline, configuration, Prisma, or other production-impacting changes.

State any check that could not run and why.

## Documentation is part of every change

Update documentation in the same change whenever code affects:

- setup;
- commands;
- environment variables;
- architecture;
- public behavior;
- routes;
- content authoring;
- dependencies;
- deployment;
- contributor workflow.

Update `README.md` for user- and contributor-facing changes.

Update this `AGENTS.md` when agent workflow or repository-wide conventions change.

Update relevant OKF documents when durable system knowledge changes.

Add focused documentation near the relevant feature when the change cannot be explained clearly in the README or OKF.

Document every new, renamed, or removed environment variable without including its value.

Do not claim documentation is current unless it was checked against the implemented change.
