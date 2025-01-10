// File: src/redux/reducers.ts

import { combineReducers } from '@reduxjs/toolkit';
import currencyReducer from './slices/currencySlice';
import locationReducer from './slices/locationSlice';
import tripReducer from './slices/tripSlice';
import expensesReducer from './slices/expensesSlice';
import receiptReducer from './slices/receiptSlice';

const rootReducer = combineReducers({
  currency: currencyReducer,
  location: locationReducer,
  trip: tripReducer,
  expenses: expensesReducer,
  receipts: receiptReducer,
});

export default rootReducer;
