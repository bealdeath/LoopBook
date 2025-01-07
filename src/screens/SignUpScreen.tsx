// File: src/screens/SignUpScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firebaseAuth, db } from "../utils/firebaseConfig";

export default function SignUpScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  async function handleSignUp() {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter email and password.");
      return;
    }
    if (password !== confirmPass) {
      Alert.alert("Passwords Differ", "Your passwords do not match.");
      return;
    }
    try {
      // 1) create user in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const { uid } = userCred.user;

      // 2) optionally store a "profile" in Firestore
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, {
        email,
        displayName,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Account Created", "You can now log in.");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Sign Up Failed", err.message || "Unknown error");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a LoopBook Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Display Name (Optional)"
        value={displayName}
        onChangeText={setDisplayName}
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
        value={confirmPass}
        onChangeText={setConfirmPass}
      />

      <TouchableOpacity style={styles.btn} onPress={handleSignUp}>
        <Text style={styles.btnText}>Sign Up</Text>
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
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
