// File: src/screens/ReceiptTrackerScreen.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { createReceipt, fetchReceipts } from "../redux/slices/receiptSlice";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { AdvancedOCRService } from "../utils/AdvancedOCRService";

export default function ReceiptTrackerScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const { data: receipts, loading } = useSelector((state: RootState) => state.receipts);

  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchReceipts());
  }, [dispatch]);

  async function handleCamera() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera permission required.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets?.length) {
        let uri = result.assets[0].uri;
        uri = await persistImage(uri);
        setCapturedImageUri(uri);
        await processAdvancedReceipt(uri);
      } else {
        Alert.alert("No Picture Taken", "Please take a picture.");
      }
    } catch (error) {
      Alert.alert("Error", "Camera failed.");
    }
  }

  async function handleGallery() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Gallery permission required.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets?.length) {
        let uri = result.assets[0].uri;
        uri = await persistImage(uri);
        setCapturedImageUri(uri);
        await processAdvancedReceipt(uri);
      } else {
        Alert.alert("No Image Selected", "Please select an image.");
      }
    } catch (error) {
      Alert.alert("Error", "Selecting image failed.");
    }
  }

  async function persistImage(uri: string): Promise<string> {
    try {
      const dir = FileSystem.documentDirectory + "receipts/";
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      const newUri = dir + Date.now() + ".jpg";
      await FileSystem.moveAsync({ from: uri, to: newUri });
      return newUri;
    } catch (error) {
      console.warn("Failed to persist image:", error);
      return uri;
    }
  }

  /**
   * Process advanced receipt (calls our Cloud Function).
   * If you suspect the Cloud Function isn't returning enough data,
   * try logging the "rawText" that you get from `AdvancedOCRService.extractExpenseData`.
   */
  async function processAdvancedReceipt(imageUri: string) {
    setIsProcessing(true);
    try {
      const {
        vendorName,
        totalAmount,
        taxes,
        lineItems,
        category,
        paymentMethod,
        last4,
        purchaseDate,
        purchaseDateISO,
      } = await AdvancedOCRService.extractExpenseData(imageUri);

      const safePurchaseDateISO = purchaseDateISO ?? null;

      await dispatch(
        createReceipt({
          imageUri,
          category: category || "Other",
          amount: totalAmount || 0,
          merchantName: vendorName || "Unknown",
          purchaseDate: purchaseDate || "Unknown",
          purchaseDateISO: safePurchaseDateISO,
          paymentMethod: paymentMethod || "Unknown",
          last4: last4 || "0000",
          hst: taxes || 0,
          gst: 0,
          uploadDate: new Date().toISOString(),
          returns: 0,
          netTotal: totalAmount || 0,
          lineItems,
        } as any)
      ).unwrap();
    } catch (error) {
      console.error("processAdvancedReceipt error:", error);
      Alert.alert("Error", "Failed to parse advanced receipt.");
    } finally {
      setIsProcessing(false);
    }
  }

  function renderReceiptItem({ item }: { item: any }) {
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() =>
          navigation.navigate("ReceiptDetail" as never, { receiptId: item.id } as never)
        }
      >
        <Text style={styles.transactionCategory}>
          {item.category} - {item.merchantName}
        </Text>
        <Text style={styles.transactionAmount}>${item.amount?.toFixed(2)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Receipt Tracker</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.addButton} onPress={handleCamera}>
          <Text style={styles.addButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={handleGallery}>
          <Text style={styles.addButtonText}>Gallery</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.organizerButton}
        onPress={() => navigation.navigate("ReceiptOrganizer" as never)}
      >
        <Text style={styles.organizerButtonText}>View Organized Receipts</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.organizerButton, { backgroundColor: "#ff9800" }]}
        onPress={() => navigation.navigate("SummaryScreen" as never)}
      >
        <Text style={styles.organizerButtonText}>View Summary</Text>
      </TouchableOpacity>

      {capturedImageUri && (
        <Image source={{ uri: capturedImageUri }} style={styles.receiptImage} />
      )}

      {(loading || isProcessing) && <ActivityIndicator size="large" color="#007bff" />}

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={renderReceiptItem}
        ListEmptyComponent={<Text style={styles.noDataText}>No Receipts Yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    width: 130,
  },
  addButtonText: { color: "#fff", fontSize: 14, textAlign: "center" },
  organizerButton: {
    backgroundColor: "#28a745",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    width: 200,
    alignSelf: "center",
    marginBottom: 10,
  },
  organizerButtonText: { color: "#fff", fontSize: 16 },
  receiptImage: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    resizeMode: "contain",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionCategory: { fontSize: 16, color: "#333" },
  transactionAmount: { fontSize: 16, fontWeight: "bold", color: "#333" },
  noDataText: { fontSize: 16, textAlign: "center", color: "#888", marginTop: 50 },
});
