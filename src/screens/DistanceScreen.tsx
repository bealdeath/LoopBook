import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';

export default function DistanceScreen() {
  const [distance, setDistance] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [tracking, setTracking] = useState(false);
  const [previousLocation, setPreviousLocation] = useState<Location.LocationObject | null>(null);

  const handleStartTracking = async () => {
    const permissionResult = await Location.requestForegroundPermissionsAsync();

    if (!permissionResult.granted) {
      alert('Permission to access location is required!');
      return;
    }

    setTracking(true);

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        setCurrentLocation(location);

        if (previousLocation) {
          const distanceIncrement = calculateDistance(
            previousLocation.coords.latitude,
            previousLocation.coords.longitude,
            location.coords.latitude,
            location.coords.longitude
          );
          setDistance((prevDistance) => prevDistance + distanceIncrement);
        }

        setPreviousLocation(location);
      }
    );
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Distance Tracker</Text>
      <Text style={styles.info}>Distance: {distance.toFixed(2)} km</Text>
      <Text style={styles.info}>
        Current Location: {currentLocation ? `${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}` : 'Fetching...'}
      </Text>
      {!tracking && (
        <TouchableOpacity style={styles.button} onPress={handleStartTracking}>
          <Text style={styles.buttonText}>Start Tracking</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
