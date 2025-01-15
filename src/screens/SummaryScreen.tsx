// File: src/screens/SummaryScreen.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Receipt } from "../redux/slices/receiptSlice";

export default function SummaryScreen() {
  const { data: receipts } = useSelector((state: RootState) => state.receipts);

  // total
  const totalAmount = useMemo(() => {
    return receipts.reduce((sum, r) => sum + (r.amount || 0), 0);
  }, [receipts]);

  // total GST
  const totalGST = useMemo(() => {
    return receipts.reduce((sum, r) => sum + (r.gst || 0), 0);
  }, [receipts]);

  // categories
  const categories = useMemo(() => {
    const catMap: Record<string, number> = {};
    receipts.forEach((r) => {
      catMap[r.category] = (catMap[r.category] || 0) + r.amount;
    });
    return Object.entries(catMap).map(([cat, amt]) => ({ cat, amt }));
  }, [receipts]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary & Reports</Text>
      <Text>Total Receipts: ${totalAmount.toFixed(2)}</Text>
      <Text>Total GST: ${totalGST.toFixed(2)}</Text>

      <Text style={styles.subtitle}>By Category:</Text>
      {categories.map((c) => (
        <Text key={c.cat} style={styles.categoryLine}>
          {c.cat}: ${c.amt.toFixed(2)}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, marginTop: 20, marginBottom: 10 },
  categoryLine: { fontSize: 16, marginLeft: 10 },
});
