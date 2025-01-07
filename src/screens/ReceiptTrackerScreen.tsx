// File: src/screens/ReceiptTrackerScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
//             ──┬───────────────────────────── Note the single dot
//               └ If your "screens" and "redux" folders are siblings, 
//                 you go up 1 directory to reach "redux"
import { addReceipt } from "../redux/slices/receiptSlice";

import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import { OCRService } from "../utils/OCRService";
import * as FileSystem from "expo-file-system";

export default function ReceiptTrackerScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const receipts = useSelector((state: RootState) => state.receipts.data);

  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null);

  function handleAddNewReceipt() {
    setCapturedImageUri(null);
    setIsCategoryModalVisible(true);
  }

  function handleCategorySelection(cat: string) {
    setIsCategoryModalVisible(false);
    Alert.alert("Choose an Option", "", [
      { text: "Take a Picture", onPress: () => handleCameraCapture(cat) },
      { text: "Select from Gallery", onPress: () => handleImageSelection(cat) },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function handleCameraCapture(cat: string) {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera permissions are required.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets?.length) {
        let uri = result.assets[0].uri;
        uri = await persistImage(uri);
        setCapturedImageUri(uri);
        await scanReceipt(uri, cat);
      } else {
        Alert.alert("No Picture Taken", "Please take a picture.");
      }
    } catch {
      Alert.alert("Error", "Camera failed.");
    }
  }

  async function handleImageSelection(cat: string) {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Gallery permissions are required.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled && result.assets?.length) {
        let uri = result.assets[0].uri;
        uri = await persistImage(uri);
        setCapturedImageUri(uri);
        await scanReceipt(uri, cat);
      } else {
        Alert.alert("No Image Selected", "Please select an image.");
      }
    } catch {
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
    } catch {
      return uri;
    }
  }

  async function scanReceipt(imageUri: string, cat: string) {
    if (!cat) {
      Alert.alert("Error", "No category selected.");
      return;
    }
    setIsLoading(true);
    try {
      const text = await OCRService.extractText(imageUri);
      const details = OCRService.categorizeAndExtractDetails(text);
      dispatch(
        addReceipt({
          id: uuidv4(),
          imageUri,
          category: cat,
          amount: details.total,
          date: new Date().toLocaleDateString(),
          merchantName: details.merchantName,
          purchaseDate: details.purchaseDate,
          paymentMethod: details.paymentMethod,
          last4: details.last4,
        })
      );
    } catch {
      Alert.alert("Error", "Failed to scan receipt.");
    } finally {
      setIsLoading(false);
    }
  }

  function renderReceiptItem({ item }: any) {
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
        <Text style={styles.transactionAmount}>${item.amount}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Receipt Tracker</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddNewReceipt}>
        <Text style={styles.addButtonText}>+ Add Receipt</Text>
      </TouchableOpacity>

      {capturedImageUri && (
        <Image source={{ uri: capturedImageUri }} style={styles.receiptImage} />
      )}

      {isLoading && <ActivityIndicator size="large" color="#007bff" />}

      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={renderReceiptItem}
        ListEmptyComponent={<Text style={styles.noDataText}>No Receipts Yet</Text>}
      />

      <Modal
        visible={isCategoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCategoryModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Category</Text>
            {["Food", "Travel", "Shopping", "Other"].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.categoryButton}
                onPress={() => handleCategorySelection(cat)}
              >
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCategoryModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: "#007bff",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
    width: 140,
    alignSelf: "center",
    marginBottom: 20,
  },
  addButtonText: { color: "#fff", fontSize: 16 },
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  categoryButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    alignItems: "center",
  },
  categoryText: { color: "#fff", fontSize: 16 },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#f00",
    padding: 10,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontSize: 16 },
});
