// File: src/redux/slices/timeSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface TimeLog {
  id: string;
  projectId?: string; // optional
  startTime: string;
  endTime?: string; // if still running, undefined
  notes?: string;
}

interface TimeState {
  data: TimeLog[];
}

const initialState: TimeState = {
  data: [],
};

export const timeSlice = createSlice({
  name: "time",
  initialState,
  reducers: {
    startLog: (state, action: PayloadAction<TimeLog>) => {
      state.data.push(action.payload);
    },
    stopLog: (state, action: PayloadAction<{ id: string; endTime: string }>) => {
      const index = state.data.findIndex((log) => log.id === action.payload.id);
      if (index >= 0) {
        state.data[index].endTime = action.payload.endTime;
      }
    },
  },
});

export const { startLog, stopLog } = timeSlice.actions;
export default timeSlice.reducer;
