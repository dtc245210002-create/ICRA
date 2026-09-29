import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Plus, 
  Check, 
  Info,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { Course } from '../types';

export interface CourseCardProps {
  course: Course;
  isSelected: boolean;
  isClashing: boolean;
  conflictingCourse?: Course | null;
  onAdd: (course: Course) => void;
  onRemove: (courseId: string) => void;
  onOpenDetail: (course: Course) => void;
  onHoverEnter: (course: Course) => void;
  onHoverLeave: () => void;
}

export type CourseVisualState = 'selected' | 'ineligible' | 'conflict' | 'available';

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  isSelected,
  isClashing,
  conflictingCourse,
  onAdd,
  onRemove,
  onOpenDetail,
  onHoverEnter,
  onHoverLeave
}) => {
  const isIneligible = course.status === 'ineligible';

  // Canonical Priority: Selected > Ineligible > Conflict > Available
  const visualState: CourseVisualState = isSelected
    ? 'selected'
    : isIneligible
    ? 'ineligible'
    : isClashing
    ? 'conflict'
    : 'available';

  const containerClasses: Record<CourseVisualState, string> = {
    selected: 'bg-blue-50/90 border-2 border-blue-500 shadow-sm ring-1 ring-blue-500/20',
    ineligible: 'bg-slate-100/70 border border-slate-300 opacity-80 cursor-default',
    conflict: 'bg-red-50/70 border-2 border-red-400 hover:border-red-500 shadow-2xs',
    available: 'bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer'
  };

  const stateBadge: Record<CourseVisualState, { text: string; icon: React.ReactNode; bg: string }> = {
    selected: {
      text: 'Đã chọn',
      icon: <CheckCircle2 className="w-3 h-3 text-blue-700" aria-hidden="true" />,
      bg: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    ineligible: {
      text: 'Chưa đủ điều kiện',
      icon: <Lock className="w-3 h-3 text-slate-700" aria-hidden="true" />,
      bg: 'bg-slate-200 text-slate-700 border-slate-300'
    },
    conflict: {
      text: 'Trùng lịch TKB',
      icon: <AlertTriangle className="w-3 h-3 text-red-700" aria-hidden="true" />,
      bg: 'bg-red-100 text-red-800 border-red-200'
    },
    available: {
      text: 'Sẵn sàng',
      icon: <Check className="w-3 h-3 text-emerald-700" aria-hidden="true" />,
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
  };

  const handleCardClick = () => {
    onOpenDetail(course);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenDetail(course);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Môn học ${course.name}, Mã ${course.code}, Trạng thái ${stateBadge[visualState].text}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHoverEnter(course)}
      onMouseLeave={onHoverLeave}
      className={`p-3.5 rounded-xl transition-all duration-150 space-y-2.5 relative select-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${containerClasses[visualState]}`}
    >
      {/* Top Header: Code, Faculty, State Badge, Credits */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded shadow-2xs ${
            visualState === 'selected'
              ? 'bg-blue-700 text-white'
              : visualState === 'conflict'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}>
            {course.code}
          </span>

          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            {course.faculty}
          </span>

          <span className={`inline-flex items-center space-x-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${stateBadge[visualState].bg}`}>
            {stateBadge[visualState].icon}
            <span>{stateBadge[visualState].text}</span>
          </span>
        </div>

        <span className="font-extrabold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
          {course.credits} TC
        </span>
      </div>

      {/* Course Title & Metadata */}
      <div>
        <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
          {course.name}
        </h4>
        <div className="flex items-center space-x-2 text-[11px] text-slate-600 mt-1">
          <span className="flex items-center space-x-1">
            <User className="w-3 h-3 text-slate-500" aria-hidden="true" />
            <span className="font-medium">{course.lecturer}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-slate-500" aria-hidden="true" />
            <span className="font-medium">P: {course.room || course.classroom}</span>
          </span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-800 mt-0.5">
          <Clock className="w-3 h-3 text-slate-600" aria-hidden="true" />
          <span>{course.scheduleText} ({course.timeText})</span>
        </div>
      </div>

      {/* Ineligible notice banner */}
      {visualState === 'ineligible' && course.prereqReason && (
        <div className="text-[10px] text-slate-700 bg-slate-200/80 px-2 py-1 rounded-md border border-slate-300 font-medium flex items-center space-x-1">
          <Lock className="w-3 h-3 text-slate-600 shrink-0" aria-hidden="true" />
          <span>Lý do: {course.prereqReason}</span>
        </div>
      )}

      {/* Conflict notice banner */}
      {visualState === 'conflict' && (
        <div className="text-[10px] text-red-800 bg-red-100/90 px-2 py-1 rounded-md border border-red-200 font-medium flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3 text-red-700 shrink-0" aria-hidden="true" />
          <span>
            {conflictingCourse 
              ? `Trùng lịch với ${conflictingCourse.code} (${conflictingCourse.name})`
              : 'Trùng thời gian với học phần đã chọn trên TKB'}
          </span>
        </div>
      )}

      {/* Footer: Detail Link + Action Button */}
      <div className="flex justify-between items-center pt-2 border-t border-slate-200/80 text-[11px]">
        {/* Detail View Trigger (Always Accessible across all 4 states) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(course);
          }}
          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:underline focus:outline-none focus:ring-1 focus:ring-blue-600 rounded"
          title="Xem chi tiết học phần & điều kiện tiên quyết"
        >
          <Info className="w-3 h-3 text-blue-600" aria-hidden="true" />
          <span>Xem chi tiết</span>
        </button>

        {/* Action Button with Event Propagation Containment */}
        <div>
          {visualState === 'selected' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(course.id);
              }}
              className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-md font-bold text-[10px] transition shadow-2xs"
            >
              Bỏ chọn
            </button>
          ) : visualState === 'ineligible' ? (
            <span className="px-2.5 py-1 bg-slate-200 text-slate-600 border border-slate-300 rounded-md font-bold text-[10px] cursor-not-allowed">
              Không thể chọn
            </span>
          ) : visualState === 'conflict' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(course);
              }}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-md font-bold text-[10px] shadow-2xs transition inline-flex items-center space-x-1"
            >
              <AlertTriangle className="w-3 h-3" aria-hidden="true" />
              <span>Thêm (Trùng)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(course);
              }}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md font-bold text-[10px] shadow-2xs transition inline-flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" aria-hidden="true" />
              <span>+ Thêm vào TKB</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

