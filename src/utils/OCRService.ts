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
  throw new Error("Google Vision API key is missing. Please ensure it's set in app.json under the 'extra' field.");
}

const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export const OCRService = {
  /**
   * Extract text from a single image using Google Vision.
   */
  async extractText(imageUri: string): Promise<string> {
    console.log("Starting text extraction for image URI:", imageUri);

    try {
      // Preprocess: Resize the image to optimize OCR
      console.log("Resizing image...");
      const processed = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1000 } }],
        { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      console.log("Image resized successfully.");

      // Build payload for Google Vision API
      const payload = {
        requests: [
          {
            image: { content: processed.base64 }, // Base64 of resized image
            features: [{ type: "TEXT_DETECTION" }],
            imageContext: {
              languageHints: ["en"], // Adjust for multi-language as needed
            },
          },
        ],
      };
      console.log("Payload built:", JSON.stringify(payload));

      // Call Google Vision API
      console.log("Calling Google Vision API...");
      const response = await axios.post(GOOGLE_VISION_API_URL, payload);
      const text = response.data?.responses?.[0]?.fullTextAnnotation?.text || "";
      console.log("Extracted text:", text);

      return text;
    } catch (err) {
      console.error("OCR Error:", err.response?.data || err.message || err);
      return "";
    }
  },

  /**
   * Extract text from multiple images, combining results for multi-page receipts or processing unrelated receipts.
   */
  async extractTextBatch(imageUrisGroups: string[][]): Promise<object[]> {
    console.log("Starting batch text extraction...");
    try {
      const results = await Promise.all(
        imageUrisGroups.map(async (imageUris) => {
          let combinedText = "";

          // Process each image in the group (multi-page receipt)
          for (const imageUri of imageUris) {
            const text = await this.extractText(imageUri);
            combinedText += `${text}\n\n`; // Combine texts with line breaks
          }

          return { pages: imageUris, combinedText };
        })
      );

      console.log("Batch extraction complete:", results);
      return results; // Array of extracted data for all receipts
    } catch (err) {
      console.error("OCR Batch Error:", err);
      return [];
    }
  },

  /**
   * Categorize and extract details from the scanned text.
   */
  categorizeAndExtractDetails(text: string) {
    console.log("Categorizing and extracting details from text...");

    // Define categories for common purchase types
    const categories = {
      Food: ["restaurant", "meal", "food", "dining", "cafe", "bakery", "hamburger", "burger"],
      Travel: ["taxi", "uber", "lyft", "gas", "petrol", "bus", "flight"],
      Clothing: ["apparel", "clothing", "shoe", "shirt", "pants", "boutique"],
      Groceries: ["grocery", "market", "supermarket", "store", "mart"],
    };

    // Extract amounts from text
    const amounts = text.match(/(\d+\.\d{2})/g)?.map(Number) || [];
    const total = amounts.length ? Math.max(...amounts) : 0;

    // Determine category
    let category = "Other";
    const lower = text.toLowerCase();
    for (const [cat, words] of Object.entries(categories)) {
      for (const word of words) {
        if (lower.includes(word)) {
          category = cat;
          break;
        }
      }
      if (category !== "Other") break;
    }

    // Extract purchase date using regex patterns
    const dateRegexes = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
      /\b\d{4}-\d{1,2}-\d{1,2}\b/,
      /\b\d{1,2}-[A-Za-z]{3}\.?-\d{4}\b/,
      /\b[A-Za-z]{3,}\s?\d{1,2},\s?\d{4}\b/,
      /\b\d{1,2}\s[A-Za-z]{3,}\s\d{4}\b/,
    ];
    let purchaseDate = "Unknown Date";
    for (const regex of dateRegexes) {
      const match = text.match(regex);
      if (match) {
        purchaseDate = match[0];
        break;
      }
    }

    // Skip common words to find merchant name
    const skipWords = [
      "mon-sat", "sun", "http", "www", "subtotal", "total", "credit card", "merchant id",
      "tax id", "tax#", "invoice", "amount due", "amount paid", "change", "balance", "tel",
      "phone", "card #", "authorized", "approval", "batch", "welcome", "hello", "thank you",
      "please come again", "receipt", "customer copy",
    ];
    let merchantName = "Unknown Merchant";
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => {
        if (!line) return false;
        const upperLine = line.toUpperCase();
        if ((line.match(/\d/g) || []).length >= 4) return false;
        for (const skip of skipWords) {
          if (upperLine.includes(skip.toUpperCase())) return false;
        }
        return true;
      });

    let bestLine = "";
    let bestScore = 9999;
    lines.forEach((line) => {
      const score = (line.match(/[0-9\.,\/#!$%\^&\*;:{}=\-_~()]/g) || []).length;
      if (score < bestScore) {
        bestScore = score;
        bestLine = line;
      }
    });
    if (bestLine) merchantName = bestLine;

    // Determine payment method and last 4 digits
    let paymentMethod = "Unknown";
    let last4 = "0000";
    if (/american\s+express|amex/i.test(text)) paymentMethod = "Amex";
    else if (/visa/i.test(text)) paymentMethod = "Visa";
    else if (/master\s?card|mastercard/i.test(text)) paymentMethod = "MasterCard";
    else if (/discover/i.test(text)) paymentMethod = "Discover";
    else if (/cash|paid\s*in\s*cash/i.test(text)) paymentMethod = "Cash";

    const last4RegexList = [
      /(?:[*xX•]{4,}\s?){2,4}(\d{4})/,
      /ending\s+in\s+(\d{4})/i,
      /acct\.*\s?#?\s?(\d{4})/i,
      /\b(\d{4})\b(?!.*\b\d{4}\b)/,
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
