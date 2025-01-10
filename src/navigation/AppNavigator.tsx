// File: src/navigation/AppNavigator.tsx

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import DistanceScreen from "../screens/MileageTrackerScreen";
import ReceiptScreen from "../screens/ReceiptManagerScreen";
import ReceiptTrackerScreen from "../screens/ReceiptTrackerScreen";
import ReceiptEditorScreen from "../screens/ReceiptEditorScreen";
import BulkUploadScreen from "../screens/BulkUploadScreen"; // Import BulkUploadScreen
import ExportScreen from "../screens/ExportScreen"; // Import ExportScreen
import TripHistoryScreen from "../screens/TripHistoryScreen"; // Import TripHistoryScreen

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="DistanceScreen" component={DistanceScreen} />
        <Stack.Screen name="ReceiptScreen" component={ReceiptScreen} />
        <Stack.Screen name="ReceiptTrackerScreen" component={ReceiptTrackerScreen} />
        <Stack.Screen
          name="ReceiptEditorScreen"
          component={ReceiptEditorScreen}
          options={{ title: "Edit Receipt" }}
        />
        <Stack.Screen
          name="BulkUploadScreen"
          component={BulkUploadScreen}
          options={{ title: "Bulk Upload Receipts" }}
        />
        <Stack.Screen
          name="ExportScreen"
          component={ExportScreen}
          options={{ title: "Export Data" }}
        />
        <Stack.Screen
          name="TripHistoryScreen"
          component={TripHistoryScreen}
          options={{ title: "Trip History" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
