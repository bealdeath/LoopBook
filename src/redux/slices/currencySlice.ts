import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { CurrencyService } from "../../utils/currencyService";

export const fetchExchangeRates = createAsyncThunk(
  "currency/fetchExchangeRates",
  async (baseCurrency) => {
    return await CurrencyService.getExchangeRates(baseCurrency);
  }
);

const currencySlice = createSlice({
  name: "currency",
  initialState: {
    baseCurrency: "USD",
    exchangeRates: {},
    status: "idle",
    error: null,
  },
  reducers: {
    setBaseCurrency: (state, action) => {
      state.baseCurrency = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchExchangeRates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.exchangeRates = action.payload;
      })
      .addCase(fetchExchangeRates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { setBaseCurrency } = currencySlice.actions;
export default currencySlice.reducer;
