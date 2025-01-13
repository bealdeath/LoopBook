import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import * as MailComposer from "expo-mail-composer";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceScreen() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [rate, setRate] = useState("0");

  const addItem = () => {
    if (!description.trim() || !quantity || !rate) {
      Alert.alert("Error", "All fields for an item are required.");
      return;
    }

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description,
      quantity: parseFloat(quantity),
      rate: parseFloat(rate),
    };
    setItems((prev) => [...prev, newItem]);

    // Reset fields
    setDescription("");
    setQuantity("0");
    setRate("0");
  };

  const calculateTotal = () =>
    items.reduce((acc, item) => acc + item.quantity * item.rate, 0);

  const shareInvoice = async () => {
    if (!clientName.trim() || !clientEmail.trim() || items.length === 0) {
      Alert.alert(
        "Error",
        "Client name, client email, and at least one item are required."
      );
      return;
    }

    // Build an invoice body
    let invoiceBody = `Invoice for: ${clientName}\n\nItems:\n`;
    items.forEach((item) => {
      invoiceBody += `${item.description} (Qty: ${item.quantity}, Rate: $${item.rate})\n`;
    });
    invoiceBody += `\nTotal: $${calculateTotal().toFixed(2)}\n\nThank you!`;

    // Compose an email using expo-mail-composer
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "Email services are not available on this device.");
      return;
    }

    try {
      const result = await MailComposer.composeAsync({
        recipients: [clientEmail],
        subject: `Invoice for ${clientName}`,
        body: invoiceBody,
      });

      if (result.status === MailComposer.MailComposerStatus.CANCELLED) {
        Alert.alert("Invoice Cancelled", "Email composition was cancelled.");
      } else {
        Alert.alert("Invoice Sent", "Invoice has been shared successfully!");
      }
    } catch (err) {
      console.error("Mail compose error:", err);
      Alert.alert("Error", "Failed to send invoice email.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Invoice</Text>

      <TextInput
        style={styles.input}
        placeholder="Client Name"
        value={clientName}
        onChangeText={setClientName}
      />

      <TextInput
        style={styles.input}
        placeholder="Client Email"
        keyboardType="email-address"
        value={clientEmail}
        onChangeText={setClientEmail}
      />

      <View style={styles.itemRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <TextInput
          style={[styles.input, { width: 80, marginHorizontal: 5 }]}
          placeholder="Qty"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />
        <TextInput
          style={[styles.input, { width: 80 }]}
          placeholder="Rate"
          keyboardType="numeric"
          value={rate}
          onChangeText={setRate}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addItem}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <View key={item.id} style={styles.itemList}>
          <Text style={styles.itemText}>
            {item.description} x {item.quantity} @ ${item.rate}
          </Text>
        </View>
      ))}

      <Text style={styles.totalText}>
        Total: ${calculateTotal().toFixed(2)}
      </Text>

      <TouchableOpacity style={styles.shareBtn} onPress={shareInvoice}>
        <Text style={styles.shareBtnText}>Share Invoice</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
    color: "#333",
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  addBtn: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
  },
  addBtnText: { color: "#fff", fontSize: 16 },
  itemList: {
    backgroundColor: "#fff",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  itemText: { fontSize: 16, color: "#333" },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 20,
    color: "#333",
  },
  shareBtn: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
