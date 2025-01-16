// File: src/redux/slices/receiptSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../utils/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

export interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Receipt {
  id: string;
  imageUri: string;
  category: string;       // e.g. "Food", "Travel", "Shopping", or "Other"
  amount: number;         // total spent
  uploadDate: string;     // ISO date of when it was uploaded
  merchantName: string;   // "IKEA", "Starbucks", etc.
  purchaseDate: string;   // e.g. "Jan 15, 2025"
  purchaseDateISO?: string;  // e.g. "2025-01-15T00:00:00.000Z"
  paymentMethod: string;  // e.g. "Visa", "Mastercard", "Cash"
  last4: string;          // last 4 digits of the card
  hst?: number;           // HST portion
  gst?: number;           // optional if you want to store GST separately
  returns?: number;       // optional if you want to track returns
  netTotal?: number;      // optional net total after returns/taxes
  lineItems?: LineItem[];
}

interface ReceiptState {
  data: Receipt[];
  loading: boolean;
  error?: string;
}

const initialState: ReceiptState = {
  data: [],
  loading: false,
};

/**
 * CREATE a single receipt doc in Firestore
 */
export const createReceipt = createAsyncThunk(
  "receipts/createReceipt",
  async (receipt: Omit<Receipt, "id">) => {
    const colRef = collection(db, "receipts");
    const docRef = await addDoc(colRef, receipt);
    return { ...receipt, id: docRef.id };
  }
);

/**
 * READ all receipts from Firestore
 */
export const fetchReceipts = createAsyncThunk("receipts/fetchReceipts", async () => {
  const colRef = collection(db, "receipts");
  const snap = await getDocs(colRef);
  const receipts: Receipt[] = [];
  snap.forEach((docSnap) => {
    receipts.push({ id: docSnap.id, ...docSnap.data() } as Receipt);
  });
  return receipts;
});

/**
 * UPDATE a given receipt by ID
 */
export const updateReceipt = createAsyncThunk(
  "receipts/updateReceipt",
  async ({ id, changes }: { id: string; changes: Partial<Receipt> }) => {
    const docRef = doc(db, "receipts", id);
    await updateDoc(docRef, changes);
    return { id, changes };
  }
);

/**
 * DELETE a given receipt by ID
 */
export const removeReceipt = createAsyncThunk(
  "receipts/removeReceipt",
  async (id: string) => {
    const docRef = doc(db, "receipts", id);
    await deleteDoc(docRef);
    return id;
  }
);

const receiptSlice = createSlice({
  name: "receipts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE
    builder.addCase(createReceipt.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createReceipt.fulfilled, (state, action) => {
      state.loading = false;
      state.data.push(action.payload);
    });
    builder.addCase(createReceipt.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // FETCH
    builder.addCase(fetchReceipts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchReceipts.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchReceipts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // UPDATE
    builder.addCase(updateReceipt.fulfilled, (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.data.findIndex((r) => r.id === id);
      if (idx >= 0) {
        state.data[idx] = { ...state.data[idx], ...changes };
      }
    });

    // REMOVE
    builder.addCase(removeReceipt.fulfilled, (state, action) => {
      state.data = state.data.filter((r) => r.id !== action.payload);
    });
  },
});

export default receiptSlice.reducer;
