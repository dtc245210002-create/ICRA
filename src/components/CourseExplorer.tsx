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

