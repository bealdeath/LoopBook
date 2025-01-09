// File: src/screens/ExportScreen.tsx
import React from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { useSelector } from "react-redux";
import { ExportService } from "../utils/ExportService";
import { RootState } from "../redux/store";

export default function ExportScreen() {
  const receipts = useSelector((state: RootState) => state.receipts?.data || []);
  const trips = useSelector((state: RootState) => state.trips?.data || []);

  async function handleExportReceipts() {
    if (!receipts.length) {
      console.warn("No receipts available to export.");
      return;
    }
    await ExportService.exportToCSV(receipts);
  }

  async function handleExportMonthlySummary() {
    if (!receipts.length && !trips.length) {
      console.warn("No data available to export.");
      return;
    }
    await ExportService.exportMonthlySummary(trips, receipts);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Export Options</Text>
      <Button title="Export Receipts" onPress={handleExportReceipts} />
      <Button title="Export Monthly Summary" onPress={handleExportMonthlySummary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
