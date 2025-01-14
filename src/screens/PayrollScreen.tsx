import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { runPayroll } from "../redux/slices/employeeSlice";
import { v4 as uuidv4 } from "uuid";

export default function PayrollScreen() {
  const dispatch = useDispatch();
  const employees = useSelector((state) => state.employee.employees || []);
  const payrollHistory = useSelector((state) => state.employee.payroll || []);

  const [employeeId, setEmployeeId] = useState("");
  const [payPeriod, setPayPeriod] = useState("");
  const [totalPay, setTotalPay] = useState("");

  const handleRunPayroll = () => {
    if (!employeeId || !payPeriod || !totalPay) {
      Alert.alert("Error", "All fields are required.");
      return;
    }
    dispatch(
      runPayroll({
        id: uuidv4(),
        employeeId,
        payPeriod,
        totalPay: parseFloat(totalPay) || 0,
      })
    );
    setEmployeeId("");
    setPayPeriod("");
    setTotalPay("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payroll</Text>

      {/* Employee selection */}
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
        placeholder="Pay Period (e.g., 2023-09)"
        value={payPeriod}
        onChangeText={setPayPeriod}
      />
      <TextInput
        style={styles.input}
        placeholder="Total Pay"
        keyboardType="numeric"
        value={totalPay}
        onChangeText={setTotalPay}
      />

      <TouchableOpacity style={styles.runBtn} onPress={handleRunPayroll}>
        <Text style={styles.runBtnText}>Run Payroll</Text>
      </TouchableOpacity>

      <Text style={{ marginTop: 20, fontWeight: "bold", fontSize: 16 }}>Payroll History</Text>
      <FlatList
        data={payrollHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.payItem}>
            <Text>
              Employee: {employees.find((e) => e.id === item.employeeId)?.name || "Unknown"}
            </Text>
            <Text>Pay Period: {item.payPeriod}</Text>
            <Text>Amount: ${item.totalPay}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 10 }}>No payroll records.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
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
  runBtn: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  runBtnText: { color: "#fff", fontWeight: "600" },
  payItem: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
});
