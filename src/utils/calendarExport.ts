import { Course } from '../types';

/**
 * Maps day of week (2 = Mon, ..., 8 = Sun) and period start/end to time strings for RFC 5545
 */
const PERIOD_TIMES: Record<number, { start: string; end: string }> = {
  1: { start: '070000', end: '074500' },
  2: { start: '075000', end: '083500' },
  3: { start: '084000', end: '092500' },
  4: { start: '093500', end: '102000' },
  5: { start: '102500', end: '111000' },
  6: { start: '120000', end: '124500' },
  7: { start: '124500', end: '133000' },
  8: { start: '133500', end: '142000' },
  9: { start: '142500', end: '151000' },
  10: { start: '152000', end: '160500' },
  11: { start: '161000', end: '165500' },
};

/**
 * Formats a Date object to YYYYMMDDTHHMMSSZ format
 */
function formatUtcTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * Calculates the first occurrence date for Semester 1 (2026-2027) starting Sep 28, 2026 (Monday).
 */
function getFirstDateForDay(day: number): string {
  // Monday of Week 1: 2026-09-28
  const baseDate = new Date(Date.UTC(2026, 8, 28)); // Sep 28, 2026
  const offset = (day >= 2 && day <= 8) ? day - 2 : 0;
  baseDate.setUTCDate(baseDate.getUTCDate() + offset);

  const y = baseDate.getUTCFullYear();
  const m = String(baseDate.getUTCMonth() + 1).padStart(2, '0');
  const d = String(baseDate.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Generates an RFC 5545 compliant iCalendar string for enrolled courses
 */
export function generateICalendar(courses: Course[]): string {
  const now = new Date();
  const dtStamp = formatUtcTimestamp(now);

  const events = courses.map(course => {
    const dayStr = getFirstDateForDay(course.day);
    const startPeriod = course.startPeriod || 1;
    const endPeriod = course.endPeriod || 3;
    const startTimeStr = PERIOD_TIMES[startPeriod]?.start || '070000';
    const endTimeStr = PERIOD_TIMES[endPeriod]?.end || '092500';

    const dtStart = `${dayStr}T${startTimeStr}`;
    const dtEnd = `${dayStr}T${endTimeStr}`;
    const uid = `ICRA-${course.id}-2026@ictu.edu.vn`;

    return [
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      'RRULE:FREQ=WEEKLY;UNTIL=20270115T235959Z',
      `SUMMARY:[ICRA] ${course.code} - ${course.name}`,
      `DESCRIPTION:Học phần: ${course.name}\\nGiảng viên: ${course.lecturer}\\nSố tín chỉ: ${course.credits} TC\\nThời gian: ${course.scheduleText} (${course.timeText})`,
      `LOCATION:${course.classroom || course.room || 'ICTU Campus'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    ].join('\r\n');
  }).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ICTU//ICRA Intelligent Course Registration Assistant//VI',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Thời khóa biểu ICRA ICTU 2026-2027',
    'X-WR-TIMEZONE:Asia/Ho_Chi_Minh',
    events,
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers a browser download of the .ics file
 */
export function downloadICalendarFile(courses: Course[], filename = 'ThoiKhoaBieu_ICRA_ICTU.ics'): void {
  const content = generateICalendar(courses);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
