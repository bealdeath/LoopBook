// File: src/redux/slices/settingsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SettingsState {
  showLedger: boolean;
}

const initialState: SettingsState = {
  showLedger: false, // Default to not showing Ledger
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleLedger(state) {
      state.showLedger = !state.showLedger;
    },
    setShowLedger(state, action: PayloadAction<boolean>) {
      state.showLedger = action.payload;
    },
  },
});

export const { toggleLedger, setShowLedger } = settingsSlice.actions;
export default settingsSlice.reducer;
