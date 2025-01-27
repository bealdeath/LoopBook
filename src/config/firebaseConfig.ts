import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  initializeFirestore,
} from "firebase/firestore";

// -- Your actual Firebase config from the console:
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "loopbook-5b036.firebaseapp.com",
  projectId: "loopbook-5b036",
  storageBucket: "loopbook-5b036.appspot.com",
  messagingSenderId: "896907442782",
  appId: "1:896907442782:web:ce83989727d1fbc5ae92cf",
  measurementId: "G-CKCXGKM990",
};

/**
 * Create or re-use the app instance.
 */
let app;
if (!getApps().length) {
  // No initialized apps yet, create one
  app = initializeApp(firebaseConfig);
} else {
  // Re-use existing app
  app = getApp();
}

/**
 * Auth approach:
 * We try to initializeAuth only once. If it's already been done,
 * we can fallback to getAuth.
 */
let firebaseAuth;
try {
  firebaseAuth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If it was already initialized, we'll do:
  firebaseAuth = getAuth(app);
}

/**
 * Firestore approach:
 * same pattern - ensure we only do initializeFirestore once.
 */
let db;
try {
  db = initializeFirestore(app, {});
} catch (error) {
  db = getFirestore(app);
}

// Export both
export { firebaseAuth, db };
