import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { ConflictInfo } from '../types';

interface ConflictAlertProps {
  conflict: ConflictInfo | null;
  onResolve: () => void;
  onDismiss: () => void;
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({ conflict, onResolve, onDismiss }) => {
  if (!conflict) return null;

  return (
    <div className="bg-red-50 border-b border-red-200 text-red-800 px-6 py-2.5 flex items-center justify-between shrink-0 animate-in slide-in-from-top duration-150">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
          !
        </div>
        <div>
          <p className="font-bold text-xs text-red-900 flex items-center space-x-2">
            <span>Xung đột lịch học:</span>
            <span className="font-normal text-red-700">
              Lớp <strong>{conflict.incomingCourse.code}</strong> bị trùng ca Thứ {conflict.incomingCourse.day} ({conflict.incomingCourse.scheduleText}) với môn <strong>{conflict.existingCourse.code}</strong> đã có trên lịch.
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button 
          onClick={onResolve} 
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-md shadow-xs transition flex items-center space-x-1"
        >
          <span>Tự động đổi sang CS202-01 (Chiều Thứ 5)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDismiss} className="text-red-400 hover:text-red-700 text-sm p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
