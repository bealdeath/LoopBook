import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";

// Example "mini-tasks" for gamification
const MINI_TASKS = [
  { id: "1", title: "Add a new expense" },
  { id: "2", title: "Scan a new receipt" },
  { id: "3", title: "Review trip mileage" },
];

export default function GameCenterScreen() {
  const [points, setPoints] = useState(0);

  const addPoints = (amount: number) => {
    setPoints((prev) => prev + amount);
    Alert.alert("Congrats!", `You earned ${amount} points!`);
  };

  const handleTaskComplete = (taskId: string) => {
    // In production, you’d mark tasks as complete in Redux or a backend
    addPoints(10);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gamification Center</Text>
      <Text style={styles.subtitle}>Your Points: {points}</Text>

      <FlatList
        data={MINI_TASKS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.miniTask}
            onPress={() => handleTaskComplete(item.id)}
          >
            <Text style={styles.taskText}>{item.title}</Text>
            <Text style={styles.pointsText}>+10 pts</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.resetBtn}
        onPress={() => setPoints(0)}
      >
        <Text style={styles.resetBtnText}>Reset Points</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  subtitle: { fontSize: 18, marginBottom: 20, textAlign: "center", color: "#555" },
  miniTask: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  taskText: { fontSize: 16, color: "#333" },
  pointsText: { fontSize: 16, color: "#28a745", fontWeight: "600" },
  resetBtn: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
  },
  resetBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
