// File: App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import "react-native-get-random-values";

import AuthStack from "./src/navigation/AuthStack";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import ReceiptDetailScreen from "./src/screens/ReceiptDetailScreen";
import ReceiptTrackerScreen from "./src/screens/ReceiptTrackerScreen";
import MileageTrackerScreen from "./src/screens/MileageTrackerScreen";
import TripHistoryScreen from "./src/screens/TripHistoryScreen";
import ReceiptEditorScreen from "./src/screens/ReceiptEditorScreen";
import SummaryExportScreen from "./src/screens/SummaryExportScreen";
import DistanceScreen from "./src/screens/DistanceScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="AuthStack">

          <Stack.Screen
            name="AuthStack"
            component={AuthStack}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="MainTabs"
            component={BottomTabNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ReceiptDetail"
            component={ReceiptDetailScreen}
            options={{ title: "Receipt Detail" }}
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
            name="TripHistory"
            component={TripHistoryScreen}
            options={{ title: "Trip History" }}
          />
          <Stack.Screen
            name="ReceiptEditor"
            component={ReceiptEditorScreen}
            options={{ title: "Multi-Page Receipts" }}
          />
          <Stack.Screen
            name="SummaryExport"
            component={SummaryExportScreen}
            options={{ title: "Export Summary" }}
          />
          <Stack.Screen
            name="Distance"
            component={DistanceScreen}
            options={{ title: "Distance Tracker" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
