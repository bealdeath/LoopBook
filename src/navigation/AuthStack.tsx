// File: src/navigation/AuthStack.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Original screens
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import ReceiptTrackerScreen from "../screens/ReceiptTrackerScreen";
import MileageTrackerScreen from "../screens/MileageTrackerScreen";
import SummaryExportScreen from "../screens/SummaryExportScreen";
import ReceiptEditorScreen from "../screens/ReceiptEditorScreen";
import ReceiptDetailScreen from "../screens/ReceiptDetailScreen";
import BulkUploadScreen from "../screens/BulkUploadScreen";
import ExportScreen from "../screens/ExportScreen";
import TripHistoryScreen from "../screens/TripHistoryScreen";
import ReceiptOrganizerScreen from "../screens/ReceiptOrganizerScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import InvoiceScreen from "../screens/InvoiceScreen";
import ReportsScreen from "../screens/ReportsScreen";
import AiInsightsScreen from "../screens/AiInsightsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import GameCenterScreen from "../screens/GameCenterScreen";
import ProjectListScreen from "../screens/ProjectListScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";
import TimeTrackingScreen from "../screens/TimeTrackingScreen";
import ExpenseOrganizerScreen from "../screens/ExpenseOrganizerScreen";
import DynamicDashboardScreen from "../screens/DynamicDashboardScreen";
import SummaryScreen from "../screens/SummaryScreen";

// Remove new screens completely:
// import ChartOfAccountsScreen from "../screens/ChartOfAccountsScreen";
import LedgerScreen from "../screens/LedgerScreen";

import EmployeeOnboardingScreen from "../screens/EmployeeOnboardingScreen";
import TimesheetScreen from "../screens/TimesheetScreen";
import PayrollScreen from "../screens/PayrollScreen";
import InventoryScreen from "../screens/InventoryScreen";
import PurchaseOrderScreen from "../screens/PurchaseOrderScreen";
import SalesScreen from "../screens/SalesScreen";
import SalesDetailScreen from "../screens/SalesDetailScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      {/* Auth */}
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ title: "Create Account" }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: "Forgot Password" }}
      />

      {/* Main Tabs */}
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />

      {/* Existing Feature Screens */}
      <Stack.Screen
        name="ReceiptTracker"
        component={ReceiptTrackerScreen}
        options={{ title: "Receipt Tracker" }}
      />
      <Stack.Screen
        name="MileageTracker"
        component={MileageTrackerScreen}
        options={{ title: "Mileage Tracker" }}
      />
      <Stack.Screen
        name="SummaryExport"
        component={SummaryExportScreen}
        options={{ title: "Summary Export" }}
      />
      <Stack.Screen
        name="ReceiptEditor"
        component={ReceiptEditorScreen}
        options={{ title: "Edit Receipt" }}
      />
      <Stack.Screen
        name="ReceiptDetail"
        component={ReceiptDetailScreen}
        options={{ title: "Receipt Detail" }}
      />
      <Stack.Screen
        name="BulkUploadScreen"
        component={BulkUploadScreen}
        options={{ title: "Bulk Upload Receipts" }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{ title: "Export Data" }}
      />
      <Stack.Screen
        name="TripHistory"
        component={TripHistoryScreen}
        options={{ title: "Trip History" }}
      />
      <Stack.Screen
        name="ReceiptOrganizer"
        component={ReceiptOrganizerScreen}
        options={{ title: "Organized Receipts" }}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{ title: "Add Expense" }}
      />
      <Stack.Screen
        name="InvoiceScreen"
        component={InvoiceScreen}
        options={{ title: "Invoice" }}
      />
      <Stack.Screen
        name="ReportsScreen"
        component={ReportsScreen}
        options={{ title: "Reports" }}
      />
      <Stack.Screen
        name="AiInsightsScreen"
        component={AiInsightsScreen}
        options={{ title: "AI Insights" }}
      />
      <Stack.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{ title: "Dashboard" }}
      />
      <Stack.Screen
        name="GameCenterScreen"
        component={GameCenterScreen}
        options={{ title: "Game Center" }}
      />
      <Stack.Screen
        name="ProjectList"
        component={ProjectListScreen}
        options={{ title: "Projects" }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: "Project Detail" }}
      />
      <Stack.Screen
        name="TimeTracking"
        component={TimeTrackingScreen}
        options={{ title: "Time Tracking" }}
      />
      <Stack.Screen
        name="ExpenseOrganizer"
        component={ExpenseOrganizerScreen}
        options={{ title: "Expense Organizer" }}
      />
      <Stack.Screen
        name="DynamicDashboard"
        component={DynamicDashboardScreen}
        options={{ title: "Custom Dashboard" }}
      />
      <Stack.Screen
        name="SummaryScreen"
        component={SummaryScreen}
        options={{ title: "Summary" }}
      />

      {/* NEW SCREENS */}
      <Stack.Screen
        name="EmployeeOnboarding"
        component={EmployeeOnboardingScreen}
        options={{ title: "Employee Onboarding" }}
      />
      <Stack.Screen
        name="Timesheet"
        component={TimesheetScreen}
        options={{ title: "Timesheet" }}
      />
      <Stack.Screen
        name="Payroll"
        component={PayrollScreen}
        options={{ title: "Payroll" }}
      />
      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ title: "Inventory" }}
      />
      <Stack.Screen
        name="PurchaseOrder"
        component={PurchaseOrderScreen}
        options={{ title: "Purchase Orders" }}
      />
      <Stack.Screen
        name="Sales"
        component={SalesScreen}
        options={{ title: "Sales" }}
      />
      <Stack.Screen
        name="SalesDetail"
        component={SalesDetailScreen}
        options={{ title: "Sales Detail" }}
      />
      <Stack.Screen
        name="LedgerScreen"
        component={LedgerScreen}
        options={{ title: "Ledger Transactions" }}
     />
    </Stack.Navigator>
  );
}
