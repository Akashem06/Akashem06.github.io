# 05 - CI/CD

Validation + deploy automation. Two jobs: **validate** (catch problems before they go live) and **deploy** (build and publish). Both run via GitHub Actions on push to `main`.

## Philosophy

The push *is* the deploy. CI's job is to make that safe: if validation fails, the site is not republished. Keep checks fast (< ~2 min) so pushing stays frictionless.

## Validation job - what it checks

| Check | Tool | Why |
|---|---|---|
| Site builds without errors | `jekyll build` | Broken Liquid/frontmatter never ships |
| No broken internal links | `htmlproofer` | Dead links hurt UX + SEO |
| Images have `alt` | `htmlproofer --check-img-http` + alt check | Accessibility + SEO; enforced, not optional |
| Required frontmatter present | small Ruby/CI script | Every post needs `title`/`date`/`description`; every gallery item needs `bucket`/`album`/`image`/`alt` |
| Markdown lint | `markdownlint` (optional) | Consistency |
| No oversized images | size-check script (warn > 400KB) | Performance guardrail |

If any required check fails, the workflow stops and deploy does not run.

## Suggested workflow file

`.github/workflows/ci.yml`:

```yaml
name: CI / Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.3"
          bundler-cache: true
      - name: Build site
        run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production
      - name: Validate HTML, links, and image alts
        run: |
          bundle exec htmlproofer ./_site \
            --disable-external \
            --check-img-http \
            --enforce-https=false
      - name: Check required frontmatter
        run: ruby script/check_frontmatter.rb
      - name: Warn on oversized images
        run: |
          find assets/images -type f \( -iname '*.jpg' -o -iname '*.png' -o -iname '*.webp' \) \
            -size +400k -printf 'OVERSIZED: %p (%k KB)\n' || true

  deploy:
    needs: validate
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.3"
          bundler-cache: true
      - name: Build site
        run: bundle exec jekyll build
        env:
          JEKYLL_ENV: production
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./_site
      - id: deployment
        uses: actions/deploy-pages@v4
```

> Note: this uses the **Actions-based** Pages deploy (set Pages source to "GitHub Actions" in repo settings). That's what lets the validate-then-deploy gate work. The default "deploy from branch" mode skips your CI gate.

## Frontmatter checker (sketch)

`script/check_frontmatter.rb` should:
- Read every file in `_posts`, `_projects`, `_galleries`.
- Assert posts have `title`, `date`, `description`, `categories`.
- Assert gallery items have `bucket`, `album`, `image`, `alt` (and `alt` is non-empty).
- Assert projects have `title`, `summary`, and at least one of `repo`/`demo`.
- Exit non-zero with a clear message listing offending files.

## Gemfile additions for CI

```ruby
group :test do
  gem "html-proofer"
end
```

## Pure automation (set-and-forget)

Once configured, the human steps are only: write file → commit → push. Everything else is automated:
- Build, validate, deploy on every push.
- `jekyll-sitemap` regenerates `sitemap.xml`; `jekyll-feed` regenerates RSS - no manual step.
- Google re-crawls from the sitemap on its own cadence.

Optional add-ons later:
- **Scheduled link-check:** a weekly `cron` workflow running htmlproofer with `--disable-external=false` to catch rotted outbound/referral links.
- **Lighthouse CI:** run on PRs to flag performance/accessibility regressions before merge.
- **Dependabot:** keep the `github-pages` gem and Actions versions current automatically.

## Local pre-push (optional but nice)

A `.git/hooks/pre-push` (or a `make check`) that runs `jekyll build` + htmlproofer locally so you catch failures before they hit CI.

## Portability & custom domain

The site is intentionally **not locked to GitHub Pages**. Jekyll outputs plain static files (`_site/`), which any static host can serve. The guiding rule:

> **Build is portable; deploy is swappable. Keep them decoupled.**

The only GitHub-specific pieces in the whole repo are the **`deploy` job** in `ci.yml` (`upload-pages-artifact` / `deploy-pages`) and the `url:` value in `_config.yml`. The `validate` job, all templates, content, and asset links (which use Jekyll's `relative_url`/`absolute_url` filters - never a hardcoded `akashem06.github.io`) are host-agnostic.

### Scenario A - custom domain, still on GitHub Pages

Cheap and changes nothing about the build:

1. Add a `CNAME` file at the repo root containing just the apex/sub domain (e.g. `aryankashem.com`). **Gotcha:** with the Actions-based deploy, the custom domain can get cleared on each deploy unless the `CNAME` is part of the published artifact - keeping the file at the repo root ensures Jekyll copies it into `_site/` (don't add it to `exclude:`).
2. Point DNS at GitHub: apex `A`/`AAAA` records to GitHub's IPs, or a `CNAME` record `www → akashem06.github.io`.
3. Set `url: "https://aryankashem.com"` in `_config.yml`; keep `baseurl: ""`. Sitemap, feed, and OG tags follow automatically.
4. HTTPS stays automatic (GitHub provisions the cert).

### Scenario B - move off GitHub Pages entirely

For Netlify / Cloudflare Pages / Vercel / S3+CloudFront / a VPS:

- **Build command:** `bundle exec jekyll build` · **Publish dir:** `_site` · **Env:** `JEKYLL_ENV=production`.
- Replace **only** the `deploy` job in `ci.yml` (or use the host's own build pipeline). The `validate` job stays identical - it's your safety gate regardless of host.
- Update `url:` in `_config.yml` to the new origin. Remove the `CNAME` file if the host manages domains itself.
- Nothing in `_layouts`, `_includes`, `assets`, or content needs to change.

Because of this boundary, a future migration is a **known, bounded change to one job + one config value**, not a rewrite.