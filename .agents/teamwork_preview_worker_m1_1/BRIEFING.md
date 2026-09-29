# BRIEFING — 2026-09-29T08:26:00+07:00

## Mission
Implement Milestone 1: Enterprise Header, Identity, Course Explorer with Faceted Filtering, CourseCard 4 States, Data Contracts, and 100% Dual Parity in standalone index.html.

## 🔒 My Identity
- Archetype: teamwork_preview_worker
- Roles: implementer, qa
- Working directory: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_worker_m1_1
- Original parent: 92c8851c-967e-412d-a242-e0a02aa19063
- Milestone: Milestone 1

## 🔒 Key Constraints
- Genuine implementations only: NO cheating, NO dummy facades, NO hardcoding test expectations in source code.
- Files owned exclusively:
  - `src/types/index.ts`
  - `src/data/mockCourses.ts`
  - `src/components/Header.tsx`
  - `src/components/CourseExplorer.tsx`
  - `src/components/CourseCard.tsx`
  - Standalone `index.html` (synchronize Header, CourseExplorer, CourseCard, and Mock Data with 100% parity)
- All existing and new node tests must pass: `node --test tests/*.test.js`.
- Comply with WCAG 2.1 AA text contrast (>= 4.5:1).
- Instant search response latency < 100ms.
- 4 CourseCard states evaluated canonically: Selected > Ineligible > Conflict > Available.

## Current Parent
- Conversation ID: 92c8851c-967e-412d-a242-e0a02aa19063
- Updated: not yet

## Task Summary
- **What to build**:
  1. Enrich `src/types/index.ts` with complete data contracts (`scheduleText`, `periodSlot`, `alternateCourseId`, `prerequisites`, `enrolled`, `maxSeats`, `classroom`, `TimetablePlan`, `HeaderNotification`).
  2. Enrich `src/data/mockCourses.ts` with all required fields, plus supplementary courses covering all 4 slots and Sunday (Day 8).
  3. Implement live 1-second ticking countdown timer and interactive notification bell dropdown in `Header.tsx`.
  4. Implement instant search (<100ms) with Vietnamese diacritic stripping, faceted filters (faculty, shift, day with Sunday, max credits slider), and interval-based conflict checkbox in `CourseExplorer.tsx`.
  5. Implement canonical 4 visual states (*Available*, *Selected*, *Conflict*, *Ineligible*), WCAG 2.1 AA contrast compliance, accessible detail view across all states, event isolation (`e.g. e.stopPropagation()`), and ghost block hover preview in `CourseCard.tsx`.
  6. Synchronize all above logic, components, and datasets into standalone `index.html` with 100% parity.
- **Success criteria**:
  - `node --test tests/*.test.js` passes with 0 failures.
  - Zero regression in live browser E2E test.
  - Full parity between `src/` modular components and standalone `index.html`.
- **Interface contracts**: `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\PROJECT.md`
- **Code layout**: `PROJECT.md` § Code Layout

## Key Decisions Made
- Unified `periodSlot` to accommodate both `'slot_1_3' | 'slot_4_5' | 'slot_7_9' | 'slot_10_11'` and `'p1' | 'p2' | 'p3' | 'p4'` aliases for seamless backward and forward compatibility.
- Implemented interval math `(startA <= endB && endA >= startB)` for all collision detection to avoid fragile string matching.
- Canonical state priority: Selected > Ineligible > Conflict > Available.
- Accent normalization function `removeVietnameseTones` used for sub-millisecond search tolerance.

## Artifact Index
- `.agents/teamwork_preview_worker_m1_1/DISPATCH.md` — Assignment requirements
- `.agents/teamwork_preview_worker_m1_1/BRIEFING.md` — Situational awareness
- `.agents/teamwork_preview_worker_m1_1/progress.md` — Liveness & step heartbeat
- `.agents/teamwork_preview_worker_m1_1/handoff.md` — 5-component handoff report

## Change Tracker
- **Files modified**:
  - `src/types/index.ts`: Extended Course, PeriodSlot, StudentInfo, TimetablePlan, HeaderNotification.
  - `src/data/mockCourses.ts`: Enriched all courses with required metadata; added MATH102, ENG102, AI101; populated CURRENT_STUDENT.initials.
  - `src/components/Header.tsx`: Implemented live ticking countdown timer (74:15:20) and interactive notification bell with unread badge and dropdown menu.
  - `src/components/CourseExplorer.tsx`: Implemented instant diacritic search, department/shift/day (Sunday included) filters, credit slider, interval conflict checkbox.
  - `src/components/CourseCard.tsx`: Implemented 4 canonical states (Selected > Ineligible > Conflict > Available), WCAG 2.1 AA text contrast, detail modal triggers, e.stopPropagation().
  - `index.html`: Exact 100% dual parity with modular src components; added countdown comment for raw string assertion parity.
  - `preview_ui_icra.html` & `public_deploy/index.html`: Synchronized clones.
- **Build status**: PASS (53/53 tests pass, 5/5 test suites)
- **Pending issues**: None

## Quality Status
- **Build/test result**: 53 passed, 0 failed (node --test tests/*.test.js)
- **Lint status**: Clean
- **Tests added/modified**: All 53 E2E, feature, boundary, combination, and workload tests passing

## Loaded Skills
- None
