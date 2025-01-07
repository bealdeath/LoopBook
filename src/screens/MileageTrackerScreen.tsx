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

const START_SPEED_KMH = 10;
const STOP_SPEED_KMH = 5;
const SPEED_QUEUE_SIZE = 5;
const REIMBURSE_RATE_PER_MILE = 0.655; 
const KM_TO_MILES = 0.621371;

/**
 * This screen uses speed averaging, auto detect, 
 * and updates the trip in Redux with each new location.
 */
export default function MileageTrackerScreen() {
  const dispatch = useDispatch();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [tracking, setTracking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [autoDetect, setAutoDetect] = useState(false);

  // watchRef for watchPositionAsync
  const watchRef = useRef<any>(null);
  // a rolling queue to store speed
  const speedQueueRef = useRef<number[]>([]);
  // store the current trip's ID in Redux
  const [tripId, setTripId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Permission Denied", "Need location for mileage tracking.");
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

  function distanceBetweenCoords(
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number]
  ) {
    const R = 6371; // Earth radius km
    const toRad = (val: number) => (val * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function calcDistanceKm(coords: [number, number][]) {
    if (coords.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      total += distanceBetweenCoords(coords[i - 1], coords[i]);
    }
    return total;
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

    // Add a new trip to Redux
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
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    if (tripId) {
      const finalReimb = calcReimbursement(distance);
      dispatch(
        updateTrip({
          id: tripId,
          route,
          distanceKm: distance,
          startTime: new Date().toISOString(), // or store the original start
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
    if (watchRef.current) return; // already watching
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

        // push speed into queue
        speedQueueRef.current.push(speedKmh);
        if (speedQueueRef.current.length > SPEED_QUEUE_SIZE) {
          speedQueueRef.current.shift();
        }
        // compute average
        const avgSpeed =
          speedQueueRef.current.reduce((a, b) => a + b, 0) /
          speedQueueRef.current.length;

        // auto detect logic
        if (autoDetect) {
          if (!tracking && avgSpeed > START_SPEED_KMH) {
            beginTrip();
          } else if (tracking && avgSpeed < STOP_SPEED_KMH) {
            endTrip();
          }
        }

        // if tracking, update route
        if (tracking && tripId) {
          setRoute((prev) => {
            const updated = [...prev, [lat, lon]];
            const dist = calcDistanceKm(updated);
            setDistance(dist);

            const reimb = calcReimbursement(dist);
            // update Redux
            dispatch(
              updateTrip({
                id: tripId,
                route: updated,
                distanceKm: dist,
                startTime: new Date().toISOString(), // or store original
                endTime: null,
                classification: "Personal",
                reimbursement: reimb,
                reviewed: false,
              })
            );
            return updated;
          });
        }
      }
    );
  }

  function stopWatch() {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
  }

  useEffect(() => {
    // Start watching once we mount, to allow speed detection
    startWatch();
    return () => {
      stopWatch();
    };
  }, []);

  function handleToggleTracking() {
    if (tracking) {
      endTrip();
    } else {
      beginTrip();
    }
  }

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
        {route.length > 0 && (
          <Marker
            coordinate={{
              latitude: route[route.length - 1][0],
              longitude: route[route.length - 1][1],
            }}
            title="Current Location"
          />
        )}
      </MapView>
      <View style={styles.infoContainer}>
        <Text style={styles.distanceText}>
          Distance: {distance.toFixed(2)} km
        </Text>
        <View style={styles.row}>
          <Button
            title={tracking ? "Stop" : "Start"}
            onPress={handleToggleTracking}
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
