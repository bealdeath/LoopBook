// File: src/screens/ReceiptScannerScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";

import { OCRService } from "../utils/OCRService";
import { addReceipt } from "../redux/slices/receiptSlice";
import { Receipt } from "../redux/slices/receiptSlice"; // Import the Receipt interface

export default function ReceiptScannerScreen({ navigation }: any) {
  const dispatch = useDispatch();

  const [image, setImage] = useState<string | null>(null); // Single image
  const [isLoading, setIsLoading] = useState(false);
  const [scannedReceipts, setScannedReceipts] = useState<Receipt[]>([]);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need gallery permissions to continue.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false, // Single image for simplicity
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        const selectedImage = result.assets[0].uri;
        setImage(selectedImage);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const scanReceipt = async () => {
    if (!image) {
      Alert.alert("No Image", "Please select an image first.");
      return;
    }

    setIsLoading(true);
    setCurrentProgress(0);
    setScannedReceipts([]);

    try {
      const batchResults = await OCRService.extractTextBatch([[image]]);
      const receipts = batchResults.map((result, index) => {
        const details = OCRService.categorizeAndExtractDetails(result.combinedText);

        return {
          id: uuidv4(),
          images: [result.pages[0]], // Changed to array
          category: details.category,
          amount: details.total,
          date: new Date().toLocaleDateString(),
          merchantName: details.merchantName,
          purchaseDate: details.purchaseDate,
          paymentMethod: details.paymentMethod,
          last4: details.last4,
          // Do not include returns and netTotal; let the slice handle them
        };
      });

      setScannedReceipts(receipts);
      receipts.forEach((receipt) => dispatch(addReceipt(receipt)));
      console.log("Dispatching receipts:", receipts); // Log dispatched receipts
      Alert.alert("Success", "Receipt scanned successfully!");
    } catch (error) {
      console.error("Error scanning receipt:", error);
      Alert.alert("Error", "Failed to scan receipt.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Receipt Scanner</Text>
      <Button title="Upload Image" onPress={pickImage} />
      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}
      {isLoading ? (
        <>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.infoText}>Processing... {currentProgress}%</Text>
        </>
      ) : (
        <Button title="Scan Receipt" onPress={scanReceipt} />
      )}
      {scannedReceipts.map((receipt, index) => (
        <View key={receipt.id} style={styles.receiptContainer}>
          <Text style={styles.receiptTitle}>Receipt {index + 1}</Text>
          <Text>Merchant: {receipt.merchantName}</Text>
          <Text>Date: {receipt.purchaseDate}</Text>
          <Text>Category: {receipt.category}</Text>
          <Text>Total: ${receipt.amount.toFixed(2)}</Text>
          <Text>Payment Method: {receipt.paymentMethod}</Text>
          <Text>Last4: {receipt.last4}</Text>
        </View>
      ))}
      <Button
        title="View Receipts"
        onPress={() => navigation.navigate("ReceiptTracker")} // Changed from "SpendingGraph"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  infoText: { fontSize: 16, textAlign: "center", marginVertical: 8 },
  receiptContainer: { marginVertical: 16, padding: 8, borderWidth: 1, borderRadius: 8 },
  receiptTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  imagePreview: { width: "100%", height: 200, resizeMode: "contain", marginVertical: 16 },
});
