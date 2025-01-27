// File: src/utils/AdvancedOCRService.ts

import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";

const CLOUD_FUNCTION_URL =
  "https://us-central1-loopbook-5b036.cloudfunctions.net/parseReceiptHandler";

export interface DocResult {
  vendorName: string;
  totalAmount: number;
  taxes: number;
  purchaseDate: string;
  paymentMethod: string;
  last4: string;
  rawText?: string;
}

export const AdvancedOCRService = {
  async extractExpenseData(imageUri: string): Promise<DocResult> {
    try {
      // Preprocess the image for better OCR performance: Resize and compress
      const processed = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1000 } }],
        { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Send preprocessed image to the Cloud Function
      const payload = { base64Image: processed.base64 };
      const response = await axios.post<DocResult>(CLOUD_FUNCTION_URL, payload);

      const data = response.data || {};
      return {
        vendorName: data.vendorName || "Unknown",
        totalAmount: data.totalAmount ?? 0,
        taxes: data.taxes ?? 0,
        purchaseDate: data.purchaseDate || "Unknown",
        paymentMethod: data.paymentMethod || "Unknown",
        last4: data.last4 || "0000",
        rawText: data.rawText || "",
      };
    } catch (error) {
      console.error("AdvancedOCRService error:", error);
      throw new Error("Failed to process receipt. Please try again.");
    }
  },
};
