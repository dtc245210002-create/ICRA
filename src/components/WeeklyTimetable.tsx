import React, { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Course, ConflictInfo } from '../types';
import { TimetableCourseCard } from './TimetableCourseCard';

interface WeeklyTimetableProps {
  courses: Course[];
  selectedIds: string[];
  ghostCourse: Course | null;
  conflict: ConflictInfo | null;
  activePlan?: 'plan_1' | 'plan_2';
  onPlanChange?: (plan: 'plan_1' | 'plan_2') => void;
  onCourseClick: (course: Course) => void;
  onResetToDefault: () => void;
}

export const WeeklyTimetable: React.FC<WeeklyTimetableProps> = ({
  courses,
  selectedIds,
  ghostCourse,
  conflict,
  activePlan = 'plan_1',
  onPlanChange,
  onCourseClick,
  onResetToDefault
}) => {
  const [currentWeek, setCurrentWeek] = useState(1);

  const activeCourses = useMemo(() => {
    return courses.filter(c => selectedIds.includes(c.id));
  }, [courses, selectedIds]);

  const days = [2, 3, 4, 5, 6, 7, 8];
  const dayNames = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"];

  const slots = [
    { id: "slot_1_3", legacyId: "1-3", pId: "p1", label: "Tiết 1 - 3", time: "07:00 - 09:25", shift: "Sáng", start: 1, end: 3 },
    { id: "slot_4_5", legacyId: "4-5", pId: "p2", label: "Tiết 4 - 5", time: "09:35 - 11:10", shift: "Sáng", start: 4, end: 5 },
    { id: "slot_7_9", legacyId: "7-9", pId: "p3", label: "Tiết 7 - 9", time: "12:45 - 15:10", shift: "Chiều", start: 7, end: 9 },
    { id: "slot_10_11", legacyId: "10-11", pId: "p4", label: "Tiết 10 - 11", time: "15:20 - 16:55", shift: "Chiều", start: 10, end: 11 }
  ];

  const weekLabels: Record<number, string> = {
    1: "Tuần 01: 28/09 - 04/10/2026",
    2: "Tuần 02: 05/10 - 11/10/2026",
    3: "Tuần 03: 12/10 - 18/10/2026",
    4: "Tuần 04: 19/10 - 25/10/2026"
  };

  const handlePrevWeek = () => {
    setCurrentWeek(prev => (prev > 1 ? prev - 1 : 4));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => (prev < 4 ? prev + 1 : 1));
  };

  return (
    <section className="w-[47%] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex items-center space-x-1.5">
            <CalendarDays className="w-4 h-4 text-blue-600" />
            <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
              Thời Khóa Biểu Tuần
            </span>
          </div>

          {/* Week switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 text-xs shadow-2xs">
            <button
              onClick={handlePrevWeek}
              className="p-1 text-slate-500 hover:text-blue-600 transition"
              title="Tuần trước"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 font-bold text-[11px] text-slate-800 select-none">
              {weekLabels[currentWeek] || `Tuần 0${currentWeek}`}
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1 text-slate-500 hover:text-blue-600 transition"
              title="Tuần sau"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Plan 1 / Plan 2 Switcher */}
          {onPlanChange && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
              <button
                type="button"
                onClick={() => onPlanChange('plan_1')}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  activePlan === 'plan_1'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Phương án 1
              </button>
              <button
                type="button"
                onClick={() => onPlanChange('plan_2')}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  activePlan === 'plan_2'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Phương án 2
              </button>
            </div>
          )}

          <button
            onClick={onResetToDefault}
            className="text-[11px] font-bold text-blue-600 hover:underline shrink-0"
          >
            Khôi phục mặc định
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Header row */}
        <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200 text-center py-2 text-[11px] font-bold text-slate-700 shrink-0">
          <div className="text-slate-400 border-r border-slate-200">Tiết / Giờ</div>
          {dayNames.map((name, idx) => (
            <div key={idx} className={idx < 6 ? "border-r border-slate-200" : ""}>
              {name}
            </div>
          ))}
        </div>

        {/* Matrix slots */}
        <div className="flex-1 grid grid-rows-4 divide-y divide-slate-200 overflow-hidden">
          {slots.map(slot => (
            <div key={slot.id} className="grid grid-cols-8 h-full">
              <div className="p-1.5 bg-slate-50/60 border-r border-slate-200 flex flex-col justify-center items-center text-center">
                <span className="font-extrabold text-[11px] text-slate-800">{slot.label}</span>
                <span className="text-[9px] text-slate-500 font-mono">{slot.time}</span>
                <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1 rounded mt-0.5">{slot.shift}</span>
              </div>

              {days.map(d => {
                const enrolled = activeCourses.find(c => 
                  c.day === d && (
                    c.periodSlot === slot.id ||
                    c.periodSlot === slot.legacyId ||
                    c.periodSlot === slot.pId ||
                    (c.startPeriod <= slot.end && c.endPeriod >= slot.start)
                  )
                );

                const isGhostMatch = ghostCourse && ghostCourse.day === d && (
                  ghostCourse.periodSlot === slot.id ||
                  ghostCourse.periodSlot === slot.legacyId ||
                  ghostCourse.periodSlot === slot.pId ||
                  (ghostCourse.startPeriod <= slot.end && ghostCourse.endPeriod >= slot.start)
                );

                const isGhostPreview = isGhostMatch && !selectedIds.includes(ghostCourse.id);
                const isGhostConflict = isGhostPreview && enrolled && enrolled.id !== ghostCourse.id;
                const isHoveringEnrolled = isGhostMatch && enrolled && enrolled.id === ghostCourse.id;
                const isClashing = enrolled && conflict && (
                  conflict.incomingCourse.id === enrolled.id || conflict.existingCourse.id === enrolled.id
                );

                return (
                  <div
                    key={d}
                    className={`p-1 relative flex flex-col justify-center ${
                      d < 8 ? "border-r border-slate-200" : "bg-slate-50/20"
                    }`}
                  >
                    {enrolled ? (
                      <div className={`relative h-full w-full rounded-lg transition-all ${
                        isGhostConflict ? "ring-2 ring-red-500 animate-pulse" : isHoveringEnrolled ? "ring-2 ring-blue-500 shadow-md" : ""
                      }`}>
                        <TimetableCourseCard
                          course={enrolled}
                          isClashing={Boolean(isClashing || isGhostConflict)}
                          onClick={onCourseClick}
                        />
                        {isGhostConflict && (
                          <div className="absolute -top-1.5 -right-1 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs pointer-events-none z-20 flex items-center space-x-0.5">
                            <span>⚠️ Trùng {ghostCourse.code}</span>
                          </div>
                        )}
                      </div>
                    ) : isGhostPreview ? (
                      <div className={`h-full w-full rounded-lg p-1 flex flex-col justify-between text-left pointer-events-none transition-all duration-150 border-2 border-dashed ${
                        ghostCourse.status === 'ineligible'
                          ? "border-slate-400 bg-slate-100/80"
                          : "border-blue-500 bg-blue-50/70 animate-pulse"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-[9px] text-blue-800 bg-blue-100 px-1 py-0.5 rounded">
                            {ghostCourse.code}
                          </span>
                          <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200 px-1 rounded">
                            {ghostCourse.status === 'ineligible' ? 'Khóa' : 'Xem trước'}
                          </span>
                        </div>
                        <div>
                          <h6 className="text-[9px] font-bold text-slate-900 line-clamp-1 leading-tight">{ghostCourse.name}</h6>
                          <p className="text-[8px] text-slate-600 font-medium">{ghostCourse.classroom || ghostCourse.room} • {ghostCourse.credits} TC</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="px-4 py-2 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-50 border border-blue-400"></span>
            <span>Đã chọn</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded border border-dashed border-blue-600 bg-blue-50/40"></span>
            <span>Xem trước (Ghost)</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-500"></span>
            <span>Trùng lịch</span>
          </span>
        </div>
        <div className="text-[11px] font-medium text-slate-600">
          Nhấp vào ô môn học để xem thông tin chi tiết
        </div>
      </div>
    </section>
  );
};
