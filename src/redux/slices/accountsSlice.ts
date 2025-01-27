// File: src/redux/slices/accountsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { db } from "../../config/firebaseConfig"; // or wherever your Firestore config is
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

/**
 * Common account types in double-entry accounting
 */
export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

/**
 * Each Account in the Chart of Accounts
 */
export interface Account {
  id: string;            // Firestore doc ID
  name: string;          // e.g. "Cash", "Accounts Receivable", "Meals & Entertainment"
  type: AccountType;     // e.g. "ASSET", "EXPENSE", etc.
  description?: string;  // optional
  // Optionally, a normalBalance ("DEBIT" or "CREDIT") if you want
  normalBalance?: "DEBIT" | "CREDIT";
}

/**
 * State shape for accounts slice
 */
interface AccountsState {
  data: Account[];
  loading: boolean;
  error?: string;
}

const initialState: AccountsState = {
  data: [],
  loading: false,
};

/**
 * CREATE a single Account doc in Firestore
 */
export const createAccount = createAsyncThunk(
  "accounts/createAccount",
  async (account: Omit<Account, "id">) => {
    const colRef = collection(db, "accounts"); // "accounts" collection in Firestore
    const docRef = await addDoc(colRef, account);
    return { ...account, id: docRef.id };
  }
);

/**
 * READ all accounts from Firestore
 */
export const fetchAccounts = createAsyncThunk("accounts/fetchAccounts", async () => {
  const colRef = collection(db, "accounts");
  const snap = await getDocs(colRef);
  const accounts: Account[] = [];
  snap.forEach((docSnap) => {
    accounts.push({ id: docSnap.id, ...docSnap.data() } as Account);
  });
  return accounts;
});

/**
 * UPDATE a given account by ID
 */
export const updateAccount = createAsyncThunk(
  "accounts/updateAccount",
  async ({ id, changes }: { id: string; changes: Partial<Account> }) => {
    const docRef = doc(db, "accounts", id);
    await updateDoc(docRef, changes);
    return { id, changes };
  }
);

/**
 * DELETE a given account by ID
 */
export const removeAccount = createAsyncThunk(
  "accounts/removeAccount",
  async (id: string) => {
    const docRef = doc(db, "accounts", id);
    await deleteDoc(docRef);
    return id;
  }
);

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // CREATE
    builder.addCase(createAccount.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createAccount.fulfilled, (state, action) => {
      state.loading = false;
      state.data.push(action.payload);
    });
    builder.addCase(createAccount.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // FETCH
    builder.addCase(fetchAccounts.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchAccounts.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchAccounts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // UPDATE
    builder.addCase(updateAccount.fulfilled, (state, action) => {
      const { id, changes } = action.payload;
      const idx = state.data.findIndex((acct) => acct.id === id);
      if (idx >= 0) {
        state.data[idx] = { ...state.data[idx], ...changes };
      }
    });

    // REMOVE
    builder.addCase(removeAccount.fulfilled, (state, action) => {
      state.data = state.data.filter((acct) => acct.id !== action.payload);
    });
  },
});

export default accountsSlice.reducer;
