import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { updateSalesOrder } from "../redux/slices/salesSlice";
import { useRoute } from "@react-navigation/native";
import { v4 as uuidv4 } from "uuid";

export default function SalesDetailScreen() {
  const route = useRoute();
  const { orderId } = route.params;
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.sales.salesOrders || []);
  const order = orders.find((o) => o.id === orderId);

  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemRate, setNewItemRate] = useState("");

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Order Not Found</Text>
      </View>
    );
  }

  const handleAddItem = () => {
    if (!newItemDesc.trim() || !newItemRate) return;
    const newItem = {
      id: uuidv4(),
      description: newItemDesc,
      rate: parseFloat(newItemRate) || 0,
    };
    const updatedItems = [...order.items, newItem];
    const newTotal = order.total + newItem.rate;

    dispatch(
      updateSalesOrder({
        id: orderId,
        changes: { items: updatedItems, total: newTotal },
      })
    );
    setNewItemDesc("");
    setNewItemRate("");
  };

  const handleRemoveItem = (itemId) => {
    const updatedItems = order.items.filter((it) => it.id !== itemId);
    const itemRemoved = order.items.find((it) => it.id === itemId);
    const newTotal = order.total - (itemRemoved ? itemRemoved.rate : 0);

    dispatch(
      updateSalesOrder({
        id: orderId,
        changes: { items: updatedItems, total: newTotal },
      })
    );
  };

  const handleStatusChange = (status) => {
    dispatch(updateSalesOrder({ id: orderId, changes: { status } }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sales Detail</Text>
      <Text style={styles.subtitle}>
        Customer: {order.customerName} | Total: ${order.total.toFixed(2)}
      </Text>
      <Text>Status: {order.status}</Text>
      <View style={{ flexDirection: "row", marginVertical: 10 }}>
        {["Open", "Fulfilled", "Closed"].map((st) => (
          <TouchableOpacity
            key={st}
            style={[
              styles.statusBtn,
              order.status === st && { backgroundColor: "#007bff" },
            ]}
            onPress={() => handleStatusChange(st)}
          >
            <Text style={{ color: order.status === st ? "#fff" : "#007bff" }}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items */}
      <FlatList
        data={order.items}
        keyExtractor={(it) => it.id}
        style={{ marginTop: 10 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemDesc}>{item.description}</Text>
            <Text>${item.rate.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Text style={{ color: "#fff" }}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text>No items.</Text>}
      />

      <View style={{ marginTop: 20 }}>
        <TextInput
          style={styles.input}
          placeholder="New Item Description"
          value={newItemDesc}
          onChangeText={setNewItemDesc}
        />
        <TextInput
          style={styles.input}
          placeholder="Rate"
          keyboardType="numeric"
          value={newItemRate}
          onChangeText={setNewItemRate}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddItem}>
          <Text style={styles.addBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 16, marginBottom: 10, color: "#666" },
  statusBtn: {
    borderWidth: 1,
    borderColor: "#007bff",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  itemRow: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemDesc: { fontSize: 14, fontWeight: "600", color: "#333" },
  removeBtn: {
    backgroundColor: "#dc3545",
    padding: 5,
    borderRadius: 5,
    alignSelf: "center",
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
});
