import React from 'react';
import { Sparkles, Check } from 'lucide-react';

interface AIRecommendationProps {
  onAddAiCourse: () => void;
}

export const AIRecommendation: React.FC<AIRecommendationProps> = ({ onAddAiCourse }) => {
  return (
    <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 space-y-2 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center">
            <Sparkles className="w-3 h-3" />
          </span>
          <span className="font-extrabold text-xs text-purple-950">AI Course Recommendation</span>
        </div>
        <span className="bg-purple-200 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded">3 Tín chỉ</span>
      </div>

      <div>
        <h4 className="font-extrabold text-xs text-slate-900">CS202: Thiết kế Giao diện Phần mềm (UI/UX)</h4>
        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
          💡 <strong>Lý do AI đề xuất:</strong> Lấp vừa khoảng trống Chiều Thứ 5. Phù hợp 100% định hướng Kỹ sư phần mềm của sinh viên K24.
        </p>
      </div>

      <div className="space-y-1 text-[10px] text-slate-600 bg-white/70 p-2 rounded-lg border border-purple-100 font-medium">
        <div className="flex items-center space-x-1 text-emerald-700">
          <Check className="w-3 h-3" />
          <span>Tương thích TKB: Khớp 100% lịch trống (0 xung đột)</span>
        </div>
        <div className="flex items-center space-x-1 text-emerald-700">
          <Check className="w-3 h-3" />
          <span>Điều kiện tiên quyết: Đã hoàn thành Nhập môn Lập trình</span>
        </div>
      </div>

      <button 
        onClick={onAddAiCourse} 
        className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center justify-center space-x-1.5"
      >
        <span>+ Thêm học phần này vào TKB</span>
      </button>
    </div>
  );
};
