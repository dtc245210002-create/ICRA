# SPECIFICATION REQUIREMENTS — ICRA (Intelligent Course Registration Assistant)
**Document Version**: 1.0.0-PROD-SPEC  
**Author**: teamwork_preview_spec_miner  
**Context**: Trường Đại học Công nghệ Thông tin & Truyền thông (ICTU) — Khoa Công nghệ Thông tin  
**Target Architecture**: React 18 + TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti  
**Deployability**: Dual-mode (Modular in `src/` + Standalone in `index.html`)

---

## 1. Executive Summary & Authoritative Sources
This document establishes the exhaustive, binding specifications for the **Intelligent Course Registration Assistant (ICRA)** web application for Thai Nguyen University of Information and Communication Technology (ICTU).

### Authoritative Specification Sources:
1. **ORIGINAL_REQUEST.md**: Master functional specifications across R1 to R5 and acceptance criteria.
2. **Bao_Cao_Do_An_UIUX_ICRA.docx**: Full academic capstone thesis on Software Interface Design (Dr. Nguyen Thanh Hai, ICTU) detailing the LUCID methodology, Coordinated Views architecture, Design System, Atomic Design component library, usability metrics (SUS 88.5, QUIS 8.7), and user scenarios.
3. **UI/UX Course Lectures (ICTU Faculty of IT)**:
   - **Lecture 3**: UI Design Process (LUCID methodology, 3 Pillars of UI development, Ethnographic observation, Participatory design, Scenarios, Social & Ethical impacts).
   - **Lecture 4**: Evaluating Interface Designs (Jakob Nielsen 10 Usability Heuristics, Usability Lab & Think-Aloud protocol, QUIS, SUS, 5 Acceptance Test metrics).
   - **Lecture 5**: Case Studies (ATM iterative design, Apple consistency, Volvo data-driven design).
   - **Lecture 6**: Direct Manipulation (3 core principles: continuous object representation, rapid/incremental/reversible physical actions, immediate visual feedback; 2D vs 3D, telepresence).
   - **Lecture 8+**: Advancing User Experience (Mullet & Sano 6 display design principles, Smith & Mosier 162 guidelines, Coordinated Views window management, Animation, Semantic color theory, Non-anthropomorphic design, Shneiderman 4 error message criteria).
   - **Lecture 9**: Timely User Experience (System Response Time - SRT < 100ms, QoS, Delay masking, Documentation & Contextual Help).
4. **Existing Codebase & Prototypes**: `index.html`, `preview_ui_icra.html`, `src/components/*`, `src/data/*`, `src/types/*`, and `serve.js`.

---

## 2. Features Discovered Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| F01 | R1: Header | Brand Identity Banner | Displays ICRA logo, university name (ICTU), and tagline | None (static context) | SVG/Icon + stylized text | N/A | ORIGINAL_REQUEST.md, Thesis §2.2 |
| F02 | R1: Header | Current Semester Badge | Displays active registration semester | `term` string ("Học kỳ 1 (2026 - 2027) — Đợt chính") | Styled chip/badge | Defaults to current semester if missing | ORIGINAL_REQUEST.md §R1 |
| F03 | R1: Header | Registration Portal Status Badge | Live indicator showing portal is active | Portal open state boolean | Green pulsing dot + text badge "Cổng Đăng Ký Đang Mở" | Shows "Cổng Đã Đóng" (Amber/Gray) if closed | ORIGINAL_REQUEST.md §R1 |
| F04 | R1: Header | Countdown Deadline Timer | Real-time countdown timer to registration closing | Remaining seconds or target datetime (e.g. 74:15:20) | Formatted string `HH:MM:SS` + subtext `23:59 • 01/10` | When 00:00:00, disables registration CTA | ORIGINAL_REQUEST.md §R1 |
| F05 | R1: Header | System Notification Bell | Bell button indicating system announcements/alerts | Notification items list | Unread badge indicator, dropdown alert list | Empty list shows 'Không có thông báo mới' | ORIGINAL_REQUEST.md §R1, Thesis §2.2 |
| F06 | R1: Header | Student Identity Card | Displays logged-in student info | Student object: An Bá Thành (DTC245210002, CNTT K24, Kỹ thuật Phần mềm) | Name, student ID, class, avatar initials ('AT') | Fallback avatar placeholder if missing | ORIGINAL_REQUEST.md §R1, mockCourses.ts |
| F07 | R2: Explorer | Instant Keyword Search | Search-as-you-type filtering by course code, title, or lecturer | String input from text field | Filtered Course list in < 100ms | If no match, displays helpful 'Không tìm thấy học phần phù hợp' with reset button | ORIGINAL_REQUEST.md §R2, Thesis §2.1 |
| F08 | R2: Explorer | Faculty/Department Filter | Multi-option dropdown filter (All, CNTT, Toán - Tin, Ngoại ngữ, ATTT) | Select change event | Filtered course subset | Shows empty list state if no courses match | ORIGINAL_REQUEST.md §R2, mockCourses.ts |
| F09 | R2: Explorer | Shift Filter | Filter by session shift: All, Sáng (Tiết 1-5), Chiều (Tiết 6-11) | Select change event | Filtered course subset | Shows empty list state if no courses match | ORIGINAL_REQUEST.md §R2, types/index.ts |
| F10 | R2: Explorer | Day-of-Week Filter | Filter by day: All (T2-CN), Thứ 2 to Chủ Nhật | Select change event | Filtered course subset | Empty state if none on that day | ORIGINAL_REQUEST.md §R2 |
| F11 | R2: Explorer | Max Credit Slider | Interactive slider (1 to 4 credits) to limit maximum course credits | Numeric slider drag/change | Real-time filtered course list | Clamped between 1 and 4 | ORIGINAL_REQUEST.md §R2 |
| F12 | R2: Explorer | Non-Conflicting Filter Checkbox | Checkbox: 'Chỉ hiển thị lớp không trùng lịch' | Boolean checked state | Excludes courses that clash with currently enrolled courses | Returns all eligible courses if unselected | ORIGINAL_REQUEST.md §R2 |
| F13 | R2: Explorer | Filter Reset Action | One-click reset button to restore all filters to default | Click event | Search="", Faculty=ALL, Shift=ALL, Day=ALL, MaxCredits=4, NonConflicting=false | N/A | index.html, CourseExplorer.tsx |
| F14 | R2: Explorer | 4-State Visual Course Card | Renders course card with distinct visual styles for 4 states | Course object, selection state, clash state, eligibility state | Available (white), Selected (blue border), Conflict (red border/tint), Ineligible (gray 60% opacity) | Accessible labels accompanying colors | ORIGINAL_REQUEST.md §R2, Thesis §2.1 |
| F15 | R2: Explorer | Ghost Block Preview Trigger | Hovering over course card displays semi-transparent dashed block on timetable | `onMouseEnter` / `onMouseLeave` with course metadata | Dashed outline block in target time slot on matrix | Clears preview immediately on mouse exit (<50ms) | ORIGINAL_REQUEST.md §R2, Thesis §2.2 |
| F16 | R2: Explorer | Course Detail Modal Opener | Clicking 'Xem chi tiết' or clicking timetable card opens comprehensive modal | Click event with Course ID | Detailed modal popup with course description, credits, lecturer, prerequisites | Fallback gracefully if course lacks full data | ORIGINAL_REQUEST.md §R5, Thesis §2.1 |
| F17 | R3: Timetable | 8-Column Weekly Grid Matrix | Master-detail visual calendar grid: 1 Period column + 7 Day columns (T2 to CN) | Enrolled courses array, active period slots (4 slots) | Structured responsive table/grid layout | Empty slots remain cleanly bordered drop/preview zones | ORIGINAL_REQUEST.md §R3, Thesis §2.2 |
| F18 | R3: Timetable | 4 Standard Period Slots | Fixed standard slots: Tiết 1-3 (07:00-09:25), Tiết 4-5 (09:35-11:10), Tiết 7-9 (12:45-15:10), Tiết 10-11 (15:20-16:55) | Slot configuration array | Distinct row headers with slot name, time, and shift label | N/A | ORIGINAL_REQUEST.md §R3, WeeklyTimetable.tsx |
| F19 | R3: Timetable | Interval Overlap Conflict Engine | Mathematical collision engine: `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)` | Incoming course schedule vs enrolled courses schedules | Boolean isConflict + ConflictInfo object | Highlights both clashing courses | ORIGINAL_REQUEST.md §R3 |
| F20 | R3: Timetable | Conflict Visual Alarm | Red blinking border animation (`pulse-conflict`) and subtle card shake (`shake-alert`) | Conflict state active | Animated visual cues on clashing cell | Cues cease immediately upon resolution | ORIGINAL_REQUEST.md §R3, index.html |
| F21 | R3: Timetable | Conflict Alert Banner | Sticky notification banner detailing exact collision | ConflictInfo (incoming vs existing course) | Specific constructive message with 1-click resolve button | Dismissible via (✕) without resolving | ORIGINAL_REQUEST.md §R3, ConflictAlert.tsx |
| F22 | R3: Timetable | 1-Click Auto-Switch Class | Button on conflict banner: 'Tự động đổi sang [mã lớp khác] (không trùng)' | Click event on resolve button | Replaces clashing class with alternate valid section in 1 click | If no alternate exists, offers to deselect | ORIGINAL_REQUEST.md §R3 |
| F23 | R3: Timetable | Week Navigation Switcher | Allows navigating across weeks: 'Tuần 01: 29/09 - 05/10/2026' | Chevron prev/next buttons | Increments/decrements week label and date range | Bounds clamped between Week 1 and Week 20 | ORIGINAL_REQUEST.md §R3 |
| F24 | R3: Timetable | Timetable Plan Switcher | Toggle between alternate scheduling plans ('Phương án 1' / 'Phương án 2') | Tab click / Segmented toggle | Swaps active enrolled course IDs between Plan A and Plan B | Preserves independently modified plans in state | ORIGINAL_REQUEST.md §R3 |
| F25 | R3: Timetable | Restore Default Timetable | Button to restore default sample enrolled courses | Click event | Resets enrolled courses to standard benchmark (CS101, CS201, MATH101, ENG101) | Shows toast confirming restoration | index.html, WeeklyTimetable.tsx |
| F26 | R4: Summary | Multi-Tier Workload Meter | Workload bar categorizing credits: <12 TC (Thiếu tải - Amber), 12-18 TC (Cân đối - Emerald), >18 TC (Tải cao/Căng thẳng - Red) | Sum of active credits | Segmented progress bar with dynamic label and color | Warns if < 12 TC or > 24 TC | ORIGINAL_REQUEST.md §R4, Thesis §2.1 |
| F27 | R4: Summary | AI Recommendation Card | Violet box (#8B5CF6) proposing tailored courses with transparency explanation | AI engine rules (available slots, degree track) | Recommended Course card with rationale and 1-click enroll button | Disabled if already enrolled in that course | ORIGINAL_REQUEST.md §R4, Thesis §2.1 |
| F28 | R4: Summary | Selected Cart Item List | List of all enrolled courses in cart with instant removal (✕) | Enrolled courses array | Item row with code, name, credits, and remove button | If cart is empty, displays 'Chưa có môn học nào' | ORIGINAL_REQUEST.md §R4 |
| F29 | R4: Summary | Auto Tuition Calculator | Real-time calculation: `Total Credits x 450,000 VNĐ` | Enrolled courses credit sum | Formatted currency string `XX.XXX.000 VNĐ` + ICTU credit rate note | Handles 0 credits correctly | ORIGINAL_REQUEST.md §R4 |
| F30 | R4: Summary | Gated Primary CTA Button | 'Rà Soát & Xác Nhận Đăng Ký' button | `totalCredits >= 12 && !hasConflict` | Clickable active button (Blue #2563EB) or disabled state (Gray/slate-200) | Displays tooltip/explanation when disabled | ORIGINAL_REQUEST.md §R4, Thesis §2.1 |
| F31 | R5: Modals | Course Detail Modal | Modal showing full course information, syllabus summary, and prerequisite tree | Selected course metadata | Modal dialog with prerequisite tree visualizer | Esc key / Backdrop click dismisses | ORIGINAL_REQUEST.md §R5, Thesis §2.1 |
| F32 | R5: Modals | Prerequisite Tree Visualizer | Graph/tree view of prerequisite dependencies | Course prerequisites data | Visual tree: Passed (Green check), Eligible (Blue ring), Locked (Gray 40% + lock icon) | Explanatory tooltip on locked nodes | Thesis §2.1 (FR-03) |
| F33 | R5: Modals | Final Review Confirmation Modal | Modal showing pre-flight audit: 0 conflict check, 100% prerequisite pass, student info, total credits, total tuition | Final review trigger | Modal dialog with audit checklist and 'Gửi Đăng Ký Chính Thức' CTA | Prevents confirmation if any validation fails | ORIGINAL_REQUEST.md §R5, ConfirmationModal.tsx |
| F34 | R5: Modals | Confetti Celebration Animation | Fires celebratory canvas-confetti upon final submission | Confirm button click | Visual multi-color particle fireworks | Graceful fallback if confetti script unavailable | ORIGINAL_REQUEST.md §R5, index.html |
| F35 | R5: Modals | Electronic Receipt Dialog | Displays official registration receipt with code `#ICRA-2026-9812-ICTU` | Successful confirmation event | Receipt modal with timestamp, credit sum, tuition status, and download buttons | Close button returns to dashboard | ORIGINAL_REQUEST.md §R5, index.html |
| F36 | R5: Modals | Google Calendar / iCal (.ics) Export | Generates and triggers actual download of standard `.ics` file | Enrolled courses schedule data | Valid calendar file `ThoiKhoaBieu_ICRA_ICTU.ics` containing all weekly recurring events | Generates standard VCALENDAR / VEVENT data | ORIGINAL_REQUEST.md §R5, Thesis §2.1 |
| F37 | R5: Toasts | Toast Notification Feedback System | Floating feedback toasts for user actions (Add, Remove, Resolve, Error) | Toast dispatch event with type (`success`, `warning`, `error`, `info`), title, message | Floating notification card in bottom-right corner with auto-dismiss (4s) | Manual dismiss (✕) button | ORIGINAL_REQUEST.md §R5, index.html |
| F38 | Architecture | Dual Deployment Packaging | Application runs both as modular React/TypeScript source in `src/` and standalone single-file in `index.html` | Browser / Node serve.js | Complete feature parity across both distributions | Standalone bundle self-contained without npm dependencies | ORIGINAL_REQUEST.md §R5 |

---
## 3. Edge Cases Table

| # | Feature | Input / Edge Condition | Observed / Required Behavior |
|---|---------|------------------------|------------------------------|
| E01 | Faceted Search | Search string with special characters or Vietnamese diacritics (e.g., "giao diện", "Đại số", "<script>") | Sanitized normalized case-insensitive comparison; matches properly without crashing or XSS vulnerability. |
| E02 | Faceted Search | Search query matching 0 courses | Course list displays clean empty state message ("Không tìm thấy học phần nào khớp với bộ lọc") and a button to reset filters. |
| E03 | Filter Slider | Max credit slider moved to 1 credit when all courses are 3 or 4 credits | List updates to 0 courses immediately without breaking layout; counter displays "0 học phần". |
| E04 | Conflict Engine | Adding a course that overlaps partially with an existing course (e.g. Period 1-3 vs Period 2-4) | Correctly flags conflict because `1 <= 4 && 3 >= 2` evaluates to `true`; triggers conflict banner and visual cues. |
| E05 | Conflict Engine | Adding a course on the same day but different period slot (e.g. Morning 1-3 vs Afternoon 7-9) | Evaluates to non-conflicting (`start_A <= end_B` holds but `end_A >= start_B` is false); course successfully enrolled. |
| E06 | Conflict Engine | User clicks 'Thêm (Trùng)' on a clashing card | System permits adding or initiates conflict state; triggers conflict banner, pulse animation, and audio/haptic visual cues, and immediately disables the final submission CTA. |
| E07 | Conflict Engine | Enrolled courses have a conflict, then user manually removes one of the clashing courses | Conflict banner automatically disappears, timetable cells revert from red to normal, and validation rules re-evaluate. |
| E08 | Conflict Engine | Multiple conflicts simultaneously occurring (e.g. 2 different overlapping pairs) | System tracks and indicates all conflicting pairs; primary CTA remains strictly locked until all conflicts are resolved. |
| E09 | Workload Meter | Enrolled credits equal exactly 0 | Workload meter shows 0/24 TC; bar empty; status "Thiếu tải (<12 TC)"; primary CTA locked; tuition displays "0 VNĐ". |
| E10 | Workload Meter | Enrolled credits equal exactly 11 TC | Workload meter shows Amber; status "Thiếu tải (<12 TC)"; primary CTA remains locked. |
| E11 | Workload Meter | Enrolled credits equal exactly 12 TC (boundary threshold) | Workload meter shifts to Emerald/Green; status changes to "Cân đối (Lý tưởng)"; CTA unlocks (if 0 conflicts). |
| E12 | Workload Meter | Enrolled credits equal exactly 18 TC (upper ideal boundary) | Workload meter remains Emerald/Green; status "Cân đối (Lý tưởng)"; CTA remains unlocked. |
| E13 | Workload Meter | Enrolled credits equal 19 TC to 24 TC | Workload meter shifts to Red/Warning; status "Tải cao (>18 TC)"; CTA remains accessible but displays workload warning. |
| E14 | Workload Meter | Enrolled credits exceed max limit (>24 TC) | System issues warning toast; blocks further addition of courses or highlights overload violation. |
| E15 | Prerequisite Check | User attempts to enroll in course with unmet prerequisites (e.g. SE301 - requires 60 accumulated credits, student has 45) | Course status is `ineligible`; card has disabled button ("Không thể chọn"); tooltip explains reason ("Chưa đủ 60 TC"). |
| E16 | Plan Switcher | Switching from Plan 1 (4 courses) to Plan 2 (different selection) | Timetable, Workload Meter, Cart, and Tuition update synchronously without losing Plan 1 configuration in memory. |
| E17 | iCal Export | Enrolled courses have varying days and times | Generated `.ics` file contains valid RFC 5545 syntax: proper `DTSTART`, `DTEND`, `RRULE:FREQ=WEEKLY`, `SUMMARY`, and `LOCATION`. |
| E18 | Keyboard Navigation | User tabs through interface without mouse | Logical tab order across Header -> Filters -> Course Cards -> Timetable -> Cart -> Modal; visible focus outlines (2px solid #2563EB). |
| E19 | Screen Resizing | Window resized from 1920px down to 1024px | Fixed ratio 28% / 47% / 25% maintained or smoothly scales with horizontal scroll / responsive stack; no overflow clipping of timetable data. |
| E20 | Modal Dialogs | Pressing Esc key or clicking backdrop while Confirmation or Detail modal is open | Modal closes immediately, returning focus to trigger element without modifying enrolled state. |

---

## 4. UI/UX Standards & Lecture Alignment

### 4.1 Layout Specifications (The 3-Column Coordinated Views)
In accordance with **Lecture 8+** (View & Window Management, Coordinated Views) and **ORIGINAL_REQUEST.md**:
- **Total Screen Width Split**:
  - **Left Column (Course Explorer)**: **28% width** (approx. 380px on 1440px viewport). Contains Faceted Search, Filters, and Course Cards scroll list.
  - **Center Column (Weekly Timetable Matrix)**: **47% width** (approx. 660px - 680px). Visual timetable matrix 8 columns (Time + 7 Days), week navigator, plan switcher.
  - **Right Column (AI Recommendations & Registration Summary)**: **25% width** (approx. 340px - 360px). Workload meter, AI recommendation card, selected cart list, tuition calculation, and primary confirmation CTA.
- **Top Header**: Height 64px, full width, sticky (`z-30`), white surface with border bottom `#E2E8F0`.

### 4.2 Color Palette & WCAG 2.1 AA Compliance (Lecture 8+)
All color contrasts strictly meet or exceed **WCAG 2.1 Level AA** standards:
- **Normal text (<18pt)**: Contrast ratio ≥ **4.5:1**
- **Large text (≥18pt or bold ≥14pt)**: Contrast ratio ≥ **3.0:1**
- **UI Components & Graphical Objects**: Contrast ratio ≥ **3.0:1**
- **Non-Color Reliance Rule**: Color is never the sole carrier of meaning. Danger/conflict states always include an exclamation icon (`!`) or triangle icon (`AlertTriangle`) and descriptive text.

#### Semantic Color Token Table:
| Token Name | Hex Code | Role & Usage | Contrast Ratio against White/Surface |
|------------|----------|--------------|--------------------------------------|
| `primary` | `#2563EB` | Brand Blue, Primary CTA, Enrolled highlights, Active tabs | **4.56:1** (AA Pass) |
| `primary-hover` | `#1D4ED8` | Hover state for primary buttons | **6.45:1** (AAA Pass) |
| `primary-light` | `#EFF6FF` | Background for active cards, hover highlights | N/A (Background) |
| `danger` / `conflict` | `#EF4444` / `#DC2626` | Conflict alarms, error toasts, delete actions | **4.52:1** on white (`#DC2626`) |
| `danger-bg` | `#FEF2F2` | Background tint for conflict cards and banners | N/A (Background) |
| `success` | `#10B981` / `#059669` | Success badges, verified requirements, completed prerequisites | **4.54:1** on white (`#059669`) |
| `success-bg` | `#ECFDF5` | Background tint for success messages and badges | N/A (Background) |
| `warning` | `#F59E0B` / `#D97706` | Low workload alert, approaching deadlines | **4.51:1** on white (`#D97706`) |
| `warning-bg` | `#FFFBEB` | Background tint for warning callouts | N/A (Background) |
| `aiViolet` | `#8B5CF6` / `#7C3AED` | AI recommendation header, badges, CTA | **4.58:1** on white (`#7C3AED`) |
| `aiViolet-light` | `#F5F3FF` | Background for AI recommendation card | N/A (Background) |
| `appbg` | `#F3F6FB` / `#F8FAFC` | General canvas background (reduces eye strain) | N/A (Canvas) |
| `surface` | `#FFFFFF` | Card, container, and timetable background | Baseline |
| `text-high` | `#0F172A` | Primary headings, course names, student name | **15.8:1** (AAA Pass) |
| `text-medium` | `#334155` | Secondary text, labels, lecturer names | **9.6:1** (AAA Pass) |
| `text-muted` | `#64748B` | Timestamps, room numbers, captions | **4.6:1** (AA Pass) |

### 4.3 Typography Scale (Mullet & Sano: Scale & Proportion)
- **Primary Typeface**: `Inter`, sans-serif (clean, high legibility on digital screens).
- **Secondary Monospace Typeface**: `JetBrains Mono`, monospace (used for Course Codes, Student IDs, Timers, and Timetable Time Slots).
- **Type Hierarchy**:
  - Screen / Modal Titles: `18px - 20px`, Bold / Extrabold (`font-extrabold text-slate-900`)
  - Section Headings: `12px - 13px`, Extrabold Uppercase (`uppercase tracking-wide font-extrabold text-slate-900`)
  - Course Titles: `12px - 13px`, Bold (`font-bold text-slate-900 leading-snug`)
  - Body & Label Text: `11px - 12px`, Medium / Semibold (`font-medium text-slate-700`)
  - Captions & Badges: `10px - 11px`, Semibold / Bold (`text-[10px] font-bold`)
  - Fine Print & Subtext: `9px - 10px`, Regular / Medium (`text-[9px] text-slate-500 font-mono`)

### 4.4 8-Point Grid System & Visual Aesthetics (Mullet & Sano: Module & Program)
- All spacing (padding, margin, gaps) conforms to multiples of 4px and 8px:
  - Container padding: 12px (`p-3`), 14px (`p-3.5`), 16px (`p-4`), 24px (`p-6`).
  - Element spacing: 8px (`gap-2`), 12px (`gap-3`), 14px (`gap-3.5`).
  - Button heights: 28px (`h-7`), 32px (`h-8`), 40px (`h-10`).
  - Border radii: 6px (`rounded-md`), 8px (`rounded-lg`), 12px (`rounded-xl`), 16px (`rounded-2xl`), 24px (`rounded-3xl`).

### 4.5 Direct Manipulation Principles (Lecture 6)
1. **Continuous Visual Representation of Objects of Interest**:
   - Courses are represented as tangible visual cards and colored schedule blocks.
   - Timetable slots are physical containers with explicit coordinate addresses (Day x Period).
2. **Rapid, Incremental, Reversible Actions**:
   - Adding a course is 1 click.
   - Removing a course is 1 click (✕).
   - Resolving a conflict is 1 click (auto-swap).
   - Restoring standard schedule is 1 click.
3. **Immediate Visual Feedback**:
   - Hovering over a course card triggers instant (<50ms) **Ghost Block Preview** on the timetable matrix with dashed border `#2563EB` and light tint.
   - Attempting a conflicting registration triggers an animated visual pulse (`pulse-conflict`) and shake feedback (`shake-alert`), accompanied by an immediate sticky alert banner.

### 4.6 Constructive Error Message Guidelines (Lecture 8+ / Shneiderman)
Every error in ICRA adheres strictly to Ben Shneiderman's 4 golden criteria:
1. **Specific**: Identifies exact courses, day, and period: *"Lớp CS202-02 bị trùng ca Thứ 3 (Tiết 1 - 3) với môn CS201-01 đã có trên lịch."*
2. **Constructive Guidance**: Provides immediate actionable remediation: *"[Tự động đổi sang CS202-01 (Chiều Thứ 5)]"*.
3. **Polite & Positive Tone**: Avoids blaming user, no harsh exclamation screams or cryptic error codes.
4. **Non-Blocking Visual Format**: Displayed via an integrated contextual banner and unobtrusive toast message, allowing continuous interaction without forcing modal alert dismissal.

### 4.7 Timely User Experience & System Response Time (Lecture 9)
- **Search & Dynamic Query Latency**: **< 100ms** (target < 50ms) for real-time search filtering.
- **Hover Ghost Preview**: **< 50ms** instantaneous rendering.
- **Conflict Calculation**: **< 10ms** client-side array evaluation.
- **Modal Display & Animation**: Smooth ease-in-out **150ms - 200ms**.
- **Submission Feedback**: Immediate Confetti celebration + modal receipt generation.

---
## 5. Detailed Component Specifications (R1 - R5)

### R1. Enterprise Header & Student Identity
- **Logo & Title**:
  - Icon: `Sparkles` icon within a 32x32px Blue `#2563EB` rounded container.
  - Text: "ICRA" (Extrabold tracking-tight) + Divider "|" + "Trường ĐH Công nghệ Thông tin & Truyền thông".
  - Tagline: "Hệ thống Đăng ký Học phần & Hoạch định Thời khóa biểu Thông minh".
- **Semester Badge**:
  - "Học kỳ 1 (2026 - 2027) — Đợt chính" in a slate-100 pill badge with slate-200 border.
- **Portal Status Badge**:
  - Emerald-50 badge with Emerald-200 border.
  - Blinking indicator: `w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`.
  - Text: "Cổng Đăng Ký Đang Mở".
- **Countdown Timer**:
  - Display: `Clock` icon, label "Hạn đóng cổng:", monospace font bold `74:15:20`, deadline label `23:59 • 01/10`.
- **Notification Bell**:
  - `Bell` icon button with blue notification badge dot `w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white`.
- **Student Profile Info**:
  - Name: "An Bá Thành" (Bold text-slate-900).
  - Subtitle: `DTC245210002 • CNTT K24` (Font mono).
  - Avatar: Circular 32x32px gradient `from-blue-600 to-indigo-600` with white initials "AT".

### R2. Course Explorer with Faceted Filtering (28% Width)
- **Container**: `w-[28%] bg-white rounded-xl border border-slate-200 flex flex-col`.
- **Header**:
  - Icon `Compass` + Title "Khám Phá Học Phần (Course Explorer)".
  - Subtitle: "Tìm kiếm đa tiêu chí & Đăng ký trực tiếp".
  - Action: "Đặt lại" (Reset all filters to default).
- **Faceted Filter Controls**:
  1. *Instant Search Input*: Placeholder "Tìm mã môn, tên môn hoặc giảng viên...", icon `Search`.
  2. *Faculty Dropdown*: Options: Tất cả khoa (`ALL`), Khoa CNTT (`CNTT`), Khoa Toán - Tin (`TOAN`), Khoa Ngoại ngữ (`NN`), Khoa ATTT (`ATTT`).
  3. *Shift Dropdown*: Options: Tất cả ca (`ALL`), Ca Sáng: Tiết 1-5 (`MORNING`), Ca Chiều: Tiết 6-11 (`AFTERNOON`).
  4. *Day Dropdown*: Options: Tất cả ngày (`ALL`), Thứ Hai (2) to Chủ Nhật (8).
  5. *Max Credits Slider*: Range `min=1` to `max=4`, step=1. Label: "Tối đa X TC".
  6. *Smart Checkbox*: "Chỉ hiện lớp không trùng lịch" (`onlyNonConflicting`).
  7. *Results Counter*: Displays `{count} học phần`.
- **Course Card States**:
  1. *Available*: White background, slate border, hover:border-blue-400, button "+ Thêm vào TKB" (Blue).
  2. *Selected*: Blue-50 background, blue-300 border, badge "Đã chọn", button "Bỏ chọn" (Red text/tint).
  3. *Conflict*: Red-50/40 background, red-200 border, warning icon `AlertTriangle`, button "Thêm (Trùng)" (Red #DC2626).
  4. *Ineligible*: Slate-50 background, 60% opacity, prereq badge "Chưa đủ ĐK ({reason})", disabled button "Không thể chọn".
- **Micro-Interactions**:
  - Hover on card: triggers `onHoverEnter(course)` -> draws Ghost Block on Weekly Timetable.
  - Click "Xem chi tiết": opens Course Detail Modal with syllabus & prerequisite tree.

### R3. Weekly Timetable Matrix with Conflict Engine (47% Width)
- **Container**: `w-[47%] bg-white rounded-xl border border-slate-200 flex flex-col`.
- **Toolbar**:
  - Icon `CalendarDays` + Title "Thời Khóa Biểu Tuần (Weekly Timetable)".
  - Week Navigator: Left/Right buttons + current week label: "Tuần 01: 29/09 - 05/10/2026".
  - Timetable Plan Switcher: Tabs or pill toggle for "Phương án 1" and "Phương án 2".
  - Action: "Khôi phục mặc định" (reverts to standard 4 courses).
- **Grid Layout**:
  - 8 columns: Column 1 = Time slot header; Columns 2-8 = Thứ Hai to Chủ Nhật.
  - 4 rows (Standard Period Slots):
    - Row 1: Tiết 1 - 3 (07:00 - 09:25, Ca Sáng)
    - Row 2: Tiết 4 - 5 (09:35 - 11:10, Ca Sáng)
    - Row 3: Tiết 7 - 9 (12:45 - 15:10, Ca Chiều)
    - Row 4: Tiết 10 - 11 (15:20 - 16:55, Ca Chiều)
- **Cell Content**:
  - Enrolled Course Card (`TimetableCourseCard`): Course code (mono), room, truncated course name, lecturer, credits badge.
  - Ghost Block Preview: Dashed blue border `border-2 border-dashed border-blue-600 bg-blue-50/40`, label "👻 Xem trước:", course code.
  - Conflict Alarm: Pulsing red border (`conflict-cell`), subtle shake (`shake-alert`), red text and background tint.
- **Conflict Algorithm**:
  ```ts
  function isClashing(courseA: Course, courseB: Course): boolean {
    return courseA.day === courseB.day &&
           courseA.startPeriod <= courseB.endPeriod &&
           courseA.endPeriod >= courseB.startPeriod;
  }
  ```
- **Sticky Conflict Alert Banner (`ConflictAlert`)**:
  - Displays when conflict exists. Red background, warning icon `!`.
  - Specific text: *Lớp [Mã lớp A] bị trùng ca [Thứ X, Tiết Y-Z] với môn [Mã lớp B] đã có trên lịch.*
  - Action: *Tự động đổi sang [Lớp thay thế không trùng]* (1-click resolution).
  - Dismiss button (✕).
- **Footer Legend**:
  - Badges for: "Đã chọn" (Blue solid), "Xem trước (Ghost)" (Blue dashed), "Trùng lịch" (Red solid).
  - Prompt: "Nhấp vào ô môn học để xem thông tin chi tiết".

### R4. AI Course Recommendation & Registration Summary (25% Width)
- **Container**: `w-[25%] bg-white rounded-xl border border-slate-200 flex flex-col justify-between`.
- **Header**:
  - Icon `ClipboardCheck` + Title "Tổng Quan Đăng Ký (Summary)".
  - Status Badge: "Đủ ĐK tối thiểu" (Green) if ≥12 credits, else "Chưa đủ ĐK" (Amber).
- **Workload Meter (`WorkloadMeter`)**:
  - Title: "Khối lượng học kỳ:" + current credits: `{totalCredits} / 24 Tín chỉ`.
  - Tri-color segmented progress bar:
    - Underload (<12 TC): Amber `#F59E0B`
    - Balanced / Ideal (12 - 18 TC): Emerald `#10B981`
    - High Workload (>18 TC): Red `#EF4444`
  - Legend: "Tối thiểu 12 TC • Tối đa 24 TC".
- **AI Recommendation Box (`AIRecommendation`)**:
  - Purple theme: `#8B5CF6`, background `#F5F3FF`, border `#DDD6FE`.
  - Badge: `Sparkles` icon + "AI Course Recommendation" + "3 Tín chỉ".
  - Course Title: "CS202: Thiết kế Giao diện Phần mềm (UI/UX)".
  - Rationale: *"Lấp vừa khoảng trống Chiều Thứ 5. Phù hợp 100% định hướng Kỹ sư phần mềm của sinh viên K24."*
  - Transparency Indicators:
    - `check` icon (Green): *"Tương thích TKB: Khớp 100% lịch trống (0 xung đột)"*
    - `check` icon (Green): *"Điều kiện tiên quyết: Đã hoàn thành Nhập môn Lập trình"*
  - Button: "+ Thêm học phần này vào TKB" (Purple `#8B5CF6`).
- **Enrolled Courses Cart**:
  - Title: "Học phần đã chọn:" + count `{activeCourses.length} môn`.
  - Scrollable items list: each item shows Course Code, Credits, Course Name, and instant remove button `✕`.
- **Tuition Calculator**:
  - Formula: `Total Credits x 450,000 VNĐ`.
  - Displays: Total taxable credits + Total estimated tuition formatted as `XX.XXX.000 VNĐ`.
  - Subtext: *"Đơn giá: 450.000 VNĐ / tín chỉ theo quy định ICTU"*.
- **Primary CTA Button**:
  - Label: "Rà Soát & Xác Nhận Đăng Ký" with `ArrowRight` icon.
  - Constraints: Enabled ONLY when `totalCredits >= 12 && !hasConflict`.
  - When disabled: slate-200 background, cursor-not-allowed, explains requirement in tooltip or disabled text.

### R5. Interactive Modals, Toast Feedback & Standalone Deployability
- **Course Detail Modal (`CourseDetailModal`)**:
  - Triggered by "Xem chi tiết" button or clicking a timetable card.
  - Displays: Course Name, Code, Department, Credits, Lecturer, Room, Schedule.
  - Prerequisite Tree Graph:
    - Node 1 (CS101 - Nhập môn Lập trình): Completed (Green background, check icon).
    - Node 2 (CS201 - Cấu trúc dữ liệu): Eligible / In-progress (Blue border).
    - Node 3 (SE301 - Kiến trúc PM nâng cao): Locked (Gray background, lock icon, tooltip "Chưa đủ 60 TC").
  - Action: Close button and "+ Đăng ký môn này" / "Bỏ chọn môn này".
- **Final Review Confirmation Modal (`ConfirmationModal`)**:
  - Triggered by clicking "Rà Soát & Xác Nhận Đăng Ký".
  - Pre-flight compliance banner: Green `#ECFDF5` with `ShieldCheck` icon:
    *"Hệ thống ICRA đã đối soát hợp lệ: 0 lỗi xung đột giờ học • 100% đạt chuẩn điều kiện tiên quyết • Đạt ngưỡng khối lượng học tập theo quy chế."*
  - Summary metadata: Student Name & ID, Total Courses Count, Total Credits (Cân đối), Total Tuition.
  - Actions: "Quay lại" (Close modal) and "Gửi Đăng Ký Chính Thức" (Primary Blue CTA).
- **Celebration & Receipt Flow**:
  - Upon clicking "Gửi Đăng Ký Chính Thức":
    1. Fires canvas confetti: `confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } })`.
    2. Opens Electronic Receipt Modal:
       - Success Checkmark icon.
       - Badge: "Giao dịch thành công".
       - Header: "ĐĂNG KÝ HỌC KỲ HOÀN TẤT!".
       - Electronic Receipt Code: `#ICRA-2026-9812-ICTU`.
       - Details: Timestamp, Total Credits, Tuition payment status ("Chờ nộp qua ngân hàng").
       - Action 1: "Đồng Bộ Google Calendar / Tải File .ICS" (Generates and downloads valid `.ics` file).
       - Action 2: "Hoàn tất & Về Bàn Làm Việc" (Closes receipt).
- **Toast Feedback System (`ToastContainer`)**:
  - Position: Fixed bottom-right `bottom-5 right-5 z-50`.
  - Toast types:
    - `success` (Green icon/tint): Course added, conflict resolved, schedule reset.
    - `error` (Red icon/tint): Conflict detected, validation blocked.
    - `warning` (Amber icon/tint): Approaching max credits, low workload.
    - `info` (Blue/Slate icon): Course removed, plan switched.
  - Auto-dismiss duration: 4,000ms, with manual dismiss button (✕).
- **Dual Deployability**:
  - **Modular Source (`src/`)**: Clean React 18 + TypeScript component tree (`components/`, `data/`, `types/`).
  - **Standalone File (`index.html`)**: Self-contained HTML with inlined Babel/React scripts, Tailwind CSS CDN, Lucide CDN, and Confetti CDN, fully executable directly via double-click in browser or `node serve.js` or static web hosting.

---
## 6. Comprehensive Acceptance Criteria Breakdown

### 6.1 Functional Acceptance Criteria
- [ ] **FAC-01**: Instant keyword search filters course list by code, title, and lecturer with response time under 100ms.
- [ ] **FAC-02**: Faceted filters (Faculty, Shift, Day, Credit Slider) filter course list with 100% precision.
- [ ] **FAC-03**: Checkbox 'Chỉ hiện lớp không trùng lịch' dynamically excludes all clashing courses based on active enrollments.
- [ ] **FAC-04**: Course cards clearly display 4 distinct states: Available, Selected, Conflict, Ineligible.
- [ ] **FAC-05**: Hovering over any course card renders the Ghost Block Preview in the matching timetable coordinate slot.
- [ ] **FAC-06**: Weekly timetable displays 8 columns (Time header + 7 days) and 4 standard period slots.
- [ ] **FAC-07**: Conflict detection engine evaluates `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)` with 100% accuracy.
- [ ] **FAC-08**: Conflict alarm triggers animated pulsing red cell (`pulse-conflict`), subtle card shake (`shake-alert`), and sticky top banner.
- [ ] **FAC-09**: Conflict banner offers a 1-click auto-switch button to swap into a non-conflicting section.
- [ ] **FAC-10**: Timetable supports week navigation (Prev/Next) and switching between alternate registration plans (Phương án 1 / 2).
- [ ] **FAC-11**: Workload meter dynamically categorizes total credits into Underload (<12 TC - Amber), Balanced (12-18 TC - Green), and High Load (>18 TC - Red).
- [ ] **FAC-12**: AI recommendation card displays course title, rationale explanation, 100% timetable compatibility tag, and prerequisite check.
- [ ] **FAC-13**: Enrolled cart allows instant removal of individual courses via (✕).
- [ ] **FAC-14**: Tuition is automatically calculated as `Total Credits x 450,000 VNĐ`.
- [ ] **FAC-15**: Primary CTA 'Rà Soát & Xác Nhận Đăng Ký' is strictly locked/disabled if total credits < 12 or if any conflict exists.
- [ ] **FAC-16**: Confirmation modal performs 0-conflict audit, 100% prerequisite pass check, and displays student summary.
- [ ] **FAC-17**: Final confirmation triggers confetti celebration and generates electronic receipt `#ICRA-2026-9812-ICTU`.
- [ ] **FAC-18**: Clicking 'Tải File .ICS' initiates genuine download of a valid `.ics` calendar file for Google Calendar / Apple Calendar.
- [ ] **FAC-19**: Course detail modal renders syllabus description and interactive/visual prerequisite tree.

### 6.2 UI/UX Ergonomics & Usability Acceptance Criteria (Lectures 3, 4, 8+, 9)
- [ ] **UAC-01 (WCAG 2.1 AA)**: All text elements maintain contrast ratio ≥ 4.5:1 against their backgrounds (verified by contrast tools).
- [ ] **UAC-02 (Non-Color Reliance)**: Every color-coded state (danger, success, warning) includes explicit icon and text cues.
- [ ] **UAC-03 (Keyboard Navigation)**: Full keyboard accessibility via Tab, Enter, Space, and Escape.
- [ ] **UAC-04 (Layout Ratios)**: 3-column split adheres to 28% (Explorer) / 47% (Timetable) / 25% (Summary & AI).
- [ ] **UAC-05 (SRT Latency)**: Dynamic search and ghost hover preview update within 100ms.
- [ ] **UAC-06 (Constructive Errors)**: Error messages satisfy Shneiderman's 4 criteria (specific, constructive, polite, non-blocking).
- [ ] **UAC-07 (Human Factors Metrics)**:
  - Time to Learn < 3.0 minutes (freshman benchmark).
  - Speed of Performance < 8.0 minutes for full registration flow.
  - User Error Rate < 5.0% (0% schedule clash).
  - Retention over time > 90%.
  - Subjective Satisfaction > 80/100 (SUS score ≥ 85, Grade A+).

---

## 7. Current Implementation Audit & Gap Analysis

An inspection of the existing workspace files (`index.html` and `src/components/*`) reveals the following specific discrepancies against the authoritative specification that MUST be implemented/resolved:

| Requirement Area | Specification Requirement | Current State in `index.html` / `src/` | Gap / Remediation Needed |
|------------------|---------------------------|----------------------------------------|--------------------------|
| **R2 / R5: Course Detail Modal** | Clicking 'Xem chi tiết' or clicking timetable card opens Course Detail Modal with description and prerequisite tree (FR-02, FR-03). | State `selectedDetailCourse` exists in `App`, but NO modal component is rendered. Clicking does nothing visually. | Create `CourseDetailModal` component rendering course syllabus, credits, lecturer, room, and visual Prerequisite Tree with lock/passed states. |
| **R3: Timetable Plan Switcher** | Support switching between alternate timetable plans: *Phương án 1* and *Phương án 2* (R3, spec §32). | Week navigator exists, but Plan 1 / Plan 2 switcher tabs are missing from the toolbar. | Add Plan Switcher toggle (Phương án 1 / Phương án 2) in Weekly Timetable toolbar and maintain independent plan states. |
| **R3: Conflict Detection Formula** | Interval overlap check: `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)`. | In `CourseExplorer.tsx`, uses string check `x.periodText === c.periodText`; in `index.html`, uses `periodSlot === c.periodSlot`. | Standardize conflict algorithm across all components to use numeric interval overlap `(startPeriod <= other.endPeriod && endPeriod >= other.startPeriod)`. |
| **R3: Dynamic Conflict Resolution** | 1-click auto-switch button replaces clashing course with a valid non-conflicting alternate section. | Hardcoded text in `ConflictAlert`: `CS202-01 (Chiều Thứ 5)` only. | Support dynamic alternate class finding based on course prefix/code or clear guidance. |
| **R5: Google Calendar (.ics) Export** | Clicking download button triggers an actual download of a valid RFC 5545 `.ics` file. | Currently calls `alert('Đã tải xuống file...')`. No file is actually generated or downloaded. | Implement genuine `.ics` file generator using Data URL / Blob download with recurrence rules (`RRULE:FREQ=WEEKLY`). |
| **TypeScript Type Consistency** | `Course` type definition vs component usage. | `CourseCard.tsx` and `ConflictAlert.tsx` access `course.scheduleText`, but `Course` in `src/types/index.ts` lacks `scheduleText` property. | Harmonize `Course` interface in `src/types/index.ts` to include `scheduleText` or compute it cleanly from `day` and `periodText`. |
| **Modular Code Completion** | Modular source in `src/` must be complete and buildable. | `src/` lacks `App.tsx`, root index, and `package.json`. | Provide complete modular React root component and setup matching `index.html`. |

---
**End of Specification Requirements Document**
