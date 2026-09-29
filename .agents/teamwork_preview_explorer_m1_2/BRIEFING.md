# BRIEFING — 2026-09-29T01:21:00Z

## Mission
Investigate CourseExplorer and Faceted Filtering in src/components/CourseExplorer.tsx and index.html to formulate technical solutions for fast instant search (<100ms), faculty filter, shift filter, day filter (including Sunday / Day 8), max credit slider, and no-conflict checkbox.

## 🔒 My Identity
- Archetype: explorer
- Roles: teamwork_preview_explorer
- Working directory: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_explorer_m1_2
- Original parent: 92c8851c-967e-412d-a242-e0a02aa19063
- Milestone: Milestone 1 (Explorer 2: CourseExplorer & Faceted Filtering)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement code in src/ or index.html directly
- Focus strictly on CourseExplorer, CourseCard, faceted filters, and state coordination
- Output concrete technical recommendations in handoff.md and report to parent

## Current Parent
- Conversation ID: 92c8851c-967e-412d-a242-e0a02aa19063
- Updated: 2026-09-29T01:21:00Z

## Investigation State
- **Explored paths**:
  - `src/components/CourseExplorer.tsx` (lines 1-172)
  - `src/components/CourseCard.tsx` (lines 1-105)
  - `src/components/WeeklyTimetable.tsx` (lines 1-99)
  - `src/components/RegistrationSummary.tsx` (lines 1-100)
  - `src/components/Header.tsx` & `ConflictAlert.tsx`
  - `src/types/index.ts` & `src/data/mockCourses.ts`
  - `index.html` (lines 1-1086, specifically lines 403-550 CourseExplorer)
  - `.agents/TEST_INFRA.md`, `.agents/ORIGINAL_REQUEST.md`, `.agents/PROJECT.md`
- **Key findings**:
  1. **Missing Sunday (Day 8 / Chủ Nhật)**: In both `CourseExplorer.tsx` (lines 111-118) and `index.html` (lines 492-499), Sunday is absent from the Day dropdown despite the timetable supporting 8 columns (T2 to CN) and requirement R2/R3 explicitly requiring Sunday.
  2. **Faculty Filter Schema Divergence**: `CourseExplorer.tsx` uses `<option value="TOAN">` and `<option value="NN">`, while `PROJECT.md` specifies `faculty: 'CNTT' | 'Toán - Tin' | 'Ngoại ngữ'`. Must support both aliases so filter never breaks.
  3. **Shift Filter Period Rule Mismatch**: `CourseExplorer.tsx` matches `c.shift === shift`, ignoring period boundaries (Sáng: 1-5, Chiều: 6-11). If `c.shift` is Vietnamese ('Sáng'/'Chiều') vs English ('MORNING'/'AFTERNOON') or determined by startPeriod, matching fails.
  4. **Conflict Check Flaws**: In `CourseExplorer.tsx`, conflict is checked via `x.periodText === c.periodText` (brittle string comparison). In `index.html`, checked via `x.periodSlot === c.periodSlot`. Canonical rule is interval collision `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)`.
  5. **Instant Search (<100ms) Optimization**: Redundant 3x lowercasing per course per render. Lacks Vietnamese diacritics/accents removal (e.g. searching "toan" or "thiet ke" won't find "Thiết kế"). Pre-normalizing query achieves <1ms execution.
  6. **Empty State & UX Polish**: 0 filtered results currently render blank area. Needs clear empty state card with "Đặt lại bộ lọc" button.
- **Unexplored areas**: None for M1 Explorer 2 scope. All files and requirements fully inspected.

## Key Decisions Made
- Formulate concrete code solutions for Worker for both `src/components/CourseExplorer.tsx` and `index.html` (and mirror `preview_ui_icra.html`).
- Provide an interval collision helper function `checkIntervalConflict` that works with startPeriod/endPeriod.

## Artifact Index
- .agents/teamwork_preview_explorer_m1_2/DISPATCH.md — Task dispatch log
- .agents/teamwork_preview_explorer_m1_2/BRIEFING.md — Persistent working memory
- .agents/teamwork_preview_explorer_m1_2/progress.md — Liveness heartbeat
- .agents/teamwork_preview_explorer_m1_2/handoff.md — Final comprehensive handoff report
