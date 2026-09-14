---
type: Domain Rule
title: Blog post
description: A blog post is an MDX article whose directory-derived slug is a stable public identifier.
tags: [content, publishing, routing]
---

# Blog post

A blog post is an MDX file located at `content/<slug>/index.mdx`. Its slug is
the directory path below `content/`, excluding the trailing `index.mdx`; this
slug defines the public URL `/post/<slug>`.

Because a slug is a public identifier, it must remain stable after publication.
If a slug changes, add a redirect for the former URL in `next.config.js`.

Posts use YAML frontmatter for title, description, dates, author, publication
state, tags, and an optional image. When an image is present, its path must
resolve to an asset within `public/`.

The public visibility rule applies across post routes, home and category lists,
search, and related-post selection: `isPublished` must be true and the
publication date must not be in the future.

See [the content pipeline](/architecture/content-pipeline.md) for the runtime
representation and [public routes](/architecture/public-routes.md) for the
URL contract.
