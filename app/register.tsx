// register.tsx
// This is the account creation screen.
// Users get here by tapping "Create Account" on the login page.

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

export default function RegisterPage() {
    const { signUp } = useSession();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        // --- Validation ---
        if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
            Alert.alert("Missing Fields", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Passwords Don't Match", "Please make sure both passwords are the same.");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters.");
            return;
        }

        setIsLoading(true);

        try {
            await signUp(email, password);
            // onAuthStateChanged will detect the new account and navigate automatically
        } catch (error: any) {
            let message = "Something went wrong. Please try again.";

            if (error.code === "auth/email-already-in-use") {
                message = "An account with this email already exists.";
            } else if (error.code === "auth/invalid-email") {
                message = "Please enter a valid email address.";
            } else if (error.code === "auth/weak-password") {
                message = "Password must be at least 6 characters.";
            }

            Alert.alert("Sign Up Failed", message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.inner}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to get started</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={true}
                />

                {isLoading ? (
                    <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp}>
                            <Text style={styles.primaryButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        {/* Go back to login */}
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Already have an account? Log In
                            </Text>
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
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#4A90D9",
        fontSize: 16,
    },
});