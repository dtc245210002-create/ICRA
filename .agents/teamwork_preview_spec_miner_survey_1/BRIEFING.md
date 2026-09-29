# BRIEFING — 2026-09-29T08:12:00+07:00

## Mission
Survey, mine, and rigorously document exhaustive specifications, feature requirements, error conditions, edge cases, WCAG 2.1 AA rules, and acceptance criteria for the ICRA (Intelligent Course Registration Assistant) project.

## 🔒 My Identity
- Archetype: teamwork_preview_spec_miner
- Roles: spec_miner, requirement_analyst
- Working directory: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_spec_miner_survey_1
- Original parent: teamwork_preview_orchestrator_1 (ID: 92c8851c-967e-412d-a242-e0a02aa19063)
- Milestone: Survey and Scope Mapping

## 🔒 Key Constraints
- Discover and document features by probing authoritative specifications; do NOT implement source code.
- Prioritize authoritative sources (ORIGINAL_REQUEST.md, Bao_Cao_Do_An_UIUX_ICRA.docx, Software_Interface_Design_Lecture_*_summary.txt, existing code).
- Deliver exhaustive tables (Features Discovered, Edge Cases, WCAG 2.1 AA, Acceptance Criteria, Error Conditions).
- Maintain 3-column layout percentages: 28% / 47% / 25%.
- Output spec_requirements.md and handoff.md in working directory.

## Current Parent
- Conversation ID: 92c8851c-967e-412d-a242-e0a02aa19063
- Updated: 2026-09-29T08:12:00+07:00

## Task Summary
- **What to survey**: Exhaustive requirements for ICRA system across R1, R2, R3, R4, R5.
- **Success criteria**: Complete spec_requirements.md with all features, edge cases, formulas, UI/UX ergonomics, WCAG 2.1 AA rules, and handoff.md for orchestrator and subsequent workers.
- **Interface contracts**: 28% Course Explorer, 47% Timetable Matrix, 25% AI Recommendation & Registration Summary.
- **Code layout**: Dual deployability: modular source in src/ and standalone in index.html.

## Key Decisions Made
- Analyzed original request, project docx (Bao_Cao_Do_An_UIUX_ICRA.docx), and lecture notes (3, 4, 5, 6, 8+, 9).
- Identified discrepancy between current index.html/src implementation and full specifications (e.g. missing Course Detail Modal with prerequisite tree, missing Plan 1 / Plan 2 switcher, missing real .ics export, hardcoded conflict resolution vs dynamic alternative classes, exact period text check vs interval overlap formula).

## Artifact Index
- c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_spec_miner_survey_1\spec_requirements.md — Exhaustive functional and UI/UX specifications
- c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_spec_miner_survey_1\handoff.md — 5-component handoff report
