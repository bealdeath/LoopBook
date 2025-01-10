// File: src/utils/locationService.ts

import * as Location from "expo-location";
import { store } from "../redux/store";
import { startTrip, addLocationToTrip, endTrip } from "../redux/slices/tripSlice";

let trackingInterval: NodeJS.Timer | null = null;
let isTracking = false;

export async function startPeriodicTracking() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.warn("Foreground location permission not granted.");
    return;
  }

  if (isTracking) {
    console.warn("Tracking is already active.");
    return;
  }

  console.log("Starting periodic tracking...");
  isTracking = true;

  // Dispatch start trip
  store.dispatch(startTrip({ id: Date.now().toString(), startTime: new Date().toISOString() }));

  trackingInterval = setInterval(async () => {
    const location = await Location.getCurrentPositionAsync({});
    const coords = [location.coords.latitude, location.coords.longitude];

    console.log("Location update:", coords);

    // Dispatch location data to Redux
    store.dispatch(addLocationToTrip(coords));
  }, 5000); // Update location every 5 seconds
}

export function stopPeriodicTracking() {
  if (!isTracking) {
    console.warn("Tracking is not active.");
    return;
  }

  console.log("Stopping periodic tracking...");
  isTracking = false;

  // Clear interval and stop tracking
  if (trackingInterval) {
    clearInterval(trackingInterval);
    trackingInterval = null;
  }

  // Dispatch end trip
  store.dispatch(endTrip(new Date().toISOString()));
}
