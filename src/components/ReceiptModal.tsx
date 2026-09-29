import React from 'react';
import { Check, Calendar, ArrowRight, ShieldCheck, Download } from 'lucide-react';
import { Course, StudentInfo } from '../types';
import { downloadICalendarFile } from '../utils/calendarExport';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentInfo;
  courses: Course[];
  selectedIds: string[];
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  student,
  courses,
  selectedIds
}) => {
  if (!isOpen) return null;

  const activeCourses = courses.filter(c => selectedIds.includes(c.id));
  const totalCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);
  const tuition = totalCredits * 450000;
  const timestamp = new Date().toLocaleString('vi-VN');

  const handleDownloadIcs = () => {
    downloadICalendarFile(activeCourses, `ThoiKhoaBieu_ICRA_${student.studentId}.ics`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-5 text-center border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div className="space-y-1">
          <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200 inline-block">
            Giao dịch thành công
          </span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight pt-1">
            ĐĂNG KÝ HỌC KỲ HOÀN TẤT!
          </h3>
          <p className="text-xs font-mono text-slate-400">
            Mã biên lai điện tử: #ICRA-2026-9812-ICTU
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 text-left border border-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-500">Sinh viên:</span>
            <span className="font-bold text-slate-800">{student.name} ({student.studentId})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Thời gian ghi nhận:</span>
            <span className="font-bold text-slate-800 font-mono">{timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tổng số học phần:</span>
            <span className="font-bold text-slate-800">{activeCourses.length} môn học</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Tổng tín chỉ:</span>
            <span className="font-black text-blue-600">{totalCredits} Tín chỉ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Học phí dự tính:</span>
            <span className="font-bold text-slate-900">{tuition.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200">
            <span className="text-slate-500">Tình trạng học phí:</span>
            <span className="font-bold text-amber-600">Chờ đối soát qua cổng thanh toán</span>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={handleDownloadIcs}
            className="w-full py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Đồng Bộ Google Calendar / Tải File .ICS</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1"
          >
            <span>Hoàn tất & Về Bàn Làm Việc</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
