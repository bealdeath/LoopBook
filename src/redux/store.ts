// File: src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import receiptReducer from './slices/receiptSlice'; // Import your reducer(s)

export const store = configureStore({
  reducer: {
    receipts: receiptReducer, // Add all your reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
