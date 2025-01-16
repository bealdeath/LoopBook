// File: src/screens/ReceiptDetailScreen.tsx

import React, { useState } from "react";
import { View, Text, Image, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { useRoute, useNavigation } from "@react-navigation/native";
import { updateReceipt } from "../redux/slices/receiptSlice";

export default function ReceiptDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { receiptId } = route.params as { receiptId: string };
  const { data: receipts } = useSelector((state: RootState) => state.receipts);
  const receipt = receipts.find((r) => r.id === receiptId);

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Receipt Not Found</Text>
      </View>
    );
  }

  // We load fields. If we want, we can also load line items or hst to display
  const [merchantName, setMerchantName] = useState(receipt.merchantName);
  const [amount, setAmount] = useState(String(receipt.amount));
  const [hst, setHst] = useState(String(receipt.hst || 0));
  const [category, setCategory] = useState(receipt.category);
  const [purchaseDate, setPurchaseDate] = useState(receipt.purchaseDate || "");
  const [purchaseDateISO, setPurchaseDateISO] = useState(receipt.purchaseDateISO || "");

  function handleSave() {
    const numericAmount = parseFloat(amount) || 0;
    const numericHst = parseFloat(hst) || 0;
    dispatch(
      updateReceipt({
        id: receipt.id,
        changes: {
          merchantName,
          amount: numericAmount,
          hst: numericHst,
          category,
          purchaseDate,
          purchaseDateISO,
        },
      })
    );
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt Detail</Text>

      {receipt.imageUri ? (
        <Image source={{ uri: receipt.imageUri }} style={styles.receiptImage} />
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
        value={hst}
        onChangeText={setHst}
        placeholder="HST"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="Category"
      />
      <TextInput
        style={styles.input}
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        placeholder="Purchase Date"
      />
      <TextInput
        style={styles.input}
        value={purchaseDateISO}
        onChangeText={setPurchaseDateISO}
        placeholder="PurchaseDateISO"
      />

      {/* Show line items if present */}
      {receipt.lineItems?.length ? (
        <View style={styles.lineItemsContainer}>
          <Text style={{ fontWeight: "bold" }}>Line Items:</Text>
          {receipt.lineItems.map((item, idx) => (
            <Text key={idx}>
              {item.description} x {item.quantity} = ${item.price.toFixed(2)}
            </Text>
          ))}
        </View>
      ) : null}

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
  lineItemsContainer: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600" },
});
