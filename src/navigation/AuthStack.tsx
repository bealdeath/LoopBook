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
import ReceiptDetailScreen from '../screens/ReceiptDetailScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator>
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
      {/* Add missing screens */}
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
    </Stack.Navigator>
  );
}
