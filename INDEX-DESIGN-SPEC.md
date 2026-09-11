# Homepage Design & Interaction Specification  
## + PDF Catalog Rebuild Playbook

**Reference experience:** `/index.html` motion, layout, and section flow  
**Build method:** Provide a **PDF product catalog** for the new company → analyze it → map content into the **same sections** → **import images accordingly** → keep the same design language and animations  

**Rules**
- Keep the **same section types and page order** as the reference homepage.
- Do **not** invent new section types or remove existing ones.
- Do **not** copy the reference site’s company name, logo, products, or proprietary copy.
- All headlines, products, specs, features, promises, and images come from the **new PDF catalog** (and brand assets the client supplies).
- Layout, spacing, typography scale, card patterns, and animation style stay aligned with this spec.

---

## How to use this file (your workflow)

### What you will give
1. **PDF catalog** of the new company (product lines, models, features, lifestyle pages, warranty/support pages, etc.)
2. Optional: logo SVG/PNG, brand colors, tagline, social links, video file for the Cinema section

### What happens next
1. **Analyze the PDF** — extract brand, series, models, features, specs, promises, imagery cues  
2. **Fill the Catalog Analysis Sheet** (below)  
3. **Map content → sections** using the per-section “Catalog mapping” rules  
4. **Import / export images** from the PDF into `images/` with the naming map  
5. **Rebuild each section** with new content while keeping the reference layout + motion  

Until a PDF is provided, the Catalog Analysis Sheet stays as a **blank template** ready to fill.

---

## PDF Catalog Intake Workflow

```
PDF catalog received
  → Page audit (cover, brand, series, models, features, lifestyle, support)
  → Extract text facts (names, sizes, OS, display, audio, USPs, warranty)
  → Extract / crop images (hero, products, lifestyle, icons if usable)
  → Fill Catalog Analysis Sheet
  → Assign assets into Image Import Map
  → Build sections in page-flow order
  → Wire same animations (Lenis + GSAP + reveals + cursor + magnetic)
  → Responsive pass (desktop / tablet / mobile)
```

### Analysis checklist (run on every PDF)

| Check | Extract from PDF |
| --- | --- |
| Brand | Logo, brand name, tagline / slogan |
| Accent | Primary brand color (replace reference orange if provided) |
| Series / lines | 2–4 product families (maps to Categories + Showcase) |
| Models | SKUs, sizes, resolution, OS, key specs (maps to Featured slider) |
| Hero claims | Best cover headline + 4 supporting slides / themes |
| Feature set | 6–10 named technologies / features (maps to Feature intro tabs) |
| Pillars | Picture / sound / processor / smart / panel / design (maps to Pointers) |
| Promises | Support, warranty, service, quality (maps to Promise — 3 columns) |
| Lifestyle | Room / in-use photography (Cinema BG, Promise scene, Final CTA) |
| CTAs | Primary browse CTA + support / contact CTA |
| Footer | Product links, company links, socials, legal |

### Image rules

- Prefer **catalog photos** over generic stock when the PDF has usable art.
- Hero / Cinema / Final CTA / Promise scene = **full-bleed** atmospheric or product-in-room shots.
- Featured slider + Categories + Showcase = **product cutouts** (clean BG or easy to isolate).
- If PDF pages are dense, crop tightly; export high-res PNG/JPG.
- If a needed shot is missing, use the closest catalog page crop — do not invent a new section to compensate.
- Cinema video: use client video if provided; otherwise loop a silent pan/zoom of a lifestyle still (or keep poster + short clip).

---

## Catalog Analysis Sheet (fill when PDF arrives)

> Paste findings here after analyzing the PDF. This sheet drives every section.

### A. Brand

| Field | Value (from PDF) |
| --- | --- |
| Company / brand name | _TBD_ |
| Logo file | `_images/logo.png_` |
| Tagline / slogan | _TBD_ |
| Short about line | _TBD_ |
| Primary accent color | _TBD (hex)_ |
| Secondary / ink color | _TBD_ |
| Tone of voice notes | _TBD_ |

### B. Product series (target 3 for Categories + Showcase)

| # | Series name | Position | Size range | OS / platform | One-line promise | Hero product image |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | _TBD_ | Entry / Colour / Everyday | _TBD_ | _TBD_ | _TBD_ | `_images/..._` |
| 02 | _TBD_ | Focus / Premium (center card) | _TBD_ | _TBD_ | _TBD_ | `_images/..._` |
| 03 | _TBD_ | Upcoming / Flagship / Soon | _TBD_ | _TBD_ | _TBD_ | `_images/..._` |

### C. Featured models (target 6–10 for carousel)

| Model ID | Series | Size | Key specs (3 chips) | Image | Popular? |
| --- | --- | --- | --- | --- | --- |
| _TBD_ | | | | | |
| _TBD_ | | | | | |
| _TBD_ | | | | | |

### D. Hero deck (exactly 4 slides)

| Slide | Eyebrow | Headline (1 accent word) | Short desc | BG image | Deck thumb |
| --- | --- | --- | --- | --- | --- |
| 0 | _TBD_ | _TBD_ | _TBD_ | `_images/..._` | `_images/..._` |
| 1 | _TBD_ | _TBD_ | _TBD_ | `_images/..._` | `_images/..._` |
| 2 | _TBD_ | _TBD_ | _TBD_ | `_images/..._` | `_images/..._` |
| 3 | _TBD_ | _TBD_ | _TBD_ | `_images/..._` | `_images/..._` |

Hero feature chips (5): `_TBD, TBD, TBD, TBD, TBD_`

### E. Features (target 8–10 for Feature intro tabs)

| ID | Tab name | Group label | Tagline | Short desc | 4 pills | Image |
| --- | --- | --- | --- | --- | --- | --- |
| _TBD_ | | | | | | |

### F. Promise pillars (exactly 3 columns)

| Col | Title | Tagline | Lead | 3–5 items (name + text) | Icon cue |
| --- | --- | --- | --- | --- | --- |
| 01 | _TBD_ | | | | |
| 02 | _TBD_ | | | | |
| 03 | _TBD_ | | | | |

### G. Pointers (exactly 6 groups)

| Group | Hero spec title | Short desc | Spec chips | Image |
| --- | --- | --- | --- | --- |
| Picture / Display | _TBD_ | | | |
| Sound | _TBD_ | | | |
| Processor | _TBD_ | | | |
| Smart Features | _TBD_ | | | |
| Panel | _TBD_ | | | |
| Aesthetics / Design | _TBD_ | | | |

### H. Cinema / Final CTA / Footer

| Slot | Content |
| --- | --- |
| Cinema eyebrow + title + lead | _TBD_ |
| Cinema media | `_videos/...` or lifestyle still_ |
| Final CTA slogan | _TBD_ |
| Final CTA desc | _TBD_ |
| Primary CTA label + link | _TBD_ |
| Secondary CTA label + link | _TBD_ |
| Footer product links | _TBD_ |
| Footer company links | _TBD_ |
| Social URLs | _TBD_ |
| Legal | _TBD_ |

---

## Image Import Map

Export catalog art into the project using these slots. Replace files (or paths) after PDF analysis.

| Slot | Suggested path | Source in PDF | Used by |
| --- | --- | --- | --- |
| Logo | `images/logo.png` | Cover / brand page | Preloader, Nav, Footer |
| Hero BG 0–3 | `images/hero-bg-0.jpg` … `-3.jpg` | Cover + series heroes | Hero slides |
| Hero thumbs | `images/hero-thumb-0.jpg` … | Same pages cropped | Hero deck |
| Featured products | `images/model-*.jpg` | Spec / product pages | Featured slider |
| Series product 01–03 | `images/series-01.jpg` … | Series openers | Categories + Showcase |
| Lifestyle wide A | `images/lifestyle-a.jpg` | Living-room spread | Categories BG / Feature BG |
| Lifestyle wide B | `images/lifestyle-b.jpg` | Evening / ambient | Promise scene |
| Cinema / film still | `images/cinema-poster.jpg` (+ optional video) | Lifestyle film pages | Cinema |
| Feature visuals 1–10 | `images/feature-01.jpg` … | Tech / feature pages | Feature panel |
| Pointer media 1–6 | `images/ptr-01.jpg` … | Detail crops | Pointers tiles |
| Final CTA BG | `images/cta-bg.jpg` | Strong closing visual | Final CTA |
| Badges / logos (optional) | `images/badges/*.svg` | Certification marks | Featured chips |

**Import actions when PDF is provided**
1. Render or extract high-resolution page images from the PDF.  
2. Crop to the slot aspect needs (hero = landscape full-bleed; product = subject-centered; tile = flexible).  
3. Optimize for web (JPG/WebP for photos, PNG for logos/cutouts).  
4. Drop into `images/` (and `videos/` if applicable).  
5. Point each section’s `src` / CSS `background-image` / data to these files.

---

## Global Design System (keep)

### Visual language

| Token | Value / behavior |
| --- | --- |
| Base fonts | Clean sans stack (Inter-like); one family for UI + titles |
| Accent | Warm orange (`#f06824` → hover `#ff7a38`) — **override with catalog brand color if supplied** |
| Ink | Deep warm brown-black (`#1a120c`) |
| Secondary text | Muted warm gray-brown (`#5c4a3d` / `#8a7464`) |
| Surfaces | Warm off-whites / cream alternating with pure dark cinematic bands |
| Container | `min(1200px, calc(100% - 48px))` |
| Nav height | `72px` |
| Radii | `10px` / `16px` / `24–32px` for large cards |
| Easing | Expo-out feel; GSAP `expo.out` / `power3–4.out` |
| Buttons | Pill (`border-radius: 999px`), primary solid accent, secondary glass/outline on dark |

### Motion stack

- **Lenis** smooth scroll (`duration ≈ 1.15`), wired to **GSAP ScrollTrigger**
- **GSAP** for page-load timelines, scroll reveals, staggers, parallax scrub
- **Custom cursor** (desktop): dot + lagging ring; expands with label on `[data-cursor]`
- **Magnetic buttons** (`[data-magnetic]`)
- **Reduced motion** / **mobile:** strip cursor, magnetic, tilt, heavy parallax

### Shared section header pattern

1. **Eyebrow** — uppercase, tracked, accent (often with side rules)  
2. **Title** — large clamp type, tight tracking  
3. **Lead** — one short supporting sentence  

### Shared reveal types

| Attribute | Behavior |
| --- | --- |
| `data-reveal="fade"` | Fade + rise (~48px), ~1s, `expo.out`, start `top 86%` |
| `data-reveal="card"` | Fade + rise (~72px) + scale + soft blur clear |
| `data-split="lines"` / `"words"` | Masked rise of inner spans, stagger ~0.06s |
| Eyebrow extra | Letter-spacing settles `0.28em` → `0.14em` |

### Vertical side rails

Atmospheric vertical micro-copy on light sections (use new brand slogan / series names from PDF — not reference-site slogans).

---

## Complete page flow (locked)

```
Preloader
  → Fixed Navigation (+ mobile drawer)
  → Hero (full-viewport cinematic slider)
  → Featured product carousel
  → Category / series cards (3D deck)
  → Cinema video band
  → Feature explorer (tabs + stage)
  → Showcase series rows (alternating media/copy)
  → Promise pillars (glass cards over scene)
  → Capability pointers (bento mosaic)
  → Final CTA
  → Footer
```

> Promo / EMI band exists in reference code but is **not** in the live flow — skip unless the PDF has a clear financing offer and you intentionally restore that section type.

---

## Section-by-section specification

Each section keeps **Purpose → Layout → … → Transition**, plus:

- **Catalog mapping** — what to pull from the PDF  
- **Images to import** — which Image Import Map slots feed this section  

---

### Preloader

* **Purpose**  
  Brand-first loading ritual before the hero entrance; locks scroll while `body.is-loading`.

* **Layout**  
  Full-viewport fixed overlay, centered: brand mark → progress track → percent.

* **Content structure**  
  Ghost logo + fill logo (clipped by progress); thin progress bar; numeric percent.

* **Catalog mapping**  
  New company logo only. Percent/UI chrome stays. No catalog product text here.

* **Images to import**  
  `images/logo.png`

* **Visual design**  
  Dark overlay; accent progress; logo fills left→right via `clip-path`.

* **Spacing**  
  Tight center stack; generous empty field.

* **Typography**  
  Small percent; brand is image-based.

* **Animations**  
  Brand in → track in → 0–100 fill (~2.35s) → soft flash → exit up → overlay wipe `clip-path` (~0.95s). Safety timeout ~6s.

* **Scroll behavior**  
  Locked until finish; then hero entrance.

* **Hover/Interaction**  
  None.

* **Responsive behavior**  
  Same; reduced-motion skips overlay.

* **Transition to next**  
  Wipe reveals nav + hero.

---

### Navigation (Header)

* **Purpose**  
  Persistent wayfinding; transparent over dark hero, frosted solid on scroll.

* **Layout**  
  Fixed 72px bar; logo left; links right; mobile drawer.

* **Content structure**  
  Logo → primary links (Home, Products/Series, Support, About, etc. from new site IA) → drawer duplicate.

* **Catalog mapping**  
  Logo + link labels from new site structure. Product mega-labels can mirror PDF series names.

* **Images to import**  
  `images/logo.png`

* **Visual design**  
  Unscrolled over hero = light text; `.is-scrolled` = white frosted + dark text; `.is-hidden` slides away.

* **Spacing**  
  Container row; link padding ~8×14px.

* **Typography**  
  ~0.875rem links.

* **Animations**  
  Hide/show 0.5s expo; drawer ~280ms.

* **Scroll behavior**  
  Solid after ~60px; hide on scroll down past ~120px; show on scroll up.

* **Hover/Interaction**  
  Link brighten; logo magnetic.

* **Responsive behavior**  
  Hamburger + drawer; body lock when open.

* **Transition to next**  
  Floats over hero; contrast flips into light sections.

---

### Hero

* **Purpose**  
  Full-bleed brand + product statement; first viewport = one composition.

* **Layout**  
  `100dvh`; copy bottom-left; vertical rail; scroll hint; bottom deck (4 cards) + prev/next + dots.

* **Content structure**  
  4 synced BG slides · overlay + grain · eyebrow · H1 (one accent word) · desc · 5 feature chips · deck cards.

* **Catalog mapping**  
  Fill **Hero deck (Sheet D)** from cover + top series pages. Feature chips = top 5 catalog USPs. Side rail = series names or slogan from PDF.

* **Images to import**  
  `hero-bg-0…3`, `hero-thumb-0…3`

* **Visual design**  
  Dark cinematic; left-weighted gradients; accent active card/dot.

* **Spacing**  
  Nav-aware padding; content max ~620px; title ~11ch stack.

* **Typography**  
  Title `clamp(2.4rem, 5.2vw, 4.35rem)`; tracked eyebrow; soft white desc.

* **Animations**  
  Load: BG scale/brightness → type cascade → chips stagger → deck. Ongoing: 6s autoplay, BG crossfade/scale, soft BG parallax (desktop).

* **Scroll behavior**  
  Parallax while leaving hero; nav solidifies.

* **Hover/Interaction**  
  Deck / dots / arrows change slide.

* **Responsive behavior**  
  Deck compresses; rails/hint simplify.

* **Transition to next**  
  Dark → warm cream Featured band (accent side borders).

---

### Featured Slider (product carousel)

* **Purpose**  
  Browse flagship models in a continuous horizontal deck.

* **Layout**  
  Centered header + arrows/dots → full-bleed track → perk row + CTA.

* **Content structure**  
  Per card: size, optional “popular”, product image, series, model ID, specs line, badge logos, specs link.

* **Catalog mapping**  
  Fill **Featured models (Sheet C)** — prefer bestselling / hero SKUs from PDF. Header series names from Sheet B. Perks = 4 recurring catalog benefits. CTA → products listing.

* **Images to import**  
  `images/model-*.jpg`, optional `images/badges/*`

* **Visual design**  
  Cream BG `#f6f4f1`; white cards; active orange ring/glow; inactive dimmed.

* **Spacing**  
  Cards ~250–300px; overlapping margins; large track padding.

* **Typography**  
  Bold model IDs; micro series labels.

* **Animations**  
  Entrance stagger; infinite auto-drift; drag/wheel/arrows; active emphasis.

* **Scroll behavior**  
  Vertical reveal; horizontal motion independent.

* **Hover/Interaction**  
  Drag; nav hover; magnetic CTA.

* **Responsive behavior**  
  Snap-friendlier ≤900px; fewer visible cards.

* **Transition to next**  
  Warm cream → beige lifestyle Categories.

---

### Categories (series cards)

* **Purpose**  
  Three product lines as a 3D deck (sides angled, center focused).

* **Layout**  
  Centered header → 3 cards in perspective → footline.

* **Content structure**  
  Meta · title · desc · product on pedestal · 3 feature icons · CTA.

* **Catalog mapping**  
  Fill **Series (Sheet B)**. Middle card = premium/focus line. Third may be “coming soon” if PDF teases a future line. Footline = short brand line from PDF.

* **Images to import**  
  `series-01…03`, lifestyle wash `lifestyle-a.jpg`

* **Visual design**  
  Side cards dark; focus card light/elevated; `rotateY ±14°` on sides.

* **Spacing**  
  Min-heights ~500–620px; radius ~28px.

* **Typography**  
  Card titles ~1.55–1.9rem; accent CTAs.

* **Animations**  
  Stagger rise/scale/`rotateX`; image settle; CTA slide-in.

* **Scroll behavior**  
  Plays once near `top 78%`.

* **Hover/Interaction**  
  Cards ease toward camera; product lifts; arrow fills accent.

* **Responsive behavior**  
  Stack; flatten 3D.

* **Transition to next**  
  Cut to dark Cinema band.

---

### Cinema (video band)

* **Purpose**  
  Emotional “in the room” pause.

* **Layout**  
  Full-width `min(88vh, 760px)`; copy bottom; dual CTAs.

* **Content structure**  
  Loop video/poster · veil · grain · eyebrow · title · lead · Browse + Sound toggle.

* **Catalog mapping**  
  Sheet H cinema copy — lifestyle headline from PDF living-room spreads. Primary CTA → series/products.

* **Images to import**  
  `cinema-poster.jpg` + optional `videos/cinema.mp4`

* **Visual design**  
  Dark overlays + orange radials; frosted secondary button.

* **Spacing**  
  Content bottom ~72px.

* **Typography**  
  Large bold white title; soft lead.

* **Animations**  
  Play/pause via ScrollTrigger in-view; text fades.

* **Scroll behavior**  
  Media lifecycle tied to viewport.

* **Hover/Interaction**  
  Mute toggle; magnetic primary.

* **Responsive behavior**  
  Shorter band; stacked buttons.

* **Transition to next**  
  Dark → cream Feature intro.

---

### Feature Intro (feature explorer)

* **Purpose**  
  Tabbed deep-dive across named technologies.

* **Layout**  
  Header → icon tabs → prev | panel | next → footline.

* **Content structure**  
  Left: group, name, tagline, desc, CTA, dashes + counter. Right: crossfade image, script words, 4 pills.

* **Catalog mapping**  
  Fill **Features (Sheet E)** from PDF tech pages (8–10). Keep panel UX identical; only swap names/copy/images.

* **Images to import**  
  `feature-01.jpg` … `feature-10.jpg`, `lifestyle-a` for soft BG

* **Visual design**  
  White 32px panel; active tab chip + accent underline; pills on dark media.

* **Spacing**  
  Panel ~500px tall desktop; stage max ~1120px.

* **Typography**  
  Heavy feature names; tracked group label.

* **Animations**  
  Panel entrance; image crossfade; copy soft opacity swap; auto-rotate; tab scroll-into-view.

* **Scroll behavior**  
  Header/panel reveal; interaction in-place.

* **Hover/Interaction**  
  Tabs, arrows, dashes, magnetic CTA.

* **Responsive behavior**  
  Tabs swipe; panel stacks.

* **Transition to next**  
  Cream → near-black Showcase.

---

### Showcase (series storytelling rows)

* **Purpose**  
  Long-form series panels with 3D product stage + specs.

* **Layout**  
  Header → pill rail 01/02/03 → 3 articles (middle flipped).

* **Content structure**  
  Index + label · heading · body · size pills · tags · CTA · 3D TV/product stage.

* **Catalog mapping**  
  One article per **Sheet B** series. Sizes/tags/specs only from PDF. Rail labels match series order.

* **Images to import**  
  `series-01…03` (screen textures)

* **Visual design**  
  Dark glass panels; orange index; soon chip if needed.

* **Spacing**  
  Article gap ~22px; radius ~28px.

* **Typography**  
  Large white headings; muted body.

* **Animations**  
  Line-split title; row slide-in; 3D rotate settle; copy stagger; desktop pointer tilt; rail active via scroll.

* **Scroll behavior**  
  Per-row entrance; rail tracks centered row.

* **Hover/Interaction**  
  Tilt; rail hover; magnetic CTAs.

* **Responsive behavior**  
  Single column; tilt off.

* **Transition to next**  
  Dark → warm Promise scene.

---

### Promise (pillars)

* **Purpose**  
  Three trust/service commitments over lifestyle scene.

* **Layout**  
  Full-bleed scene · side tag · centered header · 3 glass columns.

* **Content structure**  
  Watermark number · icon badge · title · tagline · lead · item list.

* **Catalog mapping**  
  Fill **Promise (Sheet F)** from warranty / service / quality PDF pages. Always 3 columns.

* **Images to import**  
  `lifestyle-b.jpg` (scene)

* **Visual design**  
  Frosted glass cards; accent badges; huge faded numerals.

* **Spacing**  
  Card gap ~14–22px; radius ~28px.

* **Typography**  
  Strong titles; quieter item text.

* **Animations**  
  Header fade; columns stagger fade (no tilt).

* **Scroll behavior**  
  Cards appear ~`top 82%`.

* **Hover/Interaction**  
  Lift + brighter glass.

* **Responsive behavior**  
  Stack columns; hide side tag.

* **Transition to next**  
  Warm scene → Pointers ground.

---

### Pointers (capability mosaic)

* **Purpose**  
  Six capability pillars in a dark bento mosaic.

* **Layout**  
  Left header · mosaic (hero tall tile + stacks + band + pairs).

* **Content structure**  
  Label · hero spec · desc · media · chip row (lead chip accent-filled).

* **Catalog mapping**  
  Fill **Pointers (Sheet G)** from PDF spec groups. Keep 6 roles even if PDF labels differ slightly (rename labels to match catalog language).

* **Images to import**  
  `ptr-01.jpg` … `ptr-06.jpg`

* **Visual design**  
  Near-black tiles; rounded media; pill chips.

* **Spacing**  
  Gap ~18px; padding ~28–32px.

* **Typography**  
  Large dark header; white tile titles; accent labels.

* **Animations**  
  Header reveals; tile hover lift.

* **Scroll behavior**  
  Mosaic reads as one composition.

* **Hover/Interaction**  
  `translateY(-4px)`.

* **Responsive behavior**  
  Single column; media above copy.

* **Transition to next**  
  Light mosaic → dark Final CTA.

---

### Final CTA

* **Purpose**  
  Closing slogan + dual actions.

* **Layout**  
  Centered ~70vh; max width ~800px.

* **Content structure**  
  Eyebrow (brand) · split slogan · desc · primary + secondary pill buttons.

* **Catalog mapping**  
  Sheet H — use PDF slogan / campaign line. CTAs = Explore products + Support/Contact.

* **Images to import**  
  `cta-bg.jpg`

* **Visual design**  
  Full-bleed photo under dark veil + grain.

* **Spacing**  
  Generous title→desc→actions rhythm.

* **Typography**  
  Title `clamp(2.5–4rem)`.

* **Animations**  
  Stagger rise; button `back.out` pop; word split.

* **Scroll behavior**  
  Trigger ~`top 75%`.

* **Hover/Interaction**  
  Magnetic; secondary invert.

* **Responsive behavior**  
  Stack buttons.

* **Transition to next**  
  Into Footer.

---

### Footer

* **Purpose**  
  Sitemap, social, legal, brand close.

* **Layout**  
  Dark multi-column top → legal bottom.

* **Content structure**  
  Logo · tagline · about · Products · Company · Social · motto · legal.

* **Catalog mapping**  
  Sheet H footer fields; tagline = PDF slogan; product links = series list.

* **Images to import**  
  `images/logo.png`

* **Visual design**  
  Near-black `#07090d`; quiet links; social circles.

* **Spacing**  
  Container rhythm; clear top/bottom split.

* **Typography**  
  Small muted; motto slightly stronger.

* **Animations**  
  Column stagger on enter.

* **Scroll behavior**  
  Page end.

* **Hover/Interaction**  
  Underlines; magnetic social.

* **Responsive behavior**  
  Stack / wrap columns.

* **Transition to next**  
  End.

---

## How motion works together (end-to-end)

1. Preloader brand ritual → wipe  
2. Hero cinematic entrance timeline  
3. Lenis continuous scroll  
4. One-shot ScrollTrigger reveals (~78–90% viewport)  
5. Light cream sections ↔ dark cinematic bands as “acts”  
6. One major interactive system per section (deck / carousel / tabs / tilt)  
7. Cursor + magnetic CTAs unify hover language  
8. Nav hide/show + solidify  
9. Mobile / reduced-motion strip luxury motion first  

**When rebuilding from PDF:** do not change these timings/patterns — only swap content and assets.

---

## Rebuild checklist (PDF → live homepage)

1. Receive PDF catalog (+ optional logo/colors/video).  
2. Complete **Catalog Analysis Sheet** (A–H).  
3. Export crops into **Image Import Map** paths.  
4. Update CSS accent variables if brand color differs.  
5. Rebuild sections **in locked page-flow order** with new copy/images only.  
6. Keep reference spacing, radii, overlays, reveals, carousels, and tilt behavior.  
7. Hero first viewport: brand + one headline + short support + deck — no extra widgets.  
8. Full-bleed media for Hero / Cinema / Promise scene / Final CTA.  
9. QA desktop + ≤900px + reduced-motion.  
10. Do not add sections that are not in the locked flow.

---

## Section inventory (quick reference)

| # | Section | Mood | Key interaction | PDF source |
| --- | --- | --- | --- | --- |
| 0 | Preloader | Brand fill | Progress clip | Logo |
| 1 | Nav | Adaptive chrome | Hide on scroll / drawer | Logo + IA |
| 2 | Hero | Dark cinematic | Auto BG + deck sync | Cover + Sheet D |
| 3 | Featured slider | Warm light | Infinite drag carousel | Models Sheet C |
| 4 | Categories | Beige lifestyle | 3D series cards | Series Sheet B |
| 5 | Cinema | Dark film | Autoplay + mute | Lifestyle Sheet H |
| 6 | Feature intro | Cream studio | Tabs + crossfade | Features Sheet E |
| 7 | Showcase | Near-black | Alternating rows + tilt | Series Sheet B |
| 8 | Promise | Warm scene | Glass pillars | Promise Sheet F |
| 9 | Pointers | Light bento | Capability mosaic | Pointers Sheet G |
| 10 | Final CTA | Dark photo | Dual CTAs | Slogan Sheet H |
| 11 | Footer | Near-black | Link columns | Footer Sheet H |

---

## Status

| Item | Status |
| --- | --- |
| Reference design/animation captured | Done |
| PDF catalog provided | **Waiting** |
| Catalog Analysis Sheet filled | Pending PDF |
| Images imported to slots | Pending PDF |
| Sections rebuilt with new company content | Pending PDF |

**Next step:** Send the PDF catalog (and logo if separate). The sheet above will be filled, images mapped into the import slots, and every section built to match this design system.

---

*Design system derived from `/index.html` + `css/main.css`, `css/pages.css`, `css/animations.css`, `js/app.js`, `js/chrome.js`, `js/cursor.js`. Original reference page files are not modified by this document alone.*
