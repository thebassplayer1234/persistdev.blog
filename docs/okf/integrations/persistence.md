---
type: Persistence Model
title: Blog persistence
description: PostgreSQL stores unique subscription emails and post view counts keyed by slug.
tags: [postgresql, prisma, subscriptions, views]
---

# Blog persistence

Prisma connects to PostgreSQL through the `@prisma/adapter-pg` adapter. The
client is cached on `globalThis` outside production to avoid creating repeated
clients during development reloads.

The schema defines two models:

- `Subscription` stores a generated string ID, a unique email address, and its
  creation timestamp.
- `Views` stores a post slug as its primary key and an integer count that
  defaults to zero.

The views API uses an upsert when incrementing a count, so the first recorded
view creates the row and later requests increment its count.

Set `VIEWS_PERSISTENCE_ENABLED=false` to intentionally bypass view persistence.
In that mode—and when a views database operation fails—the views API returns
`{ count: 0, disabled: true }` with a successful HTTP response. This lets the
post UI continue rendering when the counter is unavailable.

`DATABASE_URL` is required by the Prisma adapter. Prisma CLI configuration also
requires `DIRECT_URL`. `PRISMA_QUERY_LOGS=true` enables Prisma query and info
logging; otherwise Prisma logs warnings only.

See [public routes](/architecture/public-routes.md) for the API surface and
[subscription delivery](/integrations/subscription-delivery.md) for the
subscription workflow that writes to this model. The complete environment
variable contract is in [runtime configuration](/integrations/runtime-configuration.md).
