import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { addSalesOrder, removeSalesOrder } from "../redux/slices/salesSlice";
import { v4 as uuidv4 } from "uuid";
import { useNavigation } from "@react-navigation/native";

export default function SalesScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const salesOrders = useSelector((state) => state.sales.salesOrders || []);

  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");

  const handleAddSalesOrder = () => {
    if (!customerName.trim() || !amount) {
      Alert.alert("Error", "Customer name and amount required.");
      return;
    }
    const order = {
      id: uuidv4(),
      customerName,
      total: parseFloat(amount),
      items: [],
      status: "Open",
    };
    dispatch(addSalesOrder(order));
    setCustomerName("");
    setAmount("");
  };

  const handleRemoveOrder = (id) => {
    dispatch(removeSalesOrder(id));
  };

  const goToDetail = (id) => {
    navigation.navigate("SalesDetail", { orderId: id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Orders</Text>

      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={setCustomerName}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.addBtn} onPress={handleAddSalesOrder}>
        <Text style={styles.addBtnText}>Add Sales Order</Text>
      </TouchableOpacity>

      <FlatList
        data={salesOrders}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderItem}
            onPress={() => goToDetail(item.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.custName}>{item.customerName}</Text>
              <Text>Total: ${item.total}</Text>
              <Text>Status: {item.status}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemoveOrder(item.id)}
            >
              <Text style={{ color: "#fff" }}>X</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No sales orders yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
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
  orderItem: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
  },
  custName: { fontSize: 16, fontWeight: "600" },
  removeBtn: {
    backgroundColor: "#dc3545",
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
    alignSelf: "center",
  },
});
