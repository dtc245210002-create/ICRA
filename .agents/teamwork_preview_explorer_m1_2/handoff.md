# Handoff Report — Milestone 1 Explorer 2: CourseExplorer & Faceted Filtering

**Author**: `teamwork_preview_explorer_m1_2`  
**Date**: 2026-09-29  
**Target Milestone**: Milestone 1 (F04 - F09: CourseExplorer & Faceted Filtering)  
**Recipient**: `teamwork_preview_orchestrator_1` / `teamwork_preview_worker_1`

---

## 1. Observation

Direct examination of `src/components/CourseExplorer.tsx`, `index.html`, `src/types/index.ts`, `src/data/mockCourses.ts`, `src/components/WeeklyTimetable.tsx`, and project specifications revealed the following exact observations:

### Observation 1.1: Missing Sunday (Day 8 / Chủ Nhật) in Day Filter Dropdown
- In `src/components/CourseExplorer.tsx`, lines 110–119:
```tsx
110:   <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ngày học</label>
111:   <select value={day} onChange={e => setDay(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
112:     <option value="ALL">Tất cả ngày (T2 - CN)</option>
113:     <option value="2">Thứ Hai</option>
114:     <option value="3">Thứ Ba</option>
115:     <option value="4">Thứ Tư</option>
116:     <option value="5">Thứ Năm</option>
117:     <option value="6">Thứ Sáu</option>
118:     <option value="7">Thứ Bảy</option>
119:   </select>
```
- In `index.html`, lines 490–500:
```html
490:   <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ngày học</label>
491:   <select value={day} onChange={e => setDay(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
492:     <option value="ALL">Tất cả ngày (T2 - CN)</option>
493:     <option value="2">Thứ Hai</option>
494:     <option value="3">Thứ Ba</option>
495:     <option value="4">Thứ Tư</option>
496:     <option value="5">Thứ Năm</option>
497:     <option value="6">Thứ Sáu</option>
498:     <option value="7">Thứ Bảy</option>
499:   </select>
```
Sunday (`<option value="8">Chủ Nhật</option>`) is completely missing in both files, despite the select label claiming `(T2 - CN)` and the weekly matrix displaying Day 8 as "Chủ Nhật" (per `WeeklyTimetable.tsx` line 27: `days = [2, 3, 4, 5, 6, 7, 8]`).

### Observation 1.2: Flawed & Inconsistent Conflict Check Math
- In `src/components/CourseExplorer.tsx`, lines 42–45 & line 153:
```tsx
42:   const isConflict = courses.some(x => selectedIds.includes(x.id) && x.id !== c.id && x.day === c.day && x.periodText === c.periodText);
43:   if (onlyNonConflicting && isConflict && !selectedIds.includes(c.id)) {
44:     return false;
45:   }
...
153:  const isClashing = !isSelected && courses.some(x => selectedIds.includes(x.id) && x.day === course.day && x.periodText === course.periodText);
```
- In `index.html`, line 422 & line 535:
```javascript
422:  const isConflict = courses.some(x => selectedIds.includes(x.id) && x.id !== c.id && x.day === c.day && x.periodSlot === c.periodSlot);
...
535:  const isClashing = !isSelected && courses.some(x => selectedIds.includes(x.id) && x.day === course.day && x.periodSlot === course.periodSlot);
```
- In contrast, `PROJECT.md` line 107 and `ORIGINAL_REQUEST.md` R3 stipulate:
```typescript
Conflict = (day_A == day_B) && (start_A <= end_B && end_A >= start_B)
```
Comparing string equality on `periodText` or discrete `periodSlot` fails when classes have non-identical text strings (e.g. `"Tiết 1 - 3"` vs `"Tiết 1-3"`) or overlap across periods (e.g. periods 2–4 overlapping periods 1–3).

### Observation 1.3: Faculty Schema Inconsistency
- In `src/components/CourseExplorer.tsx`, lines 90–95:
```tsx
<select value={faculty} onChange={e => setFaculty(e.target.value)} className="...">
  <option value="ALL">Tất cả khoa</option>
  <option value="CNTT">Khoa CNTT</option>
  <option value="TOAN">Khoa Toán - Tin</option>
  <option value="NN">Khoa Ngoại ngữ</option>
</select>
```
- In `src/types/index.ts` line 8: `faculty: 'CNTT' | 'TOAN' | 'NN' | 'ATTT';`
- In `PROJECT.md` line 70: `faculty: 'CNTT' | 'Toán - Tin' | 'Ngoại ngữ';`
- In `ORIGINAL_REQUEST.md` R2: `Bộ lọc theo Khoa/Bộ môn (CNTT, Toán - Tin, Ngoại ngữ).`
If data uses `'Toán - Tin'` or `'Ngoại ngữ'`, the strict equality `c.faculty === faculty` with `faculty === 'TOAN'` or `'NN'` evaluates to `false` and returns 0 courses.

### Observation 1.4: Shift Filter Lacks Period Interval Resilience
- In `src/components/CourseExplorer.tsx`, line 38 & lines 100–103:
```tsx
38:  const matchShf = shift === 'ALL' || c.shift === shift;
...
100: <option value="ALL">Tất cả ca</option>
101: <option value="MORNING">Ca Sáng (1-5)</option>
102: <option value="AFTERNOON">Ca Chiều (6-11)</option>
```
- In `PROJECT.md` line 77: `shift: 'Sáng' | 'Chiều';`
- In `ORIGINAL_REQUEST.md` line 19: `Bộ lọc theo Ca học (Sáng: Tiết 1-5, Chiều: Tiết 6-11).`
Direct string comparison does not guard against Vietnamese values (`'Sáng'` / `'Chiều'`) or verify period boundaries (`startPeriod <= 5` for Sáng, `startPeriod >= 6` for Chiều).

### Observation 1.5: Instant Search Inefficiency & Lack of Vietnamese Diacritic Normalization
- In `src/components/CourseExplorer.tsx`, lines 34–36:
```tsx
const matchQ = c.name.toLowerCase().includes(search.toLowerCase()) || 
               c.code.toLowerCase().includes(search.toLowerCase()) || 
               c.lecturer.toLowerCase().includes(search.toLowerCase());
```
`search.toLowerCase()` is evaluated 3 times for every course on every render. Furthermore, searching without Vietnamese accents (e.g. `"nhap mon"`, `"thiet ke"`, `"nguyen thanh hai"`) fails to match courses with accents (`"Nhập môn Lập trình"`, `"Thiết kế Giao diện Phần mềm"`, `"TS. Nguyễn Thanh Hải"`).

### Observation 1.6: Max Credits Hardcoded to 4
- In `src/components/CourseExplorer.tsx`, line 29 & line 127:
```tsx
const [maxCredits, setMaxCredits] = useState(4);
...
<input type="range" min="1" max="4" value={maxCredits} ... />
```
Hardcoding max to 4 limits flexibility if the catalog contains courses with 5 credits (such as Graduation Thesis or Capstone projects).

### Observation 1.7: Missing Empty State Feedback
- In `src/components/CourseExplorer.tsx`, line 150:
```tsx
<div className="flex-1 overflow-y-auto p-3 space-y-2.5">
  {filteredCourses.map(...)}
</div>
```
When filters match 0 courses, the container is an empty white void with no user feedback or recovery button.

---

## 2. Logic Chain

1. **Sunday (Day 8) Filter Requirement**:
   - *From Observation 1.1*: Day filter select options only list 2 through 7 (Thứ Hai through Thứ Bảy).
   - *Requirement R2/R3*: System must support scheduling from Thứ 2 to Chủ Nhật (8 columns).
   - *Inference*: Any course placed on Sunday cannot be filtered or isolated by the student. Adding `<option value="8">Chủ Nhật</option>` restores complete 7-day coverage.

2. **Interval Collision Engine**:
   - *From Observation 1.2*: Using `periodText === periodText` or `periodSlot === periodSlot` produces false negatives on interval clashes.
   - *From Observation 1.2*: The authoritative formula is `(day_A == day_B) && (start_A <= end_B && end_A >= start_B)`.
   - *Inference*: Both `CourseExplorer.tsx` and `index.html` must compute conflict using mathematical interval collision. Pre-computing `selectedCourses = courses.filter(c => selectedIds.includes(c.id))` once per render and passing it to the collision check avoids redundant lookups.

3. **Faculty & Shift Schema Normalization**:
   - *From Observation 1.3 & 1.4*: Divergence between internal enum keys (`'TOAN'`, `'NN'`, `'MORNING'`, `'AFTERNOON'`) and localized display strings (`'Toán - Tin'`, `'Ngoại ngữ'`, `'Sáng'`, `'Chiều'`).
   - *Inference*: Filter predicates should check normalized aliases:
     - Faculty: `faculty === 'ALL' || c.faculty === faculty || (faculty === 'TOAN' && c.faculty === 'Toán - Tin') || (faculty === 'NN' && c.faculty === 'Ngoại ngữ')`.
     - Shift: `shift === 'ALL' || ((shift === 'MORNING' || shift === 'Sáng') && (c.shift === 'MORNING' || c.shift === 'Sáng' || c.startPeriod <= 5)) || ((shift === 'AFTERNOON' || shift === 'Chiều') && (c.shift === 'AFTERNOON' || c.shift === 'Chiều' || c.startPeriod >= 6))`.
     This ensures 100% interoperability regardless of data schema refactoring.

4. **Instant Search (<100ms) with Diacritic Tolerance**:
   - *From Observation 1.5*: Calling `.toLowerCase()` inside tight loop burns CPU cycles. Lack of diacritic stripping breaks UX for Vietnamese students typing on ASCII keyboards.
   - *Inference*: Normalizing search query once before looping:
     ```typescript
     const q = search.trim().toLowerCase();
     const qNoTone = removeVietnameseTones(q);
     ```
     Comparing both exact and tone-stripped values guarantees sub-millisecond execution and effortless search UX.

5. **No-Conflict Checkbox Behavior**:
   - When `onlyNonConflicting` is true, courses that conflict with *any* currently selected course must be hidden (`return false`), EXCEPT if the course is already in `selectedIds` (so the user can always see what they have enrolled).

6. **Empty State & Reset UX**:
   - When `filteredCourses.length === 0`, render a friendly card with an icon, "Không tìm thấy học phần phù hợp", and a "Đặt lại bộ lọc" button triggering `resetFilters()`.

---

## 3. Caveats

1. **Data Set Dependency**: If mock data has no courses on Sunday (Day 8), selecting Sunday will correctly show 0 courses. It is recommended that Worker / Explorer 1 include at least one course on Sunday (e.g. `CS305: An Toàn Hệ Thống - CN (Tiết 1-3)`) to enable end-to-end verification.
2. **Dual-Track Sync**: Edits made to `src/components/CourseExplorer.tsx` must be mirrored in `index.html` (lines 403–550) and `preview_ui_icra.html` to maintain 100% parity for standalone zero-install deployment.
3. **CourseCard Prop Contract**: `CourseCard` expects `course`, `isSelected`, `isClashing`, `onAdd`, `onRemove`, `onOpenDetail`, `onHoverEnter`, `onHoverLeave`. The internal state calculations in `CourseExplorer` do not alter this prop interface, preserving compatibility with Explorer 3's visual state work.

---

## 4. Conclusion & Concrete Code Specifications

### 4.1 Solution for `src/components/CourseExplorer.tsx`

Here is the exact production-ready code proposed for `src/components/CourseExplorer.tsx`:

```tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Compass, Search, FilterX, X } from 'lucide-react';
import { Course } from '../types';
import { CourseCard } from './CourseCard';

interface CourseExplorerProps {
  courses: Course[];
  selectedIds: string[];
  onAdd: (course: Course) => void;
  onRemove: (courseId: string) => void;
  onOpenDetail: (course: Course) => void;
  onHoverEnter: (course: Course) => void;
  onHoverLeave: () => void;
}

// Canonical Interval Conflict Detection
export const checkIntervalConflict = (courseA: Course, courseB: Course): boolean => {
  if (courseA.id === courseB.id) return false;
  if (courseA.day !== courseB.day) return false;
  if (courseA.startPeriod != null && courseA.endPeriod != null && 
      courseB.startPeriod != null && courseB.endPeriod != null) {
    return courseA.startPeriod <= courseB.endPeriod && courseA.endPeriod >= courseB.startPeriod;
  }
  return courseA.periodText === courseB.periodText;
};

// Vietnamese Diacritics Stripper for Accent-Insensitive Instant Search
const removeVietnameseTones = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const CourseExplorer: React.FC<CourseExplorerProps> = ({
  courses,
  selectedIds,
  onAdd,
  onRemove,
  onOpenDetail,
  onHoverEnter,
  onHoverLeave
}) => {
  const [search, setSearch] = useState('');
  const [faculty, setFaculty] = useState('ALL');
  const [shift, setShift] = useState('ALL');
  const [day, setDay] = useState('ALL');
  const [maxCredits, setMaxCredits] = useState(4);
  const [onlyNonConflicting, setOnlyNonConflicting] = useState(false);

  // Compute selected courses list once
  const selectedCourses = useMemo(() => {
    return courses.filter(c => selectedIds.includes(c.id));
  }, [courses, selectedIds]);

  // Determine dynamic max credits from available courses
  const maxPossibleCredits = useMemo(() => {
    return Math.max(4, ...courses.map(c => c.credits || 0));
  }, [courses]);

  // Fast Instant Filtering (<100ms)
  const filteredCourses = useMemo(() => {
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
  }, [courses, selectedCourses, selectedIds, search, faculty, shift, day, maxCredits, onlyNonConflicting]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setFaculty('ALL');
    setShift('ALL');
    setDay('ALL');
    setMaxCredits(maxPossibleCredits);
    setOnlyNonConflicting(false);
  }, [maxPossibleCredits]);

  const isFilterActive = search !== '' || faculty !== 'ALL' || shift !== 'ALL' || day !== 'ALL' || maxCredits < maxPossibleCredits || onlyNonConflicting;

  return (
    <section className="w-[28%] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Khám Phá Học Phần (Course Explorer)</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Tìm kiếm đa tiêu chí & Đăng ký trực tiếp</p>
        </div>
        {isFilterActive && (
          <button 
            onClick={resetFilters} 
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline transition"
          >
            Đặt lại
          </button>
        )}
      </div>

      {/* Filter Panel */}
      <div className="p-3.5 space-y-2.5 border-b border-slate-200 bg-white">
        {/* Search input with clear button */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Tìm mã môn, tên môn hoặc giảng viên..." 
            className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition"
          />
          {search && (
            <button 
              onClick={() => setSearch('')} 
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Faculty & Shift Dropdowns */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Khoa / Bộ môn</label>
            <select 
              value={faculty} 
              onChange={e => setFaculty(e.target.value)} 
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
            >
              <option value="ALL">Tất cả khoa</option>
              <option value="CNTT">Khoa CNTT</option>
              <option value="TOAN">Khoa Toán - Tin</option>
              <option value="NN">Khoa Ngoại ngữ</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ca học</label>
            <select 
              value={shift} 
              onChange={e => setShift(e.target.value)} 
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
            >
              <option value="ALL">Tất cả ca</option>
              <option value="MORNING">Ca Sáng (1-5)</option>
              <option value="AFTERNOON">Ca Chiều (6-11)</option>
            </select>
          </div>
        </div>

        {/* Day & Credit Range Slider */}
        <div className="grid grid-cols-2 gap-2 text-xs items-center">
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ngày học</label>
            <select 
              value={day} 
              onChange={e => setDay(e.target.value)} 
              className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
            >
              <option value="ALL">Tất cả ngày (T2 - CN)</option>
              <option value="2">Thứ Hai</option>
              <option value="3">Thứ Ba</option>
              <option value="4">Thứ Tư</option>
              <option value="5">Thứ Năm</option>
              <option value="6">Thứ Sáu</option>
              <option value="7">Thứ Bảy</option>
              <option value="8">Chủ Nhật</option>
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-0.5">
              <span>Số tín chỉ:</span>
              <span className="text-blue-600 font-black">Tối đa {maxCredits} TC</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max={maxPossibleCredits} 
              value={maxCredits} 
              onChange={e => setMaxCredits(Number(e.target.value))} 
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Số tín chỉ tối đa"
            />
          </div>
        </div>

        {/* Checkbox & Count */}
        <div className="pt-1 flex items-center justify-between text-xs">
          <label className="flex items-center space-x-2 cursor-pointer text-slate-700 select-none">
            <input 
              type="checkbox" 
              checked={onlyNonConflicting} 
              onChange={e => setOnlyNonConflicting(e.target.checked)} 
              className="rounded border-slate-300 text-blue-600 h-3.5 w-3.5 focus:ring-blue-500"
            />
            <span className="text-[11px] font-medium">Chỉ hiện lớp không trùng lịch</span>
          </label>
          <span className={`text-[11px] font-bold ${filteredCourses.length > 0 ? 'text-slate-500' : 'text-amber-600'}`}>
            {filteredCourses.length} học phần
          </span>
        </div>
      </div>

      {/* Cards List / Empty State */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(course => {
            const isSelected = selectedIds.includes(course.id);
            const isClashing = !isSelected && selectedCourses.some(sel => checkIntervalConflict(course, sel));
            return (
              <CourseCard 
                key={course.id}
                course={course}
                isSelected={isSelected}
                isClashing={isClashing}
                onAdd={onAdd}
                onRemove={onRemove}
                onOpenDetail={onOpenDetail}
                onHoverEnter={onHoverEnter}
                onHoverLeave={onHoverLeave}
              />
            );
          })
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <FilterX className="w-8 h-8 text-slate-300 mb-2" />
            <p className="font-bold text-xs text-slate-700">Không tìm thấy học phần phù hợp</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Vui lòng thử từ khóa khác hoặc đặt lại bộ lọc tìm kiếm.
            </p>
            <button 
              onClick={resetFilters} 
              className="mt-3 px-3 py-1 bg-white border border-slate-200 hover:border-blue-300 text-blue-600 font-bold text-[11px] rounded-lg shadow-2xs transition"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
```

---

### 4.2 Solution for `index.html` (and `preview_ui_icra.html`)

In `index.html` (lines 403–552):

1. **Replace `CourseExplorer` component** with:
```jsx
    // ==================== COMPONENT: COURSE EXPLORER ====================
    function CourseExplorer({ courses, selectedIds, onAdd, onRemove, onOpenDetail, onHoverEnter, onHoverLeave }) {
      const [search, setSearch] = useState("");
      const [faculty, setFaculty] = useState("ALL");
      const [shift, setShift] = useState("ALL");
      const [day, setDay] = useState("ALL");
      const [maxCredits, setMaxCredits] = useState(4);
      const [onlyNonConflicting, setOnlyNonConflicting] = useState(false);

      const removeTones = (str) => {
        return (str || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D");
      };

      const selectedCourses = useMemo(() => {
        return courses.filter(c => selectedIds.includes(c.id));
      }, [courses, selectedIds]);

      const checkIntervalConflict = (a, b) => {
        if (a.id === b.id) return false;
        if (a.day !== b.day) return false;
        if (a.startPeriod != null && a.endPeriod != null && b.startPeriod != null && b.endPeriod != null) {
          return a.startPeriod <= b.endPeriod && a.endPeriod >= b.startPeriod;
        }
        if (a.periodSlot && b.periodSlot) {
          return a.periodSlot === b.periodSlot;
        }
        return a.periodText === b.periodText;
      };

      const maxPossibleCredits = useMemo(() => {
        return Math.max(4, ...courses.map(c => c.credits || 0));
      }, [courses]);

      const filteredCourses = useMemo(() => {
        const qRaw = search.trim().toLowerCase();
        const qNorm = removeTones(qRaw);

        return courses.filter(c => {
          // Instant search (<100ms)
          if (qRaw) {
            const code = (c.code || "").toLowerCase();
            const name = (c.name || "").toLowerCase();
            const lecturer = (c.lecturer || "").toLowerCase();
            const direct = code.includes(qRaw) || name.includes(qRaw) || lecturer.includes(qRaw);
            if (!direct) {
              const normName = removeTones(name);
              const normLect = removeTones(lecturer);
              if (!normName.includes(qNorm) && !normLect.includes(qNorm)) {
                return false;
              }
            }
          }

          // Faculty filter
          if (faculty !== "ALL") {
            const fac = c.faculty;
            const matchFac = 
              fac === faculty ||
              (faculty === "CNTT" && (fac === "CNTT" || fac === "Khoa CNTT")) ||
              (faculty === "TOAN" && (fac === "TOAN" || fac === "Toán - Tin" || fac === "Khoa Toán - Tin")) ||
              (faculty === "NN" && (fac === "NN" || fac === "Ngoại ngữ" || fac === "Khoa Ngoại ngữ"));
            if (!matchFac) return false;
          }

          // Shift filter (Sáng: 1-5, Chiều: 6-11)
          if (shift !== "ALL") {
            const isMorning = c.shift === "MORNING" || c.shift === "Sáng" || (c.startPeriod != null && c.startPeriod <= 5);
            const isAfternoon = c.shift === "AFTERNOON" || c.shift === "Chiều" || (c.startPeriod != null && c.startPeriod >= 6);
            if (shift === "MORNING" && !isMorning) return false;
            if (shift === "AFTERNOON" && !isAfternoon) return false;
          }

          // Day filter (2 to 8, including Sunday / Day 8)
          if (day !== "ALL" && c.day.toString() !== day) {
            return false;
          }

          // Max credits slider
          if (c.credits > maxCredits) {
            return false;
          }

          // Conflict checkbox
          const isSelected = selectedIds.includes(c.id);
          if (onlyNonConflicting && !isSelected) {
            const hasConflict = selectedCourses.some(sel => checkIntervalConflict(c, sel));
            if (hasConflict) return false;
          }

          return true;
        });
      }, [courses, selectedCourses, selectedIds, search, faculty, shift, day, maxCredits, onlyNonConflicting]);

      const resetFilters = () => {
        setSearch("");
        setFaculty("ALL");
        setShift("ALL");
        setDay("ALL");
        setMaxCredits(maxPossibleCredits);
        setOnlyNonConflicting(false);
      };

      const isFilterActive = search !== "" || faculty !== "ALL" || shift !== "ALL" || day !== "ALL" || maxCredits < maxPossibleCredits || onlyNonConflicting;

      return (
        <section className="w-[28%] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <i data-lucide="compass" className="w-4 h-4 text-blue-600"></i>
                <span>Khám Phá Học Phần (Course Explorer)</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Tìm kiếm đa tiêu chí & Đăng ký trực tiếp</p>
            </div>
            {isFilterActive && (
              <button onClick={resetFilters} className="text-[11px] font-bold text-blue-600 hover:underline">
                Đặt lại
              </button>
            )}
          </div>

          {/* Filter Panel */}
          <div className="p-3.5 space-y-2.5 border-b border-slate-200 bg-white">
            <div className="relative">
              <i data-lucide="search" className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5"></i>
              <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Tìm mã môn, tên môn hoặc giảng viên..." 
                className="w-full pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")} 
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Khoa / Bộ môn</label>
                <select value={faculty} onChange={e => setFaculty(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <option value="ALL">Tất cả khoa</option>
                  <option value="CNTT">Khoa CNTT</option>
                  <option value="TOAN">Khoa Toán - Tin</option>
                  <option value="NN">Khoa Ngoại ngữ</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ca học</label>
                <select value={shift} onChange={e => setShift(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <option value="ALL">Tất cả ca</option>
                  <option value="MORNING">Ca Sáng (1-5)</option>
                  <option value="AFTERNOON">Ca Chiều (6-11)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs items-center">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ngày học</label>
                <select value={day} onChange={e => setDay(e.target.value)} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                  <option value="ALL">Tất cả ngày (T2 - CN)</option>
                  <option value="2">Thứ Hai</option>
                  <option value="3">Thứ Ba</option>
                  <option value="4">Thứ Tư</option>
                  <option value="5">Thứ Năm</option>
                  <option value="6">Thứ Sáu</option>
                  <option value="7">Thứ Bảy</option>
                  <option value="8">Chủ Nhật</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 mb-0.5">
                  <span>Số tín chỉ:</span>
                  <span className="text-blue-600 font-black">Tối đa {maxCredits} TC</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max={maxPossibleCredits} 
                  value={maxCredits} 
                  onChange={e => setMaxCredits(Number(e.target.value))} 
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-700">
                <input 
                  type="checkbox" 
                  checked={onlyNonConflicting} 
                  onChange={e => setOnlyNonConflicting(e.target.checked)} 
                  className="rounded border-slate-300 text-blue-600 h-3.5 w-3.5"
                />
                <span className="text-[11px] font-medium">Chỉ hiện lớp không trùng lịch</span>
              </label>
              <span className={`text-[11px] font-bold ${filteredCourses.length > 0 ? 'text-slate-500' : 'text-amber-600'}`}>
                {filteredCourses.length} học phần
              </span>
            </div>
          </div>

          {/* Cards List / Empty State */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredCourses.length > 0 ? (
              filteredCourses.map(course => {
                const isSelected = selectedIds.includes(course.id);
                const isClashing = !isSelected && selectedCourses.some(sel => checkIntervalConflict(course, sel));
                return (
                  <CourseCard 
                    key={course.id}
                    course={course}
                    isSelected={isSelected}
                    isClashing={isClashing}
                    onAdd={onAdd}
                    onRemove={onRemove}
                    onOpenDetail={onOpenDetail}
                    onHoverEnter={onHoverEnter}
                    onHoverLeave={onHoverLeave}
                  />
                );
              })
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="font-bold text-xs text-slate-700">Không tìm thấy học phần phù hợp</p>
                <p className="text-[11px] text-slate-400 mt-1">Vui lòng thử từ khóa khác hoặc đặt lại bộ lọc tìm kiếm.</p>
                <button 
                  onClick={resetFilters} 
                  className="mt-3 px-3 py-1 bg-white border border-slate-200 hover:border-blue-300 text-blue-600 font-bold text-[11px] rounded-lg shadow-2xs transition"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>
        </section>
      );
    }
```

---

## 5. Verification Method

To verify these changes independently:

### 5.1 Automated Node Test Verification
Run test scripts verifying search and faceted filtering:
```powershell
# Run feature test suite once Worker implements F04-F09
node --test tests/tier1_features.test.js
```
The test should verify:
1. `filterCourses({ search: "nhap mon" })` matches `CS101` (Nhập môn Lập trình) even without diacritics.
2. `filterCourses({ faculty: "TOAN" })` matches `MATH101`.
3. `filterCourses({ shift: "MORNING" })` returns only courses with `startPeriod <= 5`.
4. `filterCourses({ day: "8" })` returns Sunday courses.
5. `filterCourses({ maxCredits: 3 })` excludes 4-credit `SE301`.
6. `filterCourses({ onlyNonConflicting: true, selectedIds: ["CS201"] })` filters out clashing course `CS202-02` (Tuesday period 1-3) while retaining `CS201` and non-clashing courses.

### 5.2 Browser DOM Inspection
1. Serve the app:
```powershell
node serve.js
```
2. Navigate to `http://127.0.0.1:8080`.
3. Open Developer Tools Console:
   - Check Day dropdown: Confirm `<option value="8">Chủ Nhật</option>` is present and selectable.
   - Type `"thiet ke"` into search: Verify `CS202-01` and `CS202-02` appear immediately.
   - Measure keystroke latency: `performance.now()` before and after state update shows `<15ms` response time.
   - Check "Chỉ hiện lớp không trùng lịch": Verify `CS202-02` (conflicting with enrolled `CS201`) immediately disappears from the course list.
   - Set max credits slider to `2`: Verify all 3-credit and 4-credit courses disappear and the empty state card is displayed.
   - Click "Đặt lại": Verify all filters reset to initial defaults and all courses reappear.

### 5.3 Invalidation Conditions
- If selecting "Chủ Nhật" fails or Day dropdown only has 7 options (2 through 7).
- If searching "Toán" returns courses but searching "toan" returns 0 courses.
- If checking "Chỉ hiện lớp không trùng lịch" hides already-selected courses from the course list.
- If conflict detection relies on string equality `periodText === periodText` instead of interval boundary math `startPeriod <= endPeriod && endPeriod >= startPeriod`.
