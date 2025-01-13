// File: src/screens/SummaryScreen.tsx

import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

/**
 * Merges data from:
 * - receipts: total expenses
 * - trips: total distance & reimbursements
 * 
 * Could display a summary at a glance
 */
export default function SummaryScreen() {
  const receipts = useSelector((state: RootState) => state.receipts.data);
  const trips = useSelector((state: RootState) => state.trips.data);

  // total receipt amount
  const totalReceipt = useMemo(() => {
    return receipts.reduce((sum, r) => sum + r.amount, 0);
  }, [receipts]);

  // total trip distance & reimburse
  const { totalDistance, totalReimbursement } = useMemo(() => {
    let dist = 0;
    let reimburse = 0;
    for (const t of trips) {
      dist += t.distanceKm;
      reimburse += t.reimbursement;
    }
    return { totalDistance: dist, totalReimbursement: reimburse };
  }, [trips]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary / Insights</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Receipt Expenses</Text>
        <Text style={styles.cardValue}>${totalReceipt.toFixed(2)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Mileage</Text>
        <Text style={styles.cardValue}>{totalDistance.toFixed(2)} km</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mileage Reimbursement</Text>
        <Text style={styles.cardValue}>${totalReimbursement.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", marginBottom: 5 },
  cardValue: { fontSize: 20, color: "#007bff", fontWeight: "bold" },
});
