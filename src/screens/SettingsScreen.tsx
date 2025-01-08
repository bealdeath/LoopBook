// File: src/screens/SettingsScreen.tsx

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDarkMode } from "../utils/DarkModeProvider";
import { firebaseAuth } from "../utils/firebaseConfig";

export const SettingsScreen = ({ navigation }: any) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  function handleLogout() {
    firebaseAuth.signOut().then(() => {
      Alert.alert("Logged Out", "You have been logged out.");
      navigation.reset({ index: 0, routes: [{ name: "SignIn" }] });
    });
  }

  return (
    <View style={[styles.container, isDarkMode && styles.containerDark]}>
      <Text style={[styles.title, isDarkMode && styles.textDark]}>Settings</Text>

      <View style={styles.toggleRow}>
        <Text style={[styles.toggleLabel, isDarkMode && styles.textDark]}>Enable Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View>

      <TouchableOpacity style={[styles.logoutButton, isDarkMode && styles.logoutButtonDark]} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#fff" },
  containerDark: { backgroundColor: "#121212" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  textDark: { color: "#fff" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  toggleLabel: { fontSize: 18 },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff5252",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  logoutButtonDark: { backgroundColor: "#d32f2f" },
  logoutText: { marginLeft: 10, color: "#fff", fontSize: 16 },
});
