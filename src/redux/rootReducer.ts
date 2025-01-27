// File: src/redux/rootReducer.ts

import { combineReducers } from "@reduxjs/toolkit";
import receiptReducer from "./slices/receiptSlice";
import inventoryReducer from "./slices/inventorySlice";
import employeeReducer from "./slices/employeeSlice";
import salesReducer from "./slices/salesSlice";
import settingsReducer from "./slices/settingsSlice";
// 1) Re-add ledger import
import ledgerReducer from "./slices/ledgerSlice";

const rootReducer = combineReducers({
  receipts: receiptReducer,
  inventory: inventoryReducer,
  employee: employeeReducer,
  sales: salesReducer,
  settings: settingsReducer,
  // 2) Re-enable ledger
  ledger: ledgerReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
