import React from 'react';
import { X, BookOpen, User, MapPin, Clock, Users, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { Course } from '../types';

interface CourseDetailModalProps {
  course: Course | null;
  isSelected: boolean;
  isClashing: boolean;
  onClose: () => void;
  onAdd: (course: Course) => void;
  onRemove: (courseId: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isSelected,
  isClashing,
  onClose,
  onAdd,
  onRemove
}) => {
  if (!course) return null;

  const isIneligible = course.status === 'ineligible';
  const percentEnrolled = Math.round((course.enrolled / course.maxSeats) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                {course.code}
              </span>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                {course.faculty}
              </span>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {course.credits} Tín chỉ
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 leading-snug">{course.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <div className="flex items-center space-x-2 text-slate-700">
            <User className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Giảng viên phụ trách</div>
              <div className="font-bold">{course.lecturer}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Phòng học lý thuyết</div>
              <div className="font-bold">{course.classroom || course.room}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-700 pt-1">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Khung thời gian</div>
              <div className="font-bold">{course.scheduleText} ({course.timeText})</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-700 pt-1">
            <Users className="w-4 h-4 text-slate-500 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Sĩ số lớp đăng ký</div>
              <div className="font-bold">{course.enrolled} / {course.maxSeats} chỗ ({percentEnrolled}%)</div>
            </div>
          </div>
        </div>

        {/* Prerequisites Tree Section */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>Điều Kiện Tiên Quyết & Cây Học Phần:</span>
          </div>

          {course.prerequisites && course.prerequisites.length > 0 ? (
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              {course.prerequisites.map((req, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-700">{req}</span>
                    <span className="text-slate-500 text-[11px]">— Học phần tiên quyết</span>
                  </div>
                  {isIneligible ? (
                    <span className="inline-flex items-center space-x-1 text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      <Lock className="w-3 h-3" />
                      <span>Chưa đạt</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã hoàn thành</span>
                    </span>
                  )}
                </div>
              ))}
              {course.prereqReason && (
                <p className="text-[11px] text-red-600 font-medium pt-1 border-t border-slate-200">
                  Lưu ý: {course.prereqReason}
                </p>
              )}
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Học phần này không có điều kiện tiên quyết. Sinh viên đủ điều kiện ghi danh.</span>
            </div>
          )}
        </div>

        {/* Warning if clashing */}
        {isClashing && !isSelected && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-red-800">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>Học phần này đang trùng lịch với môn học khác trên thời khóa biểu của bạn.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            Đóng
          </button>

          {isSelected ? (
            <button
              onClick={() => {
                onRemove(course.id);
                onClose();
              }}
              className="w-2/3 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-bold text-xs rounded-xl transition"
            >
              Bỏ chọn học phần này
            </button>
          ) : isIneligible ? (
            <button
              disabled
              className="w-2/3 py-2 bg-slate-200 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed"
            >
              Chưa đủ điều kiện đăng ký
            </button>
          ) : (
            <button
              onClick={() => {
                onAdd(course);
                onClose();
              }}
              className="w-2/3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              + Thêm vào thời khóa biểu
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
