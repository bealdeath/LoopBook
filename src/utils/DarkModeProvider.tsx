import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type DarkModeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = ({ children }: any) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("darkMode").then((value) => {
      if (value !== null) setIsDarkMode(value === "true");
    });
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      AsyncStorage.setItem("darkMode", (!prevMode).toString());
      return !prevMode;
    });
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
