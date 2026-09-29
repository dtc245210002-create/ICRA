import React from 'react';
import { Course } from '../types';

interface TimetableCourseCardProps {
  course: Course;
  isClashing?: boolean;
  onClick: (course: Course) => void;
}

export const TimetableCourseCard: React.FC<TimetableCourseCardProps> = ({ course, isClashing, onClick }) => {
  return (
    <div 
      onClick={() => onClick(course)}
      className={`h-full w-full rounded-lg p-1.5 flex flex-col justify-between text-left cursor-pointer transition shadow-2xs border ${
        isClashing 
          ? 'bg-red-50 border-red-500 conflict-cell shake-alert' 
          : 'bg-blue-50/90 border-blue-300 hover:border-blue-600'
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span className={`font-mono font-bold text-[9px] ${isClashing ? 'text-red-700' : 'text-blue-700'}`}>{course.code}</span>
          <span className="text-[8px] font-bold text-slate-500">{course.room}</span>
        </div>
        <h5 className="text-[10px] font-bold text-slate-900 line-clamp-1 leading-tight mt-0.5">{course.name}</h5>
      </div>
      <div className="flex items-center justify-between text-[8px] text-slate-400 mt-1">
        <span>{course.lecturer}</span>
        <span className="font-bold text-blue-700">{course.credits}TC</span>
      </div>
    </div>
  );
};
