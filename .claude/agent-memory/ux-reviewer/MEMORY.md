# UX Reviewer Agent Memory

## Project: 해운대순복음교회 주보 (Korean Church Bulletin Web App)

**Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript
**Fonts**: Noto Sans KR (body), Noto Serif KR (headings/section-titles) via next/font
**Design tokens** (CSS custom properties in globals.css):
  - `--navy`: #1b3252
  - `--gold`: #b8963e
  - `--gold-light`: #e8d5a3
  - `--cream`: #fdf8f0
  - `--paper`: #f5efe3
**Body text color**: #2c2218 on --paper (#f5efe3) background

## Known Patterns & Conventions
- `.section-title` class: decorative centered rule style, 0.8rem, letter-spacing 0.2em, --navy color
- Zebra-stripe rows: alternating `var(--cream)` / `white` backgrounds in table-like lists
- All sections are plain `<section>` with `<h2 class="section-title">`
- Grid layouts use `grid-cols-1 sm:grid-cols-2` (worship order) and `grid-cols-1 md:grid-cols-2` (content sections)
- WorshipCommittee and AutonomousGroups use a fixed `grid-cols-2` and `grid-cols-4` with no responsive override — known overflow risk on mobile
- FastingPrayer uses fixed `grid-cols-4` header + rows — known overflow risk on mobile

## Recurring Accessibility Gaps (confirmed in first review)
- Touch targets: top nav buttons use `py-1.5 px-4` (~30px tall) — below 44px minimum (WCAG 2.5.5)
- Font sizes: widespread use of `text-xs` (12px) and custom 0.65rem–0.7rem in dense tables — below 16px mobile base, no `rem` scaling from root
- ARIA: no `aria-label` on icon-only or emoji-augmented buttons (admin/calendar links, print button)
- No `lang` override needed — `<html lang="ko">` is correctly set
- No `<meta name="viewport">` found in layout.tsx — Next.js injects one by default, but worth verifying
- Color contrast: `--gold` (#b8963e) on white = ~2.7:1 — fails WCAG AA for normal text (needs 4.5:1)
- Color contrast: `text-gray-400` on cream/white backgrounds may fall below 3:1 for UI text
- No focus-visible styles defined in globals.css — browser defaults only
- No loading/skeleton state for async bulletin load in page.tsx

## Responsive Breakpoints Used
- `sm:` = 640px (worship order 2-col grid)
- `md:` = 768px (content 2-col grids)
- `max-w-2xl` container (672px) — snug but appropriate for bulletin format

## Sections Reviewed (2026-03-02)
All 14 bulletin components reviewed. See ux-review-2026-03-02.md for full findings.
