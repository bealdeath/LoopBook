import { createSlice } from '@reduxjs/toolkit';

const locationSlice = createSlice({
  name: 'location',
  initialState: {
    currentLocation: null,
  },
  reducers: {
    setLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
  },
});

export const { setLocation } = locationSlice.actions;
export default locationSlice.reducer;
