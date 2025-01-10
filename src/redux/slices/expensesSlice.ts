// File: src/redux/slices/expensesSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Expense {
  amount: number;
  category: string;
  date: string;
  total: number;
  merchant: string;
}

interface ExpensesState {
  data: Expense[];
}

const initialState: ExpensesState = {
  data: [],
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      state.data.push(action.payload);
    },
    setExpenses: (state, action: PayloadAction<Expense[]>) => {
      state.data = action.payload;
    },
    // Add additional reducer examples here if needed.
  },
});

export const { addExpense, setExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;
