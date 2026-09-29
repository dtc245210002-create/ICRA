import React, { useMemo } from 'react';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { Course } from '../types';
import { AIRecommendation } from './AIRecommendation';

interface RegistrationSummaryProps {
  courses: Course[];
  selectedIds: string[];
  onRemove: (courseId: string) => void;
  onAddAiCourse: () => void;
  onOpenReviewModal: () => void;
  hasConflict: boolean;
}

export const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  courses,
  selectedIds,
  onRemove,
  onAddAiCourse,
  onOpenReviewModal,
  hasConflict
}) => {
  const activeCourses = useMemo(() => {
    return courses.filter(c => selectedIds.includes(c.id));
  }, [courses, selectedIds]);

  const totalCredits = useMemo(() => {
    return activeCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [activeCourses]);

  const tuition = totalCredits * 450000;
  const isEligibleToSubmit = totalCredits >= 12 && !hasConflict;

  return (
    <section className="w-[25%] bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ClipboardCheck className="w-4 h-4 text-blue-600" />
          <h2 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">Tổng Quan Đăng Ký (Summary)</h2>
        </div>
        <span className={`font-extrabold text-[10px] px-2 py-0.5 rounded border ${
          totalCredits >= 12 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {totalCredits >= 12 ? 'Đủ ĐK tối thiểu' : 'Chưa đủ ĐK'}
        </span>
      </div>

      <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1">
        {/* Workload Meter */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Khối lượng học kỳ:</span>
            <span className="font-extrabold text-slate-900">{totalCredits} / 24 Tín chỉ</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
            <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: totalCredits < 12 ? '40%' : '30%' }}></div>
            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: totalCredits >= 12 && totalCredits <= 18 ? '55%' : '0%' }}></div>
            <div className="h-full bg-red-500 transition-all duration-300" style={{ width: totalCredits > 18 ? '30%' : '0%' }}></div>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className={`font-bold ${totalCredits >= 12 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {totalCredits < 12 ? 'Thiếu tải (<12 TC)' : totalCredits <= 18 ? 'Cân đối (Lý tưởng)' : 'Tải cao (>18 TC)'}
            </span>
            <span className="text-slate-400">Tối thiểu 12 TC • Tối đa 24 TC</span>
          </div>
        </div>

        <AIRecommendation onAddAiCourse={onAddAiCourse} />

        {/* Selected Courses */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-[11px] text-slate-600 uppercase tracking-wide">Học phần đã chọn:</span>
            <span className="font-bold text-xs text-blue-600">{activeCourses.length} môn</span>
          </div>

          <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
            {activeCourses.map(c => (
              <div key={c.id} className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{c.code} • <span className="font-normal text-slate-500">{c.credits} TC</span></div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{c.name}</div>
                </div>
                <button onClick={() => onRemove(c.id)} className="text-slate-400 hover:text-red-500 p-1 font-bold text-xs" title="Bỏ chọn">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tuition summary */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between items-center text-slate-600">
            <span>Tổng tín chỉ tính phí:</span>
            <span className="font-bold text-slate-800">{totalCredits} TC</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
            <span className="font-extrabold text-slate-900">Học phí dự kiến:</span>
            <span className="font-extrabold text-sm text-blue-600">{tuition.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <p className="text-[10px] text-slate-400">Đơn giá: 450.000 VNĐ / tín chỉ theo quy định ICTU</p>
        </div>
      </div>

      <div className="p-3.5 border-t border-slate-200 bg-white">
        <button 
          onClick={onOpenReviewModal}
          disabled={!isEligibleToSubmit}
          className={`w-full py-2.5 rounded-xl font-extrabold text-xs shadow-md transition flex items-center justify-center space-x-2 ${
            isEligibleToSubmit 
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          <span>Rà Soát & Xác Nhận Đăng Ký</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
