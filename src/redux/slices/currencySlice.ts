// File: src/redux/slices/currencySlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch exchange rates
export const fetchExchangeRates = createAsyncThunk(
  "currency/fetchExchangeRates",
  async (baseCurrency: string, thunkAPI) => {
    try {
      const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      return response.data.rates;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch exchange rates.");
    }
  }
);

interface CurrencyState {
  baseCurrency: string;
  exchangeRates: Record<string, number>;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CurrencyState = {
  baseCurrency: "USD",
  exchangeRates: {},
  status: "idle",
  error: null,
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setBaseCurrency(state, action: PayloadAction<string>) {
      state.baseCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action: PayloadAction<Record<string, number>>) => {
        state.status = "succeeded";
        state.exchangeRates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { setBaseCurrency } = currencySlice.actions;
export default currencySlice.reducer;
