// File: src/redux/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";

// Slices
import receiptReducer from "./slices/receiptSlice";
import inventoryReducer from "./slices/inventorySlice";
import employeeReducer from "./slices/employeeSlice";
import salesReducer from "./slices/salesSlice";
// plus any others you have

const rootReducer = combineReducers({
  // The key must match how your UI references these slices
  receipts: receiptReducer,  // state.receipts.data
  inventory: inventoryReducer, // state.inventory.items
  employee: employeeReducer, // state.employee.employees
  sales: salesReducer, // state.sales.salesOrders
  // etc.
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
