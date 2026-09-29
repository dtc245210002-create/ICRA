// src/types/index.ts

export type ShiftType = 'MORNING' | 'AFTERNOON' | 'Sáng' | 'Chiều';

export type FacultyType = 'CNTT' | 'TOAN' | 'NN' | 'ATTT' | 'Toán - Tin' | 'Ngoại ngữ';

export type PeriodSlot = 
  | 'slot_1_3' 
  | 'slot_4_5' 
  | 'slot_7_9' 
  | 'slot_10_11'
  | 'p1' 
  | 'p2' 
  | 'p3' 
  | 'p4';

export interface Course {
  id: string;
  code: string;
  name: string;
  faculty: FacultyType;
  credits: number;
  lecturer: string;
  room: string;
  classroom?: string; // Compatibility alias
  day: number; // 2 (Monday) to 8 (Sunday)
  startPeriod: number;
  endPeriod: number;
  shift: ShiftType;
  periodSlot: PeriodSlot;
  periodText: string;
  scheduleText: string;
  timeText: string;
  status: 'available' | 'ineligible';
  prerequisites: string[];
  prereqReason?: string;
  isAiRecommended?: boolean;
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo' | 'red' | 'slate';
  colorTheme?: string;
  enrolled: number;
  maxSeats: number;
  alternateCourseId?: string;
}

export interface ConflictInfo {
  incomingCourse: Course;
  existingCourse: Course;
  alternateCourse?: Course;
  day?: number;
  periodText?: string;
}

export interface TimetablePlan {
  id: 'plan_1' | 'plan_2';
  name: string;
  selectedCourseIds: string[];
}

export interface StudentInfo {
  name: string;
  studentId: string;
  classGroup: string;
  major: string;
  accumulatedCredits: number;
  targetCredits: number;
  term: string;
  initials?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export interface HeaderNotification {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

