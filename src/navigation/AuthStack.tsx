// File: src/navigation/AuthStack.tsx

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../screens/SignInScreen";
import SignUpScreen from "../screens/SignUpScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
        options={{ title: "Sign In" }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
        options={{ title: "Create Account" }}
      />
    </Stack.Navigator>
  );
}
