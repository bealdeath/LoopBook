// File: src/screens/SignUpScreen.js

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { firebaseAuth } from "../utils/firebaseConfig";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW: optional GST number
  const [gstNumber, setGstNumber] = useState("");

  async function handleSignUp() {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "All fields (email, password, confirm) are required.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const user = userCred.user;

      await sendEmailVerification(user);

      // Optional: store the GST in Firestore or your DB
      // e.g. using Firestore: setDoc(doc(db, "users", user.uid), { gstNumber });
      // For now, we just alert
      if (gstNumber.trim()) {
        console.log("Storing GST number:", gstNumber);
      }

      Alert.alert(
        "Account Created",
        "A verification email has been sent. Please verify your email."
      );

      navigation.navigate("SignIn");
    } catch (err) {
      Alert.alert("Sign Up Failed", err.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create an Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Optional GST field */}
      <TextInput
        style={styles.input}
        placeholder="GST Number (optional)"
        value={gstNumber}
        onChangeText={setGstNumber}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
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
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 5, marginBottom: 20 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  link: { color: "#007bff", textAlign: "center", marginTop: 10 },
});
