// File: src/screens/LedgerScreen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, TextInput } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  fetchLedgerTransactions,
  createLedgerTransaction,
  LedgerTransaction,
  LedgerLine,
} from "../redux/slices/ledgerSlice";
import { fetchAccounts, Account } from "../redux/slices/accountsSlice"; // if you have an accounts slice

export default function LedgerScreen() {
  const dispatch = useDispatch<AppDispatch>();

  const { data: ledgerData, loading } = useSelector((state: RootState) => state.ledger);
  const { data: accounts } = useSelector((state: RootState) => state.accounts || { data: [] });

  // local form
  const [memo, setMemo] = useState("");
  const [lines, setLines] = useState<LedgerLine[]>([
    { accountId: "", debit: 0, credit: 0 },
    { accountId: "", debit: 0, credit: 0 },
  ]);

  useEffect(() => {
    dispatch(fetchLedgerTransactions());
    // if you want accounts
    dispatch(fetchAccounts());
  }, [dispatch]);

  function handleCreateTx() {
    const totalDebits = lines.reduce((acc, l) => acc + (l.debit || 0), 0);
    const totalCredits = lines.reduce((acc, l) => acc + (l.credit || 0), 0);
    if (Math.abs(totalDebits - totalCredits) > 0.0001) {
      Alert.alert("Error", "Debits and credits must balance");
      return;
    }
    dispatch(
      createLedgerTransaction({
        date: new Date().toISOString().slice(0, 10),
        memo,
        lines,
      })
    )
      .unwrap()
      .then(() => {
        setMemo("");
        setLines([
          { accountId: "", debit: 0, credit: 0 },
          { accountId: "", debit: 0, credit: 0 },
        ]);
      })
      .catch((err) => {
        Alert.alert("Error", err.message);
      });
  }

  function renderLedgerItem({ item }: { item: LedgerTransaction }) {
    const totalDebits = item.lines.reduce((acc, l) => acc + (l.debit || 0), 0);
    const totalCredits = item.lines.reduce((acc, l) => acc + (l.credit || 0), 0);
    return (
      <View style={styles.txItem}>
        <Text style={styles.txDate}>{item.date}</Text>
        <Text style={styles.txMemo}>{item.memo || "No memo"}</Text>
        <Text style={styles.txSum}>
          D: {totalDebits.toFixed(2)} / C: {totalCredits.toFixed(2)}
        </Text>
        {item.lines.map((line, idx) => {
          const acct = accounts.find((a) => a.id === line.accountId);
          return (
            <Text key={idx} style={styles.txLine}>
              {acct ? acct.name : "No Account"} => D:{line.debit} C:{line.credit}
            </Text>
          );
        })}
      </View>
    );
  }

  function handleLineChange(index: number, field: keyof LedgerLine, val: string) {
    const newLines = [...lines];
    if (field === "debit" || field === "credit") {
      newLines[index][field] = parseFloat(val) || 0;
    } else {
      newLines[index][field] = val;
    }
    setLines(newLines);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ledger</Text>
      {loading && <Text>Loading Ledger...</Text>}

      <FlatList
        data={ledgerData}
        keyExtractor={(tx) => tx.id}
        renderItem={renderLedgerItem}
        style={{ flex: 1, marginBottom: 10 }}
      />

      <Text style={styles.subtitle}>Create Transaction</Text>
      <TextInput
        style={styles.input}
        placeholder="Memo"
        value={memo}
        onChangeText={setMemo}
      />

      {lines.map((line, idx) => (
        <View key={idx} style={styles.lineContainer}>
          <Text style={{ fontWeight: "bold" }}>Line {idx + 1}</Text>
          {/* if you want to pick an account */}
          <TextInput
            style={styles.input}
            placeholder="Account ID or name"
            value={line.accountId}
            onChangeText={(val) => handleLineChange(idx, "accountId", val)}
          />
          <View style={styles.debitCredit}>
            <TextInput
              style={styles.dcInput}
              placeholder="Debit"
              keyboardType="decimal-pad"
              value={String(line.debit)}
              onChangeText={(val) => handleLineChange(idx, "debit", val)}
            />
            <TextInput
              style={styles.dcInput}
              placeholder="Credit"
              keyboardType="decimal-pad"
              value={String(line.credit)}
              onChangeText={(val) => handleLineChange(idx, "credit", val)}
            />
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.createBtn} onPress={handleCreateTx}>
        <Text style={styles.btnText}>Create Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: "600", marginVertical: 10 },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  lineContainer: {
    backgroundColor: "#fff",
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  debitCredit: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dcInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginRight: 5,
  },
  createBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  txItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  txDate: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  txMemo: { fontSize: 14, marginBottom: 4 },
  txSum: { fontSize: 12, color: "#666", marginBottom: 4 },
  txLine: { fontSize: 12, color: "#666" },
});

