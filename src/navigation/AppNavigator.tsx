import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import DistanceScreen from '../screens/MileageTrackerScreen'; // Ensure correct import
import ReceiptScreen from '../screens/ReceiptManagerScreen'; // Ensure correct import
import MileageTrackerScreen from '../screens/MileageTrackerScreen';
import ReceiptTrackerScreen from '../screens/ReceiptTrackerScreen';
import ReceiptScannerScreen from "../screens/ReceiptScannerScreen";
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="DistanceScreen" component={DistanceScreen} />
        <Stack.Screen name="ReceiptScreen" component={ReceiptScreen} />
        <Stack.Screen name="MileageTrackerScreen" component={MileageTrackerScreen} />
        <Stack.Screen name="Receipt TrackerScreen" component={ReceiptTrackerScreen} />
        <Stack.Screen name="ReceiptScanner" component={ReceiptScannerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
