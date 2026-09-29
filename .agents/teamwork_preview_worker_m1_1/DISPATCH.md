# DISPATCH — Milestone 1 Worker (Implementation)

- **Role**: teamwork_preview_worker
- **Working Directory**: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_worker_m1_1
- **Authoritative Request**: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\ORIGINAL_REQUEST.md
- **Project Index**: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\PROJECT.md
- **Explorer Reports to Consume**:
  - `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_explorer_m1_1\handoff.md` (Types, Mock Data, Header, Countdown, Notification)
  - `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_explorer_m1_2\handoff.md` (CourseExplorer, Faceted Filtering, Sunday, Slider, Search <100ms)
  - `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_explorer_m1_3\handoff.md` (CourseCard 4 states, WCAG 2.1 AA, Ghost block preview)
- **Files Owned Exclusively by This Worker**:
  - `src/types/index.ts`
  - `src/data/mockCourses.ts`
  - `src/components/Header.tsx`
  - `src/components/CourseExplorer.tsx`
  - `src/components/CourseCard.tsx`
  - Standalone `index.html` (synchronize Header, CourseExplorer, CourseCard, and Mock Data with exact parity)

## Mandatory Tasks:
1. Update `src/types/index.ts`:
   - Add `scheduleText: string`, `periodSlot: PeriodSlot`, `alternateCourseId?: string`, `prerequisites: string[]`, `enrolled: number`, `maxSeats: number`, `classroom?: string`.
2. Update `src/data/mockCourses.ts`:
   - Populate `scheduleText`, `periodSlot`, `alternateCourseId`, `prerequisites`, `enrolled`, `maxSeats` on all courses.
   - Add missing courses so all slots (including `slot_4_5`, `slot_10_11`) and all days (including Day 8 / Sunday) have courses.
3. Update `src/components/Header.tsx` and `index.html` (Header component):
   - Implement live ticking countdown timer (starts at 74:15:20, ticks down every second).
   - Ensure student identity: An Bá Thành (DTC245210002 • CNTT K24), semester badge, portal open badge.
   - Implement interactive notification bell with unread badge and dropdown menu.
4. Update `src/components/CourseExplorer.tsx` and `index.html` (CourseExplorer component):
   - Fast instant search (<100ms) with tone/diacritics support.
   - Faculty filter (CNTT, Toán - Tin, Ngoại ngữ).
   - Shift filter (Sáng: 1-5, Chiều: 6-11).
   - Day filter with Sunday (Day 8 / Chủ Nhật) fully integrated.
   - Max credits slider.
   - Smart checkbox "Chỉ hiển thị lớp không trùng lịch" using interval math.
5. Update `src/components/CourseCard.tsx` and `index.html` (CourseCard component):
   - Canonical 4 states: *Selected* > *Ineligible* > *Conflict* > *Available*.
   - WCAG 2.1 AA text contrast compliance (no sub-4.5:1 text).
   - Ghost block hover preview trigger (`onHoverEnter`, `onHoverLeave`).
   - "Xem chi tiết" trigger accessible across all states, with `e.stopPropagation()` on action buttons.
6. Run tests:
   `node --test tests/*.test.js`
   Ensure all tests continue to pass with 0 failures!

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-29T01:23:06Z
You are teamwork_preview_worker implementing Milestone 1 (Header, Identity, Course Explorer with Faceted Filtering, CourseCard States, Data Contracts).
Working directory: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_worker_m1_1
Authoritative User Request: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\ORIGINAL_REQUEST.md
Dispatch details: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_worker_m1_1\DISPATCH.md
Project Index: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\PROJECT.md
Project Root: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA

