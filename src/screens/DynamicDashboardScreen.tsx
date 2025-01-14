// File: src/screens/DynamicDashboardScreen.js

import React, { useState, useCallback } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

const initialWidgets = [
  {
    id: "1",
    title: "Time Tracking",
    description: "View or track billable hours",
    hidden: false,
  },
  {
    id: "2",
    title: "Receipts Summary",
    description: "Quick stats on scanned receipts",
    hidden: false,
  },
  {
    id: "3",
    title: "Project Overview",
    description: "Active projects, tasks, deadlines",
    hidden: false,
  },
  {
    id: "4",
    title: "Invoice Reminders",
    description: "Upcoming or overdue invoices",
    hidden: false,
  },
];

export default function DynamicDashboardScreen() {
  const [widgets, setWidgets] = useState(initialWidgets);

  const toggleHidden = useCallback((id) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, hidden: !w.hidden } : w))
    );
  }, []);

  const handleDragEnd = useCallback(({ data }) => {
    setWidgets(data);
  }, []);

  const renderItem = useCallback(({ item, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={[
          styles.widgetContainer,
          isActive && { backgroundColor: "#e2edff" },
          item.hidden && { opacity: 0.4 },
        ]}
        onLongPress={drag}
        activeOpacity={0.9}
      >
        <Text style={styles.widgetTitle}>{item.title}</Text>
        {!item.hidden && <Text style={styles.widgetDesc}>{item.description}</Text>}
        <TouchableOpacity
          style={[
            styles.hideBtn,
            { backgroundColor: item.hidden ? "#007bff" : "#dc3545" },
          ]}
          onPress={() => toggleHidden(item.id)}
        >
          <Text style={styles.hideBtnText}>{item.hidden ? "Show" : "Hide"}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [toggleHidden]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reorderable Dashboard</Text>
      <DraggableFlatList
        data={widgets}
        keyExtractor={(item) => item.id}
        onDragEnd={handleDragEnd}
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f6ff" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#003366",
  },
  widgetContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    elevation: 2,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  widgetDesc: {
    fontSize: 14,
    color: "#777",
    marginBottom: 8,
  },
  hideBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  hideBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
