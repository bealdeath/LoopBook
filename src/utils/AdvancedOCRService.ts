// File: src/utils/AdvancedOCRService.ts

import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * The Cloud Function endpoint for Document AI parsing.
 */
const CLOUD_FUNCTION_URL =
  "https://us-central1-loopbook-5b036.cloudfunctions.net/parseReceipt";

export interface DocResult {
  vendorName: string;
  totalAmount: number;
  taxes: number;
  purchaseDate: string;
  paymentMethod: string;
  last4: string;
  rawText?: string;
}

/**
 * A simple client to send base64 images to your parseReceipt function.
 */
export const AdvancedOCRService = {
  async extractExpenseData(imageUri: string): Promise<DocResult> {
    // 1) Convert to base64
    const processed = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2) Send to the Cloud Function
    const payload = { base64Image: processed.base64 };
    const response = await axios.post<DocResult>(CLOUD_FUNCTION_URL, payload);

    // 3) Return structured data, with fallback
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
  },
};
