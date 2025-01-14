// File: src/screens/SettingsScreen.js

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Switch, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useDarkMode } from "../utils/DarkModeProvider";
// If you store user data in Redux or Firestore, import that logic here

export function SettingsScreen() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [gstNumber, setGstNumber] = useState(""); // fetch from DB or Redux if stored
  const [tempGst, setTempGst] = useState("");

  useEffect(() => {
    // Suppose you fetch from Firestore or Redux:
    // setGstNumber(reduxUser.gstNumber || "");
    setGstNumber("");
    setTempGst("");
  }, []);

  const handleSaveGst = () => {
    // Save gstNumber to DB
    console.log("Saving GST:", tempGst);
    setGstNumber(tempGst);
    Alert.alert("GST updated", "Your GST number has been saved.");
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: "#1f1f1f" }]}>
      <Text style={[styles.label, isDarkMode && { color: "#fff" }]}>Dark Mode</Text>
      <Switch value={isDarkMode} onValueChange={toggleDarkMode} />

      <View style={{ marginTop: 30 }}>
        <Text style={[styles.label, isDarkMode && { color: "#fff" }]}>GST Number</Text>
        <TextInput
          style={[styles.input, isDarkMode && { backgroundColor: "#333", color: "#fff" }]}
          value={tempGst}
          onChangeText={setTempGst}
          placeholder={gstNumber || "Enter GST number..."}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGst}>
          <Text style={styles.saveBtnText}>Save GST</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600" },
});
