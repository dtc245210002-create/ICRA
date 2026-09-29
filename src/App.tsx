import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { CourseExplorer } from './components/CourseExplorer';
import { WeeklyTimetable } from './components/WeeklyTimetable';
import { RegistrationSummary } from './components/RegistrationSummary';
import { ConflictAlert } from './components/ConflictAlert';
import { ConfirmationModal } from './components/ConfirmationModal';
import { CourseDetailModal } from './components/CourseDetailModal';
import { ReceiptModal } from './components/ReceiptModal';
import { MOCK_COURSES, CURRENT_STUDENT } from './data/mockCourses';
import { Course, ConflictInfo, ToastMessage } from './types';
import { checkIntervalConflict, buildConflictInfo } from './utils/conflictEngine';

declare global {
  interface Window {
    confetti?: (options?: any) => void;
  }
}

export const App: React.FC = () => {
  const [courses] = useState<Course[]>(MOCK_COURSES);
  const [activePlan, setActivePlan] = useState<'plan_1' | 'plan_2'>('plan_1');
  const [plan1Ids, setPlan1Ids] = useState<string[]>(["CS101", "CS201", "MATH101", "ENG101"]);
  const [plan2Ids, setPlan2Ids] = useState<string[]>(["CS101", "CS202-01", "MATH101"]);
  const [ghostCourse, setGhostCourse] = useState<Course | null>(null);
  const [conflict, setConflict] = useState<ConflictInfo | null>(null);
  const [selectedDetailCourse, setSelectedDetailCourse] = useState<Course | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Current active selections depending on Plan 1 or Plan 2
  const selectedIds = activePlan === 'plan_1' ? plan1Ids : plan2Ids;
  const setSelectedIds = (updater: (prev: string[]) => string[]) => {
    if (activePlan === 'plan_1') {
      setPlan1Ids(updater);
    } else {
      setPlan2Ids(updater);
    }
  };

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleAddCourse = (course: Course) => {
    if (course.status === 'ineligible') {
      addToast('error', 'Chưa đủ điều kiện!', course.prereqReason || 'Sinh viên chưa hoàn thành môn tiên quyết.');
      return;
    }

    const clash = courses.find(x => selectedIds.includes(x.id) && checkIntervalConflict(course, x));
    if (clash) {
      const conflictData = buildConflictInfo(course, clash, courses);
      setConflict(conflictData);
      addToast('error', 'Xung đột lịch học!', `Lớp ${course.code} bị trùng lịch với ${clash.code} (${clash.scheduleText}).`);
      return;
    }

    if (!selectedIds.includes(course.id)) {
      setSelectedIds(prev => [...prev, course.id]);
      setConflict(null);
      addToast('success', 'Đã thêm học phần', `Đã thêm ${course.name} (${course.code}) vào thời khóa biểu.`);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedIds(prev => prev.filter(id => id !== courseId));
    setConflict(null);
    addToast('info', 'Đã bỏ chọn học phần', 'Đã xóa học phần khỏi thời khóa biểu.');
  };

  const handleResolveConflict = () => {
    if (conflict?.alternateCourse) {
      const alt = conflict.alternateCourse;
      setConflict(null);
      setSelectedIds(prev => [...prev.filter(id => id !== conflict.incomingCourse.id), alt.id]);
      addToast('success', 'Đã giải quyết xung đột', `Hệ thống tự động chuyển sang lớp ${alt.code} (${alt.scheduleText}).`);
    } else {
      // Default fallback: switch to CS202-01
      setConflict(null);
      if (!selectedIds.includes("CS202-01")) {
        setSelectedIds(prev => [...prev, "CS202-01"]);
        addToast('success', 'Đã giải quyết xung đột', 'Hệ thống tự động chuyển sang lớp CS202-01 (Chiều Thứ Năm).');
      }
    }
  };

  const handleAddAiCourse = () => {
    if (!selectedIds.includes("CS202-01")) {
      setSelectedIds(prev => [...prev, "CS202-01"]);
      addToast('success', 'AI Course Recommendation', 'Đã thêm học phần đề xuất CS202: Thiết kế UI/UX vào TKB!');
    }
  };

  const handleResetDefault = () => {
    setSelectedIds(() => ["CS101", "CS201", "MATH101", "ENG101"]);
    setConflict(null);
    addToast('info', 'Khôi phục mặc định', 'Đã đặt lại thời khóa biểu về 4 môn tiêu chuẩn.');
  };

  const handleConfirmRegistration = () => {
    setIsReviewOpen(false);
    if (typeof window !== 'undefined' && typeof window.confetti === 'function') {
      window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
    setIsReceiptOpen(true);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 font-sans text-[13px] select-none text-slate-800">
      <Header student={CURRENT_STUDENT} />

      <ConflictAlert
        conflict={conflict}
        onResolve={handleResolveConflict}
        onDismiss={() => setConflict(null)}
      />

      <main className="flex-1 flex gap-3.5 p-3.5 overflow-hidden w-full max-w-[1920px] mx-auto">
        {/* Column 1: Course Explorer (28%) */}
        <CourseExplorer
          courses={courses}
          selectedIds={selectedIds}
          onAdd={handleAddCourse}
          onRemove={handleRemoveCourse}
          onOpenDetail={setSelectedDetailCourse}
          onHoverEnter={setGhostCourse}
          onHoverLeave={() => setGhostCourse(null)}
        />

        {/* Column 2: Weekly Timetable (47%) */}
        <WeeklyTimetable
          courses={courses}
          selectedIds={selectedIds}
          ghostCourse={ghostCourse}
          conflict={conflict}
          activePlan={activePlan}
          onPlanChange={setActivePlan}
          onCourseClick={setSelectedDetailCourse}
          onResetToDefault={handleResetDefault}
        />

        {/* Column 3: Registration Summary & AI (25%) */}
        <RegistrationSummary
          courses={courses}
          selectedIds={selectedIds}
          onRemove={handleRemoveCourse}
          onAddAiCourse={handleAddAiCourse}
          onOpenReviewModal={() => setIsReviewOpen(true)}
          hasConflict={Boolean(conflict)}
        />
      </main>

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={selectedDetailCourse}
        isSelected={Boolean(selectedDetailCourse && selectedIds.includes(selectedDetailCourse.id))}
        isClashing={Boolean(
          selectedDetailCourse &&
          courses.filter(c => selectedIds.includes(c.id)).some(sel => checkIntervalConflict(selectedDetailCourse, sel))
        )}
        onClose={() => setSelectedDetailCourse(null)}
        onAdd={handleAddCourse}
        onRemove={handleRemoveCourse}
      />

      {/* Confirmation Audit Modal */}
      <ConfirmationModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        onConfirm={handleConfirmRegistration}
        student={CURRENT_STUDENT}
        courses={courses}
        selectedIds={selectedIds}
      />

      {/* Electronic Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        student={CURRENT_STUDENT}
        courses={courses}
        selectedIds={selectedIds}
      />

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-xl border flex items-start space-x-3 text-xs w-80 animate-in slide-in-from-right duration-200 ${
              t.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : t.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : t.type === 'info'
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="shrink-0 mt-0.5 font-bold">
              {t.type === 'error' ? '⚠️' : t.type === 'warning' ? '⚡' : t.type === 'info' ? 'ℹ️' : '✅'}
            </div>
            <div className="flex-1">
              <h5 className="font-bold">{t.title}</h5>
              <p className="text-[11px] text-slate-600 mt-0.5">{t.message}</p>
            </div>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
