// File: src/screens/HomeScreen.tsx

import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { startAutomaticTripDetection, stopAutomaticTripDetection } from "../utils/locationService";

const FEATURES = [
  { name: "Scan Receipts", action: "ReceiptTracker" },
  { name: "Trip History", action: "TripHistory" },
  { name: "Mileage Tracker", action: "MileageTracker" },
  { name: "Edit Receipts", action: "ReceiptEditor" },
  { name: "Export Data", action: "Export" },
];

export default function HomeScreen() {
  const navigation = useNavigation();

  function handleFeaturePress(action: string) {
    navigation.navigate(action as never);
  }

  function handleFabPress() {
    startAutomaticTripDetection();
    console.log("Trip detection started.");
  }

  function handleFabLongPress() {
    stopAutomaticTripDetection();
    console.log("Trip detection stopped.");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LoopBook Home</Text>
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
      <FAB
        icon="car"
        label="Trip Detection"
        style={styles.fab}
        onPress={handleFabPress}
        onLongPress={handleFabLongPress} // Stop trip detection on long press
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  row: { justifyContent: "space-between", marginBottom: 15 },
  featureButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#007bff",
    borderRadius: 10,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  featureText: { color: "#fff", fontSize: 14, textAlign: "center" },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "#007bff",
  },
});

