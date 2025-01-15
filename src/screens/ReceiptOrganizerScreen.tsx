// File: src/screens/ReceiptOrganizerScreen.tsx (Full Example)

import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { fetchReceipts, removeReceipt } from "../redux/slices/receiptSlice";
import { useNavigation } from "@react-navigation/native";

export default function ReceiptOrganizerScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { data: receipts, loading } = useSelector((state: RootState) => state.receipts);

  useEffect(() => {
    dispatch(fetchReceipts()); // load all receipts if not loaded
  }, []);

  function handleDelete(id: string) {
    Alert.alert("Confirm", "Are you sure you want to delete this receipt?", [
      {
        text: "Yes",
        onPress: async () => {
          try {
            await dispatch(removeReceipt(id)).unwrap();
            Alert.alert("Deleted", "Receipt removed successfully.");
          } catch (err) {
            console.error("Remove error:", err);
            Alert.alert("Error", "Failed to remove receipt.");
          }
        },
      },
      { text: "No", style: "cancel" },
    ]);
  }

  function handleOpenDetail(receiptId: string) {
    navigation.navigate("ReceiptDetail" as never, { receiptId } as never);
  }

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => handleOpenDetail(item.id)}>
        <Text style={styles.merchant}>{item.merchantName}</Text>
        <Text style={styles.amount}>${item.amount?.toFixed(2)}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Text style={{ color: "#fff" }}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Organized Receipts</Text>
      {loading && <Text>Loading...</Text>}
      <FlatList
        data={receipts}
        keyExtractor={(r) => r.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No receipts found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    alignItems: "center",
  },
  merchant: { fontSize: 16, fontWeight: "600", color: "#333" },
  amount: { fontSize: 14, color: "#666" },
  deleteBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
});
