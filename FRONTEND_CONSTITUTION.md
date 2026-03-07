# PMTL FE Constitution

## 1. Mission

This file is the single frontend constitution for `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl`.
Every human and every AI must read this first before changing FE.

This document unifies all frontend standards into one:

- one visual system
- one data contract
- one structural pattern
- one technical discipline

If any file, component, page, helper, or prompt conflicts with this document, this document wins.

## 2. Priority Order

Use this order when rules conflict:

1. `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl/FRONTEND_CONSTITUTION.md`
2. `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/.agent/skills/pmtl-frontend/SKILL.md`
3. `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl/app/videos/page.tsx`
4. shared foundations in `app/globals.css`, `tailwind.config.ts`, `types/strapi.ts`, `lib/strapi.ts`, `lib/strapi-client.ts`, `lib/api/*`
5. feature-level implementation

## 3. Single Visual System

The public visual reference is `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl/app/videos/page.tsx`.
All public pages must follow that visual language.

PMTL must feel:

- calm
- warm
- contemplative
- editorial
- Buddhist, not startup

Approved visual direction:

- warm cream, sand, brown, gold
- soft borders and restrained depth
- expressive headings with dignity
- clear section rhythm
- cards that feel curated, not dashboard-like

Forbidden as main style:

- blue hero banners
- green hero banners
- purple gradient branding
- generic SaaS or social-app look
- random per-page accent colors

Public page pattern:

1. Header
2. hero or intro
3. main sections with clear spacing
4. supporting sidebar if needed
5. Footer
6. StickyBanner if needed

Default public section pattern:

- eyebrow or context label
- title
- supporting description
- optional quote, divider, or motif
- consistent cards
- restrained CTA

Known visual mismatches to refactor:

- `components/library/LibraryClient.tsx`
- `components/guestbook/GuestbookPageHeader.tsx`
- `components/guestbook/GuestbookSidebar.tsx`
- `app/shares/page.tsx`

## 4. Single Data Contract

Frontend data contract is Strapi v5 flat format only.
Use:

- `documentId` for business identity
- direct fields on objects
- explicit relation and media normalization

Do not build new FE code around:

- `attributes`
- `data.attributes`
- mixed Strapi v4/v5 compat unless there is a written migration reason

Single type source of truth:

- `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl/types/strapi.ts`

Single server fetching source of truth:

- `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl/lib/strapi.ts`

Single client-safe fetching source of truth:

- `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl/lib/strapi-client.ts`

Feature API wrappers belong in:

- `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl/lib/api/`

Data rules:

- server components fetch through server helpers
- client components must not import server-only Strapi helpers
- populate must be explicit
- `populate:*` is temporary debt, not architecture
- media URLs must use shared helpers

Known contract gaps:

- `lib/api/blog.ts` uses `source` in `checkDuplicatePost()` while the rest uses `sourceName`, `sourceUrl`, `sourceTitle`
- `lib/api/community.ts` still contains legacy drift
- `lib/strapi-client.ts` still contains legacy drift
- `lib/strapi-helpers.ts` still contains legacy drift

## 5. Single Rendering And Cache Policy

Default to Server Components.
Use client components only for real browser-only behavior, local interactivity, form state, or real-time UX.

One feature must have one cache story:

1. published public CMS content uses ISR or tagged revalidation
2. user-specific or auth content uses `no-store`
3. live counters or real-time content uses an explicit real-time strategy

Known cache mismatch:

- `lib/api/downloads.ts` is temporarily using `noCache:true` while its route `app/library/page.tsx` expects revalidation

## 6. Single Structural Pattern

Folder responsibility:

- `app/` for routing, pages, metadata, server entry
- `components/` for reusable UI
- `lib/api/` for feature data access
- `lib/` for shared infrastructure
- `types/` for canonical shared types
- `contexts/` only for truly app-wide state

A page should orchestrate sections, not hold every detail inline.
Large pages must be split into smaller section, modal, form, and card components.

Main current complexity target:

- `C:/Users/ADMIN/DEV2/THINKLABS/PMTL_VN/fe-pmtl/app/shares/page.tsx`

Reuse before inventing:

1. check `components/`
2. check existing page patterns
3. extend the closest reusable piece
4. only create a new abstraction if it clearly removes repetition

## 7. Single Technical Discipline

Build discipline:

- `typescript.ignoreBuildErrors=true` is temporary debt
- `// @ts-nocheck` is emergency-only
- fix contract or fix code; do not hide type failures

Known build debt:

- `next.config.mjs`
- `app/api/revalidate/route.ts`

Logging discipline:

- no noisy runtime logs in public paths
- known cleanup target: `components/ViewTracker.tsx`

Dependency discipline:

- every dependency must justify its existence
- remove legacy packages that no longer fit the architecture
- known review target: `package.json` for `@studio-freight/react-lenis`

Query discipline:

- respect backend pagination limits
- do not request oversized pageSize values
- known mismatch: `app/library/page.tsx` and `lib/api/downloads.ts`

Utility discipline:

- use shared helpers
- use `cn()` for class merging when appropriate
- keep null-safety and formatting patterns consistent

## 8. Reusable Patterns

Public hero pattern:

- context label
- title
- supporting description
- optional quote, divider, or motif
- optional featured content

Section pattern:

- heading
- short intro
- intentional spacing
- cards with one visual grammar

Service pattern:

1. one feature file in `lib/api/feature-name.ts`
2. explicit query shape
3. explicit normalization
4. a return shape that pages can trust

Dynamic CMS page pattern:

1. fetch by slug through one helper
2. validate published state upstream
3. normalize blocks once
4. render through dedicated block components
5. keep the page shell inside the PMTL visual system

## 9. AI Execution Rules

Any AI or contributor touching this frontend must:

1. read this file first
2. check `app/videos/page.tsx` before changing public page UI
3. check `types/strapi.ts` before adding or using fields
4. check `lib/api/` before writing new requests
5. prefer Server Components first
6. prefer reuse over invention
7. do not add new styles that break the Buddhist editorial mood
8. do not extend Strapi v4 compat without a written migration reason
9. do not hide type problems with `any`, `ts-nocheck`, or ignored build errors
10. if a file breaks this constitution, report it and refactor toward the constitution

## 10. Definition Of Done

FE work is not done unless:

- the result fits the PMTL visual language
- the result uses the approved data contract
- the result respects server/client boundaries
- the result reuses shared patterns where possible
- the result does not casually add technical debt

## 11. Refactor Priority

1. unify public visual system
2. split and simplify `app/shares/page.tsx`
3. remove Strapi v4 compat drift
4. unify cache strategy
5. remove build debt, debug logs, and stale dependencies

Internal short name: PMTL FE Constitution
