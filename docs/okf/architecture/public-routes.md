---
type: Route Contract
title: Public routes
description: The App Router exposes post, category, subscription, and views routes, with a redirect from the legacy blog path.
tags: [nextjs, routing, api]
---

# Public routes

Posts are rendered at `/post/<slug>`. Static parameters are generated only for
public post flattened paths. The post page returns its not-found UI for a post
that is unpublished or future-dated; a public post renders MDX content, builds
article metadata, and includes up to three related public posts with shared
tags.

Categories are rendered at `/categories/<slug>`. Their static parameters and
page results include only public posts: `isPublished` is true and the
publication date is not in the future.

The home page is rendered at `/` and the about page at `/about`. Search is a
query-driven modal rather than a dedicated route; see
[the application shell](/architecture/application-shell.md).

`next.config.js` permanently redirects `/blog/:slug` to `/post/:slug`. A
renamed post slug must retain the previous URL through a redirect.

## API routes

- `GET /api/views?slug=<slug>` returns the view count for a slug, or a
  fallback response when view persistence is disabled or unavailable.
- `POST /api/views` increments the view count for a request body containing a
  `slug`, with the same fallback behavior.
- `POST /api/subscription` validates an email address, creates a subscription,
  and attempts a SendGrid email delivery.

See [persistence](/integrations/persistence.md) and
[subscription delivery](/integrations/subscription-delivery.md) for the
backing integration contracts.
