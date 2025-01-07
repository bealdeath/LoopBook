// File: src/screens/ReceiptDetailScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView, // <--- Import
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRoute, useNavigation } from "@react-navigation/native";
import { RootState } from "../redux/store";
import { updateReceipt } from "../redux/slices/receiptSlice";

export default function ReceiptDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const receiptId = route.params?.receiptId;
  const receipt = useSelector((state: RootState) =>
    state.receipts.data.find((r) => r.id === receiptId)
  );

  const [merchantName, setMerchantName] = useState(receipt?.merchantName || "");
  const [tempDate, setTempDate] = useState(receipt?.purchaseDate || "");
  const [tempAmount, setTempAmount] = useState(String(receipt?.amount || "0"));
  const [tempPayment, setTempPayment] = useState(receipt?.paymentMethod || "Unknown");
  const [tempLast4, setTempLast4] = useState(receipt?.last4 || "0000");
  const [tempReturns, setTempReturns] = useState(String(receipt?.returns || "0"));

  if (!receipt) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Receipt Not Found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleSaveChanges() {
    const newAmount = parseFloat(tempAmount) || 0;
    const newReturns = parseFloat(tempReturns) || 0;
    dispatch(
      updateReceipt({
        ...receipt,
        merchantName,
        purchaseDate: tempDate,
        amount: newAmount,
        returns: newReturns,
        netTotal: newAmount - newReturns,
        paymentMethod: tempPayment,
        last4: tempLast4,
      })
    );
    Alert.alert("Updated", "Receipt updated successfully!");
    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {receipt.imageUri && (
        <Image source={{ uri: receipt.imageUri }} style={styles.receiptImage} />
      )}

      <Text style={styles.label}>Merchant Name:</Text>
      <TextInput style={styles.input} value={merchantName} onChangeText={setMerchantName} />

      <Text style={styles.label}>Date:</Text>
      <TextInput style={styles.input} value={tempDate} onChangeText={setTempDate} />

      <Text style={styles.label}>Amount:</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={tempAmount}
        onChangeText={setTempAmount}
      />

      <Text style={styles.label}>Payment Method:</Text>
      <TextInput style={styles.input} value={tempPayment} onChangeText={setTempPayment} />

      <Text style={styles.label}>Last4:</Text>
      <TextInput style={styles.input} value={tempLast4} onChangeText={setTempLast4} />

      <Text style={styles.label}>Returns:</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={tempReturns}
        onChangeText={setTempReturns}
      />

      {/* Net total if you want to show it */}
      <Text style={[styles.label, { marginTop: 15 }]}>
        Net Total: $
        {(parseFloat(tempAmount) - parseFloat(tempReturns || "0") || 0).toFixed(2)}
      </Text>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20 },
  backBtn: { color: "blue", marginTop: 10 },
  receiptImage: {
    width: "100%",
    height: 250,
    resizeMode: "contain",
    marginBottom: 20,
  },
  label: { marginTop: 15, fontSize: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  saveBtn: {
    marginTop: 30,
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
});
