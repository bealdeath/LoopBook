// File: src/screens/MileageTrackerScreen.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Switch,
  Alert,
} from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { addTrip, updateTrip } from "../redux/slices/tripSlice";

const START_SPEED_KMH = 10; // Speed to start tracking automatically
const STOP_SPEED_KMH = 5; // Speed to stop tracking automatically
const SPEED_QUEUE_SIZE = 5; // Number of speed readings to average
const REIMBURSE_RATE_PER_MILE = 0.655;
const KM_TO_MILES = 0.621371;

/**
 * Mileage Tracker Screen
 */
export default function MileageTrackerScreen() {
  const dispatch = useDispatch();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [tracking, setTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [autoDetect, setAutoDetect] = useState(false);

  const watchRef = useRef<any>(null);
  const speedQueueRef = useRef<number[]>([]); // Queue for averaging speed
  const [tripId, setTripId] = useState<string | null>(null);

  // Request location permission and set initial location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission Denied",
          "Location permission is required for mileage tracking."
        );
        return;
      }

      const initial = await Location.getCurrentPositionAsync({});
      setLocation(initial);
    })();

    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, []);

  function calcDistanceKm(coords: [number, number][]) {
    if (coords.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      total += distanceBetweenCoords(coords[i - 1], coords[i]);
    }
    return total;
  }

  function distanceBetweenCoords(
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number]
  ) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calcReimbursement(km: number) {
    const miles = km * KM_TO_MILES;
    return miles * REIMBURSE_RATE_PER_MILE;
  }

  function beginTrip() {
    if (tracking) return;

    setTracking(true);
    const newId = uuidv4();
    setTripId(newId);

    dispatch(
      addTrip({
        id: newId,
        route: [],
        distanceKm: 0,
        startTime: new Date().toISOString(),
        endTime: null,
        classification: "Personal",
        reimbursement: 0,
        reviewed: false,
      })
    );

    setRoute([]);
    setDistance(0);
    speedQueueRef.current = [];
  }

  function endTrip() {
    if (!tracking) return;

    setTracking(false);

    if (tripId) {
      const finalReimb = calcReimbursement(distance);

      dispatch(
        updateTrip({
          id: tripId,
          route,
          distanceKm: distance,
          startTime: new Date().toISOString(), // Store the original start
          endTime: new Date().toISOString(),
          classification: "Personal",
          reimbursement: finalReimb,
          reviewed: false,
        })
      );

      setTripId(null);
    }
  }

  function startWatch() {
    if (watchRef.current) return;

    watchRef.current = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
      },
      (loc) => {
        setLocation(loc);

        const lat = loc.coords.latitude;
        const lon = loc.coords.longitude;
        const speedMps = loc.coords.speed || 0;
        const speedKmh = speedMps * 3.6;

        speedQueueRef.current.push(speedKmh);

        if (speedQueueRef.current.length > SPEED_QUEUE_SIZE) {
          speedQueueRef.current.shift();
        }

        const avgSpeed =
          speedQueueRef.current.reduce((a, b) => a + b, 0) /
          speedQueueRef.current.length;

        if (autoDetect) {
          if (!tracking && avgSpeed > START_SPEED_KMH) {
            beginTrip();
          } else if (tracking && avgSpeed < STOP_SPEED_KMH) {
            endTrip();
          }
        }

        if (tracking) {
          setRoute((prev) => {
            const updated = [...prev, [lat, lon]];
            const dist = calcDistanceKm(updated);
            setDistance(dist);
            return updated;
          });
        }
      }
    );
  }

  useEffect(() => {
    startWatch();

    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
        watchRef.current = null;
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 37.78825,
          longitude: location?.coords.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
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
        <Text style={styles.distanceText}>
          Distance: {distance.toFixed(2)} km
        </Text>
        <View style={styles.row}>
          <Button
            title={tracking ? "Stop" : "Start"}
            onPress={tracking ? endTrip : beginTrip}
            color="#007bff"
          />
          <View style={styles.autoWrapper}>
            <Text style={styles.autoLabel}>Auto</Text>
            <Switch
              value={autoDetect}
              onValueChange={setAutoDetect}
              thumbColor={autoDetect ? "#007bff" : "#ccc"}
              trackColor={{ false: "#ddd", true: "#80c4ff" }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  infoContainer: {
    padding: 20,
    backgroundColor: "#fff",
  },
  distanceText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  autoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  autoLabel: {
    fontSize: 16,
    marginRight: 5,
  },
});
