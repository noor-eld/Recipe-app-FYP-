// firebaseConfig.ts
// This file sets up the connection between your app and Firebase.
// Think of it as giving your app the "address" of your Firebase project.

import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyD0lA_BCtHUvbgv7BYsLcqOGeSAY8IO4Bk",
    authDomain: "recipe-app-b4ea7.firebaseapp.com",
    projectId: "recipe-app-b4ea7",
    storageBucket: "recipe-app-b4ea7.firebasestorage.app",
    messagingSenderId: "34820301823",
    appId: "1:34820301823:web:4b5447aae8dc6e8574fdca"
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