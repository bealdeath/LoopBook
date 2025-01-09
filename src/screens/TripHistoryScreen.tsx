kimport React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { VictoryBar, VictoryChart, VictoryTheme } from "victory-native"; // For charts

export default function TripHistoryScreen() {
  const trips = useSelector((state: RootState) => state.trips.data);

  const monthlyData = trips.reduce((acc, trip) => {
    const month = trip.startTime.slice(0, 7); // "YYYY-MM"
    if (!acc[month]) acc[month] = { month, totalDistance: 0 };
    acc[month].totalDistance += trip.distanceKm;
    return acc;
  }, {});

  function renderTripItem({ item }: any) {
    return (
      <TouchableOpacity style={styles.tripItem}>
        <Text style={styles.tripText}>
          Date: {item.startTime?.slice(0, 10)}
          {"\n"}Distance: {item.distanceKm.toFixed(2)} km
          {"\n"}Classification: {item.classification}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip History</Text>
      <VictoryChart theme={VictoryTheme.material} domainPadding={{ x: 20 }}>
        <VictoryBar
          data={Object.values(monthlyData)}
          x="month"
          y="totalDistance"
          style={{ data: { fill: "#007bff" } }}
        />
      </VictoryChart>
      <FlatList
        data={trips}
        keyExtractor={(t) => t.id}
        renderItem={renderTripItem}
        ListEmptyComponent={<Text>No trips yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  tripItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  tripText: { fontSize: 16, color: "#333" },
});

