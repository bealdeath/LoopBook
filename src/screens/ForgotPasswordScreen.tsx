// File: src/screens/ForgotPasswordScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { firebaseAuth } from "../utils/firebaseConfig";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  async function handleForgotPassword() {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      Alert.alert(
        "Success",
        "A password reset email has been sent. Please check your inbox."
      );
      navigation.navigate("SignIn");
    } catch (err: any) {
      Alert.alert("Error", err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.titleDark]}>
        Forgot Password
      </Text>

      <TextInput
        style={[styles.input, isDarkMode && styles.inputDark]}
        placeholder="Email Address"
        placeholderTextColor={isDarkMode ? "#bbb" : "#555"}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity
          style={[styles.btn, isDarkMode && styles.btnDark]}
          onPress={handleForgotPassword}
        >
          <Text style={styles.btnText}>Reset Password</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.link, isDarkMode && styles.linkDark]}>
          Back to Sign In
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f9f9f9" },
  containerDark: { backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center", color: "#333" },
  titleDark: { color: "#fff" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: "#000",
  },
  inputDark: {
    backgroundColor: "#1e1e1e",
    borderColor: "#444",
    color: "#fff",
  },
  btn: { backgroundColor: "#007bff", padding: 15, borderRadius: 5 },
  btnDark: { backgroundColor: "#3a3a3a" },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  link: { color: "#007bff", textAlign: "center", marginTop: 10 },
  linkDark: { color: "#90caf9" },
});
