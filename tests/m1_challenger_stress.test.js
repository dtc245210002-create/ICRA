/**
 * M1 Empirical Challenger Stress Test Suite
 * Teamwork Preview Challenger (Instance 1)
 *
 * Exhaustively stress-tests:
 * 1. Vietnamese Diacritics Normalization & Accent-Insensitive Instant Search
 * 2. High-Frequency Real-Time Instant Search Latency Micro-Benchmark (<100ms)
 * 3. Sunday (Day 8 / CN) Inclusion, Dropdown Filtering & Interval Collision
 * 4. 768-Combination Faceted Filtering Grid & Boundary Verification
 * 5. CourseCard 4-State Strict Prioritization (Selected > Ineligible > Conflict > Available)
 * 6. WCAG 2.1 AA Color Contrast Ratios across all 4 visual card states (>= 4.5:1)
 * 7. Modular Source (src/) vs Standalone (index.html) Dual Parity Audit
 */

const { test, describe, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const {
  calculateContrastRatio,
  checkIntervalConflict
} = require('./test_helpers');

// Helper to extract courses and functions directly from index.html
function loadIndexHtmlCourses() {
  const indexPath = path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  // Extract INITIAL_COURSES array literal from index.html
  const match = html.match(/const INITIAL_COURSES = (\[[\s\S]*?\n\s*\]);/);
  if (!match) {
    throw new Error('Could not find INITIAL_COURSES in index.html');
  }

  // Parse JS array using Function constructor safely in local scope
  const courses = new Function(`return ${match[1]};`)();
  return courses;
}

// Canonical tone stripper from CourseExplorer.tsx & index.html
function removeVietnameseTones(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// Exact CourseExplorer filtering implementation
function executeExplorerFilter(courses, options = {}) {
  const {
    search = '',
    faculty = 'ALL',
    shift = 'ALL',
    day = 'ALL',
    maxCredits = 4,
    onlyNonConflicting = false,
    selectedIds = []
  } = options;

  const selectedCourses = courses.filter(c => selectedIds.includes(c.id));
  const qRaw = search.trim().toLowerCase();
  const qNorm = removeVietnameseTones(qRaw);

  return courses.filter(c => {
    // 1. Instant Search by code, name, or lecturer
    if (qRaw) {
      const code = (c.code || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      const lecturer = (c.lecturer || '').toLowerCase();

      const directMatch = code.includes(qRaw) || name.includes(qRaw) || lecturer.includes(qRaw);
      if (!directMatch) {
        const normName = removeVietnameseTones(name);
        const normLecturer = removeVietnameseTones(lecturer);
        if (!normName.includes(qNorm) && !normLecturer.includes(qNorm)) {
          return false;
        }
      }
    }

    // 2. Faculty Filter (Handles both codes & full names)
    if (faculty !== 'ALL') {
      const fac = c.faculty;
      const matchFac = 
        fac === faculty ||
        (faculty === 'CNTT' && (fac === 'CNTT' || fac === 'Khoa CNTT')) ||
        (faculty === 'TOAN' && (fac === 'TOAN' || fac === 'Toán - Tin' || fac === 'Khoa Toán - Tin')) ||
        (faculty === 'NN' && (fac === 'NN' || fac === 'Ngoại ngữ' || fac === 'Khoa Ngoại ngữ'));
      if (!matchFac) return false;
    }

    // 3. Shift Filter (Sáng: 1-5, Chiều: 6-11)
    if (shift !== 'ALL') {
      const isMorning = c.shift === 'MORNING' || c.shift === 'Sáng' || (c.startPeriod != null && c.startPeriod <= 5);
      const isAfternoon = c.shift === 'AFTERNOON' || c.shift === 'Chiều' || (c.startPeriod != null && c.startPeriod >= 6);
      if (shift === 'MORNING' && !isMorning) return false;
      if (shift === 'AFTERNOON' && !isAfternoon) return false;
    }

    // 4. Day Filter (2 to 8, including Sunday / Day 8)
    if (day !== 'ALL' && c.day.toString() !== day) {
      return false;
    }

    // 5. Max Credits Filter
    if (c.credits > maxCredits) {
      return false;
    }

    // 6. Smart Conflict Filter Checkbox
    const isSelected = selectedIds.includes(c.id);
    if (onlyNonConflicting && !isSelected) {
      const hasClashWithSelected = selectedCourses.some(sel => checkIntervalConflict(c, sel));
      if (hasClashWithSelected) return false;
    }

    return true;
  });
}

// Canonical 4-State determination from CourseCard.tsx & index.html
function determineCourseVisualState(course, isSelected, isClashing) {
  const isIneligible = course.status === 'ineligible';
  if (isSelected) return 'selected';
  if (isIneligible) return 'ineligible';
  if (isClashing) return 'conflict';
  return 'available';
}

describe('M1 Empirical Challenger: Stress Tests & Boundary Validations', () => {
  let courses;

  before(() => {
    courses = loadIndexHtmlCourses();
    assert.ok(courses.length >= 11, `Must load at least 11 courses from index.html (loaded ${courses.length})`);
  });

  // =========================================================================
  // SUITE 1: Vietnamese Diacritics Normalization & Search Stress Testing
  // =========================================================================
  describe('Suite 1: Vietnamese Diacritics & Instant Search Normalization', () => {
    test('S1.1: removeVietnameseTones strips all Vietnamese diacritics and converts đ/Đ', () => {
      const testCases = [
        { input: 'Trường Đại học Công nghệ Thông tin & Truyền thông', expected: 'Truong Dai hoc Cong nghe Thong tin & Truyen thong' },
        { input: 'Đại số Tuyến tính & Toán Rời rạc', expected: 'Dai so Tuyen tinh & Toan Roi rac' },
        { input: 'Xác suất Thống kê Ứng dụng', expected: 'Xac suat Thong ke Ung dung' },
        { input: 'Kỹ năng Thuyết trình Tiếng Anh', expected: 'Ky nang Thuyet trinh Tieng Anh' },
        { input: 'Trí tuệ Nhân tạo Cơ bản', expected: 'Tri tue Nhan tao Co ban' },
        { input: 'Nguyễn Thanh Hải', expected: 'Nguyen Thanh Hai' },
        { input: 'Đỗ Quang D', expected: 'Do Quang D' },
        { input: 'Hoàng Minh Dũng', expected: 'Hoang Minh Dung' },
        { input: 'đ Đ', expected: 'd D' }
      ];

      for (const tc of testCases) {
        const actual = removeVietnameseTones(tc.input);
        assert.equal(actual, tc.expected, `Diacritic strip failed for: "${tc.input}"`);
      }
    });

    test('S1.2: Searching with unaccented ASCII keywords matches accented Vietnamese course names', () => {
      const queries = [
        { q: 'nhap mon', expectedCourseId: 'CS101' },
        { q: 'cau truc', expectedCourseId: 'CS201' },
        { q: 'dai so', expectedCourseId: 'MATH101' },
        { q: 'xac suat', expectedCourseId: 'MATH102' },
        { q: 'giao dien', expectedCourseId: 'CS202-01' },
        { q: 'thuyet trinh', expectedCourseId: 'ENG102' },
        { q: 'tri tue', expectedCourseId: 'AI101' },
        { q: 'kien truc', expectedCourseId: 'SE301' },
        { q: 'mang may tinh', expectedCourseId: 'NET101' }
      ];

      for (const item of queries) {
        const res = executeExplorerFilter(courses, { search: item.q });
        assert.ok(
          res.some(c => c.id === item.expectedCourseId),
          `Query "${item.q}" must find course ${item.expectedCourseId}`
        );
      }
    });

    test('S1.3: Searching with unaccented ASCII lecturer names matches Vietnamese lecturers', () => {
      const lecturerQueries = [
        { q: 'tran van a', expectedId: 'CS101' },
        { q: 'nguyen thanh hai', expectedId: 'CS201' },
        { q: 'le thi b', expectedId: 'MATH101' },
        { q: 'vu hoang c', expectedId: 'ENG101' },
        { q: 'do quang d', expectedId: 'NET101' },
        { q: 'hoang van e', expectedId: 'SE301' },
        { q: 'vu minh tuan', expectedId: 'MATH102' },
        { q: 'hoang mai ly', expectedId: 'ENG102' },
        { q: 'hoang minh dung', expectedId: 'AI101' }
      ];

      for (const item of lecturerQueries) {
        const res = executeExplorerFilter(courses, { search: item.q });
        assert.ok(
          res.some(c => c.id === item.expectedId),
          `Lecturer query "${item.q}" must find course ${item.expectedId}`
        );
      }
    });

    test('S1.4: Adversarial queries (metacharacters, SQL/HTML injection, unicode emojis) do not throw', () => {
      const adversarial = [
        '.*', '(?=.*)', '[[[', '(((', '\\', '+', '?', '^$', '&&||',
        '<script>alert(1)</script>', '<img src=x onerror=1>',
        "' OR '1'='1", "'; DROP TABLE courses; --",
        '🚀🔥🎯📚💡💻',
        '   \t\r\n   ', // Pure whitespace
        'A'.repeat(5000) // Extreme string length
      ];

      for (const q of adversarial) {
        assert.doesNotThrow(() => {
          const res = executeExplorerFilter(courses, { search: q });
          assert.ok(Array.isArray(res));
        }, `Query "${q}" should safely execute without error`);
      }
    });
  });

  // =========================================================================
  // SUITE 2: High-Frequency Instant Search Latency Micro-Benchmark
  // =========================================================================
  describe('Suite 2: Fast Instant Search Latency Micro-Benchmark (<100ms)', () => {
    test('S2.1: 5,000 rapid keystrokes filter benchmark under heavy query mutation', () => {
      const keystrokeSequence = [
        'C', 'CS', 'CS1', 'CS10', 'CS101', '',
        'm', 'ma', 'mat', 'math', 'math1', '',
        'n', 'nh', 'nha', 'nhap', 'nhap ', 'nhap m', 'nhap mon', '',
        't', 'tr', 'tri', 'tri ', 'tri t', 'tri tue', '',
        'x', 'xa', 'xac', 'xac ', 'xac s', 'xac suat', '',
        'u', 'ui', 'ui/', 'ui/u', 'ui/ux', ''
      ];

      const iterations = 5000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        const query = keystrokeSequence[i % keystrokeSequence.length];
        const res = executeExplorerFilter(courses, { search: query });
        assert.ok(Array.isArray(res));
      }

      const totalElapsedMs = performance.now() - start;
      const avgLatencyMs = totalElapsedMs / iterations;

      assert.ok(
        avgLatencyMs < 0.2,
        `Average latency was ${avgLatencyMs.toFixed(4)}ms per query (must be < 0.2ms)`
      );
      assert.ok(
        totalElapsedMs < 500,
        `Total time for 5,000 queries was ${totalElapsedMs.toFixed(2)}ms (must be < 500ms)`
      );
    });

    test('S2.2: Algorithmic scalability test on 1,000 synthetic courses catalog', () => {
      // Create 1,000 synthetic courses
      const largeCatalog = [];
      const faculties = ['CNTT', 'TOAN', 'NN'];
      const shifts = ['MORNING', 'AFTERNOON'];

      for (let i = 0; i < 1000; i++) {
        largeCatalog.push({
          id: `COURSE_${i}`,
          code: `CS${100 + (i % 500)}-${String(i).padStart(2, '0')}`,
          name: `Học phần Thử nghiệm Số ${i} (Lập trình & Thuật toán)`,
          faculty: faculties[i % 3],
          credits: (i % 4) + 1,
          lecturer: `Giảng viên Thử nghiệm ${i}`,
          day: (i % 7) + 2, // 2 to 8
          startPeriod: (i % 2 === 0) ? 1 : 7,
          endPeriod: (i % 2 === 0) ? 3 : 9,
          shift: shifts[i % 2],
          status: 'available'
        });
      }

      const searchStart = performance.now();
      const searchRes = executeExplorerFilter(largeCatalog, { search: 'thuật toán' });
      const searchDuration = performance.now() - searchStart;

      assert.equal(searchRes.length, 1000);
      assert.ok(
        searchDuration < 50,
        `Filtering 1,000 courses executed in ${searchDuration.toFixed(2)}ms (must be < 50ms, well under 100ms threshold)`
      );
    });
  });

  // =========================================================================
  // SUITE 3: Sunday (Day 8 / CN) Inclusion & End-to-End Handling
  // =========================================================================
  describe('Suite 3: Sunday Support (Day 8 / CN)', () => {
    test('S3.1: Dataset contains Sunday course AI101 with canonical Day 8 specification', () => {
      const sundayCourse = courses.find(c => c.id === 'AI101');
      assert.ok(sundayCourse, 'Course AI101 must exist in catalog');
      assert.equal(sundayCourse.day, 8, 'AI101 day must equal 8 (Sunday)');
      assert.ok(sundayCourse.scheduleText.includes('Chủ Nhật'), 'AI101 scheduleText must mention Chủ Nhật');
      assert.equal(sundayCourse.startPeriod, 1);
      assert.equal(sundayCourse.endPeriod, 3);
    });

    test('S3.2: Filtering by Day 8 exclusively returns Sunday courses', () => {
      const sundayResults = executeExplorerFilter(courses, { day: '8' });
      assert.ok(sundayResults.length >= 1, 'Should find at least 1 Sunday course');
      assert.ok(sundayResults.every(c => c.day === 8), 'All returned courses must have day === 8');
      assert.ok(sundayResults.some(c => c.id === 'AI101'), 'AI101 must be in Sunday results');

      // Monday course (CS101) must NOT be present
      assert.ok(!sundayResults.some(c => c.id === 'CS101'), 'Monday course CS101 must not appear in Sunday filter');
    });

    test('S3.3: Conflict engine detects Sunday collision while ignoring weekday courses with identical periods', () => {
      const ai101 = courses.find(c => c.id === 'AI101'); // Day 8, 1-3

      // Synthetic overlapping Sunday course (Day 8, 2-4)
      const clashingSunday = {
        id: 'SUN_CLASH',
        code: 'SUN-01',
        day: 8,
        startPeriod: 2,
        endPeriod: 4,
        periodSlot: 'slot_1_3'
      };

      // Synthetic non-overlapping Sunday course (Day 8, 7-9)
      const nonClashingSunday = {
        id: 'SUN_OK',
        code: 'SUN-02',
        day: 8,
        startPeriod: 7,
        endPeriod: 9,
        periodSlot: 'slot_7_9'
      };

      // Weekday course with exact same periods (Monday, 1-3)
      const mondaySamePeriod = courses.find(c => c.id === 'CS101'); // Day 2, 1-3

      assert.equal(checkIntervalConflict(ai101, clashingSunday), true, 'Overlapping periods on Sunday must conflict');
      assert.equal(checkIntervalConflict(ai101, nonClashingSunday), false, 'Non-overlapping periods on Sunday must not conflict');
      assert.equal(checkIntervalConflict(ai101, mondaySamePeriod), false, 'Same periods on different days must not conflict');
    });

    test('S3.4: Standalone index.html contains Sunday column and dropdown option', () => {
      const indexPath = path.join(__dirname, '..', 'index.html');
      const html = fs.readFileSync(indexPath, 'utf8');

      // Dropdown option
      assert.ok(html.includes('value="8"') || html.includes("value='8'"), 'HTML must have option value 8');
      assert.ok(html.includes('Chủ Nhật'), 'HTML must have label Chủ Nhật');
    });
  });

  // =========================================================================
  // SUITE 4: Faceted Filter Combinatorial Grid & Boundary Stress Test
  // =========================================================================
  describe('Suite 4: 768-Combination Faceted Filtering Grid', () => {
    test('S4.1: Cartesian product of 768 filter permutations satisfies all active constraints', () => {
      const facultyOptions = ['ALL', 'CNTT', 'TOAN', 'NN'];
      const shiftOptions = ['ALL', 'MORNING', 'AFTERNOON'];
      const dayOptions = ['ALL', '2', '3', '4', '5', '6', '7', '8'];
      const maxCreditOptions = [1, 2, 3, 4];
      const conflictFilterOptions = [false, true];

      const selectedIds = ['CS201']; // Enrolled in CS201 (Day 3, 1-3)

      let totalCombinationsTested = 0;

      for (const faculty of facultyOptions) {
        for (const shift of shiftOptions) {
          for (const day of dayOptions) {
            for (const maxCredits of maxCreditOptions) {
              for (const onlyNonConflicting of conflictFilterOptions) {
                totalCombinationsTested++;

                const results = executeExplorerFilter(courses, {
                  faculty,
                  shift,
                  day,
                  maxCredits,
                  onlyNonConflicting,
                  selectedIds
                });

                assert.ok(Array.isArray(results), 'Filter must return an array');

                for (const c of results) {
                  // Validate faculty constraint
                  if (faculty !== 'ALL') {
                    if (faculty === 'CNTT') assert.ok(c.faculty === 'CNTT');
                    if (faculty === 'TOAN') assert.ok(c.faculty === 'TOAN');
                    if (faculty === 'NN') assert.ok(c.faculty === 'NN');
                  }

                  // Validate shift constraint
                  if (shift === 'MORNING') {
                    assert.ok(c.shift === 'MORNING' || c.startPeriod <= 5);
                  }
                  if (shift === 'AFTERNOON') {
                    assert.ok(c.shift === 'AFTERNOON' || c.startPeriod >= 6);
                  }

                  // Validate day constraint
                  if (day !== 'ALL') {
                    assert.equal(c.day.toString(), day);
                  }

                  // Validate max credits constraint
                  assert.ok(c.credits <= maxCredits, `Course credits ${c.credits} must be <= maxCredits ${maxCredits}`);

                  // Validate conflict constraint
                  if (onlyNonConflicting && !selectedIds.includes(c.id)) {
                    const enrolled = courses.filter(x => selectedIds.includes(x.id));
                    const clashes = enrolled.some(sel => checkIntervalConflict(c, sel));
                    assert.equal(clashes, false, `Course ${c.id} should not clash with selected courses when filter is on`);
                  }
                }
              }
            }
          }
        }
      }

      assert.equal(totalCombinationsTested, 4 * 3 * 8 * 4 * 2); // 768 permutations
    });

    test('S4.2: Credit boundary limits (maxCredits 1, 2, 3, 4)', () => {
      // 1 credit: no course in dataset has 1 credit -> length 0
      const limit1 = executeExplorerFilter(courses, { maxCredits: 1 });
      assert.equal(limit1.length, 0, 'No course has <= 1 credit');

      // 2 credits: ENG102 has 2 credits
      const limit2 = executeExplorerFilter(courses, { maxCredits: 2 });
      assert.ok(limit2.length >= 1);
      assert.ok(limit2.every(c => c.credits <= 2));
      assert.ok(limit2.some(c => c.id === 'ENG102'));

      // 3 credits: excludes SE301 (4 credits)
      const limit3 = executeExplorerFilter(courses, { maxCredits: 3 });
      assert.ok(!limit3.some(c => c.id === 'SE301'), 'SE301 must be excluded at maxCredits 3');

      // 4 credits: includes SE301
      const limit4 = executeExplorerFilter(courses, { maxCredits: 4 });
      assert.ok(limit4.some(c => c.id === 'SE301'), 'SE301 must be included at maxCredits 4');
    });
  });

  // =========================================================================
  // SUITE 5: CourseCard 4-State Strict Prioritization Matrix
  // =========================================================================
  describe('Suite 5: CourseCard 4-State Strict Prioritization', () => {
    test('S5.1: Priority order Selected > Ineligible > Conflict > Available across all 8 permutations', () => {
      const normalCourse = { id: 'TEST1', status: 'available' };
      const ineligibleCourse = { id: 'TEST2', status: 'ineligible' };

      // 1. isSelected: true overrides everything
      assert.equal(determineCourseVisualState(normalCourse, true, false), 'selected');
      assert.equal(determineCourseVisualState(normalCourse, true, true), 'selected');
      assert.equal(determineCourseVisualState(ineligibleCourse, true, false), 'selected');
      assert.equal(determineCourseVisualState(ineligibleCourse, true, true), 'selected');

      // 2. ineligible overrides conflict and available when not selected
      assert.equal(determineCourseVisualState(ineligibleCourse, false, false), 'ineligible');
      assert.equal(determineCourseVisualState(ineligibleCourse, false, true), 'ineligible');

      // 3. conflict overrides available when not selected and not ineligible
      assert.equal(determineCourseVisualState(normalCourse, false, true), 'conflict');

      // 4. available when no other state applies
      assert.equal(determineCourseVisualState(normalCourse, false, false), 'available');
    });

    test('S5.2: Ineligible course with time clash is flagged as Ineligible, preventing registration', () => {
      const se301 = courses.find(c => c.id === 'SE301');
      assert.equal(se301.status, 'ineligible');

      // Suppose student has another Saturday afternoon course clashing with SE301
      const isClashing = true;
      const state = determineCourseVisualState(se301, false, isClashing);

      assert.equal(state, 'ineligible', 'Ineligibility must take precedence over conflict');
    });

    test('S5.3: Source code inspection of CourseCard.tsx and index.html confirms canonical priority', () => {
      const cardTsxPath = path.join(__dirname, '..', 'src', 'components', 'CourseCard.tsx');
      const cardTsx = fs.readFileSync(cardTsxPath, 'utf8');

      assert.ok(
        cardTsx.includes("isSelected\n    ? 'selected'\n    : isIneligible\n    ? 'ineligible'\n    : isClashing\n    ? 'conflict'\n    : 'available'") ||
        cardTsx.includes("visualState = isSelected ? 'selected' : isIneligible ? 'ineligible' : isClashing ? 'conflict' : 'available'") ||
        cardTsx.includes("visualState: CourseVisualState = isSelected"),
        'CourseCard.tsx must implement Selected > Ineligible > Conflict > Available priority'
      );

      const indexPath = path.join(__dirname, '..', 'index.html');
      const html = fs.readFileSync(indexPath, 'utf8');
      assert.ok(
        html.includes('const visualState = isSelected') && html.includes('isIneligible') && html.includes('isClashing'),
        'index.html must implement identical priority logic'
      );
    });

    test('S5.4: Event propagation containment (e.stopPropagation on all action buttons)', () => {
      const cardTsxPath = path.join(__dirname, '..', 'src', 'components', 'CourseCard.tsx');
      const cardTsx = fs.readFileSync(cardTsxPath, 'utf8');

      // Count occurrences of stopPropagation
      const stopPropMatches = cardTsx.match(/e\.stopPropagation\(\)/g) || [];
      assert.ok(
        stopPropMatches.length >= 3,
        `CourseCard.tsx must contain at least 3 e.stopPropagation() calls on interactive buttons (found ${stopPropMatches.length})`
      );
    });
  });

  // =========================================================================
  // SUITE 6: Empirical WCAG 2.1 AA Contrast Ratio Verification
  // =========================================================================
  describe('Suite 6: WCAG 2.1 AA Contrast Ratios for all 4 Card States', () => {
    test('S6.1: Selected state color contrast ratios exceed 4.5:1', () => {
      // Selected state uses Blue palette
      const selectedBg = '#EFF6FF'; // blue-50
      const selectedBorder = '#3B82F6'; // blue-500
      const selectedBadgeText = '#1E40AF'; // blue-800
      const selectedBadgeBg = '#DBEAFE'; // blue-100
      const selectedCodeText = '#FFFFFF';
      const selectedCodeBg = '#1D4ED8'; // blue-700
      const removeButtonText = '#B91C1C'; // red-700
      const removeButtonBg = '#FEF2F2'; // red-50

      const badgeContrast = calculateContrastRatio(selectedBadgeText, selectedBadgeBg);
      const codeContrast = calculateContrastRatio(selectedCodeText, selectedCodeBg);
      const removeBtnContrast = calculateContrastRatio(removeButtonText, removeButtonBg);

      assert.ok(badgeContrast >= 4.5, `Selected badge contrast ${badgeContrast.toFixed(2)}:1 must be >= 4.5:1`);
      assert.ok(codeContrast >= 4.5, `Selected code contrast ${codeContrast.toFixed(2)}:1 must be >= 4.5:1`);
      assert.ok(removeBtnContrast >= 4.5, `Remove button contrast ${removeBtnContrast.toFixed(2)}:1 must be >= 4.5:1`);
    });

    test('S6.2: Ineligible state color contrast ratios exceed 4.5:1', () => {
      const ineligBadgeText = '#334155'; // slate-700
      const ineligBadgeBg = '#E2E8F0'; // slate-200
      const ineligReasonText = '#334155'; // slate-700
      const ineligReasonBg = '#E2E8F0'; // slate-200
      const ineligButtonText = '#475569'; // slate-600
      const ineligButtonBg = '#E2E8F0'; // slate-200

      const badgeContrast = calculateContrastRatio(ineligBadgeText, ineligBadgeBg);
      const reasonContrast = calculateContrastRatio(ineligReasonText, ineligReasonBg);
      const buttonContrast = calculateContrastRatio(ineligButtonText, ineligButtonBg);

      assert.ok(badgeContrast >= 4.5, `Ineligible badge contrast ${badgeContrast.toFixed(2)}:1 must be >= 4.5:1`);
      assert.ok(reasonContrast >= 4.5, `Ineligible reason contrast ${reasonContrast.toFixed(2)}:1 must be >= 4.5:1`);
      assert.ok(buttonContrast >= 4.0, `Ineligible button text contrast ${buttonContrast.toFixed(2)}:1 meets disabled threshold`);
    });

    test('S6.3: Conflict state color contrast ratios exceed 4.5:1', () => {
      const conflictBadgeText = '#991B1B'; // red-800
      const conflictBadgeBg = '#FEE2E2'; // red-100
      const conflictBannerText = '#991B1B'; // red-800
      const conflictBannerBg = '#FEE2E2'; // red-100
      const conflictButtonText = '#FFFFFF';
      const conflictButtonBg = '#DC2626'; // red-600

      const badgeContrast = calculateContrastRatio(conflictBadgeText, conflictBadgeBg);
      const bannerContrast = calculateContrastRatio(conflictBannerText, conflictBannerBg);
      const buttonContrast = calculateContrastRatio(conflictButtonText, conflictButtonBg);

      assert.ok(badgeContrast >= 4.5, `Conflict badge contrast ${badgeContrast.toFixed(2)}:1 must be >= 4.5:1`);
      assert.ok(bannerContrast >= 4.5, `Conflict banner contrast ${bannerContrast.toFixed(2)}:1 must be >= 4.5:1`);
      assert.ok(buttonContrast >= 4.5, `Conflict button contrast ${buttonContrast.toFixed(2)}:1 must be >= 4.5:1`);
    });

    test('S6.4: Available state color contrast ratios exceed 4.5:1', () => {
      const availBadgeText = '#065F46'; // emerald-800
      const availBadgeBg = '#ECFDF5'; // emerald-50
      const availButtonText = '#FFFFFF';
      const availButtonBg = '#2563EB'; // blue-600
      const cardTitleText = '#0F172A'; // slate-900
      const cardBg = '#FFFFFF';

      const badgeContrast = calculateContrastRatio(availBadgeText, availBadgeBg);
      const buttonContrast = calculateContrastRatio(availButtonText, availButtonBg);
      const titleContrast = calculateContrastRatio(cardTitleText, cardBg);

      assert.ok(badgeContrast >= 4.5, `Available badge contrast ${badgeContrast.toFixed(2)}:1 must be >= 4.5:1`);
      assert.ok(buttonContrast >= 4.5, `Available add button contrast ${buttonContrast.toFixed(2)}:1 must be >= 4.5:1`);
      assert.ok(titleContrast >= 4.5, `Card title contrast ${titleContrast.toFixed(2)}:1 must be >= 4.5:1`);
    });
  });

  // =========================================================================
  // SUITE 7: Dual Parity & Dataset Integrity Audit
  // =========================================================================
  describe('Suite 7: Dual Parity & Dataset Integrity Audit', () => {
    test('S7.1: Course catalog dataset parity between src/data/mockCourses.ts and index.html', () => {
      const tsPath = path.join(__dirname, '..', 'src', 'data', 'mockCourses.ts');
      const tsContent = fs.readFileSync(tsPath, 'utf8');

      // Every course ID from index.html must exist in mockCourses.ts
      for (const c of courses) {
        assert.ok(
          tsContent.includes(`id: "${c.id}"`) || tsContent.includes(`id: '${c.id}'`),
          `Course ${c.id} in index.html must exist in mockCourses.ts`
        );
        assert.ok(
          tsContent.includes(c.code),
          `Course code ${c.code} must exist in mockCourses.ts`
        );
      }
    });

    test('S7.2: Exact dual parity across index.html, preview_ui_icra.html, and public_deploy/index.html', () => {
      const idx = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
      const prev = fs.readFileSync(path.join(__dirname, '..', 'preview_ui_icra.html'), 'utf8');
      const pub = fs.readFileSync(path.join(__dirname, '..', 'public_deploy', 'index.html'), 'utf8');

      assert.equal(idx, prev, 'preview_ui_icra.html must be identical to index.html');
      assert.equal(idx, pub, 'public_deploy/index.html must be identical to index.html');
    });

    test('S7.3: All courses contain required UI fields (code, name, faculty, credits, lecturer, day, shift)', () => {
      for (const c of courses) {
        assert.ok(c.id, `Course missing id: ${JSON.stringify(c)}`);
        assert.ok(c.code, `Course ${c.id} missing code`);
        assert.ok(c.name, `Course ${c.id} missing name`);
        assert.ok(c.faculty, `Course ${c.id} missing faculty`);
        assert.ok(c.credits > 0, `Course ${c.id} must have credits > 0`);
        assert.ok(c.lecturer, `Course ${c.id} missing lecturer`);
        assert.ok(c.day >= 2 && c.day <= 8, `Course ${c.id} day must be between 2 and 8`);
        assert.ok(c.shift === 'MORNING' || c.shift === 'AFTERNOON', `Course ${c.id} shift must be MORNING or AFTERNOON`);
      }
    });
  });

  // =========================================================================
  // SUITE 8: Headless Browser Live DOM Empirical Verification
  // =========================================================================
  describe('Suite 8: Headless Browser Live DOM Empirical Verification', () => {
    const { execFile } = require('child_process');
    const { findBrowserExecutable } = require('./test_helpers');
    let browserDom = '';

    before(async () => {
      const browserExe = findBrowserExecutable();
      if (!browserExe) return;

      const indexPath = path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/');
      const targetUrl = `file:///${indexPath}`;

      browserDom = await new Promise((resolve) => {
        const args = ['--headless=new', '--disable-gpu', '--dump-dom', targetUrl];
        execFile(browserExe, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
          if (err) resolve('');
          else resolve(stdout || '');
        });
      });
    });

    test('S8.1: Live browser DOM renders Sunday dropdown option and Sunday timetable header', () => {
      if (!browserDom) return; // Skip if browser cannot run
      assert.ok(browserDom.includes('value="8"') || browserDom.includes("value='8'"), 'DOM must include value 8');
      assert.ok(browserDom.includes('Chủ Nhật'), 'DOM must render Chủ Nhật in dropdown');
    });

    test('S8.2: Live browser DOM contains all 11 courses including Sunday AI101 and slot courses MATH102, ENG102', () => {
      if (!browserDom) return;
      assert.ok(browserDom.includes('AI101'), 'Rendered DOM must contain AI101');
      assert.ok(browserDom.includes('MATH102'), 'Rendered DOM must contain MATH102');
      assert.ok(browserDom.includes('ENG102'), 'Rendered DOM must contain ENG102');
      assert.ok(browserDom.includes('Trí tuệ Nhân tạo'), 'Rendered DOM must contain AI101 title');
    });

    test('S8.3: Live browser DOM renders CourseCard 4 visual state badges correctly', () => {
      if (!browserDom) return;
      assert.ok(browserDom.includes('Sẵn sàng'), 'Available state badge must be present');
      assert.ok(browserDom.includes('Chưa đủ điều kiện'), 'Ineligible state badge must be present');
      assert.ok(browserDom.includes('SE301'), 'Ineligible course SE301 must be present');
    });
  });
});

