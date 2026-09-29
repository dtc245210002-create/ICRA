# HANDOFF REPORT — Survey Spec Miner (ICRA Project)

- **Agent Name**: teamwork_preview_spec_miner
- **Role**: Survey Specification Miner & Requirements Analyst
- **Working Directory**: `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_spec_miner_survey_1`
- **Handoff Type**: Hard (Task Complete)
- **Target Deliverable**: `spec_requirements.md` and `handoff.md`
- **Date**: 2026-09-29T08:14:30+07:00

---

## 1. Observation

### 1.1 Direct Source Observations
1. **Authoritative Request File** (`.agents/ORIGINAL_REQUEST.md`):
   - Lines 12-13 (R1): Enterprise Header with ICRA logo, ICTU university name, semester `Học kỳ 1, 2026 - 2027`, open registration badge, countdown timer `74:15:20`, student `An Bá Thành (DTC245210002 • CNTT K24)`, notification bell.
   - Lines 15-24 (R2): Course Explorer with Faceted Filtering (28% width): instant search by code/name/lecturer, dropdown filters (Faculty: CNTT, Toán - Tin, Ngoại ngữ; Shift: Sáng 1-5, Chiều 6-11; Day: T2-CN; Slider: max credits), smart checkbox "Chỉ hiển thị lớp không trùng lịch", 4 card visual states (*Available*, *Selected*, *Conflict*, *Ineligible*), hover Ghost Block Preview.
   - Lines 25-33 (R3): Weekly Timetable Matrix with Conflict Engine (47% width): 8 columns (Time header + 7 days) x 4 period slots (Tiết 1-3, Tiết 4-5, Tiết 7-9, Tiết 10-11). Conflict formula: `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)`. Visual alert `ConflictAlert`, flashing red border (`pulse-conflict`), subtle card shake (`shake-alert`), 1-click auto-switch button to non-clashing section, week switcher and alternate timetable plan switcher (*Phương án 1 / Phương án 2*).
   - Lines 34-41 (R4): AI Recommendation & Registration Summary (25% width): Workload meter (Underload <12 TC - Amber, Balanced 12-18 TC - Green, High Load >18 TC - Red), AI Recommendation block in violet `#8B5CF6` with explanation, 100% timetable compatibility tag and prerequisite check, selected cart list with instant remove (✕), tuition formula `Total Credits x 450,000 VNĐ`, primary CTA `Rà Soát & Xác Nhận Đăng Ký` locked if <12 credits or conflicts present.
   - Lines 42-47 (R5): Interactive Modals, Toast Feedback & Standalone Deployability: `ConfirmationModal` (pre-flight audit 0 errors, 100% prerequisites), Course Detail Modal with prerequisite tree, Confetti animation, electronic receipt `#ICRA-2026-9812-ICTU`, real Google Calendar / Apple Calendar `.ics` file export, dual deployment (modular in `src/` and standalone in `index.html`).

2. **Project Academic Capstone Report** (`Bao_Cao_Do_An_UIUX_ICRA.docx`):
   - Document length: 62,222 characters / 619 lines of text.
   - Instructed by Dr. Nguyen Thanh Hai, Faculty of IT, ICTU.
   - Students: An Bá Thành (DTC245210002), Nguyễn Văn Đông (DTC245210008), Hoàng Khánh Huy (DTC245210015).
   - §1.4: LUCID methodology (Envision -> Analyze -> Design -> Refine -> Implement -> Support/Evaluate).
   - §2.1: FR-01 through FR-08, NFR-01 (SRT < 100ms), NFR-02 (WCAG 2.1 AA), NFR-03 (Error Prevention).
   - §2.2: Information Architecture (3-Column Coordinated Views: Left 28%, Center 50%/47%, Right 22%/25%), 8-pt grid system, Direct Manipulation (Lecture 6).
   - §2.3: Mullet & Sano 6 display principles, Semantic Color System (`#2563EB`, `#EF4444`, `#10B981`, `#F59E0B`, `#8B5CF6`), Shneiderman 4 error message criteria (Specific, Constructive, Polite, Non-blocking).
   - §3.2 & §3.3: Usability testing (5 users, Think-Aloud protocol), 5 Shneiderman metrics (Learning <3m, Speed <8m, Error <5%, Retention >90%, Satisfaction >80%), SUS score = 88.5 (Grade A+), QUIS = 8.7/9.0.

3. **Current Codebase Gap Observations**:
   - In `index.html` lines 919 & 1001: `selectedDetailCourse` state exists, but no `CourseDetailModal` is rendered in the JSX.
   - In `index.html` lines 606-610 and `WeeklyTimetable.tsx` lines 45-50: Week navigation exists, but Plan Switcher (*Phương án 1 / Phương án 2*) is absent.
   - In `index.html` line 1065: The download `.ics` button merely executes `alert(...)` instead of generating and downloading a genuine `.ics` calendar file.
   - In `CourseExplorer.tsx` line 42: Conflict check uses string equality `x.periodText === c.periodText` instead of the interval formula `startPeriod <= other.endPeriod && endPeriod >= other.startPeriod`.
   - In `src/types/index.ts`: The `Course` type definition lacks `scheduleText`, which is accessed in `CourseCard.tsx` (line 57) and `ConflictAlert.tsx` (line 24).
   - In `src/`: Root `App.tsx` and build files are absent, leaving `src/` modular code incomplete.

---

## 2. Logic Chain

1. **Premise 1**: The authoritative request (`ORIGINAL_REQUEST.md`) and project capstone report (`Bao_Cao_Do_An_UIUX_ICRA.docx`) define an educational enterprise SaaS interface for ICTU with a strict 3-column Coordinated Views layout (28% Explorer / 47% Timetable / 25% Summary).
2. **Premise 2**: The UI/UX lectures at ICTU establish strict pedagogical and ergonomic criteria:
   - Lecture 8+ dictates WCAG 2.1 AA (≥4.5:1 contrast, non-color reliance), Mullet & Sano\'s 6 display design principles, 8-pt grid, and Shneiderman\'s 4 error criteria.
   - Lecture 9 dictates System Response Time (SRT < 100ms for dynamic query filtering and hover ghost previews).
   - Lecture 6 dictates Direct Manipulation with immediate visual feedback (ghost blocks, shake alert, pulse conflict).
   - Lecture 4 dictates usability evaluation benchmarks (5 human factors metrics, SUS > 80, QUIS > 8.5).
3. **Premise 3**: The prototype in `index.html` implemented the general visual style and layout, but left key contractual requirements either unrendered (`CourseDetailModal` for prerequisite trees), hardcoded (`ConflictAlert` swap text), incomplete (Plan 1 / Plan 2 switcher, real `.ics` export), or approximated (`periodText` check vs interval overlap).
4. **Conclusion**:
   - The master specification is fully discovered, consolidated, and documented in `spec_requirements.md` (388 lines, 41.5 KB) including 38 discovered features (F01-F38), 20 edge cases (E01-E20), complete WCAG 2.1 AA rules, contrast tables, and 26 acceptance criteria (FAC-01 to FAC-19 and UAC-01 to UAC-07).
   - Subsequent implementation teams (Workers for R1-R2, R3, R4, R5) must resolve the identified gaps across both modular `src/` and standalone `index.html`.

---

## 3. Caveats

- **No Backend Scope**: As confirmed in `ORIGINAL_REQUEST.md` and Capstone Report §1.3, this project is 100% focused on client-side UI/UX, interaction engineering, and usability. Backend database/server APIs are strictly out-of-scope; all data is managed via state and mock fixtures.
- **Standalone Dependency Constraint**: The standalone `index.html` must continue to operate directly in modern browsers via CDNs (Tailwind CSS, Lucide Icons, Canvas Confetti, React 18 / Babel) without requiring local Node modules, while `src/` modular TypeScript should mirror the exact same architecture.

---

## 4. Conclusion

1. **Specification Delivered**: `spec_requirements.md` has been compiled and placed in the working directory:
   `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_spec_miner_survey_1\spec_requirements.md`.
2. **Contract Boundaries Defined**:
   - **Width Split**: 28% (Course Explorer) / 47% (Weekly Timetable) / 25% (Summary & AI).
   - **Conflict Logic**: `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)`.
   - **Workload Tiers**: <12 TC (Amber), 12-18 TC (Emerald), >18 TC (Red).
   - **Validation Gate**: Primary CTA locked if credits < 12 or conflict count > 0.
   - **Modals**: CourseDetailModal (prereq tree visualizer) + ConfirmationModal (audit) + Electronic Receipt (`#ICRA-2026-9812-ICTU` with actual `.ics` download).
3. **Execution Roadmap for Orchestrator**:
   - Milestone 1: Enterprise Header, Identity & Course Explorer (R1, R2).
   - Milestone 2: Weekly Timetable Matrix, Conflict Engine & Plan Switcher (R3).
   - Milestone 3: AI Recommendations, Workload Meter & Registration Summary (R4).
   - Milestone 4: Modals, Prerequisite Tree, Confetti, Real .ICS Export & Dual Deployability (R5).
   - Milestone 5: E2E Verification & Usability Audit (WCAG 2.1 AA, SRT < 100ms).

---

## 5. Verification Method

To independently verify the completeness and accuracy of this specification survey:
1. **Inspect Deliverable**:
   - File path: `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_spec_miner_survey_1\spec_requirements.md`
   - Verify table structure: Features Discovered (F01 - F38), Edge Cases (E01 - E20), Acceptance Criteria (FAC-01..19, UAC-01..07).
2. **Cross-Check with Authoritative Requirements**:
   - Compare §5 (R1-R5 specifications) against `.agents/ORIGINAL_REQUEST.md`.
   - Compare §4 (UI/UX standards) against `Software_Interface_Design_Lecture_*_summary.txt`.
   - Compare §2 & §3 against thesis `Bao_Cao_Do_An_UIUX_ICRA.docx`.
3. **Invalidation Conditions**:
   - This specification is invalidated if any of the 5 core requirement areas (R1-R5) omits contractual features from `ORIGINAL_REQUEST.md`, if the 3-column layout proportions deviate from 28%/47%/25%, or if WCAG 2.1 AA contrast constraints are breached.
