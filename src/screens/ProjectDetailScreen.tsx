// File: src/screens/ProjectDetailScreen.tsx

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/store";
import { Project, updateProject } from "../redux/slices/projectSlice";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function ProjectDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { projectId } = route.params;

  const dispatch = useDispatch();
  const project: Project | undefined = useSelector((state: RootState) =>
    state.projects.data.find((p) => p.id === projectId)
  );

  if (!project) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Project Not Found</Text>
      </View>
    );
  }

  const handleLinkInvoice = () => {
    // Example: navigate to InvoiceScreen with this project's ID
    // so user can create an invoice linked to this project
    navigation.navigate("InvoiceScreen" as never, { projectId: project.id } as never);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{project.name}</Text>
      <Text style={styles.description}>{project.description}</Text>

      <TouchableOpacity style={styles.invoiceBtn} onPress={handleLinkInvoice}>
        <Text style={styles.invoiceBtnText}>Create/Link Invoice</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 16, color: "#666", marginBottom: 20 },
  invoiceBtn: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  invoiceBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
