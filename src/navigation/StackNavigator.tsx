import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabNavigator from "./BottomTabNavigator";
import MileageTrackerScreen from "../screens/MileageTrackerScreen";
import ReceiptScannerScreen from "../screens/ReceiptScannerScreen";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Mileage Tracker" component={MileageTrackerScreen} />
      <Stack.Screen name="Receipt Scanner" component={ReceiptScannerScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
