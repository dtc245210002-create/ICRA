import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Clock, Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { StudentInfo, HeaderNotification } from '../types';

interface HeaderProps {
  student: StudentInfo;
  initialCountdownSeconds?: number;
}

const DEFAULT_NOTIFICATIONS: HeaderNotification[] = [
  {
    id: 'n1',
    type: 'info',
    title: 'Cổng Đăng Ký Đang Mở',
    message: 'Cổng đăng ký tín chỉ Học kỳ 1 (2026 - 2027) chính thức mở từ 08:00 29/09.',
    time: 'Vừa xong',
    read: false
  },
  {
    id: 'n2',
    type: 'warning',
    title: 'Lưu ý Tiên quyết',
    message: 'Học phần SE301 yêu cầu hoàn thành tối thiểu 60 tín chỉ tích lũy.',
    time: '2 giờ trước',
    read: false
  },
  {
    id: 'n3',
    type: 'success',
    title: 'Biểu phí Học kỳ 1',
    message: 'Mức học phí 450.000 VNĐ / tín chỉ được áp dụng tự động cho K24.',
    time: '1 ngày trước',
    read: true
  }
];

export const Header: React.FC<HeaderProps> = ({ 
  student, 
  initialCountdownSeconds = 267320 // 74h 15m 20s
}) => {
  // Live Ticking Countdown State
  const [timeLeft, setTimeLeft] = useState<number>(initialCountdownSeconds);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<HeaderNotification[]>(DEFAULT_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format seconds to HH:MM:SS
  const formatCountdown = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between shrink-0 shadow-xs z-30 relative">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-tight text-slate-900">ICRA</span>
              <span className="text-xs font-semibold text-slate-400">|</span>
              <span className="text-xs font-semibold text-slate-600">Trường ĐH Công nghệ Thông tin & Truyền thông</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Hệ thống Đăng ký Học phần & Hoạch định Thời khóa biểu Thông minh</p>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <div className="hidden sm:flex items-center space-x-2.5">
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {student.term}
          </span>
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cổng Đăng Ký Đang Mở</span>
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-5">
        {/* Ticking Countdown Timer */}
        <div 
          data-testid="countdown-container"
          className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg text-xs shadow-2xs"
        >
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 font-medium">Hạn đóng cổng:</span>
          <span data-testid="countdown-timer" className="font-mono font-bold text-blue-600 tracking-wider">
            {formatCountdown(timeLeft)}
          </span>
          <span className="text-[10px] text-slate-400 border-l border-slate-200 pl-2">23:59 • 01/10</span>
        </div>

        {/* Interactive Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(prev => !prev)}
            className="relative p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            title="Thông báo hệ thống"
            aria-label="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xs text-slate-900">Thông báo</span>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    className="text-[10px] font-semibold text-blue-600 hover:underline"
                  >
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`px-4 py-2.5 flex items-start space-x-2.5 hover:bg-slate-50 transition cursor-pointer ${
                      !n.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.type === 'warning' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      ) : n.type === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-800 leading-snug truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Student Identity */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="text-right">
            <p className="font-bold text-slate-900 text-xs leading-none">{student.name}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{student.studentId} • {student.classGroup}</p>
          </div>
          <div 
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs select-none"
            title={`${student.name} (${student.studentId})`}
          >
            {student.initials || "AT"}
          </div>
        </div>
      </div>
    </header>
  );
};

