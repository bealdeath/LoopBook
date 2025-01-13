// File: src/utils/OCRService.ts

import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";
import Constants from "expo-constants";

// Debugging logs for extra config
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra;
console.log("Constants.manifest.extra:", Constants.manifest?.extra);
console.log("Extra config loaded:", extra);

// Safely retrieve API key from extra config
const GOOGLE_VISION_API_KEY = extra?.GOOGLE_API_KEY;
if (!GOOGLE_VISION_API_KEY) {
  throw new Error(
    "Google Vision API key is missing. Please ensure it's set in app.json under the 'extra' field."
  );
}

const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export const OCRService = {
 async extractText(imageUri: string): Promise<string> {
  console.log("Starting text extraction for image URI:", imageUri);
  try {
    // Resize image
    const processed = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 1000 } }],
      { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Prepare payload for OCR API
    const payload = {
      requests: [
        {
          image: { content: processed.base64 },
          features: [{ type: "TEXT_DETECTION" }],
        },
      ],
    };

    const response = await axios.post(GOOGLE_VISION_API_URL, payload);
    return response.data?.responses?.[0]?.fullTextAnnotation?.text || "";
  } catch (err) {
    console.error("OCR Error:", err);
    throw new Error("Text extraction failed. Please try again or verify image quality.");
  }
},

  categorizeAndExtractDetails(text: string) {
    // Define categories for common purchase types
    const categories = {
      Food: ["restaurant", "meal", "food", "dining", "cafe", "bakery", "hamburger", "burger"],
      Travel: ["taxi", "uber", "lyft", "gas", "petrol", "bus", "flight"],
      Clothing: ["apparel", "clothing", "shoe", "shirt", "pants", "boutique"],
      Groceries: ["grocery", "market", "supermarket", "store", "mart"],
    };

    // Extract amounts and determine the total
    const amounts = text.match(/(\d+\.\d{2})/g)?.map(Number) || [];
    const total = amounts.length ? Math.max(...amounts) : 0;

    // Determine the category based on keywords
    let category = "Other";
    const lowerText = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((word) => lowerText.includes(word))) {
        category = cat;
        break;
      }
    }

    // Improved date extraction logic with additional formats
    const dateRegexes = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/, // MM/DD/YYYY or similar
      /\b\d{4}-\d{1,2}-\d{1,2}\b/, // YYYY-MM-DD
      /\b\d{1,2}-[A-Za-z]{3}\.?-\d{4}\b/, // DD-MMM-YYYY
      /\b[A-Za-z]{3,}\s?\d{1,2},\s?\d{4}\b/, // Month DD, YYYY
      /\b\d{1,2}\s[A-Za-z]{3,}\s\d{4}\b/, // DD Month YYYY
      /\b[A-Za-z]{3}\s\d{1,2},\s?\d{2}\b/, // MMM DD, YY (e.g., Dec 13, 24)
    ];
    let purchaseDate = "Unknown Date";
    for (const regex of dateRegexes) {
      const match = text.match(regex);
      if (match) {
        purchaseDate = match[0];
        break;
      }
    }

    // Enhanced merchant name extraction
    const skipWords = [
      "mon-sat",
      "sun",
      "http",
      "www",
      "subtotal",
      "total",
      "credit card",
      "merchant id",
      "tax id",
      "tax#",
      "invoice",
      "amount due",
      "amount paid",
      "change",
      "balance",
      "tel",
      "phone",
      "card #",
      "authorized",
      "approval",
      "batch",
      "welcome",
      "hello",
      "thank you",
      "please come again",
      "receipt",
      "customer copy",
      "table",
      "seats",
      "server",
      "printed by",
    ];

    let merchantName = "Unknown Merchant";
    const filteredLines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => {
        if (!line) return false;
        const upperLine = line.toUpperCase();
        if ((line.match(/\d/g) || []).length >= 4) return false; // Exclude numeric-heavy lines
        return !skipWords.some((word) => upperLine.includes(word.toUpperCase())); // Exclude irrelevant words
      });

    // Prioritize lines with minimal special characters and no numbers
    if (filteredLines.length > 0) {
      const candidate = filteredLines.find((line) => /^[A-Za-z' ]+$/.test(line)) || filteredLines[0];
      merchantName = candidate;
    }

    // Improved payment method and last 4 digits extraction
    let paymentMethod = "Unknown";
    let last4 = "0000";

    if (/american\s+express|amex/i.test(text)) paymentMethod = "Amex";
    else if (/visa/i.test(text)) paymentMethod = "Visa";
    else if (/master\s?card|mastercard/i.test(text)) paymentMethod = "MasterCard";
    else if (/discover/i.test(text)) paymentMethod = "Discover";
    else if (/cash|paid\s*in\s*cash/i.test(text)) paymentMethod = "Cash";

    const last4RegexList = [
      /\b(?:AMEX|VISA|MASTERCARD|CARD|ENDING IN)\b.*?(\d{4})/, // Keywords + digits
      /\b(\d{4})\b(?!.*\b\d{4}\b)/, // Last standalone 4 digits
    ];
    for (const regex of last4RegexList) {
      const match = text.match(regex);
      if (match) {
        last4 = match[1];
        break;
      }
    }

    return {
      category,
      total,
      purchaseDate,
      merchantName,
      paymentMethod,
      last4,
    };
  },
};
