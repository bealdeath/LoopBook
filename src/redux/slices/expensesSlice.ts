import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Expense {
  amount: number;
  category: string;
  date: string;
  // Add more fields if needed (merchant, notes, etc.)
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
    // If you want more actions, like removeExpense, updateExpense, etc.
  },
});

export const { addExpense, setExpenses } = expensesSlice.actions;
export default expensesSlice.reducer;
