import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Course, StudentInfo } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  student: StudentInfo;
  courses: Course[];
  selectedIds: string[];
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
  courses,
  selectedIds
}) => {
  if (!isOpen) return null;
  const activeCourses = courses.filter(c => selectedIds.includes(c.id));
  const totalCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-7 shadow-2xl space-y-5 border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Rà Soát & Xác Nhận Đăng Ký Học Phần</h3>
          <p className="text-xs text-slate-500 mt-0.5">Vui lòng kiểm tra lại thời khóa biểu trước khi ghi danh chính thức vào hệ thống đào tạo ICTU.</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 font-medium">
            <strong>Hệ thống ICRA đã đối soát hợp lệ:</strong> 0 lỗi xung đột giờ học • 100% đạt chuẩn điều kiện tiên quyết • Đạt ngưỡng khối lượng học tập theo quy chế.
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs border border-slate-200">
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Sinh viên thực hiện:</span>
            <span className="font-bold text-slate-800">{student.name} ({student.studentId})</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Tổng số học phần:</span>
            <span className="font-bold text-slate-800">{activeCourses.length} Môn học</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Tổng số tín chỉ:</span>
            <span className="font-black text-blue-600">{totalCredits} Tín chỉ (Cân đối)</span>
          </div>
          <div className="flex justify-between py-1 pt-2">
            <span className="font-extrabold text-slate-900">Học phí dự tính:</span>
            <span className="font-black text-base text-slate-900">{(totalCredits * 450000).toLocaleString('vi-VN')} VNĐ</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <button onClick={onClose} className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition">
            Quay lại
          </button>
          <button onClick={onConfirm} className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5">
            <span>Gửi Đăng Ký Chính Thức</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
