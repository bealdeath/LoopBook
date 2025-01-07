// File: src/navigation/BottomTabNavigator.tsx

import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";

import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Text,
  Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation();

  function openModal() {
    setIsModalVisible(true);
  }
  function closeModal() {
    setIsModalVisible(false);
  }

  function handleGoToReceipts() {
    closeModal();
    navigation.navigate("ReceiptTracker" as never);
  }

  // Instead of "DistanceScreen", we use "MileageTracker" to show your map-based screen
  function handleGoToDistance() {
    closeModal();
    navigation.navigate("MileageTracker" as never);
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#007bff",
          tabBarInactiveTintColor: "gray",
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: "Home",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerTitle: "Settings",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cog" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      {/* Floating button at bottom-center */}
      <View style={styles.floatingBtnContainer}>
        <TouchableOpacity style={styles.floatingBtn} onPress={openModal}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal for picking Receipt vs Distance */}
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
  floatingBtnContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
  },
  floatingBtn: {
    width: 60,
    height: 60,
    backgroundColor: "#007bff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
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
