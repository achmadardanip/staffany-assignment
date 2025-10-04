import { Between, FindOneOptions } from "typeorm";
import * as shiftRepository from "../database/default/repository/shiftRepository";
import * as weekRepository from "../database/default/repository/weekRepository";
import Shift from "../database/default/entity/shift";
import Week from "../database/default/entity/week";
import { ICreateShift, IUpdateShift, IWeekSummary } from "../shared/interfaces";
import { HttpError } from "../shared/classes/HttpError";
import {
  DATE_FORMAT,
  getAdjacentDateStrings,
  getShiftDateTimeRange,
  getWeekBounds,
} from "../shared/functions/date";
import { format } from "date-fns";

interface IFindQuery {
  weekStart?: string;
}

const mapWeekToSummary = (week: Week | null, fallback: { startDate: string; endDate: string }): IWeekSummary => {
  if (!week) {
    return {
      startDate: fallback.startDate,
      endDate: fallback.endDate,
      isPublished: false,
      publishedAt: null,
    };
  }

  return {
    id: week.id,
    startDate: week.startDate,
    endDate: week.endDate,
    isPublished: week.isPublished,
    publishedAt: week.publishedAt ? week.publishedAt.toISOString() : null,
  };
};

const ensureWeek = async (startDate: string, endDate: string): Promise<Week> => {
  const existing = await weekRepository.findOne({ startDate });
  if (existing) {
    return existing;
  }

  return weekRepository.create({
    startDate,
    endDate,
    isPublished: false,
  });
};

const checkWeekIsPublished = (week?: Week | null) => {
  if (week?.isPublished) {
    throw new HttpError(400, "This week has already been published and cannot be modified.");
  }
};

const findClashingShift = async (
  date: string,
  startTime: string,
  endTime: string,
  ignoreId?: string
): Promise<Shift | null> => {
  const { start, end } = getShiftDateTimeRange(date, startTime, endTime);
  const { previous, next } = getAdjacentDateStrings(date);

  const candidates = await shiftRepository.find({
    where: {
      date: Between(previous, next),
    },
    order: {
      date: "ASC",
      startTime: "ASC",
    },
  });

  for (const candidate of candidates) {
    if (ignoreId && candidate.id === ignoreId) {
      continue;
    }

    const candidateRange = getShiftDateTimeRange(
      candidate.date,
      candidate.startTime,
      candidate.endTime
    );

    if (start < candidateRange.end && end > candidateRange.start) {
      return candidate;
    }
  }

  return null;
};

export const find = async ({ weekStart }: IFindQuery) => {
  const baseDate = weekStart ? weekStart : format(new Date(), DATE_FORMAT);
  const bounds = getWeekBounds(baseDate);
  const week = await weekRepository.findOne({ startDate: bounds.startDate });

  const shifts = await shiftRepository.find({
    where: {
      date: Between(bounds.startDate, bounds.endDate),
    },
    order: {
      date: "ASC",
      startTime: "ASC",
    },
  });

  return {
    shifts,
    week: mapWeekToSummary(week ?? null, bounds),
  };
};

export const findById = async (
  id: string,
  opts?: FindOneOptions<Shift>
): Promise<Shift> => {
  const data = await shiftRepository.findById(id, opts);
  if (!data) {
    throw new HttpError(404, "Shift not found");
  }
  return data;
};

export const create = async (payload: ICreateShift): Promise<Shift> => {
  try {
    getShiftDateTimeRange(payload.date, payload.startTime, payload.endTime);
  } catch (error) {
    throw new HttpError(400, error.message);
  }

  const bounds = getWeekBounds(payload.date);
  const week = await weekRepository.findOne({ startDate: bounds.startDate });
  checkWeekIsPublished(week);

  const clashingShift = await findClashingShift(
    payload.date,
    payload.startTime,
    payload.endTime
  );

  if (clashingShift && !payload.ignoreClash) {
    throw new HttpError(409, "Shift clashes with an existing shift.", {
      conflictShift: clashingShift,
    });
  }

  const targetWeek = await ensureWeek(bounds.startDate, bounds.endDate);

  const shift = new Shift();
  shift.name = payload.name;
  shift.date = payload.date;
  shift.startTime = payload.startTime;
  shift.endTime = payload.endTime;
  shift.week = targetWeek;
  shift.weekId = targetWeek.id;

  const created = await shiftRepository.create(shift);
  return created;
};

export const updateById = async (
  id: string,
  payload: IUpdateShift
): Promise<Shift> => {
  const existing = await shiftRepository.findById(id, { relations: ["week"] });
  if (!existing) {
    throw new HttpError(404, "Shift not found");
  }

  checkWeekIsPublished(existing.week);

  const updatedDate = payload.date ?? existing.date;
  const updatedStartTime = payload.startTime ?? existing.startTime;
  const updatedEndTime = payload.endTime ?? existing.endTime;

  try {
    getShiftDateTimeRange(updatedDate, updatedStartTime, updatedEndTime);
  } catch (error) {
    throw new HttpError(400, error.message);
  }

  const bounds = getWeekBounds(updatedDate);
  const targetWeek = await weekRepository.findOne({ startDate: bounds.startDate });
  if (targetWeek && targetWeek.id !== existing.weekId) {
    checkWeekIsPublished(targetWeek);
  }

  const clashingShift = await findClashingShift(
    updatedDate,
    updatedStartTime,
    updatedEndTime,
    id
  );

  if (clashingShift && !payload.ignoreClash) {
    throw new HttpError(409, "Shift clashes with an existing shift.", {
      conflictShift: clashingShift,
    });
  }

  const ensuredWeek = await ensureWeek(bounds.startDate, bounds.endDate);

  const updated = await shiftRepository.updateById(id, {
    name: payload.name ?? existing.name,
    date: updatedDate,
    startTime: updatedStartTime,
    endTime: updatedEndTime,
    weekId: ensuredWeek.id,
  });

  return updated;
};

export const deleteById = async (id: string | string[]) => {
  if (Array.isArray(id)) {
    throw new HttpError(400, "Batch delete is not supported");
  }

  const existing = await shiftRepository.findById(id, { relations: ["week"] });
  if (!existing) {
    throw new HttpError(404, "Shift not found");
  }

  checkWeekIsPublished(existing.week);

  return shiftRepository.deleteById(id);
};

export const publishWeek = async (weekStart: string): Promise<IWeekSummary> => {
  const bounds = getWeekBounds(weekStart);
  const shifts = await shiftRepository.find({
    where: {
      date: Between(bounds.startDate, bounds.endDate),
    },
  });

  if (shifts.length === 0) {
    throw new HttpError(400, "Cannot publish an empty week.");
  }

  const week = await ensureWeek(bounds.startDate, bounds.endDate);
  if (week.isPublished) {
    throw new HttpError(400, "This week has already been published.");
  }

  const updatedWeek = await weekRepository.updateById(week.id, {
    isPublished: true,
    publishedAt: new Date(),
    endDate: bounds.endDate,
  });

  return mapWeekToSummary(updatedWeek, bounds);
};
