import { addHours, endOfWeek, format, parseISO, setMinutes, setSeconds, startOfWeek } from "date-fns";

export const DATE_FORMAT = "yyyy-MM-dd";
export const TIME_FORMAT = "HH:mm";

export const getWeekStart = (date: Date): string =>
  format(startOfWeek(date, { weekStartsOn: 1 }), DATE_FORMAT);

export const getWeekBounds = (weekStart: string) => {
  const start = parseISO(weekStart);
  const end = endOfWeek(start, { weekStartsOn: 1 });
  return {
    startDate: format(start, DATE_FORMAT),
    endDate: format(end, DATE_FORMAT),
  };
};

export const formatWeekRangeLabel = (startDate: string, endDate: string) => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const sameMonth = format(start, "MMM") === format(end, "MMM");
  if (sameMonth) {
    return `${format(start, "MMM dd")} - ${format(end, "dd")}`;
  }
  return `${format(start, "MMM dd")} - ${format(end, "MMM dd")}`;
};

export const getStartOfCurrentHour = () => {
  const now = new Date();
  return setSeconds(setMinutes(now, 0), 0);
};

export const getDefaultEndTime = (start: Date) => addHours(start, 1);

export const formatTime = (date: Date) => format(date, TIME_FORMAT);

export const formatPublishedAt = (iso?: string | null) => {
  if (!iso) {
    return "";
  }
  const parsed = new Date(iso);
  return format(parsed, "dd MMM yyyy, HH:mm");
};
