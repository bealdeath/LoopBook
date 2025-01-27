// File: src/screens/HomeScreen.tsx
import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store"; // Adjust path if needed
import { startPeriodicTracking, stopPeriodicTracking } from "../utils/locationService";

// Your base features
const baseFeatures = [
  { name: "Invoice", action: "InvoiceScreen" },
  { name: "Reports", action: "ReportsScreen" },
  { name: "AI Insights", action: "AiInsightsScreen" },
  { name: "Game Center", action: "GameCenterScreen" },
  { name: "Employee Onboarding", action: "EmployeeOnboarding" },
  { name: "Timesheet", action: "Timesheet" },
  { name: "Payroll", action: "Payroll" },
  { name: "Inventory", action: "Inventory" },
  { name: "Purchase Orders", action: "PurchaseOrder" },
  { name: "Sales", action: "Sales" },
  { name: "Spending Summary", action: "SummaryScreen" },
  { name: "Ledger", action: "LedgerScreen" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  // Access showLedger from settingsSlice
  const showLedger = useSelector((state: RootState) => state.settings.showLedger);

  // If showLedger is true, add "Ledger" tile
  const FEATURES = showLedger
    ? [...baseFeatures, { name: "Ledger", action: "LedgerScreen" }]
    : baseFeatures;

  function handleFeaturePress(action: string) {
    navigation.navigate(action as never);
  }

  function handleFabPress() {
    startPeriodicTracking();
    console.log("Periodic tracking started.");
  }

  function handleFabLongPress() {
    stopPeriodicTracking();
    console.log("Periodic tracking stopped.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LoopBook Home</Text>

      {/* Render features in a 2-column grid */}
      <FlatList
        data={FEATURES}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.featureButton}
            onPress={() => handleFeaturePress(item.action)}
          >
            <Text style={styles.featureText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* FAB for starting/stopping distance tracking */}
      <FAB
        icon="car"
        label="Start Tracking"
        style={styles.fab}
        onPress={handleFabPress}
        onLongPress={handleFabLongPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f6ff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#003366",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  featureButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#007bff",
    borderRadius: 10,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  featureText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#007bff",
  },
});
