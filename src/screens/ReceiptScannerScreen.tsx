kimport React, { useState } from "react";
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

export default function ReceiptScannerScreen({ navigation }) {
  const dispatch = useDispatch();

  const [images, setImages] = useState<string[][]>([]); // Groups of images (multi-page receipts)
  const [isLoading, setIsLoading] = useState(false);
  const [scannedReceipts, setScannedReceipts] = useState<any[]>([]); // Store extracted receipt data
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  const pickImages = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need gallery permissions to continue.");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        const selectedImages = result.assets.map((asset) => asset.uri);
        setImages((prev) => [...prev, selectedImages]); // Add new group of images
      }
    } catch (error) {
      console.error("Error picking images:", error);
    }
  };

  const scanReceipts = async () => {
    if (!images.length) {
      Alert.alert("No Images", "Please select images first.");
      return;
    }

    setIsLoading(true);
    setCurrentProgress(0);
    setScannedReceipts([]);

    try {
      const batchResults = await OCRService.extractTextBatch(images);

      const receipts = batchResults.map((result, index) => {
        const details = OCRService.categorizeAndExtractDetails(result.combinedText);

        // Create a new receipt object
        return {
          id: uuidv4(),
          images: result.pages,
          category: details.category,
          amount: details.total,
          date: new Date().toLocaleDateString(),
          merchantName: details.merchantName,
          purchaseDate: details.purchaseDate,
        };
      });

      setScannedReceipts(receipts);

      // Dispatch each receipt to Redux store
      receipts.forEach((receipt) => dispatch(addReceipt(receipt)));

      Alert.alert("Success", "Receipts scanned successfully!");
    } catch (error) {
      console.error("Error scanning receipts:", error);
      Alert.alert("Error", "Failed to scan receipts.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Receipt Scanner</Text>

      <Button title="Upload Images (Multi-page)" onPress={pickImages} />
      {images.length > 0 && (
        <Text style={styles.infoText}>
          {images.length} receipt(s) added. Press "Scan Receipts" to process.
        </Text>
      )}

      {isLoading ? (
        <>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.infoText}>Processing... {currentProgress}%</Text>
        </>
      ) : (
        <Button title="Scan Receipts" onPress={scanReceipts} />
      )}

      {/* Display scanned results */}
      {scannedReceipts.map((receipt, index) => (
        <View key={index} style={styles.receiptContainer}>
          <Text style={styles.receiptTitle}>Receipt {index + 1}</Text>
          <Text>Merchant: {receipt.merchantName}</Text>
          <Text>Date: {receipt.purchaseDate}</Text>
          <Text>Category: {receipt.category}</Text>
          <Text>Total: ${receipt.amount.toFixed(2)}</Text>
        </View>
      ))}

      <Button
        title="View Spending Data"
        onPress={() => navigation.navigate("SpendingGraph")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 8,
  },
  receiptContainer: {
    marginVertical: 16,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
});

export default ReceiptScannerScreen;

