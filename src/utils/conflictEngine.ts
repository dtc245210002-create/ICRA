import { Course, ConflictInfo } from '../types';

/**
 * Checks whether two courses have conflicting time intervals.
 * Exact mathematical condition:
 * day_A == day_B && startPeriod_A <= endPeriod_B && endPeriod_A >= startPeriod_B
 */
export function checkIntervalConflict(courseA: Course, courseB: Course): boolean {
  if (courseA.id === courseB.id) return false;
  if (courseA.day !== courseB.day) return false;
  
  if (
    courseA.startPeriod != null &&
    courseA.endPeriod != null &&
    courseB.startPeriod != null &&
    courseB.endPeriod != null
  ) {
    return courseA.startPeriod <= courseB.endPeriod && courseA.endPeriod >= courseB.startPeriod;
  }
  
  if (courseA.periodSlot && courseB.periodSlot) {
    return courseA.periodSlot === courseB.periodSlot;
  }
  
  return courseA.periodText === courseB.periodText;
}

/**
 * Finds the first conflicting course among selected courses for an incoming course.
 */
export function findConflict(incoming: Course, selectedCourses: Course[]): Course | null {
  return selectedCourses.find(existing => checkIntervalConflict(incoming, existing)) || null;
}

/**
 * Creates conflict info with possible non-conflicting alternate course recommendation.
 */
export function buildConflictInfo(
  incoming: Course,
  existing: Course,
  allCourses: Course[]
): ConflictInfo {
  const alternate = allCourses.find(
    c => c.id === incoming.alternateCourseId || (c.code.split('-')[0] === incoming.code.split('-')[0] && c.id !== incoming.id)
  );

  return {
    incomingCourse: incoming,
    existingCourse: existing,
    alternateCourse: alternate,
    day: incoming.day,
    periodText: incoming.periodText
  };
}
