import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons name="map-marker" size={20} color="#007bff" />
        <Text style={styles.itemText}>Tracking Configuration</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons name="car" size={20} color="#007bff" />
        <Text style={styles.itemText}>Vehicles</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons name="office-building" size={20} color="#007bff" />
        <Text style={styles.itemText}>Workplaces</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons name="map-marker-outline" size={20} color="#007bff" />
        <Text style={styles.itemText}>Locations</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons name="currency-usd" size={20} color="#007bff" />
        <Text style={styles.itemText}>Mileage Rates</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item}>
        <MaterialCommunityIcons name="calendar" size={20} color="#007bff" />
        <Text style={styles.itemText}>Reporting Periods</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default SettingsScreen;
