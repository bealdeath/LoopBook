// File: src/redux/slices/receiptSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Receipt {
  id: string;
  imageUri: string;
  category: string;
  amount: number;
  date: string;
  merchantName: string;
  purchaseDate: string;
  paymentMethod: string;
  last4: string;
  returns: number;        // <-- NEW field
  netTotal: number;       // <-- NEW field, total - returns
}

interface ReceiptState {
  data: Receipt[];
}

const initialState: ReceiptState = {
  data: [],
};

export const receiptSlice = createSlice({
  name: "receipts",
  initialState,
  reducers: {
    addReceipt: {
      prepare(payload: Omit<Receipt, "returns" | "netTotal">) {
        // automatically set returns:0, netTotal = amount - 0
        return {
          payload: {
            ...payload,
            returns: 0,
            netTotal: payload.amount, // default
          },
        };
      },
      reducer(state, action: PayloadAction<Receipt>) {
        state.data.push(action.payload);
      },
    },

    updateReceipt(state, action: PayloadAction<Receipt>) {
      const idx = state.data.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) {
        state.data[idx] = action.payload;
      }
    },

    setReturns(
      state,
      action: PayloadAction<{ id: string; returns: number }>
    ) {
      const idx = state.data.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) {
        const old = state.data[idx];
        const newNet = old.amount - action.payload.returns;
        state.data[idx] = {
          ...old,
          returns: action.payload.returns,
          netTotal: newNet,
        };
      }
    },
  },
});

export const { addReceipt, updateReceipt, setReturns } = receiptSlice.actions;
export default receiptSlice.reducer;
