// File: src/redux/slices/employeeSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

export interface Employee {
  id: string;
  name: string;
  position?: string;
}

export interface TimesheetEntry {
  id: string;
  date: string;
  hours: number;
}

interface EmployeeState {
  employees: Employee[];
  timesheets: { [employeeId: string]: TimesheetEntry[] };
  payroll: Array<{
    id: string;
    employeeId: string;
    payPeriod: string;
    totalPay: number;
  }>;
}

const initialState: EmployeeState = {
  employees: [],
  timesheets: {},
  payroll: [],
};

export const employeeSlice = createSlice({
  name: "employee",
  initialState,
  reducers: {
    addEmployee: (state, action: PayloadAction<Employee>) => {
      state.employees.push(action.payload);
    },
    removeEmployee: (state, action: PayloadAction<string>) => {
      state.employees = state.employees.filter((emp) => emp.id !== action.payload);
      delete state.timesheets[action.payload];
    },
    addTimesheetEntry: (
      state,
      action: PayloadAction<{ employeeId: string; entry: TimesheetEntry }>
    ) => {
      const { employeeId, entry } = action.payload;
      if (!state.timesheets[employeeId]) {
        state.timesheets[employeeId] = [];
      }
      state.timesheets[employeeId].push(entry);
    },
    removeTimesheetEntry: (
      state,
      action: PayloadAction<{ employeeId: string; entryId: string }>
    ) => {
      const { employeeId, entryId } = action.payload;
      if (state.timesheets[employeeId]) {
        state.timesheets[employeeId] = state.timesheets[employeeId].filter(
          (e) => e.id !== entryId
        );
      }
    },
    runPayroll: (
      state,
      action: PayloadAction<{
        id?: string;
        employeeId: string;
        payPeriod: string;
        totalPay: number;
      }>
    ) => {
      const { employeeId, payPeriod, totalPay, id } = action.payload;
      state.payroll.push({
        id: id || uuidv4(),
        employeeId,
        payPeriod,
        totalPay,
      });
    },
  },
});

export const {
  addEmployee,
  removeEmployee,
  addTimesheetEntry,
  removeTimesheetEntry,
  runPayroll,
} = employeeSlice.actions;

export default employeeSlice.reducer;
