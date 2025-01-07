// File: src/screens/HomeScreen.tsx

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const navigation = useNavigation();

  function goToReceipts() {
    navigation.navigate("ReceiptTracker" as never);
  }
  function goToTripHistory() {
    navigation.navigate("TripHistory" as never);
  }
  function goToMileage() {
    navigation.navigate("MileageTracker" as never);
  }
  function goToReceiptEditor() {
    navigation.navigate("ReceiptEditor" as never);
  }
  function goToSummaryExport() {
    navigation.navigate("SummaryExport" as never);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LoopBook Home</Text>
      <TouchableOpacity style={styles.btn} onPress={goToReceipts}>
        <Text style={styles.btnText}>Scan Receipts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={goToTripHistory}>
        <Text style={styles.btnText}>Trip History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={goToMileage}>
        <Text style={styles.btnText}>Mileage Tracker</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={goToReceiptEditor}>
        <Text style={styles.btnText}>Multi-Page Receipt Editor</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btn} onPress={goToSummaryExport}>
        <Text style={styles.btnText}>Summary & PDF Export</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30, textAlign: "center" },
  btn: {
    backgroundColor: "#007bff",
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
