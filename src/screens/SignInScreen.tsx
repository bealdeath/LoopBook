// File: src/screens/SignInScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { firebaseAuth } from "../utils/firebaseConfig";

export default function SignInScreen({ navigation }: any) {
  const [identifier, setIdentifier] = useState(""); // Email or Phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, (user) => {
      if (user && user.emailVerified) {
        navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      }
    });
    return unsub;
  }, []);

  async function handleSignIn() {
    if (!identifier || !password) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(firebaseAuth, identifier, password);
      const user = userCred.user;

      if (!user.emailVerified) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in.",
          [
            {
              text: "Resend Email",
              onPress: async () => {
                await sendEmailVerification(user);
                Alert.alert("Verification Email Sent", "Check your inbox.");
              },
            },
          ]
        );
        return;
      }

      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  function goToSignUp() {
    navigation.navigate("SignUp");
  }

  function goToForgotPassword() {
    navigation.navigate("ForgotPassword");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email or Phone"
        placeholderTextColor="#888" // Set visible placeholder color
        autoCapitalize="none"
        keyboardType="email-address"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888" // Set visible placeholder color
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.row}>
        <Switch value={rememberMe} onValueChange={setRememberMe} />
        <Text style={styles.rememberMeText}>Remember me</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#28a745" />
      ) : (
        <TouchableOpacity style={styles.btn} onPress={handleSignIn}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={goToSignUp}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={goToForgotPassword}>
        <Text style={styles.link}>Forgot Password?</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f9f9f9" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: "#333",
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  rememberMeText: { marginLeft: 10, color: "#555" },
  btn: { backgroundColor: "#28a745", padding: 15, borderRadius: 5 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  link: { color: "#28a745", textAlign: "center", marginTop: 10 },
});
