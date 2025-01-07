// File: src/utils/OCRService.ts
import axios from "axios";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

const GOOGLE_VISION_API_KEY = "***REMOVED***DvHiLb--iPnOwv77RaYGl62KNtBspdeEk";
const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

export const OCRService = {
  /**
   * Extract text from an image using Google Vision, with optional resizing.
   * If you'd like multi-language, set languageHints to e.g. ["en", "fr"] below.
   */
  async extractText(imageUri: string): Promise<string> {
    try {
      // 1) Preprocess: resize image for better OCR accuracy
      const processed = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1000 } }], // or desired width
        { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 2) Build request payload
      const payload = {
        requests: [
          {
            image: { content: processed.base64 }, // use the base64 from resized image
            features: [{ type: "TEXT_DETECTION" }],
            imageContext: {
              // Add language hints if needed:
              languageHints: ["en"], // e.g. ["en", "fr", "es"]
            },
          },
        ],
      };

      // 3) Call Google Vision
      const response = await axios.post(GOOGLE_VISION_API_URL, payload);
      const text = response.data?.responses?.[0]?.fullTextAnnotation?.text || "";
      return text;
    } catch (err) {
      console.error("OCR Error:", err);
      return "";
    }
  },

  /**
   * A minimal approach: parse category, total, date, merchant, paymentMethod, last4
   */
  categorizeAndExtractDetails(text: string) {
    // categories
    const categories = {
      Food: ["restaurant", "meal", "food", "dining", "cafe", "bakery", "hamburger", "burger"],
      Travel: ["taxi", "uber", "lyft", "gas", "petrol", "bus", "flight"],
      Clothing: ["apparel", "clothing", "shoe", "shirt", "pants", "boutique"],
      Groceries: ["grocery", "market", "supermarket", "store", "mart"],
    };

    const amounts = text.match(/(\d+\.\d{2})/g)?.map(Number) || [];
    const total = amounts.length ? Math.max(...amounts) : 0;

    let category = "Other";
    const lower = text.toLowerCase();
    for (const [cat, words] of Object.entries(categories)) {
      for (const w of words) {
        if (lower.includes(w)) {
          category = cat;
          break;
        }
      }
      if (category !== "Other") break;
    }

    const dateRegexes = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
      /\b\d{4}-\d{1,2}-\d{1,2}\b/,
      /\b\d{1,2}-[A-Za-z]{3}\.?-\d{4}\b/,
      /\b[A-Za-z]{3,}\s?\d{1,2},\s?\d{4}\b/, 
      /\b\d{1,2}\s[A-Za-z]{3,}\s\d{4}\b/,
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}:\d{2}\b/,
      /\b[A-Za-z]{3,}\.\s?\d{1,2},\s?\d{4}\b/,
      /\b\d{1,2}\s[A-Za-z]{3}\b/,
      /\b[A-Za-z]{3}\s\d{1,2}\b/,
    ];
    let purchaseDate = "Unknown Date";
    for (const rgx of dateRegexes) {
      const match = text.match(rgx);
      if (match) {
        purchaseDate = match[0];
        break;
      }
    }

    const skipWords = [
      "mon-sat", "sun", "http", "www", "subtotal", "total", "credit card", "merchant id",
      "tax id", "tax#", "invoice", "amount due", "amount paid", "change", "balance", "tel",
      "phone", "card #", "authorized", "approval", "batch", "welcome", "hello", "thank you",
      "please come again", "receipt", "customer copy",
    ];

    let merchantName = "Unknown Merchant";
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => {
        if (!l) return false;
        const upperL = l.toUpperCase();
        if ((l.match(/\d/g) || []).length >= 4) return false;
        for (const s of skipWords) {
          if (upperL.includes(s.toUpperCase())) return false;
        }
        return true;
      });

    let bestLine = "";
    let bestScore = 9999;
    lines.forEach((ln) => {
      const score = (ln.match(/[0-9\.,\/#!$%\^&\*;:{}=\-_`~()]/g) || []).length;
      if (score < bestScore) {
        bestScore = score;
        bestLine = ln;
      }
    });
    if (bestLine) merchantName = bestLine;

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
    for (const rgx of last4RegexList) {
      const found = text.match(rgx);
      if (found) {
        last4 = found[1];
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
