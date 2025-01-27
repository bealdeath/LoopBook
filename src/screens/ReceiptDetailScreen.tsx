// File: src/screens/ReceiptDetailScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RootState, AppDispatch } from "../redux/store";
import { updateReceipt } from "../redux/slices/receiptSlice"; // adjust path

export default function ReceiptDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const { receiptId } = route.params as { receiptId: string };
  const receipts = useSelector((state: RootState) => state.receipts.data);
  const receipt = receipts.find((r) => r.id === receiptId);

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Receipt Not Found</Text>
      </View>
    );
  }

  // We assume your receipt has these fields: lineItems, totalAmount, taxes, docAiTotal, etc.
  const [merchantName, setMerchantName] = useState(receipt.merchantName || "");
  const [baseAmount, setBaseAmount] = useState(String(receipt.amount || "0"));
  const [taxes, setTaxes] = useState(String(receipt.hst || "0"));
  const [category, setCategory] = useState(receipt.category || "Other");
  const [purchaseDate, setPurchaseDate] = useState(receipt.purchaseDate || "Unknown");
  const [cardBrand, setCardBrand] = useState(receipt.cardBrand || "Unknown");
  const [last4, setLast4] = useState(receipt.last4 || "0000");
  const [grandTotal, setGrandTotal] = useState(String(receipt.grandTotal || "0"));

  // If you have line items
  const [lineItems, setLineItems] = useState(receipt.lineItems || []);

  function handleSave() {
    // Convert numeric fields
    const parsedAmount = parseFloat(baseAmount) || 0;
    const parsedTaxes = parseFloat(taxes) || 0;
    const parsedGrand = parseFloat(grandTotal) || parsedAmount;

    dispatch(
      updateReceipt({
        id: receipt.id,
        changes: {
          merchantName,
          amount: parsedAmount,
          hst: parsedTaxes,
          category,
          purchaseDate,
          paymentMethod: cardBrand,
          last4,
          grandTotal: parsedGrand,
          lineItems, // store line items if your slice supports it
        },
      })
    );
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Receipt Detail</Text>

      {/* If you store an imageUri */}
      {receipt.imageUri ? (
        <Image source={{ uri: receipt.imageUri }} style={styles.receiptImage} />
      ) : null}

      {/* Fields */}
      <Text>Merchant Name</Text>
      <TextInput style={styles.input} value={merchantName} onChangeText={setMerchantName} />
      
      <Text>Base Amount</Text>
      <TextInput style={styles.input} value={baseAmount} onChangeText={setBaseAmount} keyboardType="numeric" />

      <Text>Auto-Detected Category</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} />

      <Text>Purchase Date</Text>
      <TextInput style={styles.input} value={purchaseDate} onChangeText={setPurchaseDate} />

      <Text>HST / Tax</Text>
      <TextInput style={styles.input} value={taxes} onChangeText={setTaxes} keyboardType="numeric" />

      <Text>Card Brand</Text>
      <TextInput style={styles.input} value={cardBrand} onChangeText={setCardBrand} />

      <Text>Last 4 Digits</Text>
      <TextInput style={styles.input} value={last4} onChangeText={setLast4} keyboardType="numeric" />

      <Text>Grand Total</Text>
      <TextInput style={styles.input} value={grandTotal} onChangeText={setGrandTotal} keyboardType="numeric" />

      {/* Example line items if you want manual correction of them */}
      {lineItems.map((item: any, idx: number) => (
        <View key={idx} style={styles.lineItemContainer}>
          <Text>Line {idx + 1}</Text>
          <Text>Description</Text>
          <TextInput
            style={styles.input}
            value={item.description}
            onChangeText={(text) => {
              const newItems = [...lineItems];
              newItems[idx].description = text;
              setLineItems(newItems);
            }}
          />
          <Text>Price</Text>
          <TextInput
            style={styles.input}
            value={String(item.price)}
            onChangeText={(val) => {
              const newItems = [...lineItems];
              newItems[idx].price = parseFloat(val) || 0;
              setLineItems(newItems);
            }}
            keyboardType="numeric"
          />
        </View>
      ))}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  receiptImage: { width: "100%", height: 200, marginBottom: 10, resizeMode: "contain" },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  lineItemContainer: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  saveBtnText: { color: "#fff", fontWeight: "600" },
});
