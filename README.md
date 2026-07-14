# Content input reference: Projects & Experiences

This file lists every frontmatter field you can set for an **engineering project**
(`_projects/`) and a **work experience** (`_experiences/`), what each one does, and a
ready to fill template for both. Hand this to an agent and it can produce complete,
valid Markdown files.

Style note: copy uses commas and periods only. No em dashes.

---

## Engineering project

- **File:** `_projects/slug.md` (lowercase, hyphenated or underscored slug, e.g. `bms.md`)
- **Rendered by** `_layouts/page.html`, carded on `projects.html`, and surfaced on the
  home page when `featured: true`.

### Fields

| Field | Required | Type | What it does |
|---|---|---|---|
| `layout` | yes | string | Must be `page`. Do not change. |
| `title` | yes | string | Project name. Shows as the H1, the card title, and the SEO/OG title. |
| `summary` | recommended | string | One sentence pitch. Shows under the title and on the card. |
| `repo` | optional | URL | Source link. Renders a "Repository" button. |
| `demo` | optional | URL | Live demo link. Renders a "Live demo" button. Leave blank if none. |
| `docs` | optional | URL | Docs link. Present in some files, not rendered yet. Safe to include or omit. |
| `team` | optional | string | Team or org the work was done under, e.g. `Midnight Sun Solar Car`. Present in files, not rendered yet. |
| `stack` | recommended | list | Tech and tool tags, e.g. `[C, FreeRTOS, STM32, CAN]`. Renders as tag chips. Quote any entry with a space, e.g. `"ARM Assembly"`. |
| `features` | recommended | list | Bullet highlights. Render under a "Highlights" heading. Lead each with impact. |
| `challenges` | optional | string | A short paragraph on 1 to 2 hard problems and the fix. Renders under "Challenges". |
| `image` | recommended | path | Cover image, used on the project card and as the OG/social preview. e.g. `/assets/images/projects/bms.jpg`. |
| `gallery` | optional | list of objects | Image strip that opens the lightbox. Each entry is `{ image, thumb, alt }`. Every entry needs `alt`. |
| `video` | optional | path | Self hosted MP4 under `assets/video/projects/`. Renders an inline player. Keep it short and compressed. |
| `video_poster` | optional | path | Still frame shown before the video plays. |
| `featured` | optional | boolean | `true` surfaces the project on the home page. Default `false`. |
| `date` | recommended | YYYY-MM-DD | Used only to sort projects, newest first. |

Body (everything after the second `---`) is the long write up in Markdown: what it does,
the problem, your role, what you learned. Optional but recommended.

### Template

```yaml
---
layout: page
title: ""
summary: ""
team: ""
repo: https://github.com/Akashem06/...
demo:
docs:
stack: [C, FreeRTOS, STM32, CAN]
featured: false
features:
  - ""
  - ""
challenges: ""
image: /assets/images/projects/<slug>.jpg
date: 2026-01-01
# Optional media:
# gallery:
#   - image: /assets/images/projects/<slug>/01.jpg
#     thumb: /assets/images/projects/<slug>/thumb/01.jpg
#     alt: ""
# video: /assets/video/projects/<slug>.mp4
# video_poster: /assets/images/projects/<slug>/poster.jpg
---

Long write up in Markdown. What it does, the problem, your role, what you learned.
```

---

## Work experience

- **File:** `_experiences/slug.md` (e.g. `texas-instruments.md`)
- **Rendered by** `experiences.html` as a timeline of "personnel file" cards, sorted by
  `date`, newest first.

### Fields

| Field | Required | Type | What it does |
|---|---|---|---|
| `company` | yes | string | Employer name. Shown in the metadata grid. |
| `title` | yes | string | Position title, e.g. `Firmware Engineering Intern`. Shows as the card heading. |
| `logo` | yes | path | Company logo, e.g. `/assets/images/experiences/ti.jpg`. Alt text is set automatically to "<company> logo". |
| `company_url` | optional | URL | Links the company name to its site. |
| `location` | optional | string | City, Country. |
| `type` | optional | string | Employment type. Suggested values: `Internship`, `Co-op`, `Full-time`, `Part-time`, `Contract`. Free text, so a new value is fine. |
| `start_date` | optional | string | Display string, free format, e.g. `May 2025`. |
| `end_date` | optional | string | Display string. Blank or omitted shows "Present". |
| `stack` | optional | list | Tech and skill tags. Renders as chips. |
| `highlights` | recommended | list | Resume style bullets. Lead with action verb, scope, outcome. |
| `date` | recommended | YYYY-MM-DD | Used only to sort, newest first. Set it to the role end date (or today if ongoing). |
| `featured` | optional | boolean | Reserved flag. Default `false`. |

Body (after the second `---`) is an optional longer write up about the role. The bullets
carry the summary, so the body can be left empty.

### Template

```yaml
---
company: ""
title: ""
company_url: https://example.com
logo: /assets/images/experiences/<slug>.jpg
location: ""
type: "Internship"
start_date: "May 2025"
end_date: "Aug 2025"
stack: [C, FreeRTOS, STM32, CAN]
highlights:
  - ""
  - ""
date: 2025-08-31
featured: false
---

Optional longer write up about the role. Context, team, systems, what you learned.
```

---

## Notes for whoever fills these in

- **Images are referenced by path, not uploaded here.** Use the paths shown. Drop the
  actual files in `assets/images/projects/` or `assets/images/experiences/` separately.
- **`alt` is mandatory on every `gallery` image.** CI fails without it.
- **Sorting is driven by `date` (YYYY-MM-DD), not by `start_date`/`end_date`,** which are
  display only.
- **One file per item.** Multiple projects or roles means multiple files, not one combined
  file. If the goal is to draft them all in one Markdown doc first, separate each with a
  clear heading and the agent can split them into files afterward.
- Full prose version of these schemas lives in `docs/04-authoring.md`.
```
