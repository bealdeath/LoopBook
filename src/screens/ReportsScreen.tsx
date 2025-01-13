kimport React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { LineChart } from "react-native-chart-kit";

export default function ReportsScreen() {
  const receipts = useSelector((state: RootState) => state.receipts.data);
  const expenses = useSelector((state: RootState) => state.expenses.data);

  // Basic P&L calculations
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const totalReceipts = receipts.reduce((acc, rec) => acc + rec.amount, 0);
  const netIncome = totalReceipts - totalExpenses;

  // Example monthly data (replace with real date-grouped values if you have them)
  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: () => "#007bff",
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Financial Reports</Text>
      <View style={styles.card}>
        <Text style={styles.label}>
          Total Expenses: ${totalExpenses.toFixed(2)}
        </Text>
        <Text style={styles.label}>
          Total Receipt Income: ${totalReceipts.toFixed(2)}
        </Text>
        <Text style={styles.label}>Net Income: ${netIncome.toFixed(2)}</Text>
      </View>

      <Text style={styles.subTitle}>Monthly Trend</Text>
      <LineChart
        data={chartData}
        width={Dimensions.get("window").width * 0.9}
        height={220}
        chartConfig={{
          backgroundGradientFrom: "#f5f5f5",
          backgroundGradientTo: "#f5f5f5",
          color: () => "#007bff",
          labelColor: () => "#333",
        }}
        style={styles.chart}
        bezier
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: { fontSize: 16, marginBottom: 5, color: "#555" },
  subTitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600",
    color: "#333",
  },
  chart: {
    alignSelf: "center",
    borderRadius: 10,
    marginBottom: 30,
  },
});

