// File: src/utils/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeFirestore } from "firebase/firestore";

// Your actual Firebase config from the console:
const firebaseConfig = {
  apiKey: "AIzaSyBlIryh--FiQ79FuXo07ByTIRHs0eL8DTo",
  authDomain: "loopbook-5b036.firebaseapp.com",
  projectId: "loopbook-5b036",
  storageBucket: "loopbook-5b036.firebasestorage.app",
  messagingSenderId: "896907442782",
  appId: "1:896907442782:web:ce83989727d1fbc5ae92cf",
  measurementId: "G-CKCXGKM990",
};

// 1) Initialize the app
const app = initializeApp(firebaseConfig);

// 2) Initialize Auth with persistent storage
export const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 3) Initialize Firestore (for storing user profiles, receipts, etc.)
export const db = initializeFirestore(app, {
  // optional settings
});
