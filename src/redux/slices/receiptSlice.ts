import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Receipt {
  id: string;
  images: string[];       // multi-page images
  category: string;
  amount: number;
  merchantName: string;
  purchaseDate: string;
  paymentMethod: string;
  last4: string;
  returns: number;
  netTotal: number;
}

interface OrganizedReceipts {
  [year: string]: {
    [month: string]: {
      [day: string]: Receipt[];
    };
  };
}

interface ReceiptState {
  data: OrganizedReceipts; // year -> month -> day -> array of receipts
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
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const day = String(currentDate.getDate()).padStart(2, "0");

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
      reducer(
        state,
        action: PayloadAction<Receipt & { year: string; month: string; day: string }>
      ) {
        const { year, month, day, ...receipt } = action.payload;

        if (!state.data[year]) {
          state.data[year] = {};
        }
        if (!state.data[year][month]) {
          state.data[year][month] = {};
        }
        if (!state.data[year][month][day]) {
          state.data[year][month][day] = [];
        }
        state.data[year][month][day].push(receipt);
      },
    },

    updateReceipt: (
      state,
      action: PayloadAction<{
        year: string;
        month: string;
        day: string;
        id: string;
        changes: Partial<Receipt>;
      }>
    ) => {
      const { year, month, day, id, changes } = action.payload;
      const dayArray = state.data[year]?.[month]?.[day];
      if (dayArray) {
        const index = dayArray.findIndex((r) => r.id === id);
        if (index >= 0) {
          dayArray[index] = { ...dayArray[index], ...changes };
        }
      }
    },
  },
});

export const { addReceipt, updateReceipt } = receiptSlice.actions;
export default receiptSlice.reducer;
