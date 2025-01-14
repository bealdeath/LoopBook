// File: App.js

import "react-native-gesture-handler"; // Must be at top for gesture handling
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./src/redux/store";
import AuthStack from "./src/navigation/AuthStack";
import { ActivityIndicator, StyleSheet } from "react-native";

// Import your DarkModeProvider & hook
import { DarkModeProvider, useDarkMode } from "./src/utils/DarkModeProvider";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<ActivityIndicator size="large" color="#007bff" />} persistor={persistor}>
          <DarkModeProvider>
            <AppNavigator />
          </DarkModeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

/**
 * A separate component to use the isDarkMode hook from DarkModeProvider
 * and provide it to NavigationContainer's theme prop
 */
function AppNavigator() {
  const { isDarkMode } = useDarkMode();

  // We'll create a custom LightTheme for a professional blue color scheme
  const MyLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: "#007bff",
      background: "#f5f9fc", // subtle light-blue background
      card: "#ffffff",
      text: "#333333",
      border: "#cccccc",
    },
  };

  // DarkTheme can be customized as well
  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: "#3399ff",
      background: "#121212",
      card: "#1f1f1f",
      text: "#ffffff",
      border: "#303030",
    },
  };

  return (
    <NavigationContainer theme={isDarkMode ? MyDarkTheme : MyLightTheme}>
      <AuthStack />
    </NavigationContainer>
  );
}
