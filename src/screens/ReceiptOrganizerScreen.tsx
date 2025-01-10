// File: src/screens/ReceiptOrganizerScreen.tsx

import React from "react";
import { View, Text, SectionList, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

export default function ReceiptOrganizerScreen() {
  const receipts = useSelector((state: RootState) => state.receipts.data);

  // Prepare data for SectionList
  const sections = Object.entries(receipts).map(([year, months]) => ({
    title: year,
    data: Object.entries(months).map(([month, days]) => ({
      month,
      days: Object.entries(days).map(([day, receipts]) => ({
        day,
        receipts,
      })),
    })),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Organized Receipts</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => index.toString()}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <View>
            <Text style={styles.monthHeader}>Month: {item.month}</Text>
            {item.days.map((dayData) => (
              <View key={dayData.day}>
                <Text style={styles.dayHeader}>Day: {dayData.day}</Text>
                {dayData.receipts.map((receipt) => (
                  <Text key={receipt.id} style={styles.receiptText}>
                    {receipt.merchantName} - ${receipt.amount.toFixed(2)}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  sectionHeader: { fontSize: 20, fontWeight: "600", marginTop: 15, marginBottom: 5 },
  monthHeader: { fontSize: 18, fontWeight: "500", marginTop: 10 },
  dayHeader: { fontSize: 16, fontWeight: "500", marginLeft: 10, marginTop: 5 },
  receiptText: { fontSize: 14, marginLeft: 20, marginBottom: 5 },
});
