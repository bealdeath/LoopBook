import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.card}>
        <MaterialCommunityIcons name="map-marker-distance" size={40} color="#007bff" />
        <Text style={styles.cardText}>Mileage Tracker</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.card}>
        <MaterialCommunityIcons name="receipt" size={40} color="#007bff" />
        <Text style={styles.cardText}>Receipt Scanner</Text>
      </TouchableOpacity>
    </View>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  card: {
    width: "80%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  cardText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});
