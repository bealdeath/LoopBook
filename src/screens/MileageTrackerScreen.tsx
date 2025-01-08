// Ensure proper cleanup and advanced UI
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Switch,
  Alert,
  TouchableOpacity,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { addTrip, updateTrip } from "../redux/slices/tripSlice";

const START_SPEED_KMH = 10;
const STOP_SPEED_KMH = 5;
const SPEED_QUEUE_SIZE = 5;
const REIMBURSE_RATE_PER_MILE = 0.655;
const KM_TO_MILES = 0.621371;

export default function MileageTrackerScreen() {
  const dispatch = useDispatch();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [tracking, setTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [autoDetect, setAutoDetect] = useState(false);
  const watchRef = useRef<any>(null);

  const startWatch = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permissions are required.");
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5 },
      (loc) => {
        setLocation(loc);
        const lat = loc.coords.latitude;
        const lon = loc.coords.longitude;
        setRoute((prev) => [...prev, [lat, lon]]);
      }
    );
  };

  useEffect(() => {
    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, []);

  const calcDistanceKm = (coords: [number, number][]) => {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lat1, lon1] = coords[i - 1];
      const [lat2, lon2] = coords[i];
      const R = 6371; // Earth radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return total;
  };

  useEffect(() => {
    if (route.length > 1) {
      const dist = calcDistanceKm(route);
      setDistance(dist);
    }
  }, [route]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        showsUserLocation
        followsUserLocation
        region={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Polyline
          coordinates={route.map(([lat, lon]) => ({
            latitude: lat,
            longitude: lon,
          }))}
          strokeColor="#007bff"
          strokeWidth={5}
        />
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.distanceText}>Distance: {distance.toFixed(2)} km</Text>
        <Button title={tracking ? "Stop" : "Start"} onPress={startWatch} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  infoContainer: { padding: 20, backgroundColor: "#fff" },
  distanceText: { fontSize: 18, marginBottom: 10 },
});
