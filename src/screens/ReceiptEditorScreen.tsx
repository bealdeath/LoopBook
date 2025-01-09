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
  const [ocrResults, setOcrResults] = useState<any[]>([]);
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
      mediaTypes: [ImagePicker.MediaType.Image], // updated
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      const newUri = result.assets[0].uri;
      setReceiptImages((prev) => [...prev, newUri]);
    }
  }

  async function pickImageFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera permissions are required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: [ImagePicker.MediaType.Image],
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets?.length) {
      const newUri = result.assets[0].uri;
      setReceiptImages((prev) => [...prev, newUri]);
    }
  }

  async function runOcrOnAllImages() {
    const results: any[] = [];
    for (const uri of receiptImages) {
      const text = await OCRService.extractText(uri);
      const details = OCRService.categorizeAndExtractDetails(text);
      results.push({ uri, details });
    }
    setOcrResults(results);

    // Optionally auto-populate fields from the first or combined result:
    if (results.length > 0) {
      const firstDetails = results[0].details;
      setMerchantName(firstDetails.merchantName || "");
      setTotal(firstDetails.total?.toString() || "");
      setCategory(firstDetails.category || "");
      setPurchaseDate(firstDetails.purchaseDate || "");
      setPaymentMethod(firstDetails.paymentMethod || "");
      setLast4(firstDetails.last4 || "");
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
      returns: 0,               // Set by prepare in the slice
      netTotal: numericTotal,   // Set by prepare in the slice
    };

    dispatch(addReceipt(newReceipt));
    Alert.alert("Saved", "Multi-page receipt saved!");

    // Clear all fields
    setReceiptImages([]);
    setOcrResults([]);
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
        style={styles.imageList}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.receiptImage} />
        )}
      />

      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
          <Text style={styles.btnText}>Add from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImageFromCamera}>
          <Text style={styles.btnText}>Add from Camera</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.ocrButton} onPress={runOcrOnAllImages}>
        <Text style={styles.ocrText}>Run OCR on All Pages</Text>
      </TouchableOpacity>

      {/* Manual Overrides */}
      <TextInput
        style={styles.input}
        placeholder="Merchant Name"
        value={merchantName}
        onChangeText={setMerchantName}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
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

      {ocrResults.length > 0 && (
        <FlatList
          data={ocrResults}
          style={{ marginTop: 20 }}
          keyExtractor={(item, idx) => idx.toString()}
          renderItem={({ item }) => (
            <View style={styles.ocrResultItem}>
              <Text>URI: {item.uri}</Text>
              <Text>Merchant: {item.details.merchantName}</Text>
              <Text>Amount: {item.details.total}</Text>
              <Text>Date: {item.details.purchaseDate}</Text>
              <Text>Payment: {item.details.paymentMethod}</Text>
              <Text>Last4: {item.details.last4}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  imageList: { maxHeight: 200, marginBottom: 20 },
  receiptImage: { width: 200, height: 200, marginRight: 10, borderRadius: 8 },
  btnRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  btnText: { color: "#fff", fontSize: 14 },
  ocrButton: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  ocrText: { color: "#fff", fontSize: 16, fontWeight: "600" },
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
    marginBottom: 10,
  },
  finalText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  ocrResultItem: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
});
