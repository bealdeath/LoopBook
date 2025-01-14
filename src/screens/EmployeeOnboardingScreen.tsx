import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addEmployee, removeEmployee } from "../redux/slices/employeeSlice";
import { v4 as uuidv4 } from "uuid";

export default function EmployeeOnboardingScreen() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employee.employees || []);

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Employee name is required.");
      return;
    }
    const newEmp = {
      id: uuidv4(),
      name,
      position,
    };
    dispatch(addEmployee(newEmp));
    setName("");
    setPosition("");
  };

  const handleDelete = (id) => {
    dispatch(removeEmployee(id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Onboarding</Text>

      <TextInput
        style={styles.input}
        placeholder="Employee Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Position/Role"
        value={position}
        onChangeText={setPosition}
      />

      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addBtnText}>Add Employee</Text>
      </TouchableOpacity>

      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.empItem}>
            <Text style={styles.empName}>{item.name}</Text>
            <Text style={styles.empPos}>{item.position || "N/A"}</Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={{ color: "#fff" }}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No employees yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 15 },
  input: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "600" },
  empItem: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  empName: { fontSize: 16, fontWeight: "600", color: "#333" },
  empPos: { fontSize: 14, color: "#666", marginVertical: 4 },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  emptyText: { textAlign: "center", marginTop: 40, color: "#999" },
});
