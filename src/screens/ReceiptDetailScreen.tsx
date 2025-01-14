// File: src/screens/ReceiptDetailScreen.tsx
import React, { useState } from "react";
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/rootReducer";
import { useRoute, useNavigation } from "@react-navigation/native";
import { updateReceipt, Receipt } from "../redux/slices/receiptSlice";

export default function ReceiptDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // We expect route.params to have: { id, year, month, day }
  const { id, year, month, day } = route.params as {
    id: string;
    year: string;
    month: string;
    day: string;
  };

  const dispatch = useDispatch();
  const receiptsState = useSelector((state: RootState) => state.receipts);
  const dayArray = receiptsState.data?.[year]?.[month]?.[day] || [];
  const receipt = dayArray.find((r) => r.id === id);

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Receipt Not Found</Text>
      </View>
    );
  }

  const [merchantName, setMerchantName] = useState(receipt.merchantName || "");
  const [amount, setAmount] = useState(String(receipt.amount));
  const [purchaseDate, setPurchaseDate] = useState(receipt.purchaseDate || "");
  const [category, setCategory] = useState(receipt.category || "");

  function handleSave() {
    const numericAmount = parseFloat(amount) || 0;
    dispatch(
      updateReceipt({
        year,
        month,
        day,
        id: receipt.id,
        changes: {
          merchantName,
          amount: numericAmount,
          purchaseDate,
          category,
          netTotal: numericAmount - receipt.returns,
        },
      })
    );
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt Detail</Text>

      {/* Display the first image, or all images */}
      {receipt.images?.length ? (
        <Image source={{ uri: receipt.images[0] }} style={styles.receiptImage} />
      ) : (
        <Text>No image available</Text>
      )}

      <TextInput
        style={styles.input}
        value={merchantName}
        onChangeText={setMerchantName}
        placeholder="Merchant Name"
      />
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        placeholder="Purchase Date"
      />
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="Category"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  receiptImage: { width: "100%", height: 200, marginBottom: 10 },
  input: {
    backgroundColor: "#f9f9f9",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600" },
});
