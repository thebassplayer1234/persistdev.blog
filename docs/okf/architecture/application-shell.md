---
type: Architecture
title: Application shell
description: The root layout provides shared metadata, navigation, search, theme handling, analytics, and footer behavior.
tags: [nextjs, search, theme, metadata, analytics]
---

# Application shell

The root layout wraps every route with the header, footer, toast provider,
Vercel Analytics, and Vercel Speed Insights. It supplies site-level metadata
from `src/utils/siteMetadata.ts` and loads the checked-in Inter and Manrope
variable fonts through `next/font/local`.

The primary navigation exposes `/`, `/about`, and a query-driven search modal.
The about page is rendered at `/about`; the home page is rendered at `/`.

## Search and publication visibility

The root layout passes only public posts to the search modal. A post is public
when `isPublished` is true and its publication date is not in the future.
Search is client-side and uses Fuse to match post titles and raw MDX content.
The search modal is controlled by the `search-modal` query parameter.

## Theme and analytics

Theme preference is stored under the `theme` key in `localStorage`. If no
stored value exists, the UI follows the user's `prefers-color-scheme` setting.

Google Analytics is included only when `NEXT_PUBLIC_GOOGLE_ANALYTICS` is set.
See [runtime configuration](/integrations/runtime-configuration.md) for the
environment-variable contract.
