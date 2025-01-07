// File: src/screens/SignInScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "../utils/firebaseConfig";

export default function SignInScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        // user is logged in, go to main tabs
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      }
    });
    return unsub;
  }, []);

  async function handleSignIn() {
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      Alert.alert("Success", "You are now logged in!");
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Unknown error");
    }
  }

  function goToSignUp() {
    navigation.navigate("SignUp");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LoopBook Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSignIn}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToSignUp}>
        <Text style={styles.link}>No account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}

// Style
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  input: {
    backgroundColor: "#f2f2f2",
    marginBottom: 15,
    padding: 10,
    borderRadius: 8,
  },
  btn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
  link: { color: "#007bff", textAlign: "center" },
});
