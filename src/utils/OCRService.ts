// File: src/utils/OCRService.ts

import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import Constants from "expo-constants";

// Ensure manifest or expoConfig is not null
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

// Google Vision API URL
const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${extra.GOOGLE_API_KEY}`;

export const OCRService = {
  async extractText(imageUri: string): Promise<string> {
    try {
      // Resize image for better OCR accuracy
      const processed = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1000 } }],
        { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Build payload
      const payload = {
        requests: [
          {
            image: { content: processed.base64 },
            features: [{ type: "TEXT_DETECTION" }],
            imageContext: { languageHints: ["en"] },
          },
        ],
      };

      // Call Google Vision
      const response = await axios.post(GOOGLE_VISION_API_URL, payload);
      return response.data?.responses?.[0]?.fullTextAnnotation?.text || "";
    } catch (err) {
      console.error("OCR Error:", err);
      return "";
    }
  },
};
