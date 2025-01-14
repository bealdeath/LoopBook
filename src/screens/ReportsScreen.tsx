// File: src/screens/ReportsScreen.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer"; // import your root state type

export default function ReportsScreen() {
  // Access the receipt slice
  const receiptsState = useSelector((state: RootState) => state.receipts);
  const receipts = receiptsState.data || []; // data is an array

  // If you have an expense slice named "expenses", do similarly
  // const expensesState = useSelector((state: RootState) => state.expenses);
  // const expenses = expensesState?.data || [];

  const totalReceipts = useMemo(() => {
    return receipts.reduce((acc, r) => acc + (r.amount || 0), 0);
  }, [receipts]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Financial Reports</Text>
      <View style={styles.card}>
        <Text>Total Receipts: ${totalReceipts.toFixed(2)}</Text>
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
});
