# CLAUDE.md

Operating manual for any AI assistant or contributor working on this repo. Read it before making changes. Keep it lean - strategy and planning live elsewhere (see "What's NOT here").

## What this is

Personal blog + portfolio for **Aryan Kashem** - embedded firmware engineer (UWaterloo CE), photographer, and sketch artist who travels. The site mixes technical writing (embedded, finance, life abroad) with creative galleries (photography, realistic sketches, travel). Maintained by Aryan alone.

- **Repo:** `Akashem06.github.io`
- **Live:** https://akashem06.github.io

## Stack & hosting (decided - do not change without updating every doc)

- **Hosting:** GitHub Pages (free, automatic HTTPS, static only - no server, no database). **Portable by design:** the build outputs static files, so only the deploy job + `url`/`CNAME` are GitHub-specific. A custom domain or a future move to another static host is a bounded change - see "Portability & custom domain" in `docs/05-cicd.md`. Keep build and deploy decoupled.
- **Framework:** Jekyll (natively supported by Pages, zero build config).
- **Styling:** Plain HTML/CSS. No React, no Next.js, no heavy JS. **One watercolor
  palette, two themes:** the default warm "paper" light theme and a warm-charcoal
  "paper at night" dark theme, flipped by a nav toggle (follows the OS setting first,
  then remembers the visitor's choice). Dark mode only re-points the token block, so
  components re-skin with no markup change. **Type:** two
  self-hosted fonts (Anton display + Archivo body) — a deliberate, bounded exception to
  "system fonts only", kept lean (latin-subset woff2, ~53KB, preloaded). See
  `docs/01-visual.md`. Don't add more web fonts without re-justifying the budget.
- **Content:** Markdown (`.md`) for posts; gallery items as Markdown + images.
- **Deploy:** push to `main` → GitHub builds and publishes automatically.

## Repo layout

```
Akashem06.github.io/
├── CLAUDE.md              ← you are here
├── _config.yml            ← site config
├── Gemfile
├── .gitignore
├── docs/                  ← reference docs (read the relevant one per task)
│   ├── 01-visual.md
│   ├── 02-tabs.md
│   ├── 03-user-interface.md
│   ├── 04-authoring.md
│   └── 05-cicd.md
├── _layouts/              default.html · post.html · page.html (also projects) · gallery.html
├── _includes/             header.html · footer.html · lightbox.html · seo.html
├── _posts/                ← blog articles (YYYY-MM-DD-slug.md)
├── _galleries/            ← gallery collections (photography / sketches / travel)
├── _projects/             ← engineering project entries (optional image gallery + video)
├── _experiences/          ← work history entries (rendered as a timeline)
├── assets/
│   ├── css/main.css
│   ├── fonts/             ← self-hosted woff2 (Anton + Archivo, latin subset)
│   ├── images/<section>/
│   └── video/projects/    ← self-hosted project showcase clips (.mp4)
├── index.html  blog.html  projects.html  experiences.html  photography.html  art.html  resources.html
```
(Home `index.html` is also the about/landing — there is no `about.html`.)

## The five docs

Each owns one concern. When a task touches it, read the doc first and keep it in sync.

1. `docs/01-visual.md` - color, type, spacing, imagery rules, motion.
2. `docs/02-tabs.md` - the site's tabs/sections and what belongs in each.
3. `docs/03-user-interface.md` - visitor-facing UI/UX (nav, galleries, lightbox, responsive).
4. `docs/04-authoring.md` - Aryan's workflow for posting/updating (blog posts, galleries, projects, experiences).
5. `docs/05-cicd.md` - CI/CD: validation checks + deploy automation.

## Working principles

- **The work is the content; the UI is the frame.** Minimal chrome so photos/projects/writing dominate.
- **Performance is a feature.** Lazy-load images, responsive sizes, green Lighthouse. Image-heavy ≠ slow.
- **SEO matters** (traffic is a goal): meta title + description + OG image on every page; sitemap + RSS auto-generated.
- **Quality over quantity for projects.** 3–5 well-documented beats 15 thin.
- **Accessibility is non-negotiable.** Alt text on every image, keyboard-navigable galleries, sufficient contrast.
- **One source of truth.** Change behavior → update the relevant `docs/` file in the same commit.

## Conventions

- Post filenames: `_posts/YYYY-MM-DD-slug.md`. Frontmatter required (schemas in `docs/04-authoring.md`).
- Images in `assets/images/<section>/`, referenced by relative path, always with alt text.
- Commits: present tense, scoped - `content: add Iceland travel gallery`, `ui: fix lightbox focus trap`.
- No secrets, email-in-plaintext, or personal financial info committed.

## Before finishing any task

- [ ] Builds locally (`bundle exec jekyll serve`)?
- [ ] Every image has alt text?
- [ ] SEO frontmatter present on new pages/posts?
- [ ] Relevant `docs/` file updated?
- [ ] CI validation (see `docs/05-cicd.md`) will pass?

## What's NOT here (on purpose)

Monetization strategy, affiliate commission figures, and the personal timeline live in `STRATEGY.local.md`, which is **gitignored** - never committed, never indexed. Don't move that content into tracked files. It's noise for a coding assistant and shouldn't be public.