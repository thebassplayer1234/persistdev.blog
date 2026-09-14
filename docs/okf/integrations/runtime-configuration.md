---
type: Operating Configuration
title: Runtime configuration
description: Environment variables configure public URLs, client API endpoints, analytics, persistence, email delivery, and build behavior.
tags: [environment, deployment, configuration]
---

# Runtime configuration

Keep all environment values in local environment files or deployment secrets.
Only variables prefixed with `NEXT_PUBLIC_` are available to browser code.

## Server-only configuration

- `DATABASE_URL` configures the PostgreSQL connection used by the Prisma
  adapter.
- `DIRECT_URL` configures Prisma CLI database operations.
- `SENDGRID_API_KEY` authenticates SendGrid email delivery.
- `SENDGRID_VERIFIED_SENDER` supplies the SendGrid sender address.
- `VIEWS_PERSISTENCE_ENABLED=false` disables database-backed view counts.
- `PRISMA_QUERY_LOGS=true` enables Prisma query and info logging.
- `SITE_URL` configures sitemap generation.
- `NEXT_BUILD_WORKERS` sets the configured Next.js build worker count when it
  is a positive integer.

## Public configuration

- `NEXT_PUBLIC_SITE_URL` supplies the site URL used by metadata and article
  structured data.
- `NEXT_PUBLIC_SUBSCRIPTION_API` supplies the browser subscription endpoint.
- `NEXT_PUBLIC_VIEWS_API` supplies the browser views endpoint.
- `NEXT_PUBLIC_GOOGLE_ANALYTICS` enables Google Analytics when set.
- `NEXT_PUBLIC_LANGUAJE` selects notification translations. Its spelling is
  part of the current runtime contract.

Set `SITE_URL` and `NEXT_PUBLIC_SITE_URL` to the same canonical public URL so
sitemaps and metadata agree. See [the application shell](/architecture/application-shell.md),
[persistence](/integrations/persistence.md), and
[subscription delivery](/integrations/subscription-delivery.md) for usage.
