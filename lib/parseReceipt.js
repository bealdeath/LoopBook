"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseReceipt = parseReceipt;
const documentai_1 = require("@google-cloud/documentai");
// Adjust these to your actual GCP config
const projectId = "loopbook-5b036";
const location = "us";
const processorId = "7421c8760d26fc66";
const docAiClient = new documentai_1.DocumentProcessorServiceClient();
async function parseReceipt(req, res) {
    try {
        const base64Image = req.body.base64Image;
        if (!base64Image) {
            return res.status(400).json({ error: "No base64Image provided." });
        }
        // 1) Call Document AI
        const imageBuffer = Buffer.from(base64Image, "base64");
        const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
        const request = {
            name,
            rawDocument: {
                content: imageBuffer,
                mimeType: "image/jpeg",
            },
        };
        const [result] = await docAiClient.processDocument(request);
        const doc = result.document;
        if (!doc) {
            return res.status(500).json({ error: "No document returned by Document AI." });
        }
        // 2) Parse Document AI fields
        let vendorName = "Unknown";
        let docAiTotal = 0;
        let purchaseDate = "Unknown";
        let docAiTaxes = 0;
        if (doc.entities) {
            for (const entity of doc.entities) {
                const type = (entity.type || "").toLowerCase();
                switch (type) {
                    case "merchant_name":
                        vendorName = entity.mentionText || "Unknown";
                        break;
                    case "total_amount":
                        docAiTotal = parseFloat(entity.mentionText || "0");
                        break;
                    case "transaction_date":
                        purchaseDate = entity.mentionText || "Unknown";
                        break;
                    case "tax_amount":
                        docAiTaxes = parseFloat(entity.mentionText || "0");
                        break;
                }
            }
        }
        const rawText = doc.text || "";
        // 3) Fallback logic
        const cardBrand = detectCardBrand(rawText);
        if (purchaseDate === "Unknown") {
            const fallbackDate = detectDateWithDayMonthDisambiguation(rawText);
            if (fallbackDate)
                purchaseDate = fallbackDate;
        }
        const category = detectCategory(rawText);
        // If vendor still unknown, do dictionary fallback
        if (vendorName === "Unknown") {
            const fallbackVendor = detectFallbackVendor(rawText);
            if (fallbackVendor)
                vendorName = fallbackVendor;
        }
        // Improved last-4 approach
        const last4 = detectCardLast4(rawText);
        // 4) Attempt line-item detection
        const { lineItems, extraTax } = tryParseLineItems(rawText);
        // 5) Merge docAiTaxes + extraTax
        const totalTaxes = parseFloat((docAiTaxes + extraTax).toFixed(2));
        // 6) Find largest plausible total
        const finalTotal = findLargestDollarAmount(rawText);
        // Decide base total
        let baseTotal = docAiTotal > 0 ? docAiTotal : finalTotal;
        if (finalTotal > docAiTotal &&
            docAiTotal > 0 &&
            (finalTotal - docAiTotal) > 0.5 * docAiTotal) {
            // if finalTotal is way bigger, override
            baseTotal = finalTotal;
        }
        else if (finalTotal > docAiTotal && docAiTotal === 0) {
            baseTotal = finalTotal;
        }
        // 7) Return everything
        const responsePayload = {
            vendorName,
            totalAmount: parseFloat(baseTotal.toFixed(2)),
            docAiTotal: parseFloat(docAiTotal.toFixed(2)),
            taxes: totalTaxes,
            purchaseDate,
            cardBrand,
            last4,
            category,
            rawText,
            lineItems,
        };
        return res.json(responsePayload);
    }
    catch (err) {
        console.error("parseReceipt error:", err.message);
        return res.status(500).json({ error: err.message });
    }
}
/** ---------- HELPER FUNCTIONS BELOW ---------- */
/** detectCardBrand */
function detectCardBrand(text) {
    const lower = text.toLowerCase();
    if (lower.includes("mastercard") || lower.includes("master card"))
        return "Mastercard";
    if (lower.includes("visa"))
        return "Visa";
    if (lower.includes("amex") || lower.includes("american express"))
        return "AMEX";
    if (lower.includes("discover"))
        return "Discover";
    return "Unknown";
}
/**
 * detectCardLast4
 * We'll:
 * 1. Split raw text into lines
 * 2. Skip lines that might be phone/address lines
 * 3. In each line, look for patterns like:
 *    - XXXXXXXXXXXXXXXX6482
 *    - ****6482
 *    - [6482]
 *    - or anything with 4 digits after X or *
 */
function detectCardLast4(text) {
    const lines = text.split(/\r?\n/);
    let found = "";
    for (const line of lines) {
        const lower = line.toLowerCase();
        // skip phone/address lines if they contain "tel", "street", "ave", "leslie", area codes, etc.
        if (lower.includes("tel") ||
            lower.includes("street") ||
            lower.includes("lesl") ||
            lower.includes("ave") ||
            lower.includes("(") // maybe phone area code
        ) {
            continue;
        }
        // Now try patterns
        // (A) bracketed [xxxx]
        const bracketMatch = line.match(/\[(\d{4})\]/);
        if (bracketMatch) {
            found = bracketMatch[1];
            break;
        }
        // (B) "XXXXXXXXX6482" or "****6482"
        // We'll look for 4 or more X or * in a row, followed by 4 digits
        const maskedMatch = line.match(/(?:\*{4,}|x{4,})(\d{4})/i);
        if (maskedMatch) {
            found = maskedMatch[1];
            break;
        }
        // (C) Possibly something like "ACCT: 6482"
        const acctMatch = line.match(/\b(\d{4})\b/);
        if (acctMatch) {
            // We found a standalone 4-digit. But we need to ensure it's not e.g. 9240 from an address
            // Let's see if the line also has "acct" or "card" or "amex" or "visa" or "master" or "xxxx"
            if (lower.includes("acct") ||
                lower.includes("card") ||
                lower.includes("amex") ||
                lower.includes("visa") ||
                lower.includes("master") ||
                lower.includes("x")) {
                found = acctMatch[1];
                break;
            }
        }
    }
    return found || "0000";
}
/** detectDateWithDayMonthDisambiguation */
function detectDateWithDayMonthDisambiguation(text) {
    // (A) dd/mm/yy or mm/dd/yy
    const slashDashRegex = /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/;
    let match = text.match(slashDashRegex);
    if (match) {
        let p1 = parseInt(match[1], 10);
        let p2 = parseInt(match[2], 10);
        const yearNum = parseYear(match[3]);
        let day = 1, month = 1;
        // If p1>12 => day = p1, month = p2
        if (p1 > 12) {
            day = p1;
            month = p2;
        }
        else if (p2 > 12) {
            // If p2>12 => day = p2, month = p1
            day = p2;
            month = p1;
        }
        else {
            // default p1=month, p2=day
            month = p1;
            day = p2;
        }
        return formatDateParts(String(yearNum), String(month), String(day));
    }
    // (B) "MonthName day, year"
    const monthRegex = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.?\s+(\d{1,2}),\s+(\d{2,4})/i;
    match = text.match(monthRegex);
    if (match) {
        const monthStr = match[1];
        const d = parseInt(match[2], 10);
        const y = parseYear(match[3]);
        const monthNum = monthNameToNumber(monthStr);
        return formatDateParts(String(y), String(monthNum), String(d));
    }
    // (C) "dd-mm-yy" e.g. 25-01-18
    const dmyRegex = /(\d{1,2})-(\d{1,2})-(\d{2,4})/;
    match = text.match(dmyRegex);
    if (match) {
        const d = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const y = parseYear(match[3]);
        return formatDateParts(String(y), String(m), String(d));
    }
    return null;
}
function parseYear(str) {
    const num = parseInt(str, 10);
    if (str.length === 2) {
        return 2000 + num;
    }
    return num;
}
function monthNameToNumber(m) {
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "sept", "oct", "nov", "dec"];
    const lower = m.toLowerCase().replace(".", "");
    const idx = months.indexOf(lower);
    return (idx >= 0) ? idx + 1 : 1;
}
function formatDateParts(yStr, mStr, dStr) {
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const day = parseInt(dStr, 10);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthName = "M" + month;
    if (month >= 1 && month <= 12) {
        monthName = monthNames[month - 1];
    }
    return `${monthName} ${day}, ${year}`;
}
/** detectCategory */
function detectCategory(text) {
    const lower = text.toLowerCase();
    if (lower.includes("costco") || lower.includes("grocery") || lower.includes("milk") || lower.includes("egg")) {
        return "Groceries";
    }
    if (lower.includes("restaurant") ||
        lower.includes("cafe") ||
        lower.includes("food") ||
        lower.includes("bar") ||
        lower.includes("burger") ||
        lower.includes("anderson")) {
        return "Food";
    }
    if (lower.includes("shell") || lower.includes("gas") || lower.includes("fuel")) {
        return "Fuel";
    }
    return "Other";
}
/** detectFallbackVendor */
function detectFallbackVendor(text) {
    const lower = text.toLowerCase();
    if (lower.includes("shell"))
        return "Shell";
    if (lower.includes("costco"))
        return "Costco";
    if (lower.includes("ikea"))
        return "IKEA";
    if (lower.includes("l'avenue"))
        return "L'Avenue Toronto";
    if (lower.includes("the morning after"))
        return "The Morning After";
    if (lower.includes("john andersons"))
        return "John Anderson's Hamburgers";
    return null;
}
/**
 * tryParseLineItems
 * We'll skip lines if description is empty or numeric,
 * also skip lines with "total" or "subtotal" or "tax"
 */
function tryParseLineItems(rawText) {
    const lines = rawText.split(/\r?\n/);
    const lineItems = [];
    let extraTax = 0;
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        // (A) check if "HST" or "tax"
        const taxMatch = trimmed.match(/(hst|tax)\s?.*\$?(\d+(\.\d{1,2})?)/i);
        if (taxMatch) {
            const val = parseFloat(taxMatch[2]);
            if (!isNaN(val))
                extraTax += val;
            continue;
        }
        // (B) line ends with a price => "desc $12.50" or "desc 12.50"
        const itemMatch = trimmed.match(/^(.*?)(?:\s+)?\$?(\d+\.\d{1,2})$/);
        if (itemMatch) {
            let desc = itemMatch[1].trim();
            const valStr = itemMatch[2];
            const val = parseFloat(valStr);
            if (!isNaN(val) && val < 99999) {
                const lowerDesc = desc.toLowerCase();
                // skip if "total" or "subtotal" etc
                if (lowerDesc.includes("total") ||
                    lowerDesc.includes("subtotal") ||
                    lowerDesc.includes("tax") ||
                    lowerDesc.includes("tender")) {
                    continue;
                }
                // skip empty or purely numeric desc
                if (!desc || /^[\d.]+$/.test(desc)) {
                    continue;
                }
                // add
                lineItems.push({ description: desc, price: val });
            }
        }
    }
    return { lineItems, extraTax };
}
/** findLargestDollarAmount */
function findLargestDollarAmount(text) {
    const matches = text.match(/\$?\d+\.\d{1,2}/g) || [];
    let max = 0;
    for (const raw of matches) {
        if (raw.includes("-"))
            continue; // skip phone-like
        const val = parseFloat(raw.replace(/\$/g, ""));
        if (!isNaN(val) && val < 999999 && val > max) {
            max = val;
        }
    }
    return max;
}
