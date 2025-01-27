// File: src/redux/slices/ledgerSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../config/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

/**
 * A single line in a ledger transaction
 * accountId references the "accounts" collection
 */
export interface LedgerLine {
  accountId: string;
  debit: number;  // e.g. 25.99
  credit: number; // usually 0 or some amount
}

/**
 * The entire ledger transaction
 * sum of all debits = sum of all credits
 */
export interface LedgerTransaction {
  id: string;        // Firestore doc ID
  date: string;      // e.g. "2025-01-25" or new Date().toISOString()
  memo?: string;     // optional note
  lines: LedgerLine[];
}

/**
 * Ledger slice state
 */
interface LedgerState {
  data: LedgerTransaction[];
  loading: boolean;
  error?: string;
}

const initialState: LedgerState = {
  data: [],
  loading: false,
};

/**
 * CREATE a single ledger transaction doc in Firestore
 */
export const createLedgerTransaction = createAsyncThunk(
  "ledger/createLedgerTransaction",
  async (tx: Omit<LedgerTransaction, "id">) => {
    // optional: verify sum of debits = sum of credits before saving
    const totalDebits = tx.lines.reduce((acc, line) => acc + (line.debit || 0), 0);
    const totalCredits = tx.lines.reduce((acc, line) => acc + (line.credit || 0), 0);
    if (Math.abs(totalDebits - totalCredits) > 0.0001) {
      throw new Error("Debits and credits do not balance!");
    }

    const colRef = collection(db, "ledger");
    const docRef = await addDoc(colRef, tx);
    return { ...tx, id: docRef.id };
  }
);

/**
 * READ all ledger transactions
 */
export const fetchLedgerTransactions = createAsyncThunk("ledger/fetchLedgerTransactions", async () => {
  const colRef = collection(db, "ledger");
  const snap = await getDocs(colRef);
  const txs: LedgerTransaction[] = [];
  snap.forEach((docSnap) => {
    txs.push({ id: docSnap.id, ...docSnap.data() } as LedgerTransaction);
  });
  return txs;
});

/**
 * UPDATE a given ledger transaction by ID
 */
export const updateLedgerTransaction = createAsyncThunk(
  "ledger/updateLedgerTransaction",
  async ({ id, changes }: { id: string; changes: Partial<LedgerTransaction> }) => {
    // optional: verify lines still balance if lines were changed
    if (changes.lines) {
      const totalDebits = changes.lines.reduce((acc, line) => acc + (line.debit || 0), 0);
      const totalCredits = changes.lines.reduce((acc, line) => acc + (line.credit || 0), 0);
      if (Math.abs(totalDebits - totalCredits) > 0.0001) {
        throw new Error("Debits and credits do not balance!");
      }
    }

    const docRef = doc(db, "ledger", id);
    await updateDoc(docRef, changes);
    return { id, changes };
  }
);

/**
 * DELETE a given ledger transaction by ID
 */
export const removeLedgerTransaction = createAsyncThunk(
  "ledger/removeLedgerTransaction",
  async (id: string) => {
    const docRef = doc(db, "ledger", id);
    await deleteDoc(docRef);
    return id;
  }
);

const ledgerSlice = createSlice({
  name: "ledger",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE
    builder.addCase(createLedgerTransaction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createLedgerTransaction.fulfilled, (state, action) => {
      state.loading = false;
      state.data.push(action.payload);
    });
    builder.addCase(createLedgerTransaction.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // FETCH
    builder.addCase(fetchLedgerTransactions.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchLedgerTransactions.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchLedgerTransactions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // UPDATE
    builder.addCase(updateLedgerTransaction.fulfilled, (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.data.findIndex((tx) => tx.id === id);
      if (idx >= 0) {
        state.data[idx] = { ...state.data[idx], ...changes };
      }
    });

    // REMOVE
    builder.addCase(removeLedgerTransaction.fulfilled, (state, action) => {
      state.data = state.data.filter((tx) => tx.id !== action.payload);
    });
  },
});

export default ledgerSlice.reducer;
