// File: src/navigation/AuthStack.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import ReceiptTrackerScreen from "../screens/ReceiptTrackerScreen";
import MileageTrackerScreen from "../screens/MileageTrackerScreen";
import SummaryExportScreen from "../screens/SummaryExportScreen";
import ReceiptEditorScreen from "../screens/ReceiptEditorScreen";
import ReceiptDetailScreen from "../screens/ReceiptDetailScreen";
import BulkUploadScreen from "../screens/BulkUploadScreen"; // Added import
import ExportScreen from "../screens/ExportScreen"; // Added import
import TripHistoryScreen from "../screens/TripHistoryScreen"; // Added import
import ReceiptOrganizerScreen from "../screens/ReceiptOrganizerScreen";
import AddExpenseScreen from "../screens/AddExpenseScreen";
import InvoiceScreen from "../screens/InvoiceScreen";
import ReportsScreen from "../screens/ReportsScreen";
import AiInsightsScreen from "../screens/AiInsightsScreen";
import DashboardScreen from "../screens/DashboardScreen";
import GameCenterScreen from "../screens/GameCenterScreen";
const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator>
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
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
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
      {/* Newly added screens */}
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
    </Stack.Navigator>
  );
}
