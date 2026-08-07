// login.tsx
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
    const { signIn } = useSession();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Missing Fields", "Please enter both email and password.");
            return;
        }

        setIsLoading(true);

        try {
            await signIn(email, password);
        } catch (error: any) {
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
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.inner}>

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <Text style={styles.logo}>
                        <Text style={styles.logoHandle}>CH</Text>
                        <Text style={styles.logoBlade}>OPPD</Text>
                    </Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                {/* Email Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#C0A898"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {/* Password Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#C0A898"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true}
                />

                {isLoading ? (
                    <ActivityIndicator size="large" color="#C4845A" style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.primaryButton} onPress={handleSignIn}>
                            <Text style={styles.primaryButtonText}>Log in</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push("/register")}
                        >
                            <Text style={styles.secondaryButtonText}>Create account</Text>
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
        backgroundColor: "#FDF6F0",  // Warm off-white
    },
    inner: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 48,
    },
    logo: {
        fontSize: 42,
        fontWeight: "900",
        letterSpacing: -1,
    },
    logoHandle: {
        color: "#C4845A",  // Terracotta — the handle
    },
    logoBlade: {
        color: "#2C2420",  // Dark charcoal — the blade
    },
    subtitle: {
        fontSize: 14,
        color: "#A08070",  // Muted warm tone
        marginTop: 8,
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 14,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",  // Warm border
        color: "#2C2420",
    },
    buttonContainer: {
        width: "100%",
        marginTop: 10,
    },
    primaryButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#C4845A",  // Terracotta
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    primaryButtonText: {
        color: "#FDF6F0",
        fontSize: 16,
        fontWeight: "600",
    },
    secondaryButton: {
        width: "100%",
        height: 50,
        backgroundColor: "transparent",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#C4845A",
        justifyContent: "center",
        alignItems: "center",
    },
    secondaryButtonText: {
        color: "#C4845A",
        fontSize: 16,
        fontWeight: "600",
    },
});