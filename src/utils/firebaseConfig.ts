// File: src/utils/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeFirestore } from "firebase/firestore";
import Constants from "expo-constants";

// Ensure manifest or expoConfig is not null
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};

// Your Firebase configuration
const firebaseConfig = {
  apiKey: extra.GOOGLE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: "loopbook-5b036",
  storageBucket: "loopbook-5b036.appspot.com",
  messagingSenderId: "896907442782",
  appId: "1:896907442782:web:ce83989727d1fbc5ae92cf",
  measurementId: "G-CKCXGKM990",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence
export const firebaseAuth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore
export const db = initializeFirestore(app, {});
