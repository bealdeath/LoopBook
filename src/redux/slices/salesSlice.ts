// File: src/redux/slices/salesSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SalesOrderItem {
  id: string;
  description: string;
  rate: number;
}

export interface SalesOrder {
  id: string;
  customerName: string;
  total: number;
  items: SalesOrderItem[];
  status: string;
}

interface SalesState {
  salesOrders: SalesOrder[];
}

const initialState: SalesState = {
  salesOrders: [],
};

export const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    addSalesOrder: (state, action: PayloadAction<SalesOrder>) => {
      state.salesOrders.push(action.payload);
    },
    updateSalesOrder: (
      state,
      action: PayloadAction<{ id: string; changes: Partial<SalesOrder> }>
    ) => {
      const index = state.salesOrders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.salesOrders[index] = {
          ...state.salesOrders[index],
          ...action.payload.changes,
        };
      }
    },
    removeSalesOrder: (state, action: PayloadAction<string>) => {
      state.salesOrders = state.salesOrders.filter((o) => o.id !== action.payload);
    },
  },
});

export const { addSalesOrder, updateSalesOrder, removeSalesOrder } = salesSlice.actions;
export default salesSlice.reducer;
