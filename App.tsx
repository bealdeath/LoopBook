// File: App.tsx

import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { Provider } from "react-redux";
import { DarkModeProvider, useDarkMode } from "./src/utils/DarkModeProvider";
import { store, persistor } from "./src/redux/store";
import { PersistGate } from "redux-persist/integration/react";
import AuthStack from "./src/navigation/AuthStack";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer theme={DefaultTheme}>
          <AuthStack />
        </NavigationContainer>
      </PersistGate>
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
