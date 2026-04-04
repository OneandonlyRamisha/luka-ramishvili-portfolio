# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run lint     # eslint
```

---

## Stack

**Next.js 16 · React 19 · Three.js · GSAP · Framer Motion · TypeScript · CSS Modules**

---

## SSR constraint — critical

All animation components must be loaded with `ssr: false` via `next/dynamic`. Server Components cannot use `dynamic(..., { ssr: false })`. The solution is the `ClientPage.tsx` pattern.

```
app/page.tsx        → Server Component, only renders <ClientPage />
app/ClientPage.tsx  → "use client", dynamic imports every section + static <footer>
```

Every section component file must have `"use client"` at the top even though the dynamic import handles SSR gating — hooks require it.

**Never** add canvas, Three.js, GSAP, or Framer Motion scroll hooks directly to a Server Component.

---

## Page structure

```
app/page.tsx
app/ClientPage.tsx
  <main>
    <HeroSection />          ← dynamic, ssr:false, loading: 600vh cream skeleton
    <AboutSection />         ← dynamic, ssr:false
    <PortfolioSection />     ← dynamic, ssr:false
    <TestimonialsSection />  ← dynamic, ssr:false
    <ContactSection />       ← dynamic, ssr:false
  </main>
  <footer>                   ← static inline JSX, no dynamic import needed
    © {year} LUKA RAMISHVILI · ALL RIGHTS RESERVED
  </footer>
```

---

## Component map

### Hero (`app/components/hero/`)

| File | Role |
|------|------|
| `HeroSection.tsx` | Root. Owns `scrollProgress` (0→1 over 250vh sticky container). Passes it as prop to all children. GSAP ScrollTrigger drives `document.body` background cream→dark tween. |
| `ParticleSphere.tsx` | Three.js RAF loop outside React. 4× `InstancedMesh` (one per gold tone). Geometry pre-built once via `buildParticleData()`. `depthWrite: false` for translucency. |
| `HeroName.tsx` | Displays "LUKA RAMISHVILI". Reads `scrollProgress` in `useEffect`, mutates `el.style` directly — no setState. |
| `BornToCreate.tsx` | Displays "BORN TO CREATE". Same direct-DOM pattern. Words split to viewport edges at progress 0.87→1.0. |
| `NavBar.tsx` | Static nav bar overlay. |

**Scroll phases (scrollProgress 0→1):**
- `0.0 → 0.4` — particle sphere explodes outward
- `0.35 → 0.62` — `document.body` background: cream (#F0EBE0) → dark (#0A0A0A) via GSAP tween
- `0.4 → 0.7` — particles fade out; name fades/colour transitions
- `0.7 → 0.85` — name fades out
- `0.7 → 0.87` — "BORN TO CREATE" fades in
- `0.87 → 1.0` — words explode to viewport edges

**Rule:** Hero children mutate `el.style.*` in `useEffect([scrollProgress])` — **never** call `setState` in response to scroll.

---

### About (`app/components/about/`)

| File | Role |
|------|------|
| `AboutSection.tsx` | Vertical timeline. 5 milestones (2015→NOW). Framer Motion `useScroll` with `offset: ["start center", "end center"]` drives a gold fill line (`scaleY`). |
| `AboutText.tsx` | Text block within each milestone row. |

**5 milestones:** FIRST LINE (2015), THINGS IN MOTION (2017), CRAFT SHARPENED (2019), BUILDING FOR REAL (2021), NOW (ongoing).

**Each milestone has a distinct entrance animation** — never reuse the same one:
1. Curtain wipe (`clipPath`)
2. Slide-in
3. Scale + rise
4. Skew reveal
5. Dramatic rise

Entrance fires via `useInView(rowRef, { once: true, margin: "-10% 0px" })`. Stagger order: counter/year (delay 0) → title (0.08–0.18s) → rule (0.32s) → description (0.45s) → node dot (0.18s).

Node dots have a pulsing ring: `animation: pulseRing 2.8s ease-out infinite`.

---

### Portfolio (`app/components/portfolio/`)

| File | Role |
|------|------|
| `PortfolioSection.tsx` | Horizontal pinned scroll. GSAP pin + `containerAnimation`. Progress bar `scaleX` 0→1. |
| `PortfolioSection.module.css` | Per-card CSS geometry art (`.c1`–`.c4`), card hover overlay. |

**4 projects:** PHANTOM (Brand Identity), AETHER (3D Web), SOLSTICE (Editorial), CIPHER (3D Configurator). Plus an end-nudge card.

**Pattern:** `containerAnimation` is passed to each card's ScrollTrigger so card reveals sync to horizontal scroll position, not vertical scroll.

**Cleanup pattern** (must match this exactly in all new GSAP sections):
```ts
const tweens: gsap.core.Tween[] = [];
const triggers: ScrollTrigger[] = [];
// ...
return () => {
  triggers.forEach(t => t.kill());
  tweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
};
```

---

### Testimonials (`app/components/testimonials/`)

| File | Role |
|------|------|
| `TestimonialsSection.tsx` | 3D card peel. GSAP pin `+=1020vh`. CSS `preserve-3d`. |
| `TestimonialsSection.module.css` | Stage/stack/card 3D CSS, card variants `.t1/.t2/.t3`. |

**Concept:** 3 cards stacked in CSS 3D perspective. On scroll, front card tilts forward (`rotateX: -20deg`, pivoting from bottom edge `transformOrigin: "50% 100%"`) then drops off screen (`y: 110vh`). Cards behind advance.

**GSAP initial setup:**
```ts
gsap.set(cards, { transformOrigin: "50% 100%" });
gsap.set(cards[0], { translateZ: 0,    scale: 1,    rotateX: 0 });
gsap.set(cards[1], { translateZ: -60,  scale: 0.95, rotateX: 0 });
gsap.set(cards[2], { translateZ: -120, scale: 0.9,  rotateX: 0 });
```

**Pin:** `end: "+=1020vh"` — 510vh per card transition. `scrub: 1`.

**3D DOM rule:** `.card` must NEVER have `overflow: hidden` (destroys `preserve-3d`). Only `.cardContent` (inner div) clips.

**Data:** 3 placeholder testimonials (Elena Voss, Marcus Osei, Sofia Andersson). Avatar placeholders use CSS circles with initials. To add a real photo: add `avatarSrc: string` to the data object and swap the avatar div for `next/image`.

Header entrance uses `immediateRender: false` on `gsap.from` to prevent opacity:0 flash before trigger fires.

---

### Contact (`app/components/contact/`)

| File | Role |
|------|------|
| `ContactSection.tsx` | Final section. Framer Motion only — no GSAP. |
| `ContactSection.module.css` | Ghost typography, glow, layout. |

**Concept:** Giant ghost "LET'S" (top-left) and "TALK" (bottom-right) in outlined Anton (`-webkit-text-stroke: 1px rgba(gold, 0.13)`, `color: transparent`). They slide in from their corners on section enter. Contact content (section marker, gold rule, email, social icons) reveals in the center.

**Email:** Each character is a `motion.span` that falls from above with staggered delay (0.028s per char). Click copies to clipboard — `AnimatePresence` swaps email row for "COPIED" flash. The `@` sign is always gold.

**Socials:** LinkedIn, Instagram, Facebook, GitHub. Inline SVG icons at 34×34px, no labels. Hover: gold color + `translateY(-6px)` + `drop-shadow`.

**Data to update before launch:**
```ts
// ContactSection.tsx line 7
email: "luka@example.com"   // ← replace with real email
// Each social href: "#"    // ← replace with real profile URLs
```

**No GSAP in this section.** Pure Framer Motion `useInView(sectionRef, { once: true, margin: "-15% 0px" })`.

---

### Footer (inline in `app/ClientPage.tsx`)

Static `<footer>` with inline styles — no component file. Gold `1px` top border, copyright left, "ALL RIGHTS RESERVED" right. Year is `new Date().getFullYear()` — dynamic.

---

## Fonts & CSS variables

**Loaded in `app/layout.tsx`** via `next/font/google`:
- `--font-display`: Anton 400 — condensed, all-caps, every heading/label/metadata
- `--font-body`: Cormorant Garamond 300/400/600 — elegant serif, quotes, body copy

**CSS variables (`app/globals.css`):**
```
--color-cream:      #F0EBE0   (hero background)
--color-dark:       #0A0A0A   (all sections after hero)
--color-gold-1:     #D4AF37   (primary gold accent, glows, active states)
--color-gold-2:     #C5A55A
--color-gold-3:     #B8972E
--color-gold-light: #E8D5A3   (hover gold, lighter variant)
--color-gold-muted: #B8A88A   (secondary text, muted accents)
--color-warm-white: #F5F5F0   (body text on dark backgrounds)
```

---

## Utilities (`lib/particleGeometry.ts`)

- `buildParticleData()` — builds the particle sphere geometry once on mount
- `clamp(v, min, max)` — used throughout scroll animations
- `lerp(a, b, t)` / `lerpColor(hex1, hex2, t)` — smooth transitions
- `easeOutCubic(t)` — explosion ease

---

## Animation conventions

| Situation | Library | Pattern |
|-----------|---------|---------|
| Scroll-driven hero children | GSAP | `useEffect([scrollProgress])` → mutate `el.style` directly, no setState |
| Section entrance (About, Contact) | Framer Motion | `useInView(ref, { once: true })` → `motion.div` with `initial`/`animate` |
| Scroll-pinned sections (Portfolio, Testimonials) | GSAP ScrollTrigger | `pin: true`, `scrub: 1`, timeline with `addLabel` |
| Background colour transition | GSAP | Tween on `document.body` background |
| Per-element stagger | Framer Motion | `transition={{ delay: base + i * step }}` |

**Easing standard:** `[0.16, 1, 0.3, 1]` (slightly bouncy, fast settle) — used site-wide as the custom cubic-bezier for Framer Motion transitions.

**GSAP `gsap.registerPlugin(ScrollTrigger)`** — called at module scope (not inside useEffect), once per file that uses ScrollTrigger.

---

## Responsive breakpoints

```
≤ 900px  — tablet: collapse grid columns, reduce font sizes
≤ 600px  — mobile: single column, reduce padding to 1.25rem, simplify/hide decorative elements
≤ 380px  — very small: hide pure-decorative elements (ghost words, etc.)
```

---

## CSS Module conventions

- One `.module.css` per component, same filename prefix
- Never put `overflow: hidden` on an element that also uses `transform-style: preserve-3d`
- Always use `will-change: transform, opacity` on elements GSAP animates
- Never set CSS `transform` on elements whose transforms are managed by GSAP — GSAP owns all transforms on those elements
- Use `position: relative; z-index: 2` on content that must float above decorative backgrounds
- Watermark text: `opacity: 0.025–0.028`, `font-size: clamp(5rem, 16vw, 20rem)`, `pointer-events: none; user-select: none`
- Gold gradient lines: `linear-gradient(to right, transparent, rgba(212,175,55,0.6) 50%, transparent)`
