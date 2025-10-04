export interface ICreateShift {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  ignoreClash?: boolean;
}

export interface IUpdateShift {
  name?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  ignoreClash?: boolean;
}
