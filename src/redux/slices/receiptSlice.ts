// File: src/redux/slices/receiptSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { db } from "../../utils/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

export interface Receipt {
  id: string;
  imageUri: string;
  category: string;
  amount: number;
  uploadDate: string;
  merchantName: string;
  purchaseDate: string;
  paymentMethod: string;
  last4: string;
  gst?: number;           // new field for GST portion
  lineItems?: LineItem[]; // optional line-item array
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  tax?: number;
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

export const createReceipt = createAsyncThunk(
  "receipts/createReceipt",
  async (receipt: Omit<Receipt, "id">) => {
    const colRef = collection(db, "receipts");
    const docRef = await addDoc(colRef, receipt);
    return { ...receipt, id: docRef.id };
  }
);

export const fetchReceipts = createAsyncThunk("receipts/fetchReceipts", async () => {
  const colRef = collection(db, "receipts");
  const snap = await getDocs(colRef);
  const receipts: Receipt[] = [];
  snap.forEach((docSnap) => {
    receipts.push({ id: docSnap.id, ...docSnap.data() } as Receipt);
  });
  return receipts;
});

export const updateReceipt = createAsyncThunk(
  "receipts/updateReceipt",
  async ({ id, changes }: { id: string; changes: Partial<Receipt> }) => {
    const docRef = doc(db, "receipts", id);
    await updateDoc(docRef, changes);
    return { id, changes };
  }
);

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
