import { getAxiosInstance } from ".";

interface GetShiftsParams {
  weekStart: string;
}

export const getShifts = async ({ weekStart }: GetShiftsParams) => {
  const api = getAxiosInstance();
  const { data } = await api.get("/shifts", {
    params: { weekStart },
  });
  return data;
};

export const getShiftById = async (id: string) => {
  const api = getAxiosInstance();
  const { data } = await api.get(`/shifts/${id}`);
  return data;
};

export const createShifts = async (payload: any) => {
  const api = getAxiosInstance();
  const { data } = await api.post("/shifts", payload);
  return data;
};

export const updateShiftById = async (id: string, payload: any) => {
  const api = getAxiosInstance();
  const { data } = await api.patch(`/shifts/${id}`, payload);
  return data;
};

export const deleteShiftById = async (id: string) => {
  const api = getAxiosInstance();
  const { data } = await api.delete(`/shifts/${id}`);
  return data;
};

export const publishWeek = async (weekStart: string) => {
  const api = getAxiosInstance();
  const { data } = await api.post("/shifts/publish", { weekStart });
  return data;
};
