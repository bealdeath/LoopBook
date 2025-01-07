import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import MileageTrackerScreen from '../screens/MileageTrackerScreen';
import ReceiptScannerScreen from '../screens/ReceiptScannerScreen';

const Stack = createNativeStackNavigator();

const ModalNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MileageTracker"
        component={MileageTrackerScreen}
        options={{ title: 'Mileage Tracker' }}
      />
      <Stack.Screen
        name="ReceiptScanner"
        component={ReceiptScannerScreen}
        options={{ title: 'Receipt Scanner' }}
      />
    </Stack.Navigator>
  );
};

export default ModalNavigator;
