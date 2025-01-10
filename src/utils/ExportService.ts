// File: src/utils/ExportService.ts

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

export async function exportReceiptsToCSV(receipts) {
  const csv = receipts
    .map((r) => `${r.merchantName},${r.amount},${r.category},${r.date}`)
    .join("\n");
  const fileUri = FileSystem.documentDirectory + "receipts.csv";

  await FileSystem.writeAsStringAsync(fileUri, csv);
  await Sharing.shareAsync(fileUri);
}
