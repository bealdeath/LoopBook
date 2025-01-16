// File: src/utils/OCRService.ts

import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";

const CLOUD_FUNCTION_URL = "https://us-central1-loopbook-5b036.cloudfunctions.net/parseReceipt";

export const OCRService = {
  async extractText(imageUri: string): Promise<string> {
    console.log("Starting text extraction for image URI:", imageUri);

    try {
      const processed = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1000 } }],
        { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const payload = { base64Image: processed.base64 };
      const response = await axios.post(CLOUD_FUNCTION_URL, payload);

      const doc = response.data.document;
      const extractedText = doc?.text || "";
      console.log("Extracted text:", extractedText);

      return extractedText;
    } catch (err) {
      console.error("OCR Error:", err);
      throw new Error("Text extraction failed. Check image or Cloud Function.");
    }
  },

  categorizeAndExtractDetails(text: string) {
    const upperText = text.toUpperCase();

    // 1) Brand detection
    const brandKeywords = ["IKEA", "COSTCO", "WALMART", "TARGET", "STARBUCKS", "APPLEBEES"];
    let merchantName = "Unknown Merchant";
    for (const brand of brandKeywords) {
      if (upperText.includes(brand)) {
        merchantName = brand;
        break;
      }
    }

    // fallback approach if brand not found
    if (merchantName === "Unknown Merchant") {
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const skipWords = ["subtotal","total","tax","gst","hst","receipt","thank you","www","http","invoice","paid","change","amount"];
      for (const line of lines) {
        const upLine = line.toUpperCase();
        if (
          !skipWords.some((w) => upLine.includes(w.toUpperCase())) &&
          (line.match(/\d/g) || []).length < 4 &&
          line.length >= 3
        ) {
          merchantName = line;
          break;
        }
      }
    }

    // 2) Weighted category logic
    const categoryDefs: Record<string, string[]> = {
      Food: ["food","cafe","restaurant","coffee","latte","cake","burger","meal","dining"],
      Travel: ["hotel","flight","uber","lyft","taxi","airbnb","train"],
      Shopping: ["store","market","shop","supermarket","mall","ikea","costco","walmart","target"],
      Tech: ["electronics","laptop","apple","bestbuy","circuit","usb"],
    };
    let bestCategory = "Other";
    let bestScore = 0;
    for (const [catName, keywords] of Object.entries(categoryDefs)) {
      let score = 0;
      for (const kw of keywords) {
        const re = new RegExp(`\\b${kw}\\b`, "i");
        if (re.test(text)) {
          score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestCategory = catName;
      }
    }

    // 3) Amount detection
    const amounts = text.match(/(\d+\.\d{2})/g)?.map(Number) || [];
    const total = amounts.length ? Math.max(...amounts) : 0;

    // 4) Payment method & last4
    let paymentMethod = "Unknown";
    let last4 = "0000";
    if (/visa/i.test(text)) paymentMethod = "Visa";
    if (/master.?card/i.test(text)) paymentMethod = "Mastercard";
    if (/amex|american express/i.test(text)) paymentMethod = "Amex";
    if (/discover/i.test(text)) paymentMethod = "Discover";
    if (/cash|paid in cash/i.test(text)) paymentMethod = "Cash";
    const last4match = text.match(/(\d{4})(?!.*\d{4})/);
    if (last4match) {
      last4 = last4match[1];
    }

    // 5) Date detection & fallback parse
    let purchaseDate = "Unknown";
    let purchaseDateISO: string | null = null;
    const dateRegexes = [
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/,
      /\b(\d{4}-\d{1,2}-\d{1,2})\b/,
      /\b(\d{1,2}-[A-Za-z]{3,}-\d{2,4})\b/,
      /\b([A-Za-z]{3,}\s\d{1,2},\s?\d{2,4})\b/,
    ];
    for (const re of dateRegexes) {
      const m = text.match(re);
      if (m) {
        purchaseDate = m[1];
        // Attempt parse
        let d = new Date(purchaseDate);
        if (isNaN(d.getTime())) {
          // fallback: sometimes "15-Jan-2025" doesn't parse well => replace dash
          const alt = purchaseDate.replace(/-/g, " ");
          d = new Date(alt);
        }
        if (!isNaN(d.getTime())) {
          purchaseDateISO = d.toISOString();
        }
        break;
      }
    }

    // 6) HST detection (or GST, PST, etc.)
    // We'll look for either "HST" or "tax" lines
    let hst = 0;
    let gst = 0; // if you want to keep separate
    const hstRegex = /\bHST\s*\$?(\d+\.\d{2})/i;
    const hstMatch = text.match(hstRegex);
    if (hstMatch) {
      hst = parseFloat(hstMatch[1]);
    } else {
      // fallback to "tax $xx.xx" which might be GST
      const gstRegex = /\b(?:gst|tax)\s*\$?(\d+\.\d{2})/i;
      const gstMatch = text.match(gstRegex);
      if (gstMatch) {
        gst = parseFloat(gstMatch[1]);
      }
    }

    return {
      category: bestCategory,
      total,
      purchaseDate,
      purchaseDateISO,
      merchantName,
      paymentMethod,
      last4,
      hst,
      gst,
    };
  },
};
