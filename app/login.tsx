// login.tsx
// This is what the user sees when they're not logged in.
// It has two text fields (email + password) and two buttons (Log In + Sign Up).

import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useState } from "react";
import { useSession } from "../ctx";
import { router } from "expo-router";

export default function LoginPage() {
    // Get signIn and signUp functions from our auth context (the "backpack")
    const { signIn } = useSession();

    // --- State variables ---
    const [email, setEmail] = useState("");         // What the user types in the email field
    const [password, setPassword] = useState("");   // What the user types in the password field
    const [isLoading, setIsLoading] = useState(false); // Shows a spinner while logging in

    // --- Handle Login ---
    const handleSignIn = async () => {
        // Basic validation — make sure fields aren't empty
        if (!email.trim() || !password.trim()) {
            Alert.alert("Missing Fields", "Please enter both email and password.");
            return;
        }

        setIsLoading(true); // Show spinner

        try {
            await signIn(email, password);
            // If login succeeds, onAuthStateChanged in ctx.tsx will detect it,
            // update the session, and the protected route in _layout.tsx will
            // automatically navigate to the tabs. We don't need router.replace() here!
        } catch (error: any) {
            // Firebase gives us error codes we can translate into friendly messages
            let message = "Something went wrong. Please try again.";

            if (error.code === "auth/user-not-found") {
                message = "No account found with this email.";
            } else if (error.code === "auth/wrong-password") {
                message = "Incorrect password.";
            } else if (error.code === "auth/invalid-email") {
                message = "Please enter a valid email address.";
            } else if (error.code === "auth/invalid-credential") {
                message = "Invalid email or password.";
            }

            Alert.alert("Login Failed", message);
        } finally {
            setIsLoading(false); // Hide spinner regardless of success or failure
        }
    };

    return (
        // KeyboardAvoidingView pushes the content up when the keyboard opens
        // so the text fields don't get hidden behind the keyboard
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.inner}>
                <Text style={styles.title}>Recipe App</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                {/* Email Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"  // Shows the @ symbol on keyboard
                    autoCapitalize="none"         // Don't capitalize email addresses
                    autoCorrect={false}           // Don't autocorrect email addresses
                />

                {/* Password Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}  // Hides the text with dots (••••••)
                />

                {/* Show a spinner while loading, or the buttons when not loading */}
                {isLoading ? (
                    <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.buttonContainer}>
                        {/* Log In Button */}
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn}>
                            <Text style={styles.primaryButtonText}>Log In</Text>
                        </TouchableOpacity>

                        {/* Navigate to the register screen — no account creation here */}
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push("/register")}
                        >
                            <Text style={styles.secondaryButtonText}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    inner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#888",
        marginBottom: 40,
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    buttonContainer: {
        width: "100%",
        marginTop: 10,
    },
    primaryButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#4A90D9",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    primaryButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "600",
    },
    secondaryButton: {
        width: "100%",
        height: 50,
        backgroundColor: "transparent",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#4A90D9",
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#4A90D9",
        fontSize: 18,
        fontWeight: "600",
    },
});