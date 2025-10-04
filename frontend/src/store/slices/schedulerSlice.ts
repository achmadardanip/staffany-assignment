import { getWeekBounds, getWeekStart } from "../../helper/date";

export interface ShiftItem {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface WeekSummary {
  id?: string;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  publishedAt?: string | null;
}

export interface SchedulerState {
  selectedWeekStart: string;
  shifts: ShiftItem[];
  week: WeekSummary | null;
  loading: boolean;
  error: string | null;
}

const defaultWeekStart = getWeekStart(new Date());
const defaultBounds = getWeekBounds(defaultWeekStart);

const initialState: SchedulerState = {
  selectedWeekStart: defaultWeekStart,
  shifts: [],
  week: {
    startDate: defaultBounds.startDate,
    endDate: defaultBounds.endDate,
    isPublished: false,
    publishedAt: null,
  },
  loading: false,
  error: null,
};

export const setSelectedWeekStart = (weekStart: string) => ({
  type: "scheduler/setSelectedWeekStart" as const,
  payload: weekStart,
});

export const setWeekData = (payload: { shifts: ShiftItem[]; week: WeekSummary }) => ({
  type: "scheduler/setWeekData" as const,
  payload,
});

export const setLoading = (loading: boolean) => ({
  type: "scheduler/setLoading" as const,
  payload: loading,
});

export const setError = (message: string | null) => ({
  type: "scheduler/setError" as const,
  payload: message,
});

type SchedulerAction =
  | ReturnType<typeof setSelectedWeekStart>
  | ReturnType<typeof setWeekData>
  | ReturnType<typeof setLoading>
  | ReturnType<typeof setError>;

const schedulerReducer = (
  state: SchedulerState = initialState,
  action: SchedulerAction
): SchedulerState => {
  switch (action.type) {
    case "scheduler/setSelectedWeekStart": {
      return {
        ...state,
        selectedWeekStart: action.payload,
      };
    }
    case "scheduler/setWeekData": {
      return {
        ...state,
        shifts: action.payload.shifts,
        week: action.payload.week,
        selectedWeekStart: action.payload.week.startDate,
      };
    }
    case "scheduler/setLoading": {
      return {
        ...state,
        loading: action.payload,
      };
    }
    case "scheduler/setError": {
      return {
        ...state,
        error: action.payload,
      };
    }
    default:
      return state;
  }
};

export default schedulerReducer;
