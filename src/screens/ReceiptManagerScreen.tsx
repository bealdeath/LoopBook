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

export default function ReceiptManagerScreen() {
  const dispatch = useDispatch();
  const { baseCurrency, exchangeRates, status, error } = useSelector(
    (state) => state.currency
  );
  const expenses = useSelector((state) => state.expenses);

  useEffect(() => {
    dispatch(fetchExchangeRates(baseCurrency));
  }, [baseCurrency]);

  const renderExpense = ({ item }) => {
    const rate = exchangeRates[item.currency] || 1;
    const convertedAmount = CurrencyService.convertCurrency(item.total, rate);
    return (
      <View style={styles.expenseItem}>
        <Text>{item.category}</Text>
        <Text>
          {item.total} {item.currency} ({convertedAmount} {baseCurrency})
        </Text>
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
        data={expenses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderExpense}
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
  expenseItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
});
