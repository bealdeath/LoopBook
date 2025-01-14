// File: src/screens/TimeTrackingScreen.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { startLog, stopLog, TimeLog } from "../redux/slices/timeSlice";
import { v4 as uuidv4 } from "uuid";
import { useNavigation } from "@react-navigation/native";

export default function TimeTrackingScreen() {
  const dispatch = useDispatch();
  const logs = useSelector((state: RootState) => state.time.data);
  const [notes, setNotes] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  function handleStart() {
    const newLog: TimeLog = {
      id: uuidv4(),
      startTime: new Date().toISOString(),
      notes,
      projectId: selectedProjectId || undefined,
    };
    dispatch(startLog(newLog));
    setNotes("");
    Alert.alert("Started", "Time log started.");
  }

  function handleStop(logId: string) {
    dispatch(stopLog({ id: logId, endTime: new Date().toISOString() }));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time Tracking</Text>

      {/* Link to project (optional) */}
      <TextInput
        style={styles.input}
        placeholder="Optional notes..."
        value={notes}
        onChangeText={setNotes}
      />

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Start New Log</Text>
      </TouchableOpacity>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => {
          const isActive = !item.endTime;
          return (
            <View style={styles.logItem}>
              <Text style={styles.logText}>
                {item.notes || "No Notes"} | Start: {new Date(item.startTime).toLocaleString()}
              </Text>
              {isActive ? (
                <TouchableOpacity style={styles.stopBtn} onPress={() => handleStop(item.id)}>
                  <Text style={{ color: "#fff" }}>Stop</Text>
                </TouchableOpacity>
              ) : (
                <Text>End: {new Date(item.endTime!).toLocaleString()}</Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  logItem: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  logText: { fontSize: 14 },
  stopBtn: {
    backgroundColor: "#dc3545",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    width: 70,
    alignItems: "center",
  },
});
