import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";

import { OCRService } from "../utils/OCRService";
import { addReceipt } from "../redux/slices/receiptSlice";

export default function ReceiptScannerScreen({ navigation }) {
  const dispatch = useDispatch();

  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedDetails, setExtractedDetails] = useState<any>(null);

  const pickImage = async () => {
    try {
      // Ask for permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need gallery permissions.");
        return;
      }

      // Launch gallery
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // 'images' is recognized
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        setImage(result.assets[0].uri);
        setExtractedDetails(null);
      }
    } catch (error) {
      console.error("pickImage Error:", error);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Camera permissions are required.");
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length) {
        setImage(result.assets[0].uri);
        setExtractedDetails(null);
      }
    } catch (error) {
      console.error("takePhoto Error:", error);
    }
  };

  const extractText = async () => {
    if (!image) {
      Alert.alert("Error", "Please select or capture an image first.");
      return;
    }

    setIsLoading(true);
    setExtractedDetails(null);

    try {
      const text = await OCRService.extractText(image);
      const details = OCRService.categorizeAndExtractDetails(text);
      setExtractedDetails(details);

      // Build a receipt object
      const newReceipt = {
        id: uuidv4(),
        imageUri: image,
        category: details.category,
        amount: details.total,
        date: new Date().toLocaleDateString(),
        merchantName: details.merchantName,
        purchaseDate: details.purchaseDate,
      };

      // Dispatch to Redux
      dispatch(addReceipt(newReceipt));
    } catch (error) {
      console.error("OCR Error:", error);
      Alert.alert("Error", "Failed to extract text from the image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Upload from Gallery" onPress={pickImage} />
      <Button title="Take a Photo" onPress={takePhoto} />

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Button title="Extract Details" onPress={extractText} />
      {isLoading && <ActivityIndicator size="large" color="#007bff" />}

      {/* Show details from OCR */}
      {extractedDetails && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Merchant: {extractedDetails.merchantName}</Text>
          <Text style={styles.resultText}>Date: {extractedDetails.purchaseDate}</Text>
          <Text style={styles.resultText}>Category: {extractedDetails.category}</Text>
          <Text style={styles.resultText}>Total: ${extractedDetails.total}</Text>
        </View>
      )}

      <Button
        title="View Spending Data"
        onPress={() => navigation.navigate("SpendingGraph")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    resizeMode: "contain",
  },
  resultContainer: {
    marginTop: 20,
  },
  resultText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ReceiptTrackerScreen;
