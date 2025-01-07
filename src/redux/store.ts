// File: src/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import receiptReducer from "./slices/receiptSlice";
import tripReducer from "./slices/tripSlice";

export const store = configureStore({
  reducer: {
    receipts: receiptReducer,
    trips: tripReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
