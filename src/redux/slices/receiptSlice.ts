// File: src/redux/slices/receiptSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Receipt {
  id: string;
  images: string[];
  category: string;
  amount: number;
  merchantName: string;
  purchaseDate: string;
  paymentMethod: string;
  last4: string;
  returns: number;
  netTotal: number;
}

type OrganizedReceipts = Record<string, Record<string, Record<string, Receipt[]>>>;

interface ReceiptState {
  data: OrganizedReceipts;
}

const initialState: ReceiptState = {
  data: {},
};

export const receiptSlice = createSlice({
  name: "receipts",
  initialState,
  reducers: {
    addReceipt: {
      prepare(payload: Omit<Receipt, "returns" | "netTotal">) {
        const currentDate = new Date();
        const year = currentDate.getFullYear().toString();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
        const day = currentDate.getDate().toString().padStart(2, "0");

        return {
          payload: {
            ...payload,
            returns: 0,
            netTotal: payload.amount,
            year,
            month,
            day,
          },
        };
      },
      reducer(state, action: PayloadAction<Receipt & { year: string; month: string; day: string }>) {
        const { year, month, day, ...receipt } = action.payload;

        if (!state.data[year]) state.data[year] = {};
        if (!state.data[year][month]) state.data[year][month] = {};
        if (!state.data[year][month][day]) state.data[year][month][day] = [];

        state.data[year][month][day].push(receipt);
      },
    },
  },
});

export const { addReceipt } = receiptSlice.actions;
export default receiptSlice.reducer;
