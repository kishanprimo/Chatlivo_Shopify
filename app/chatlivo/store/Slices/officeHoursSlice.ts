// src/app/store/slices/officeHoursSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DayData = {
  enabled: boolean;
  start: string;
  end: string;
};

export type OfficeHoursState = {
  WholeDayHoursEnabled:boolean;
  officeHoursEnabled: boolean;
  weekTimings: Record<string, DayData>;
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialState: OfficeHoursState = {
  WholeDayHoursEnabled:false,
  officeHoursEnabled: false,
  weekTimings: days.reduce(
    (acc, day) => ({
      ...acc,
      [day]: { enabled: false, start: "", end: "" },
    }),
    {}
  ),
};

const officeHoursSlice = createSlice({
  name: "officeHours",
  initialState,
  reducers: {
    set24HoursEnabled: (state,action:PayloadAction<boolean>) => {
      state.WholeDayHoursEnabled = action.payload;
    },
    setOfficeHoursEnabled: (state, action: PayloadAction<boolean>) => {
      state.officeHoursEnabled = action.payload;
    },
    setDayToggle: (
      state,
      action: PayloadAction<{ day: string; enabled: boolean }>
    ) => {
      const { day, enabled } = action.payload;
      if (state.weekTimings[day]) {
        state.weekTimings[day].enabled = enabled;
      }
    },
    setTimeValue: (
      state,
      action: PayloadAction<{
        day: string;
        field: "start" | "end";
        value: string;
      }>
    ) => {
      const { day, field, value } = action.payload;
      if (state.weekTimings[day]) {
        state.weekTimings[day][field] = value;
      }
    },
    setAllOfficeHours: (state, action: PayloadAction<OfficeHoursState>) => {
      return action.payload;
    },
  },
});

export const {
  set24HoursEnabled,
  setOfficeHoursEnabled,
  setDayToggle,
  setTimeValue,
  setAllOfficeHours,
} = officeHoursSlice.actions;

export default officeHoursSlice.reducer;
