// File: src/screens/BulkUploadScreen.tsx

import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useDispatch } from "react-redux";
import { addReceipt } from "../redux/slices/receiptSlice";
import { v4 as uuidv4 } from "uuid";

export default function BulkUploadScreen() {
  const dispatch = useDispatch();
  const [receiptUris, setReceiptUris] = useState<string[]>([]);

  async function pickMultipleImages() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need gallery permissions to add images.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setReceiptUris((prev) => [...prev, ...uris]);
    }
  }

  function finalizeReceipts() {
    receiptUris.forEach((uri) => {
      const newReceipt = {
        id: uuidv4(),
        images: [uri],
        category: "Uncategorized",
        amount: 0,
        date: new Date().toLocaleDateString(),
        merchantName: "Unknown",
        purchaseDate: "Unknown",
        paymentMethod: "Unknown",
        last4: "0000",
        returns: 0,
        netTotal: 0,
      };
      dispatch(addReceipt(newReceipt));
    });
    Alert.alert("Receipts Saved", "All receipts have been added.");
    setReceiptUris([]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bulk Upload Receipts</Text>
      <FlatList
        data={receiptUris}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.imagePreview}>
            <Text>{item}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.button} onPress={pickMultipleImages}>
        <Text style={styles.buttonText}>Select Receipts from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.finalizeButton} onPress={finalizeReceipts}>
        <Text style={styles.buttonText}>Finalize Bulk Upload</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  imagePreview: { marginVertical: 10, padding: 10, backgroundColor: "#f9f9f9", borderRadius: 5 },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, marginTop: 10 },
  finalizeButton: { backgroundColor: "orange", padding: 15, borderRadius: 8, marginTop: 10 },
  buttonText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
