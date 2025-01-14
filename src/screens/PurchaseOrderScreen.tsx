import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, Alert } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { createPurchaseOrder, removePurchaseOrder } from "../redux/slices/inventorySlice";
import { v4 as uuidv4 } from "uuid";

export default function PurchaseOrderScreen() {
  const dispatch = useDispatch();
  const inventory = useSelector((state) => state.inventory.items || []);
  const purchaseOrders = useSelector((state) => state.inventory.purchaseOrders || []);

  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");

  const [poStatus, setPoStatus] = useState("Open");

  const handleCreatePO = () => {
    if (!selectedItemId || !quantity) {
      Alert.alert("Error", "Select an item and quantity.");
      return;
    }

    const newPO = {
      id: uuidv4(),
      items: [{ inventoryId: selectedItemId, quantity: parseFloat(quantity) || 1 }],
      status: poStatus,
    };

    dispatch(createPurchaseOrder(newPO));
    setSelectedItemId("");
    setQuantity("");
    setPoStatus("Open");
  };

  const handleDeletePO = (id) => {
    dispatch(removePurchaseOrder(id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purchase Orders</Text>

      <Text style={styles.subtitle}>Select an Inventory Item:</Text>
      <FlatList
        data={inventory}
        horizontal
        keyExtractor={(item) => item.id}
        style={{ marginVertical: 10 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemBtn,
              item.id === selectedItemId && { backgroundColor: "#007bff" },
            ]}
            onPress={() => setSelectedItemId(item.id)}
          >
            <Text style={{ color: item.id === selectedItemId ? "#fff" : "#007bff" }}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No items available.</Text>}
      />

      <TextInput
        style={styles.input}
        placeholder="Quantity"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Text style={styles.subtitle}>Status:</Text>
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        {["Open", "Ordered", "Received"].map((st) => (
          <TouchableOpacity
            key={st}
            style={[
              styles.statusBtn,
              poStatus === st && { backgroundColor: "#28a745" },
            ]}
            onPress={() => setPoStatus(st)}
          >
            <Text style={{ color: poStatus === st ? "#fff" : "#28a745" }}>{st}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={handleCreatePO}>
        <Text style={styles.createBtnText}>Create Purchase Order</Text>
      </TouchableOpacity>

      <Text style={[styles.subtitle, { marginTop: 20 }]}>Existing Purchase Orders:</Text>
      <FlatList
        data={purchaseOrders}
        keyExtractor={(po) => po.id}
        renderItem={({ item }) => (
          <View style={styles.poItem}>
            <Text style={styles.poText}>ID: {item.id}</Text>
            <Text style={styles.poText}>Status: {item.status}</Text>
            {item.items.map((it, idx) => {
              const inv = inventory.find((invv) => invv.id === it.inventoryId);
              return (
                <Text key={idx} style={styles.poText}>
                  {inv ? inv.name : "??"} x {it.quantity}
                </Text>
              );
            })}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDeletePO(item.id)}
            >
              <Text style={{ color: "#fff" }}>Delete PO</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 10 }}>No purchase orders.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 5, fontWeight: "600" },
  itemBtn: {
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
  statusBtn: {
    borderWidth: 1,
    borderColor: "#28a745",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
  },
  createBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  createBtnText: { color: "#fff", fontWeight: "600" },
  poItem: {
    backgroundColor: "#f1f1f1",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  poText: { fontSize: 14, color: "#333" },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: "flex-start",
  },
});
