import axios from "axios";
import * as ImageManipulator from "expo-image-manipulator";

// Cloud Function URL (live endpoint)
const CLOUD_FUNCTION_URL = "https://us-central1-loopbook-5b036.cloudfunctions.net/parseReceipt";

export const OCRService = {
  /**
   * Sends the image to the live Cloud Function for Document AI processing.
   * @param {string} imageUri - The URI of the image to process.
   * @returns {Promise<string>} - The extracted text from the image.
   */
  async extractText(imageUri: string): Promise<string> {
    console.log("Starting text extraction for image URI:", imageUri);

    try {
      // Resize image to optimize before sending to Cloud Function
      const processed = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1000 } }],
        { base64: true, compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const payload = { base64Image: processed.base64 };

      // Call the live Cloud Function
      const response = await axios.post(CLOUD_FUNCTION_URL, payload);

      // Extract text from the response
      const document = response.data.document;
      const extractedText = document?.text || "";
      console.log("Extracted text:", extractedText);

      return extractedText;
    } catch (err) {
      console.error("OCR Error:", err);
      throw new Error("Text extraction failed. Please verify the image quality or Cloud Function.");
    }
  },

  /**
   * Auto-categorize & detect GST from raw OCR text.
   * @param {string} text - The raw OCR text extracted from the image.
   * @returns {object} - An object containing parsed details such as total, category, merchant name, etc.
   */
  categorizeAndExtractDetails(text: string) {
    // 1) Basic categorization
    const categories = {
      Food: ["restaurant", "meal", "food", "dining", "cafe", "bakery", "burger"],
      Travel: ["taxi", "uber", "lyft", "gas", "petrol", "bus", "flight"],
      Shopping: ["store", "market", "shop", "supermarket", "mall"],
      Other: [],
    };

    let category = "Other";
    const lowerText = text.toLowerCase();
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some((kw) => lowerText.includes(kw))) {
        category = cat;
        break;
      }
    }

    // 2) Detect amounts
    const amounts = text.match(/(\d+\.\d{2})/g)?.map(Number) || [];
    const total = amounts.length ? Math.max(...amounts) : 0;

    // 3) Merchant name
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    let merchantName = "Unknown Merchant";
    const skipWords = [
      "subtotal", "total", "tax", "gst", "receipt", "thank you", "welcome",
      "change", "amount", "invoice", "paid", "www", "http"
    ];
    for (const line of lines) {
      const upper = line.toUpperCase();
      if (
        !skipWords.some((w) => upper.includes(w.toUpperCase())) &&
        (line.match(/\d/g) || []).length < 4 &&
        line.length >= 3
      ) {
        merchantName = line;
        break;
      }
    }

    // 4) Payment method
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

    // 5) Date detection
    let purchaseDate = "Unknown";
    const dateRegexes = [
      /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,
      /\b\d{4}-\d{1,2}-\d{1,2}\b/,
      /\b\d{1,2}-[A-Za-z]{3,}\-?\d{2,4}\b/,
      /\b[A-Za-z]{3,}\s\d{1,2},\s?\d{2,4}\b/,
    ];
    for (const re of dateRegexes) {
      const m = text.match(re);
      if (m) {
        purchaseDate = m[0];
        break;
      }
    }

    // 6) GST detection
    let gst = 0;
    const gstRegex = /\b(?:gst|tax)\s*\$?(\d+\.\d{2})/i;
    const gstMatch = text.match(gstRegex);
    if (gstMatch) {
      gst = parseFloat(gstMatch[1]);
    }

    return {
      total,
      category,
      purchaseDate,
      merchantName,
      paymentMethod,
      last4,
      gst,
    };
  },
};
