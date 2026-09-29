# HANDOFF — Codebase Survey & Gap Analysis for ICRA

**From**: teamwork_preview_explorer (Survey Code Explorer)  
**To**: teamwork_preview_orchestrator / parent (92c8851c-967e-412d-a242-e0a02aa19063)  
**Date**: 2026-09-29  
**Working Directory**: `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_explorer_survey_code_1`  
**Primary Deliverable**: `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_explorer_survey_code_1\code_survey.md`

---

## 1. Observation

### 1.1 Files, Hashes & Structure
1. **Three Identical Standalone HTML Files**:
   Execution of `Get-FileHash -Algorithm MD5` returned identical MD5 hash `79D727D4CC44C6332856FBB466EDB5C8` (size 53,449 bytes, 1,086 lines) for:
   - `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\index.html`
   - `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\preview_ui_icra.html`
   - `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\public_deploy\index.html`
2. **Server Script (`serve.js`)**:
   - 20 lines, Node HTTP server listening on `127.0.0.1:8080`, reading and serving `index.html`.
3. **Modular Source Directory (`src/`)**:
   - 11 TypeScript files located in `src/`:
     - `src/types/index.ts` (47 lines)
     - `src/data/mockCourses.ts` (154 lines)
     - 9 components in `src/components/`: `Header.tsx` (66 lines), `CourseExplorer.tsx` (172 lines), `CourseCard.tsx` (105 lines), `WeeklyTimetable.tsx` (99 lines), `TimetableCourseCard.tsx` (34 lines), `ConflictAlert.tsx` (44 lines), `AIRecommendation.tsx` (48 lines), `RegistrationSummary.tsx` (123 lines), `ConfirmationModal.tsx` (73 lines).
   - **Absence of Core Files**: `find_by_name` and directory listing confirmed that `package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`, `src/main.tsx`, and `src/index.css` DO NOT EXIST in the project repository.
4. **Reference Documentation**:
   - `Bao_Cao_Do_An_UIUX_ICRA.docx` (69,918 bytes): Official ICTU final project report for Software Interface Design under Dr. Nguyen Thanh Hai, containing requirements FR-01 through FR-08, NFR-01 through NFR-03, user scenarios, and wireframes.
   - `Software_Interface_Design_Lecture_*.txt` (6 lecture summaries on UCD, Direct Manipulation, Heuristics).

### 1.2 Verbatim Code Observations of Bugs & Discrepancies
1. **Interface Property Missing in `src/`**:
   - In `src/types/index.ts` lines 4–22, `Course` interface defines `startPeriod`, `endPeriod`, `periodText`, `timeText`, but does NOT declare `scheduleText`.
   - In `src/components/CourseCard.tsx` line 58:
     ```tsx
     <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
       {course.scheduleText} ({course.timeText})
     </p>
     ```
   - In `src/components/ConflictAlert.tsx` line 24:
     ```tsx
     ({conflict.incomingCourse.scheduleText})
     ```
   - In `src/data/mockCourses.ts`, none of the course objects have a `scheduleText` property. At runtime in `CourseCard.tsx`, this renders verbatim as `undefined (07:00 - 09:25)`.
2. **Missing Course Detail Modal**:
   - In `index.html` line 919: `const [selectedDetailCourse, setSelectedDetailCourse] = useState(null);`
   - In `CourseCard.tsx` line 72 and `WeeklyTimetable.tsx` line 82: `onOpenDetail` and `onClick` handlers pass courses to `setSelectedDetailCourse`.
   - In `index.html` lines 985–1080 (the entire JSX return of `App`), `selectedDetailCourse` is NEVER referenced. There is no modal element rendered for it. Clicking "Xem chi tiết" produces zero visual feedback.
3. **Flawed Conflict Algorithm**:
   - In `index.html` line 934:
     ```javascript
     const clash = courses.find(x => selectedIds.includes(x.id) && x.day === course.day && x.periodSlot === course.periodSlot);
     ```
   - In `src/components/CourseExplorer.tsx` line 42:
     ```typescript
     const isConflict = courses.some(x => selectedIds.includes(x.id) && x.id !== c.id && x.day === c.day && x.periodText === c.periodText);
     ```
   - Both implementations violate the authoritative R3 requirement: `Conflict = (day_A == day_B) && (start_A <= end_B && end_A >= start_B)`.
4. **Hardcoded Conflict Resolution & Blocked Timetable Cell**:
   - In `index.html` line 309 and `ConflictAlert.tsx` line 34:
     ```tsx
     <span>Tự động đổi sang CS202-01 (Chiều Thứ 5)</span>
     ```
   - In `index.html` lines 934–939 (`handleAddCourse`), if `clash` is found, the function returns early without adding the conflicting course to `selectedIds`. Consequently, only the pre-existing course exists on the timetable; the user cannot observe both courses conflicting on the grid.
5. **Missing Sunday in Day Filter**:
   - In `index.html` lines 491–499 and `src/components/CourseExplorer.tsx` lines 110–118:
     ```tsx
     <select value={day} onChange={e => setDay(e.target.value)} ...>
       <option value="ALL">Tất cả ngày (T2 - CN)</option>
       <option value="2">Thứ Hai</option>
       ...
       <option value="7">Thứ Bảy</option>
     </select>
     ```
     Option for Day 8 (Chủ Nhật / Sunday) is omitted completely.
6. **Hardcoded Workload Meter Segments**:
   - In `index.html` lines 761–765 and `RegistrationSummary.tsx` lines 55–59:
     ```tsx
     <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
       <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: totalCredits < 12 ? '40%' : '30%' }}></div>
       <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: totalCredits >= 12 && totalCredits <= 18 ? '55%' : '0%' }}></div>
       <div className="h-full bg-red-500 transition-all duration-300" style={{ width: totalCredits > 18 ? '30%' : '0%' }}></div>
     </div>
     ```
     Three static width divs are toggled rather than a true continuous progress bar displaying `(credits / 24) * 100%`.
7. **Mock Google Calendar Export**:
   - In `index.html` line 1065:
     ```javascript
     <button onClick={() => alert('Đã tải xuống file lịch học ThoiKhoaBieu_ICRA_ICTU.ics!')} ...>
     ```
     Triggers a standard browser `alert()`; no `.ics` file is downloaded.
8. **Static Countdown Timer**:
   - In `index.html` line 263 and `Header.tsx` line 44:
     ```tsx
     <span className="font-mono font-bold text-blue-600">74:15:20</span>
     ```
     Static text; no timer hook or interval updating the value.
9. **Missing Timetable Plan Switcher (Phương án 1 / Phương án 2)**:
   - Neither `index.html` nor `src/components/WeeklyTimetable.tsx` has UI tabs or state to switch between Plan 1 and Plan 2, despite R3 requiring: "chuyển đổi giữa các phương án thời khóa biểu (*Phương án 1 / Phương án 2*)".

---

## 2. Logic Chain

1. **Observation 1.1.1 + 1.1.3 → Inference on Deployability**:
   `index.html` is the only executable artifact because it loads all dependencies via CDN and runs in-browser Babel. `src/` cannot be executed, built, or tested because there is no `package.json` to define dependencies or build scripts, no entrypoint (`App.tsx`/`main.tsx`), and no configuration (`tsconfig.json`/`vite.config.ts`). This directly violates R5's requirement: "Đóng gói ứng dụng chạy được cả ở chế độ modular source trong src/ và chạy độc lập qua index.html".
2. **Observation 1.2.1 → Inference on Code Health**:
   `CourseCard.tsx` and `ConflictAlert.tsx` were modified to rely on `course.scheduleText`, but `Course` in `types/index.ts` and `mockCourses.ts` was not updated to include it. When a TypeScript build tool is introduced, these will cause compiler errors (`TS2339: Property 'scheduleText' does not exist on type 'Course'`).
3. **Observation 1.2.3 → Inference on Conflict Accuracy**:
   Comparing periods via string equality (`periodText === c.periodText` or `periodSlot === c.periodSlot`) fails for any course whose time interval spans multiple periods (e.g. Tiết 7-10 overlaps with Tiết 7-9 and Tiết 10-11). The canonical mathematical interval condition `(start_A <= end_B && end_A >= start_B)` is the only way to satisfy the Acceptance Criteria: "Bắt lỗi trùng lịch học 100% chính xác".
4. **Observation 1.2.2, 1.2.5, 1.2.7, 1.2.8, 1.2.9 → Inference on Functional Completeness**:
   The user request specifically requires R1 (live countdown), R2 (Sunday filter, course detail modal), R3 (Plan 1/2 switcher, dynamic auto-switch), R4 (proportional workload meter), and R5 (real .ics download, dual modular/standalone parity). These represent tangible, verifiable gaps that must be resolved to meet enterprise SaaS quality.

---

## 3. Caveats

1. **Backend & Database Scope**:
   The project specification and user request focus strictly on client-side React + TypeScript UI/UX, in-memory state, and static export. Backend REST endpoints or database persistence (PostgreSQL/MongoDB) were not investigated as they are out of scope.
2. **Browser Environment Assumptions**:
   Analysis assumes a modern evergreen browser (Chrome, Edge, Firefox, Safari) with ES6+ and canvas support (for `canvas-confetti`).
3. **Network Mode**:
   CDN dependencies in `index.html` require internet access unless cached or served from a local bundle. Moving to a bundler (Vite) with local `node_modules` eliminates all CDN dependencies for offline reliability.

---

## 4. Conclusion

1. **Current Status**: The visual design and aesthetic structure of ICRA are well-crafted and align with the UI/UX specifications of ICTU's Software Interface Design course. However, the application is functionally shallow in critical areas (dummy alert for calendar export, static countdown, missing modals, non-generalized conflict engine) and architecturally fractured between an all-in-one `index.html` and an incomplete `src/` tree.
2. **Implementation Scope for Team**:
   - **Phase 1 (Tooling & Architecture)**: Initialize `package.json`, `tsconfig.json`, `vite.config.ts`, `src/App.tsx`, `src/main.tsx`, and `src/index.css`.
   - **Phase 2 (Schema & Conflict Engine)**: Standardize `Course` schema with integer periods (`startPeriod`, `endPeriod`), implement the universal `checkConflict()` utility, and generalize the 1-click alternative section resolver.
   - **Phase 3 (Missing Components & Modals)**: Implement `CourseDetailModal` (with prerequisite visualizer), `ReceiptModal`, timetable Plan 1/2 switcher, and Sunday filter.
   - **Phase 4 (Feature Fidelity & UX Polish)**: Implement true `.ics` file generation and download, ticking countdown timer, dynamic continuous Workload Meter, and ensure WCAG 2.1 AA contrast compliance.
   - **Phase 5 (Parity Build)**: Ensure both `src/` (Vite dev/build) and standalone `index.html` are 100% synchronized and fully functional.

---

## 5. Verification Method

### 5.1 Verification Commands
To independently verify the observations:

```powershell
# 1. Verify file hash parity between standalone files
Get-FileHash -Algorithm MD5 "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\index.html", "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\preview_ui_icra.html", "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\public_deploy\index.html" | Format-Table -AutoSize

# 2. Verify absence of package.json and build tools
Test-Path "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\package.json"
Test-Path "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\src\App.tsx"

# 3. Verify scheduleText mismatch
Select-String -Path "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\src\types\index.ts" -Pattern "scheduleText"
Select-String -Path "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\src\components\CourseCard.tsx" -Pattern "scheduleText"

# 4. Verify fake Google Calendar download alert
Select-String -Path "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\index.html" -Pattern "alert\("

# 5. Verify server execution
node "c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\serve.js"
```

### 5.2 Invalidation Conditions
- If `package.json` or `src/App.tsx` is discovered in an untracked directory or parent directory, the build tooling finding is invalidated.
- If `course.scheduleText` is defined in another type definition file, the type error finding is invalidated.
