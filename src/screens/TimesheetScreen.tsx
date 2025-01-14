import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addTimesheetEntry, removeTimesheetEntry } from "../redux/slices/employeeSlice";
import { v4 as uuidv4 } from "uuid";

export default function TimesheetScreen() {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employee.employees || []);
  const timesheets = useSelector((state) => state.employee.timesheets || {});

  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState("");
  const [hours, setHours] = useState("");

  const handleAddTimesheet = () => {
    if (!employeeId || !date || !hours) {
      Alert.alert("Error", "All fields required.");
      return;
    }
    const entry = {
      id: uuidv4(),
      date,
      hours: parseFloat(hours) || 0,
    };
    dispatch(addTimesheetEntry({ employeeId, entry }));
    setDate("");
    setHours("");
  };

  const handleDeleteEntry = (empId, entryId) => {
    dispatch(removeTimesheetEntry({ employeeId: empId, entryId }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Timesheets</Text>

      {/* Employee dropdown or input */}
      <Text>Pick an Employee:</Text>
      <FlatList
        data={employees}
        horizontal
        keyExtractor={(item) => item.id}
        style={{ marginVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.empBtn,
              item.id === employeeId && { backgroundColor: "#007bff" },
            ]}
            onPress={() => setEmployeeId(item.id)}
          >
            <Text style={{ color: item.id === employeeId ? "#fff" : "#007bff" }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No employees yet.</Text>}
      />

      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Hours"
        keyboardType="numeric"
        value={hours}
        onChangeText={setHours}
      />

      <TouchableOpacity style={styles.addBtn} onPress={handleAddTimesheet}>
        <Text style={styles.addBtnText}>Add Timesheet Entry</Text>
      </TouchableOpacity>

      {employeeId ? (
        <FlatList
          data={timesheets[employeeId] || []}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 20 }}
          renderItem={({ item }) => (
            <View style={styles.entryItem}>
              <Text style={styles.entryText}>
                {item.date} - {item.hours} hrs
              </Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteEntry(employeeId, item.id)}
              >
                <Text style={{ color: "#fff" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text>No timesheet entries for this employee.</Text>}
        />
      ) : (
        <Text style={{ marginTop: 30, fontStyle: "italic" }}>
          Select an employee to view timesheet entries.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  empBtn: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
  entryItem: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  entryText: { fontSize: 14, color: "#333" },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 5,
  },
});

