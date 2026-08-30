export const CLASS_END_HOUR = 21;
export const CLASS_END_MINUTE = 45;

/**
 * Calculates the end time of a class schedule.
 * By standard, studio classes end at 21:45 on the day of the class.
 * If a class is scheduled after 21:45, its start time is used as the lower bound.
 */
export function getClassEndTime(classDate: string | Date): Date {
  const start = new Date(classDate);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), CLASS_END_HOUR, CLASS_END_MINUTE, 0, 0);

  if (start.getTime() > end.getTime()) {
    return start;
  }
  return end;
}

/**
 * Checks whether a class has already ended and should be considered 'Ministrada' (past/completed).
 * Returns true if the current time is at or past the class end time (21h45).
 */
export function isClassPast(classDate: string | Date, now: number = Date.now()): boolean {
  const endTime = getClassEndTime(classDate);
  return now >= endTime.getTime();
}

/**
 * Checks whether a class is still upcoming or in progress (before 21h45 on its date).
 */
export function isClassFuture(classDate: string | Date, now: number = Date.now()): boolean {
  return !isClassPast(classDate, now);
}
