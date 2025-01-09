// File: src/screens/ReceiptManagerScreen.tsx

import React, { useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { fetchExchangeRates } from "../redux/slices/currencySlice";
import { CurrencyService } from "../utils/currencyService";
import { RootState } from "../redux/store"; // Import RootState for TypeScript

export default function ReceiptManagerScreen() {
  const dispatch = useDispatch();
  const { baseCurrency, exchangeRates, status, error } = useSelector(
    (state: RootState) => state.currency
  );
  const receipts = useSelector((state: RootState) => state.receipts.data); // Select receipts instead of expenses

  useEffect(() => {
    dispatch(fetchExchangeRates(baseCurrency));
  }, [baseCurrency, dispatch]);

  const renderReceipt = ({ item }: { item: any }) => {
    const rate = exchangeRates["USD"] || 1; // Assuming receipts are in USD; adjust as needed
    const convertedAmount = CurrencyService.convertCurrency(item.amount, rate);
    return (
      <View style={styles.receiptItem}>
        <Text style={styles.receiptTitle}>{item.merchantName}</Text>
        <Text>Date: {item.purchaseDate}</Text>
        <Text>Category: {item.category}</Text>
        <Text>Total: ${item.amount.toFixed(2)}</Text>
        <Text>
          Converted: {convertedAmount.toFixed(2)} {baseCurrency}
        </Text>
        <Text>Payment Method: {item.paymentMethod}</Text>
        <Text>Last4: {item.last4}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt Manager</Text>
      <Button
        title="Change Base Currency"
        onPress={() => Alert.alert("Currency change feature coming soon!")}
      />
      {status === "loading" && <Text>Loading exchange rates...</Text>}
      {error && <Text>Error: {error}</Text>}
      <FlatList
        data={receipts}
        keyExtractor={(item) => item.id}
        renderItem={renderReceipt}
        ListEmptyComponent={<Text>No receipts scanned yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  receiptItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 10,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
