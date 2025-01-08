// File: App.tsx

import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { Provider } from "react-redux";
import { DarkModeProvider, useDarkMode } from "./src/utils/DarkModeProvider";
import { store } from "./src/redux/store";

import AuthStack from "./src/navigation/AuthStack";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";

const App = () => {
  return (
    <Provider store={store}>
      <DarkModeProvider>
        <Navigation />
      </DarkModeProvider>
    </Provider>
  );
};

const Navigation = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
      <AuthStack />
    </NavigationContainer>
  );
};

export default App;
