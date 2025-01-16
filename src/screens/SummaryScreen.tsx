// File: src/screens/SummaryScreen.tsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Receipt } from "../redux/slices/receiptSlice";
import { format } from "date-fns";

// If you want a pie chart, install react-native-chart-kit & react-native-svg:
//   npm install react-native-chart-kit react-native-svg
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function SummaryScreen() {
  const { data: receipts } = useSelector((state: RootState) => state.receipts);

  // 1) Group by month-year
  const monthlyGroups = useMemo(() => {
    const groups: Record<string, Receipt[]> = {};
    receipts.forEach((r) => {
      if (r.purchaseDateISO) {
        const d = new Date(r.purchaseDateISO);
        if (!isNaN(d.getTime())) {
          const key = format(d, "yyyy-MM"); // e.g. 2025-01
          if (!groups[key]) groups[key] = [];
          groups[key].push(r);
        } else {
          if (!groups["Unknown"]) groups["Unknown"] = [];
          groups["Unknown"].push(r);
        }
      } else {
        if (!groups["Unknown"]) groups["Unknown"] = [];
        groups["Unknown"].push(r);
      }
    });
    return groups;
  }, [receipts]);

  // Convert to array of { period, total, hst, count }
  const monthlySummary = useMemo(() => {
    const result: { period: string; total: number; hst: number; count: number }[] = [];
    for (const [period, recs] of Object.entries(monthlyGroups)) {
      let total = 0;
      let hst = 0;
      recs.forEach((r) => {
        total += r.amount;
        hst += (r.hst || 0);
      });
      result.push({ period, total, hst, count: recs.length });
    }
    // Sort descending by period if you like
    result.sort((a, b) => (a.period > b.period ? -1 : 1));
    return result;
  }, [monthlyGroups]);

  // 2) Group by category
  const categoryMap = useMemo(() => {
    const catMap: Record<string, { total: number; hst: number; count: number }> = {};
    receipts.forEach((r) => {
      const cat = r.category || "Other";
      if (!catMap[cat]) {
        catMap[cat] = { total: 0, hst: 0, count: 0 };
      }
      catMap[cat].total += r.amount;
      catMap[cat].hst += (r.hst || 0);
      catMap[cat].count++;
    });
    return catMap;
  }, [receipts]);

  const categorySummary = Object.entries(categoryMap)
    .map(([cat, data]) => ({
      cat,
      total: data.total,
      hst: data.hst,
      count: data.count,
    }))
    .sort((a, b) => b.total - a.total);

  // Optional: Pie chart data for categories
  const pieData = categorySummary.map((item, index) => ({
    name: item.cat,
    amount: item.total,
    color: pickColor(index),
    legendFontColor: "#333",
    legendFontSize: 12,
  }));

  function pickColor(index: number) {
    // some basic color palette
    const colors = ["#007bff", "#28a745", "#ff9800", "#f44336", "#9c27b0", "#03a9f4"];
    return colors[index % colors.length];
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Summary of Expenses</Text>

      {/* Section 1: Monthly summary */}
      <Text style={styles.subHeader}>By Month-Year</Text>
      {monthlySummary.length === 0 ? (
        <Text>No receipts found.</Text>
      ) : (
        monthlySummary.map((ms) => (
          <View style={styles.row} key={ms.period}>
            <Text style={styles.periodText}>{ms.period}</Text>
            <Text style={styles.amountText}>Count: {ms.count}</Text>
            <Text style={styles.amountText}>Total: ${ms.total.toFixed(2)}</Text>
            <Text style={styles.amountText}>HST: ${ms.hst.toFixed(2)}</Text>
          </View>
        ))
      )}

      {/* Section 2: Category summary */}
      <Text style={styles.subHeader}>By Category</Text>
      {categorySummary.map((c) => (
        <View style={styles.row} key={c.cat}>
          <Text style={styles.periodText}>{c.cat}</Text>
          <Text style={styles.amountText}>Count: {c.count}</Text>
          <Text style={styles.amountText}>Total: ${c.total.toFixed(2)}</Text>
          <Text style={styles.amountText}>HST: ${c.hst.toFixed(2)}</Text>
        </View>
      ))}

      {/* Optional Pie Chart */}
      {pieData.length > 0 && (
        <>
          <Text style={styles.subHeader}>Category Pie Chart</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 40}   // chart width
            height={220}
            chartConfig={{
              color: () => "#fff",
              labelColor: () => "#333",
            }}
            accessor={"amount"}
            backgroundColor={"transparent"}
            paddingLeft={"20"}
            absolute
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  subHeader: { fontSize: 18, fontWeight: "600", marginTop: 20, marginBottom: 10 },
  row: {
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  periodText: { fontSize: 16, fontWeight: "600", color: "#333" },
  amountText: { fontSize: 14, color: "#555", marginLeft: 5 },
});

