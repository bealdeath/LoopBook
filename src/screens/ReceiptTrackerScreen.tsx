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
import axios from "axios";
import { createLedgerTransaction } from "../redux/slices/ledgerSlice";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";


export default function ReceiptTrackerScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  const { data: receipts, loading } = useSelector(
    (state: RootState) => state.receipts
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  // Fetch existing receipts from Firestore on mount
  useEffect(() => {
    dispatch(fetchReceipts());
  }, [dispatch]);

  /**
   * Call your Cloud Function
   */
  async function callParseReceipt(base64Image: string) {
    const response = await axios.post(
      "https://us-central1-loopbook-5b036.cloudfunctions.net/parseReceiptHandler",
      { base64Image }
    );
    console.log("Parsed Receipt:", response.data);
    return response.data;
  }

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
      console.error("handleCamera error:", error);
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
      console.error("handleGallery error:", error);
      Alert.alert("Error", "Selecting image failed.");
    }
  }

  /**
   * Save the image to a local folder
   */
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
   * Process the image with doc.ai + fallback
   */
  async function processAdvancedReceipt(imageUri: string) {
    setIsProcessing(true);
    try {
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const {
        vendorName = "Unknown",
        purchaseDate = "Unknown",
        last4 = "0000",
        totalAmount = 0,
        taxes = 0,
        docAiTotal = 0,
        category = "Other",
        grandTotal = totalAmount,
        tip = 0,
        cardBrand = "Unknown",
      } = await callParseReceipt(base64Image);
   const dateIso = new Date().toISOString().slice(0, 10);
   const debitAmount = totalAmount + taxes;
   await dispatch(
     createLedgerTransaction({
       date: dateIso,
       memo: `Receipt scanned: ${vendorName}`,
       lines: [
         { accountId: "defaultExpenseId", debit: debitAmount, credit: 0 },
         { accountId: "defaultPaymentId", debit: 0, credit: debitAmount },
       ],
     })
   ).unwrap();
      // Save to Firestore
      await dispatch(
        createReceipt({
          imageUri,
          category,
          amount: totalAmount,
          merchantName: vendorName,
          purchaseDate,
          purchaseDateISO: null,
          paymentMethod: cardBrand,
          last4,
          hst: taxes,
          gst: 0,
          uploadDate: new Date().toISOString(),
          returns: 0,
          netTotal: totalAmount,
          cardBrand,
          docAiTotal,
          tip,
          grandTotal,
        } as any)
      ).unwrap();

      // REMOVED auto-create ledger transaction code
      // if you want to re-introduce later, do so after verifying no black screen
    } catch (error) {
      console.error("processAdvancedReceipt error:", error);
      Alert.alert("Error", "Failed to process the receipt.");
    } finally {
      setIsProcessing(false);
    }
  }

  function renderReceiptItem({ item }: { item: any }) {
    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() =>
          navigation.navigate("ReceiptDetail" as never, {
            receiptId: item.id,
          } as never)
        }
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.transactionCategory}>
            {item.merchantName} ({item.category})
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Date: {item.purchaseDate}
          </Text>
          <Text style={{ fontSize: 14, color: "#666" }}>
            Card: {item.paymentMethod} {item.last4}
          </Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.transactionAmount}>
            Base: ${item.amount?.toFixed(2)}
          </Text>
          {item.tip > 0 && (
            <Text style={styles.transactionAmount}>
              Tip: ${item.tip?.toFixed(2)}
            </Text>
          )}
          {item.grandTotal > 0 && item.grandTotal !== item.amount && (
            <Text style={styles.transactionAmount}>
              Total: ${item.grandTotal?.toFixed(2)}
            </Text>
          )}
        </View>
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

      {(loading || isProcessing) && (
        <ActivityIndicator size="large" color="#007bff" />
      )}

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={renderReceiptItem}
        ListEmptyComponent={
          <Text style={styles.noDataText}>No Receipts Yet</Text>
        }
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
  transactionCategory: { fontSize: 16, color: "#333", fontWeight: "600" },
  transactionAmount: { fontSize: 16, fontWeight: "bold", color: "#333" },
  noDataText: { fontSize: 16, textAlign: "center", color: "#888", marginTop: 50 },
});
