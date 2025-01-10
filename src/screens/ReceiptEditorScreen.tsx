// File: src/screens/ReceiptEditorScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { addReceipt } from "../redux/slices/receiptSlice";
import { OCRService } from "../utils/OCRService";

export default function ReceiptEditorScreen() {
  const dispatch = useDispatch();
  const [receiptImages, setReceiptImages] = useState<string[]>([]);
  const [merchantName, setMerchantName] = useState("");
  const [total, setTotal] = useState("");
  const [category, setCategory] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [last4, setLast4] = useState("");

  async function pickImageFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need gallery permissions to add images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Enable multiple selection
      quality: 1,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((asset) => asset.uri);
      setReceiptImages((prev) => [...prev, ...newUris]);
    }
  }

  async function pickImageFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permissions are required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      const newUri = result.assets[0].uri;
      setReceiptImages((prev) => [...prev, newUri]);
    }
  }

  function finalizeMultiPageReceipt() {
    if (receiptImages.length === 0) {
      Alert.alert("No Images", "Please add at least one image before finalizing.");
      return;
    }

    const newId = uuidv4();
    const numericTotal = parseFloat(total) || 0;

    const newReceipt = {
      id: newId,
      images: receiptImages,
      category: category || "Other",
      amount: numericTotal,
      date: purchaseDate || new Date().toLocaleDateString(),
      merchantName: merchantName || "Unknown Merchant",
      purchaseDate: purchaseDate || "Unknown Date",
      paymentMethod: paymentMethod || "Unknown",
      last4: last4 || "0000",
      returns: 0,
      netTotal: numericTotal,
    };

    dispatch(addReceipt(newReceipt));
    Alert.alert("Saved", "Multi-page receipt saved!");

    // Clear fields
    setReceiptImages([]);
    setMerchantName("");
    setTotal("");
    setCategory("");
    setPurchaseDate("");
    setPaymentMethod("");
    setLast4("");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Multi-Page Receipt Editor</Text>
      <FlatList
        data={receiptImages}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.receiptImage} />
        )}
      />

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
          <Text style={styles.btnText}>Add Images</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImageFromCamera}>
          <Text style={styles.btnText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Merchant Name"
        value={merchantName}
        onChangeText={setMerchantName}
      />
      <TextInput
        style={styles.input}
        placeholder="Total Amount"
        keyboardType="numeric"
        value={total}
        onChangeText={setTotal}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Purchase Date"
        value={purchaseDate}
        onChangeText={setPurchaseDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Payment Method"
        value={paymentMethod}
        onChangeText={setPaymentMethod}
      />
      <TextInput
        style={styles.input}
        placeholder="Last 4 Digits"
        keyboardType="numeric"
        value={last4}
        onChangeText={setLast4}
      />

      <TouchableOpacity style={styles.finalButton} onPress={finalizeMultiPageReceipt}>
        <Text style={styles.finalText}>Finalize Receipt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  receiptImage: { width: 200, height: 200, marginRight: 10, borderRadius: 8 },
  btnRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 14 },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  finalButton: {
    backgroundColor: "orange",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  finalText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
