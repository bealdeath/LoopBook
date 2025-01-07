import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";

const SpendingGraphScreen = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const storedData = await AsyncStorage.getItem("transactions");
      const transactions = storedData ? JSON.parse(storedData) : [];

      const categories = ["Food", "Travel", "Shopping", "Other"];
      const totals = categories.map((category) =>
        transactions
          .filter((transaction) => transaction.category === category)
          .reduce((sum, transaction) => sum + transaction.amount, 0)
      );

      setData({ labels: categories, datasets: [{ data: totals }] });
    };

    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Spending by Category</Text>
      {data.labels ? (
        <BarChart
          data={data}
          width={Dimensions.get("window").width - 30}
          height={220}
          chartConfig={{
            backgroundColor: "#007bff",
            backgroundGradientFrom: "#007bff",
            backgroundGradientTo: "#80c4ff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.noDataText}>No data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  chart: {
    borderRadius: 10,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});

export default SpendingGraphScreen;

