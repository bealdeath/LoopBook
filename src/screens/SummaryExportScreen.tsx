// File: src/screens/SummaryExportScreen.tsx

import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import * as Sharing from "expo-sharing";
import { PDFDocument, StandardFonts } from "pdf-lib";

export default function SummaryExportScreen() {
  const receipts = useSelector((state: RootState) => state.receipts.data);
  const trips = useSelector((state: RootState) => state.trips.data);

  const totalReceipts = useMemo(() => {
    return receipts.reduce((acc, r) => acc + r.amount, 0);
  }, [receipts]);

  const totalMileage = useMemo(() => {
    return trips.reduce((acc, t) => acc + t.distanceKm, 0);
  }, [trips]);

  const totalReimburse = useMemo(() => {
    return trips.reduce((acc, t) => acc + t.reimbursement, 0);
  }, [trips]);

  async function generateAndSharePdf() {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([550, 700]);
      const { width, height } = page.getSize();

      // basic text
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.drawText("LoopBook Summary Report", {
        x: 50, y: height - 50, size: 20, font,
      });
      page.drawText(`Total Receipt Expenses: $${totalReceipts.toFixed(2)}`, {
        x: 50, y: height - 80, size: 14, font,
      });
      page.drawText(`Total Mileage: ${totalMileage.toFixed(2)} km`, {
        x: 50, y: height - 100, size: 14, font,
      });
      page.drawText(`Total Reimbursement: $${totalReimburse.toFixed(2)}`, {
        x: 50, y: height - 120, size: 14, font,
      });

      // finalize
      const pdfBytes = await pdfDoc.saveAsBase64({ dataUri: true });
      const base64Data = pdfBytes.split(",")[1]; // remove "data:application/pdf..."

      // create a local URI for sharing
      const filename = FileSystem.cacheDirectory + "loopbook_summary.pdf";
      await FileSystem.writeAsStringAsync(filename, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Error", "Sharing is not available on this device");
        return;
      }
      await Sharing.shareAsync(filename);
    } catch (err) {
      console.log("PDF generation error:", err);
      Alert.alert("Error", "Failed to create or share PDF");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary & Export</Text>
      <View style={styles.card}>
        <Text style={styles.label}>
          Total Receipt Expenses: ${totalReceipts.toFixed(2)}
        </Text>
        <Text style={styles.label}>
          Total Mileage: {totalMileage.toFixed(2)} km
        </Text>
        <Text style={styles.label}>
          Total Reimbursement: ${totalReimburse.toFixed(2)}
        </Text>
      </View>

      <TouchableOpacity style={styles.exportBtn} onPress={generateAndSharePdf}>
        <Text style={styles.exportText}>Export PDF</Text>
      </TouchableOpacity>
    </View>
  );
}

// you'll need to import "expo-file-system" at top if you want to do that
import * as FileSystem from "expo-file-system";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  label: { fontSize: 16, marginBottom: 8 },
  exportBtn: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  exportText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
