---
type: Architecture
title: Content pipeline
description: MDX post files are read at runtime and enriched into the post model used by pages and components.
tags: [content, mdx, posts]
---

# Content pipeline

Blog posts are stored under `content/<slug>/index.mdx`. The directory path
without `index.mdx` is the post's flattened path; for example,
`content/understanding-typescript-never/index.mdx` has the flattened path
`understanding-typescript-never`.

`src/content/generated.ts` recursively discovers `.mdx` files in `content/`.
It parses YAML frontmatter, calculates reading time, extracts headings for the
table of contents, and resolves an optional image relative to the source MDX
file. Images must resolve within `public/` to be included in the post model.

The loader exports cached `getAllPosts`, `getPostBySlug`, and
`getCategorySlugs` accessors. The post page, home page, category page, and
search modal consume this shared model.

The loader reads every source post. Public consumers use the publication rule:
`isPublished` must be true and `publishedAt` must not be in the future.

## Frontmatter contract

Every post supplies `title`, `description`, `publishedAt`, and `author`.
`updatedAt`, `image`, `isPublished`, and `tags` are optional in the loader;
`updatedAt` defaults to `publishedAt`, `isPublished` defaults to `true`, and
`tags` defaults to an empty list.

Post dates are parsed as JavaScript dates and exposed as ISO timestamps in the
generated model. Authors should use `YYYY-MM-DD` dates in post frontmatter.

New post hero images are 16:9 assets with a minimum resolution of 1920×1080
pixels. Store them under `public/posts/`, verify their dimensions before use,
and reference them from post frontmatter with a path that resolves inside
`public/`.

## LinkedIn promotion

When creating a LinkedIn post for a specific article, keep it short and
simple: no more than 75 words, one practical takeaway in plain language, and
the article's canonical URL. It is a promotion, not a full summary; avoid
unnecessary marketing language.

See [the blog-post domain rule](/domain/blog-post.md) for authoring and URL
constraints, and [public routes](/architecture/public-routes.md) for route
behavior.
