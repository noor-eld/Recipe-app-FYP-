// ctx.tsx
// This is the "brain" of your authentication system.
// It keeps track of WHO is logged in and provides signIn/signOut functions
// to every screen in your app.

// WHAT IS CONTEXT? Imagine a backpack that every screen in your app can reach into.
// Instead of passing "is the user logged in?" to every single screen manually,
// we put it in this "backpack" (context) and any screen can check it.

import React, { createContext, useContext, useState, useEffect } from "react";
import {
    onAuthStateChanged,       // Listens for login/logout changes
    signInWithEmailAndPassword, // Logs in with email + password
    createUserWithEmailAndPassword, // Creates a new account
    signOut as firebaseSignOut,  // Logs out
    User,                        // The type for a Firebase user object
} from "firebase/auth";
import { auth } from "./firebaseConfig"; // Our Firebase connection

// --- Define the shape of our context ---
// This is like a contract that says "our backpack will ALWAYS contain these things"
type AuthContextType = {
    session: User | null;        // The logged-in user (or null if not logged in)
    isLoading: boolean;          // Are we still checking if the user is logged in?
    signIn: (email: string, password: string) => Promise<void>;   // Function to log in
    signUp: (email: string, password: string) => Promise<void>;   // Function to create account
    signOut: () => void;         // Function to log out
};

// --- Create the context (the "backpack") ---
const AuthContext = createContext<AuthContextType>({
    session: null,
    isLoading: true,
    signIn: async () => {},
    signUp: async () => {},
    signOut: () => {},
});

// --- This hook lets any screen easily access the backpack ---
// Instead of writing useContext(AuthContext) everywhere, we just write useSession()
export function useSession() {
    return useContext(AuthContext);
}

// --- The Provider wraps your entire app and fills the backpack ---
export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // This runs once when the app starts.
    // onAuthStateChanged is like a security guard that watches the door.
    // Whenever someone logs in or out, it tells us immediately.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setSession(user);    // Update who's logged in (or null if nobody)
            setIsLoading(false); // We're done checking
        });

        // Cleanup: stop listening when the component is removed
        return unsubscribe;
    }, []);

    // --- Sign In function ---
    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // We don't need to manually set session here!
            // onAuthStateChanged (the "security guard" above) will detect the login
            // and update session automatically. That's the beauty of this pattern.
        } catch (error: any) {
            // If something goes wrong (wrong password, no account, etc.), throw the error
            // so the login screen can show a message to the user
            throw error;
        }
    };

    // --- Sign Up function (create new account) ---
    const signUp = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Same as signIn — onAuthStateChanged handles updating the session
        } catch (error: any) {
            throw error;
        }
    };

    // --- Sign Out function ---
    const signOut = () => {
        firebaseSignOut(auth);
        // Again, onAuthStateChanged will detect this and set session to null
    };

    // --- Provide everything to the rest of the app ---
    return (
        <AuthContext.Provider value={{ session, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}