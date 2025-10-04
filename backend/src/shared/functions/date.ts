import { addDays, format, parseISO, startOfWeek, endOfWeek, set } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd";

const parseTimeString = (time: string) => {
  const [hour = "0", minute = "0", second = "0"] = time.split(":");
  return {
    hours: Number(hour),
    minutes: Number(minute),
    seconds: Number(second),
  };
};

export const combineDateAndTime = (date: string, time: string): Date => {
  const baseDate = parseISO(date);
  const { hours, minutes, seconds } = parseTimeString(time);
  return set(baseDate, { hours, minutes, seconds, milliseconds: 0 });
};

export const getWeekBounds = (date: string) => {
  const baseDate = parseISO(date);
  const start = startOfWeek(baseDate, { weekStartsOn: 1 });
  const end = endOfWeek(baseDate, { weekStartsOn: 1 });
  return {
    startDate: format(start, DATE_FORMAT),
    endDate: format(end, DATE_FORMAT),
  };
};

export const formatDate = (date: Date) => format(date, DATE_FORMAT);

export const getAdjacentDateStrings = (date: string) => {
  const base = parseISO(date);
  const previous = addDays(base, -1);
  const next = addDays(base, 1);
  return {
    previous: format(previous, DATE_FORMAT),
    next: format(next, DATE_FORMAT),
  };
};

export interface DateTimeRange {
  start: Date;
  end: Date;
}

export const getShiftDateTimeRange = (
  date: string,
  startTime: string,
  endTime: string
): DateTimeRange => {
  const startDateTime = combineDateAndTime(date, startTime);
  let endDateTime = combineDateAndTime(date, endTime);

  if (endDateTime.getTime() === startDateTime.getTime()) {
    throw new Error("Shift end time must be after the start time");
  }

  if (endDateTime.getTime() < startDateTime.getTime()) {
    endDateTime = addDays(endDateTime, 1);
  }

  return {
    start: startDateTime,
    end: endDateTime,
  };
};
