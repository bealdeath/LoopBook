// File: src/screens/ReportsScreen.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
// Import your RootState from the same place as store
import { RootState } from "../redux/store";

export default function ReportsScreen() {
  // Access the receipt slice
  const receiptsState = useSelector((state: RootState) => state.receipts);
  const receipts = receiptsState.data || [];

  const totalReceipts = useMemo(() => {
    return receipts.reduce((acc, r) => acc + (r.amount || 0), 0);
  }, [receipts]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financial Reports</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          Total Receipts: ${totalReceipts.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  cardText: {
    fontSize: 18,
    color: "#333",
  },
});
