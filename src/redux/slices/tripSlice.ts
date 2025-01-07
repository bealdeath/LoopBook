// File: src/redux/slices/tripSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Trip {
  id: string;
  route: [number, number][];       // array of [lat,lon] points
  distanceKm: number;              // total distance in km
  startTime: string;               // ISO date/time when started
  endTime: string | null;          // ISO date/time when ended
  classification: "Business" | "Personal";
  reimbursement: number;           // how much is reimbursed
  reviewed: boolean;               // whether user has confirmed it
}

interface TripState {
  data: Trip[];
}

const initialState: TripState = {
  data: [],
};

export const tripSlice = createSlice({
  name: "trips",
  initialState,
  reducers: {
    addTrip: {
      prepare(payload: Omit<Trip, "distanceKm" | "reimbursement">) {
        // let distance default to 0
        // let reimbursement default to 0
        return {
          payload: {
            ...payload,
            distanceKm: 0,
            reimbursement: 0,
          },
        };
      },
      reducer(state, action: PayloadAction<Trip>) {
        state.data.push(action.payload);
      },
    },

    updateTrip(state, action: PayloadAction<Trip>) {
      const idx = state.data.findIndex((t) => t.id === action.payload.id);
      if (idx >= 0) {
        state.data[idx] = action.payload;
      }
    },

    markReviewed(state, action: PayloadAction<string>) {
      // mark the trip with given id as reviewed
      const idx = state.data.findIndex((t) => t.id === action.payload);
      if (idx >= 0) {
        state.data[idx].reviewed = true;
      }
    },
  },
});

export const { addTrip, updateTrip, markReviewed } = tripSlice.actions;
export default tripSlice.reducer;
