// firebaseConfig.ts
// This file sets up the connection between your app and Firebase.
// Think of it as giving your app the "address" of your Firebase project.

import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { getReactNativePersistence } = require("firebase/auth");

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase — this "starts up" Firebase in your app
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage for persistence
// This means when a user logs in, they STAY logged in even if they close the app.
// AsyncStorage saves the login info on the phone's local storage.
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore — this is your database
const db = getFirestore(app);

// Export these so other files can use them
export { auth, db };