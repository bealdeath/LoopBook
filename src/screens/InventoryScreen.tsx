import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { addInventoryItem, removeInventoryItem, updateInventoryItem } from "../redux/slices/inventorySlice";
import { v4 as uuidv4 } from "uuid";

export default function InventoryScreen() {
  const dispatch = useDispatch();
  const inventory = useSelector((state) => state.inventory.items || []);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reorderLevel, setReorderLevel] = useState("");

  const handleAdd = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Item name is required.");
      return;
    }
    const item = {
      id: uuidv4(),
      name,
      quantity: parseFloat(quantity) || 0,
      reorderLevel: parseFloat(reorderLevel) || 0,
    };
    dispatch(addInventoryItem(item));
    setName("");
    setQuantity("");
    setReorderLevel("");
  };

  const handleUpdateQty = (id, newQty) => {
    dispatch(updateInventoryItem({ id, changes: { quantity: newQty } }));
  };

  const handleDelete = (id) => {
    dispatch(removeInventoryItem(id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory</Text>

      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Quantity"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />
      <TextInput
        style={styles.input}
        placeholder="Reorder Level"
        keyboardType="numeric"
        value={reorderLevel}
        onChangeText={setReorderLevel}
      />

      <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
        <Text style={styles.addBtnText}>Add Item</Text>
      </TouchableOpacity>

      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        style={{ marginTop: 20 }}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            <Text style={styles.itemReorder}>Reorder @ {item.reorderLevel}</Text>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() => handleUpdateQty(item.id, item.quantity + 1)}
              >
                <Text style={{ color: "#fff" }}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.adjustBtn}
                onPress={() =>
                  handleUpdateQty(item.id, Math.max(0, item.quantity - 1))
                }
              >
                <Text style={{ color: "#fff" }}>-1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={{ color: "#fff" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text>No inventory items yet.</Text>}
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
  itemRow: {
    backgroundColor: "#f1f1f1",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  itemName: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemQty: { color: "#555" },
  itemReorder: { color: "#999" },
  adjustBtn: {
    backgroundColor: "#28a745",
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
});
