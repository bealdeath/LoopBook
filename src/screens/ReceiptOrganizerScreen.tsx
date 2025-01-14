import React, { useMemo } from "react";
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/rootReducer"; // If you have a typed RootState
import { useNavigation } from "@react-navigation/native";
import { Receipt } from "../redux/slices/receiptSlice";

interface SectionData {
  title: string; // e.g. "2023-09-23"
  data: Receipt[];
}

export default function ReceiptOrganizerScreen() {
  const navigation = useNavigation();
  const receiptsState = useSelector((state: RootState) => state.receipts);
  const data = receiptsState?.data || {};

  // Convert from year->month->day structure to a SectionList array
  const sections: SectionData[] = useMemo(() => {
    const result: SectionData[] = [];

    Object.keys(data).forEach((year) => {
      Object.keys(data[year]).forEach((month) => {
        Object.keys(data[year][month]).forEach((day) => {
          const dateKey = `${year}-${month}-${day}`;
          result.push({
            title: dateKey,
            data: data[year][month][day],
          });
        });
      });
    });

    // Sort by date descending if you want
    result.sort((a, b) => (a.title < b.title ? 1 : -1));

    return result;
  }, [data]);

  function handlePress(receipt: Receipt, dateKey: string) {
    const [yr, mo, dy] = dateKey.split("-");
    navigation.navigate("ReceiptDetail" as never, {
      id: receipt.id,
      year: yr,
      month: mo,
      day: dy,
    } as never);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Organized Receipts</Text>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item, section }) => (
          <TouchableOpacity
            style={styles.receiptItem}
            onPress={() => handlePress(item, section.title)}
          >
            <Text style={styles.receiptText}>
              {item.merchantName} - ${item.amount}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No receipts found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  headerContainer: { backgroundColor: "#eee", paddingVertical: 5, paddingHorizontal: 10 },
  headerText: { fontSize: 16, fontWeight: "600" },
  receiptItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  receiptText: { fontSize: 14, color: "#333" },
});
