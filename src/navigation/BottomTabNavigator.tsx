// File: src/navigation/BottomTabNavigator.js

import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import DynamicDashboardScreen from "../screens/DynamicDashboardScreen";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SettingsScreen } from "../screens/SettingsScreen"; 
// If you want the Settings in the tab, you can add a third tab. For now, let's keep two.

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const handleGoToReceipts = () => {
    closeModal();
    // Switch to the route that actually scans receipts
    // If you're using "ReceiptTracker" or "ReceiptEditor", choose the correct route:
    navigation.navigate("ReceiptTracker");
  };

  const handleGoToDistance = () => {
    closeModal();
    navigation.navigate("MileageTracker");
  };

  const handleGoToBulkUpload = () => {
    closeModal();
    navigation.navigate("BulkUploadScreen");
  };

  return (
    <>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarStyle: {
            height: 60,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Dashboard"
          component={DynamicDashboardScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* The floating plus button for scanning, etc. */}
      <TouchableOpacity style={styles.floatingBtn} onPress={openModal}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* The modal for scanning receipts, tracking distance, etc. */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose an Option</Text>

            <Pressable style={styles.modalOption} onPress={handleGoToReceipts}>
              <MaterialCommunityIcons
                name="file-document"
                size={24}
                color="#007bff"
              />
              <Text style={styles.modalOptionText}>Scan Receipt</Text>
            </Pressable>

            <Pressable style={styles.modalOption} onPress={handleGoToDistance}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={24}
                color="#007bff"
              />
              <Text style={styles.modalOptionText}>Track Distance</Text>
            </Pressable>

            <Pressable style={styles.modalOption} onPress={handleGoToBulkUpload}>
              <MaterialCommunityIcons
                name="folder-upload"
                size={24}
                color="#007bff"
              />
              <Text style={styles.modalOptionText}>Bulk Upload</Text>
            </Pressable>

            <Pressable style={styles.modalCancel} onPress={closeModal}>
              <Text style={{ color: "#fff" }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingBtn: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    bottom: 20,
    elevation: 5,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalOptionText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#007bff",
  },
  modalCancel: {
    marginTop: 10,
    backgroundColor: "#f00",
    padding: 10,
    borderRadius: 8,
  },
});
