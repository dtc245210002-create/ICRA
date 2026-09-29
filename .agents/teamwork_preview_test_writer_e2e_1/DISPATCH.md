# DISPATCH — E2E Test Suite Creation

## 2026-09-29T01:16:24Z

- **Role**: teamwork_preview_test_writer
- **Working Directory**: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_test_writer_e2e_1
- **Authoritative Request**: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\ORIGINAL_REQUEST.md
- **Project Index**: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\PROJECT.md
- **Test Infra Spec**: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\TEST_INFRA.md
- **Project Root**: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA

## Objective
Implement the comprehensive 4-Tier automated test suite under `tests/` directory:
1. `tests/tier1_features.test.js`: Feature coverage (≥15 tests) covering F01-F31 (Header, student identity, countdown format, instant search, faceted filters, card states, ghost preview, timetable 8x4 matrix, interval conflict math, workload classification, tuition calculation, receipt format, .ics structure).
2. `tests/tier2_boundaries.test.js`: Boundary and edge cases (≥8 tests) covering empty queries, exact credit boundaries (11 vs 12 vs 18 vs 19), interval boundaries, multi-slot spanning intervals, empty cart, max load.
3. `tests/tier3_combinations.test.js`: Cross-feature combinatorial tests (≥6 tests) covering simultaneous multi-faceted filters, auto-swap with timetable state update, plan 1 vs plan 2 switching, ghost block on occupied slot.
4. `tests/tier4_workloads.test.js`: Realistic end-user workflow scenarios (≥5 tests) covering standard freshman registration flow, conflict detection and auto-switch flow, stress workload transitions, and receipt validation.
5. `tests/browser_e2e.test.js`: Headless Chrome/Edge test script that connects to `http://127.0.0.1:8080` (or runs against local standalone `index.html`), validating live DOM elements, search response latency (<100ms), and WCAG 2.1 AA text contrast.

## Verification & Signal
Execute `node --test tests/*.test.js` to ensure the test suite is syntactically and logically sound. (Tests may initially assert against expected contracts or mock states).
When complete, generate and publish `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\TEST_READY.md` summarizing the test suite and execution instructions.
Write `handoff.md` in your working directory and message the orchestrator.
