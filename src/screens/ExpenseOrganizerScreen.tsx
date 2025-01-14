// File: src/screens/ExpenseOrganizerScreen.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, FlatList } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

/*
  We assume you have an `expensesSlice.ts` or you’re using the existing `expenses` from your code.
  This screen filters & groups them. If you want “by project,” you can store a projectId in each expense.
*/

export default function ExpenseOrganizerScreen() {
  const expenses = useSelector((state: RootState) => state.expenses.data); // or receipts
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = expenses.filter((exp: any) =>
    exp.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expense Organizer</Text>
      <TextInput
        style={styles.input}
        placeholder="Search expenses..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <Text style={styles.desc}>{item.description}</Text>
            <Text style={styles.amt}>${item.amount.toFixed(2)}</Text>
            {item.projectId && <Text style={styles.proj}>Proj: {item.projectId}</Text>}
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center" }}>No expenses found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  expenseItem: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  desc: { fontSize: 16, fontWeight: "600" },
  amt: { fontSize: 14, color: "#333" },
  proj: { fontSize: 12, color: "#999" },
});
