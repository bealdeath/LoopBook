// File: src/screens/TripHistoryScreen.tsx

import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function TripHistoryScreen() {
  const trips = useSelector((state: RootState) => state.trips.data);

  function renderTripItem({ item }: any) {
    return (
      <TouchableOpacity style={styles.tripItem}>
        <Text style={styles.tripText}>
          Date: {item.startTime?.slice(0, 10)} 
          {"\n"}Distance: {item.distanceKm.toFixed(2)} km
          {"\n"}Classification: {item.classification}
          {"\n"}Reimbursement: ${item.reimbursement.toFixed(2)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trip History</Text>
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
