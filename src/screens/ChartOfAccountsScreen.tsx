// File: src/screens/ChartOfAccountsScreen.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  removeAccount,
  Account,
  AccountType,
} from "../redux/slices/accountsSlice";

/**
 * Hard-coded options for account type
 */
const ACCOUNT_TYPES: AccountType[] = [
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
];

export default function ChartOfAccountsScreen() {
  const dispatch = useDispatch<AppDispatch>();

  // Grab accounts from Redux
  const { data: accounts, loading } = useSelector(
    (state: RootState) => state.accounts
  );

  // We store new account form in local state
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("EXPENSE");
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Fetch existing accounts on mount
    dispatch(fetchAccounts());
  }, [dispatch]);

  /**
   * Handle creating a new account
   */
  function handleCreateAccount() {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter an account name.");
      return;
    }

    dispatch(
      createAccount({
        name,
        type,
        description,
      })
    )
      .unwrap()
      .then(() => {
        // Clear inputs
        setName("");
        setDescription("");
        setType("EXPENSE");
      })
      .catch((err) => {
        Alert.alert("Error", err.message);
      });
  }

  /**
   * Handle deleting an account
   */
  function handleDeleteAccount(acctId: string) {
    Alert.alert("Confirm", "Are you sure you want to delete this account?", [
      {
        text: "Yes",
        onPress: () => {
          dispatch(removeAccount(acctId)).catch((err) =>
            Alert.alert("Error", err.message)
          );
        },
      },
      { text: "No", style: "cancel" },
    ]);
  }

  /**
   * (Optional) handle edit account. 
   * For simplicity, we just do a prompt or a new screen. 
   * We'll do a basic approach with an Alert prompt example:
   */
  function handleEditAccount(acct: Account) {
    Alert.prompt(
      "Edit Account Name",
      "Enter new name",
      (text) => {
        dispatch(updateAccount({ id: acct.id, changes: { name: text } }));
      },
      "plain-text",
      acct.name
    );
  }

  /**
   * Render each account in a FlatList
   */
  function renderAccountItem({ item }: { item: Account }) {
    return (
      <View style={styles.accountItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.accountName}>
            {item.name} ({item.type})
          </Text>
          {item.description ? (
            <Text style={styles.accountDesc}>{item.description}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => handleEditAccount(item)}
        >
          <Text style={{ color: "#fff" }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteAccount(item.id)}
        >
          <Text style={{ color: "#fff" }}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chart of Accounts</Text>

      {loading && <Text>Loading Accounts...</Text>}

      {/* List of existing accounts */}
      <FlatList
        data={accounts}
        keyExtractor={(acct) => acct.id}
        renderItem={renderAccountItem}
      />

      {/* Form to create a new account */}
      <Text style={styles.formTitle}>Create New Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Account Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.typeRow}>
        <Text style={{ marginRight: 10 }}>Type:</Text>
        {ACCOUNT_TYPES.map((acctType) => (
          <TouchableOpacity
            key={acctType}
            style={[
              styles.typeBtn,
              acctType === type && { backgroundColor: "#007bff" },
            ]}
            onPress={() => setType(acctType)}
          >
            <Text style={{ color: acctType === type ? "#fff" : "#007bff" }}>
              {acctType}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.createBtn} onPress={handleCreateAccount}>
        <Text style={styles.createBtnText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    padding: 10,
  },
  accountName: { fontSize: 16, fontWeight: "600", color: "#333" },
  accountDesc: { fontSize: 14, color: "#666" },
  editBtn: {
    backgroundColor: "#28a745",
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    padding: 8,
    borderRadius: 5,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    alignItems: "center",
  },
  typeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007bff",
    marginRight: 5,
    marginBottom: 5,
  },
  createBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
