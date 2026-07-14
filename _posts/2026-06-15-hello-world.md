---
layout: post
title: "What This Site Is"
date: 2026-06-15
description: "First post. What this blog is going to be: embedded notes, some writing about finance and life abroad, and the photo and sketch galleries."
categories: [meta]
image: /assets/images/blog/hello-world.svg
read_time: 2
---

> **Placeholder post.** Replace this with your first real article. The schema and
> structure are here so you can copy the pattern. See `docs/04-authoring.md`.

Welcome. This is where I'll write about the things I spend my time on: embedded
firmware and the debugging that comes with it, a bit of finance and what it's like
managing money as a student abroad, and the occasional note from the road.

## What you'll find here

- **Writing**: embedded systems, finance, life abroad.
- **[Projects]({{ '/projects/' | relative_url }})**: a few engineering builds, documented properly.
- **[Photography]({{ '/photography/' | relative_url }})** and **[Art]({{ '/art/' | relative_url }})**: what I've shot and drawn.

## How posts work

Each post is a Markdown file in `_posts/` with frontmatter for the title, date,
description, and categories. Headings, code blocks, and images all render from plain
Markdown:

```c
int main(void) {
    return 0;  // the smallest possible firmware
}
```

That's the whole interface. Write a file, commit, push. The rest is automated.
