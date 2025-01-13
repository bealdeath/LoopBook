import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

export default function DashboardScreen() {
  // Example widgets (replace with dynamic user data)
  const widgets = [
    { id: "1", name: "Expense Summary", description: "Track your monthly expenses" },
    { id: "2", name: "Receipt Overview", description: "View total scanned receipts" },
    { id: "3", name: "Recent Trips", description: "Check your trip logs" },
    { id: "4", name: "AI Recommendations", description: "Ask AI for tips" },
  ];

  const handleWidgetPress = (widgetName: string) => {
    // Could navigate to relevant screens
    console.log(`Widget pressed: ${widgetName}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Custom Dashboard</Text>
      {widgets.map((widget) => (
        <View key={widget.id} style={styles.widget}>
          <View style={{ flex: 1 }}>
            <Text style={styles.widgetTitle}>{widget.name}</Text>
            <Text style={styles.widgetDesc}>{widget.description}</Text>
          </View>
          <TouchableOpacity
            style={styles.widgetButton}
            onPress={() => handleWidgetPress(widget.name)}
          >
            <Text style={styles.widgetButtonText}>View</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", paddingTop: 20 },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  widget: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  widgetTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  widgetDesc: { fontSize: 14, color: "#777", marginTop: 4 },
  widgetButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  widgetButtonText: { color: "#fff", fontSize: 14 },
});
