// File: src/redux/slices/locationSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  currentLocation: { latitude: number; longitude: number } | null;
}

const initialState: LocationState = {
  currentLocation: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (state, action: PayloadAction<{ latitude: number; longitude: number }>) => {
      state.currentLocation = action.payload;
    },
  },
});

export const { setLocation } = locationSlice.actions;
export default locationSlice.reducer;
