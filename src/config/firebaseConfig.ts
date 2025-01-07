// File: src/config/firebaseConfig.ts
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR-FIREBASE-API-KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

export const firebaseApp = initializeApp(firebaseConfig);
