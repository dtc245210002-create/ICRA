# E2E Test Infra: ICRA (Intelligent Course Registration Assistant)

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on internal implementation details.
- Derived directly from `ORIGINAL_REQUEST.md` and user-facing acceptance criteria.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Test Architecture
- **Test Runner**: Node.js native test runner (`node --test tests/*.test.js`) - fast, zero third-party dependency, instant execution on Node v24.19.0.
- **Browser Runner**: Headless Edge/Chrome runner script (`node tests/browser_e2e.test.js`) validating actual DOM rendering, click flows, layout, contrast, and response times on both `http://127.0.0.1:8080` (standalone `index.html`) and modular build.
- **Directory Layout**:
  - `tests/tier1_features.test.js`
  - `tests/tier2_boundaries.test.js`
  - `tests/tier3_combinations.test.js`
  - `tests/tier4_workloads.test.js`
  - `tests/browser_e2e.test.js`

## Coverage Thresholds
- **Tier 1 (Feature Coverage, >=5 per feature group, min 15 tests)**:
  - F01-F03: Header elements, student ID format, ticking countdown format.
  - F04-F09: Search query filtering, faculty filter, shift filter, day filter, credit limit slider, no-conflict checkbox.
  - F10-F12: 4 card states, ghost block data projection, course detail triggers.
  - F13-F18: Timetable 8x4 matrix cell resolution, conflict detection interval math, alternate section mapping.
  - F19-F23: Workload classification (<12, 12-18, >18), tuition formula (credits * 450,000 VNĐ), CTA locking.
  - F24-F31: Pre-flight check, receipt generation, RFC 5545 .ics calendar text formatting.
- **Tier 2 (Boundary & Corner Cases, min 8 tests)**:
  - Empty search results handling.
  - Boundary credits: exactly 11 credits (locked CTA), exactly 12 credits (unlocked CTA, green meter), exactly 18 credits (green meter), exactly 19 credits (red meter).
  - Multi-period interval conflicts (periods spanning across slots: e.g., periods 3-4, periods 7-10).
  - Exact period boundary collisions (endPeriod == startPeriod).
  - Removing last course from cart (empty cart state).
  - Maximum course load (>24 credits).
- **Tier 3 (Cross-Feature Combinations, min 6 tests)**:
  - Filtering by Faculty + Shift + Day simultaneously while typing search term.
  - Adding conflicting course while "Chỉ hiển thị lớp không trùng lịch" is checked vs unchecked.
  - Switching between Timetable Plan 1 and Plan 2 with different enrolled courses.
  - 1-Click auto-swap with cart and timetable updating in lockstep.
  - Ghost block preview on an already occupied slot showing conflict visually.
  - Checkout confirmation with prerequisites satisfied vs missing prerequisite.
- **Tier 4 (Real-World Application Scenarios, min 5 tests)**:
  - Scenario 1: Freshman standard registration flow (15 credits, 5 courses, 0 conflicts, checkout, receipt #ICRA-2026-9812-ICTU, download .ics).
  - Scenario 2: Conflict resolution flow (student attempts to enroll CS202 clashing with SE101, triggers ConflictAlert, clicks 1-click swap, successfully enrolled).
  - Scenario 3: Workload stress test (student starts at 6 TC -> adds to 14 TC -> adds to 21 TC, meter transitions Amber -> Green -> Red accurately).
  - Scenario 4: Direct browser E2E interaction test via headless Chrome/Edge against `http://127.0.0.1:8080`.
  - Scenario 5: WCAG 2.1 AA contrast audit (all text elements >= 4.5:1 ratio) and SRT latency benchmark (<100ms per search keystroke).

## Publish Signal
Upon test runner and test suite completion and validation, publish `TEST_READY.md` to project root.
