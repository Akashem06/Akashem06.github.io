# Copy review

Every bit of editorial / subtitle copy on the site, in one place, so you can rewrite
whatever reads off. Edit it here to mark up what you want, or just edit the source file
listed under each block (that is what actually ships). Per-photo alt text in
`_galleries/` is not included (it is hundreds of one-line image captions, not editorial copy).

This pass rewrites the blocks that read as copywriter-voice rather than yours: plainer,
more direct, no eyebrow-phrases or try-hard lines, but still proper capitalization and
clean enough for recruiters and buyers. SEO meta descriptions are deliberately left
keyword-clear rather than conversational, since they are for search and link previews.

---

## Home (`index.html`)

- **Stamp (top-left chip):** `UWaterloo CE`  *(dropped "Always building")*
- **Roles line:** `firmware · photography · sketches · travel`
- **Lead paragraph:**
  > I'm an embedded software engineer. I work on bare-metal systems, control systems, hardware bringup, and system integration. Outside
  > of that, I shoot photos and draw.
- **Meta description (SEO / link previews):** *(unchanged, keyword-clear by design)*
  > Embedded firmware engineer, photographer, and sketch artist. Firmware,
  > photography, sketches, and travel, gathered in one place.

### Field log card (right side of hero)
- **Header:** `What I've been up to`
- **Now building:** `Vehicle Bootloader` — `Firmware-over-CAN with rollback safety and verified images.`
- **Where I've been:** pulls the latest photo's album/location. Fallback if none: `On the coast` alone, or hide the line entirely when there is no photo. *(Dropped "Chasing golden hour.")*
- **Latest sketch:** pulls the latest sketch title. Fallback: `Graphite study`. Subtext: `Graphite, sketchbook № 06.`

### Section headings
- `From the studio`  (link: `View all →`)
- `Selected projects`  (link: `All projects →`)
- `Latest writing`  (link: `All posts →`)

---

## Blog (`blog.html`)

- **Lede:**
  > Personal notes
- **Empty state:** `No posts yet. Check back soon.`
- **Meta description:**
  > Technical and personal writing

### Placeholder post (`_posts/2026-06-15-hello-world.md`) — this whole post is a placeholder to replace
- **Title:** `What This Site Is`  *(was "Hello, World, and What This Site Is")*
- **Description:**
  > First post. What this blog is going to be: embedded notes, some writing about
  > finance and life abroad, and the photo and sketch galleries.

---

## Projects (`projects.html` + `_projects/*.md`)

- **Lede:** `A few firmware and systems projects, written up properly instead of just listed.`

Each row shows a short **title** (split at the colon) and a **summary** under it. Titles
live in each project's frontmatter (`_projects/<file>.md`).

| File | Title (display ← before colon) | Summary (the subtitle under it) |
|---|---|---|
| `solar-car.md` | Solar Car Electrical and Software Integration | End-to-end firmware for a 5-node distributed system managing battery protection, power distribution, and telemetry on a competition solar electric vehicle. |
| `bootloader.md` | Vehicle Update System | A network-wide firmware update system for the solar car, with a custom datagram protocol, Python command-line tooling, and a bare-metal bootloader in ARM assembly and C. |
| `bms.md` | Battery Management System | High-voltage battery protection firmware for a 288-cell lithium-ion pack, featuring isolated SPI communication, passive cell balancing, and an extended Kalman filter for state-of-charge estimation. |
| `pdu.md` | Power Distribution Unit | Firmware for an 18-channel low-voltage power distribution board, with pre-charge management, overcurrent protection, and GPIO expanders over I2C. |
| `telemetry.md` | Vehicle Telemetry and Data Collection Infrastructure | End-to-end data acquisition for a solar race vehicle, covering a CAN-to-SD logger, a 6-axis inertial measurement unit driver, radio frequency transmission, and automated CAN tooling across a 7-node network. |
| `motor-controller.md` | 24V Motor Controller | A custom BLDC motor control library and 4-layer PCB for a 24V 10A motor controller, supporting both sensored Hall and sensorless back-EMF control with discrete-time field-oriented control. |
| `rpi-os.md` | ARM64 Operating System | A bare-metal ARM64 operating system for the Raspberry Pi 4 with a preemptive scheduler, memory manager, peripheral drivers, GPU communication, and a Breakout game demo. |
| `bluecore.md` | BlueCore | A from-scratch Bluetooth LE host stack built for my Raspberry Pi 4 OS, covering the host controller interface, generic access profile, and generic attribute profile layers. |

> Note: `solar-car`, `telemetry`, `rpi-os` have **no colon** in the title, so the whole
> long title shows as the heading and the full summary shows under it (the longest rows).
> If you want those tighter, give them a `Short Name: subtitle` title and the row splits
> cleanly like the others. Each project's `features`, `challenges`, and body text are
> longer-form and live in the same file if you want to review those too.

---

## Experience (`experiences.html` + `_experiences/*.md`)

- **Lede:** `Roles and internships. The teams, the systems I worked on, and what I shipped.`
- **Meta description:** `Work history of Aryan Kashem. Embedded firmware roles, internships, and the systems worked on.`

Each role has a one-line intro paragraph (the body of its file). Resume bullets
(`highlights`) are factual and not listed here, but they live in the same files.

| File | Role | Intro line (the write-up under the card) |
|---|---|---|
| `atomic-semi.md` | Embedded Software Intern, Atomic Semi | Semiconductor fabrication tooling firmware at Atomic Semi. The work spanned a wide range of subsystems across the fab stack, from plasma generation and vacuum control to heater sequencing and precision distance sensing. Most firmware was written in C and Rust, with a mix of real-time control loops and backend tooling for calibration and diagnostics. |
| `onsemi-wireless.md` | Wireless Software Intern, Onsemi | Wireless firmware for a low-power hearing aid platform at Onsemi. The role was focused on Bluetooth Classic and LE Audio stacks, with a heavy emphasis on link reliability, Audio streaming, and the near field magnetic induction system used for ear-to-ear synchronization. |
| `onsemi-silicon.md` | Silicon Firmware Intern, Onsemi | Pre-silicon validation for an Ethernet transceiver at Onsemi. Work involved writing and testing low-level firmware drivers against FPGA prototypes before tapeout, with a focus on catching bugs early and building reusable driver infrastructure across the team. |
| `midnight-sun.md` | Vehicle Firmware Lead, Midnight Sun | Vehicle Firmware Lead on the Midnight Sun Solar Car Team at the University of Waterloo. Over three years the role covered every embedded subsystem on the car, from high-voltage battery protection to driver controls and live telemetry. The team raced under FSGP26 and ASC26 rules, and all firmware ran on a distributed CAN-based network of STM32 nodes running FreeRTOS. |

---

## Photography (`photography.html`)

- **Eyebrow:** `Photography`  *(was "Through the lens"; or remove the eyebrow entirely)*
- **Intro:**
  > Photos grouped into folders by place and trip. Open a folder to browse it,
  > search to find a shot, or click any image to view it full size.
- **Meta description:**
  > Photography by Aryan Kashem, organized into folders by place and trip, viewable full-screen.

## Art (`art.html`)

- **Eyebrow:** `Sketchbook`
- **Intro:**
  > Sketches and other artwork, grouped into folders. Open a folder to browse it,
  > or click any piece to view it full size.
- **Meta description:**
  > Realistic pencil sketches and other artwork by Aryan Kashem, organized into folders.

---

## Resources (`resources.html`)

- **Lede:** `Tools, references, and links I keep coming back to, for embedded work, photography, and travel`
- **Empty state:** `Resource list coming soon.`
- **Meta description:**
  > Tools, references, and links Aryan Kashem recommends for embedded engineering, photography, and travel.
- The page currently ships one placeholder card: `TODO - add your first resource`. Replace it with a real resource or remove it before shipping, since a live TODO is the one thing here that actually reads as unfinished.

---

## Summary of changes this pass

- **Home lead paragraph:** rewrote to drop "I trade the keyboard for a camera and a sketchbook" and the layered phrasing; plainer and more direct.
- **Home stamp:** removed "Always building."
- **Home field log:** removed "Chasing golden hour" fallback; use `On the coast` or hide the line.
- **Projects lede:** "documented well rather than listed thin" → "written up properly instead of just listed."
- **Blog placeholder post:** title shortened to "What This Site Is"; description simplified.
- **Photography eyebrow:** "Through the lens" → "Photography" (or remove).
- **Resources:** flagged the placeholder TODO card as the real ship-blocker.
- **Left unchanged:** all meta descriptions (keyword-clear for SEO), the Art section (already clean), and the Photography/Resources intros (functional and fine).

---

## Em dash cleanup (done in a prior pass)

Removed every em dash from visible site copy and replaced with commas / periods, per
your comma-and-period rule. Spots fixed:

- Ledes on Blog, Projects, Experience, Resources.
- Photography meta description (was `Kashem —`).
- Gallery empty state (`Nothing here yet —`).
- The home-page section numerals (CSS `::before` was emitting `01 — From the studio`;
  now `01. From the studio`).
- Experience date ranges (were `Jan 2026 – May 2026`, now `Jan 2026 to May 2026`).
- The placeholder blog post body and title.

Not touched (not visible website copy): code comments and the private Studio tool
under `tools/`.