// File: src/utils/locationService.ts

import * as Location from "expo-location";
import { loop_background } from "../tasks/locationTask";

export async function startBackgroundLocation() {
  // 1) Request foreground permission
  const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
  if (fgStatus !== "granted") {
    console.warn("Foreground location permission not granted!");
    return;
  }

  // 2) Request background permission (iOS requires "Always")
  const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
  if (bgStatus !== "granted") {
    console.warn("Background location permission not granted!");
    return;
  }

  // 3) Start location updates in the background
  await Location.startLocationUpdatesAsync(loop_background, {
    accuracy: Location.Accuracy.High,
    distanceInterval: 20, // get an update every 20 meters
    deferredUpdatesInterval: 10000, // every 10s, if you prefer
    showsBackgroundLocationIndicator: true, // iOS only, shows blue bar
    foregroundService: {
      notificationTitle: "LoopBook Tracking",
      notificationBody: "Tracking your mileage in the background",
    },
  });
  console.log("Background location tracking started");
}

export async function stopBackgroundLocation() {
  await Location.stopLocationUpdatesAsync(loop_background);
  console.log("Background location tracking stopped");
}

export async function checkIfTracking() {
  const tasks = await Location.getRunningTasksAsync();
  return tasks.some((t) => t.taskName === loop_background);
}
