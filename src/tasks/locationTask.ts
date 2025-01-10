import { LocationObject } from "expo-location";
import * as Location from "expo-location";

// A unique name for our location task
export const loop_background = "BACKGROUND_LOCATION_TASK";

// 1) Define the background task
TaskManager.defineTask(loop_background, async ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: LocationObject[] };
    if (locations && locations.length > 0) {
      // We have new location(s)
      const { speed } = locations[0].coords;
      const kmPerHour = speed ? speed * 3.6 : 0; // Convert m/s to km/h

      // Check if speed above 10 km/h
      if (kmPerHour >= 10) {
        console.log("Driving detected!", kmPerHour, "km/h");
        // TODO: Dispatch to Redux or handle logic to "start tracking" automatically.
      } else {
        console.log("Speed below 10 km/h:", kmPerHour);
      }
    }
  }
});
