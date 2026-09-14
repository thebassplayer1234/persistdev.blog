---
type: Integration
title: Subscription delivery
description: Subscription requests are validated, persisted, and sent through SendGrid from a server-side route.
tags: [sendgrid, subscriptions, api]
---

# Subscription delivery

The footer subscription form validates its email field in the browser with the
shared Zod schema, then sends the request to the URL configured by
`NEXT_PUBLIC_SUBSCRIPTION_API`. The server route validates the same request
shape before performing persistence or email delivery.

`POST /api/subscription`:

1. validates that `email` is present and is a valid email address;
2. rejects an existing subscription with the same email;
3. creates the `Subscription` row; and
4. attempts to send an email through SendGrid.

The SendGrid helper logs a delivery failure instead of rethrowing it. The route
therefore returns `201` after a subscription row is created even if delivery
fails. The current message subject and body are test content, not a verified
subscriber confirmation.

The SendGrid integration is server-only. It uses `SENDGRID_API_KEY` to
authenticate and `SENDGRID_VERIFIED_SENDER` as the sender address. Neither
value belongs in a client component or a public environment variable.

The browser requires `NEXT_PUBLIC_SUBSCRIPTION_API`; the subscription hook
throws during module initialization when it is absent. API route behavior is
described in [public routes](/architecture/public-routes.md), and the stored
record is defined by [persistence](/integrations/persistence.md).
