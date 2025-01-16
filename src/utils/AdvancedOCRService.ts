// File: src/utils/AdvancedOCRService.ts

import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * The Cloud Function endpoint that processes receipts using Google Document AI.
 */
const ADVANCED_CLOUD_FUNCTION_URL =
  "https://us-central1-loopbook-5b036.cloudfunctions.net/parseReceipt"; // Replace with the correct URI.

export interface AdvancedDocResult {
  vendorName?: string;
  totalAmount?: number;
  taxes?: number;
  lineItems?: {
    description: string;
    quantity: number;
    price: number;
  }[];
  rawText?: string;
  paymentMethod?: string;
  last4?: string;
  dateDetected?: string;
  purchaseDate?: string;
}

/**
 * Service to extract structured data from receipts using the Cloud Function.
 */
export const AdvancedOCRService = {
  /**
   * Sends a base64 image to the Cloud Function and returns the structured response.
   */
  async extractExpenseData(imageUri: string): Promise<AdvancedDocResult> {
    // Convert image to base64 (resize to ~1000px width)
    const processed = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Send the base64 image to the Cloud Function
    const payload = { base64Image: processed.base64 };
    const response = await axios.post<AdvancedDocResult>(
      ADVANCED_CLOUD_FUNCTION_URL,
      payload
    );

    // Return the structured result
    return response.data;
  },
};

