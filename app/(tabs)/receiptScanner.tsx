// receiptScanner.tsx
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text,
    ActivityIndicator,
    Alert,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import React, { useState, useEffect, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Directory, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export default function ReceiptScanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const [photo, setPhoto] = useState<string | null>(null);
    const [ingredients, setIngredients] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const cameraRef = useRef<CameraView | null>(null);
    const receiptsDir = new Directory(Paths.document, 'savedReceipts');
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newIngredient, setNewIngredient] = useState("");

    useEffect(() => {
        async function setup() {
            await receiptsDir.create({ idempotent: true, intermediates: true });
            const savedUri = await AsyncStorage.getItem('lastReceiptImage');
            if (savedUri) {
                setPhoto(savedUri);
            }
        }
        setup();
    }, []);

    if (!permission) {
        return <View style={styles.wrapper} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    Choppd needs camera access to scan your receipts
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
                    <Text style={styles.primaryButtonText}>Grant permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const processReceipt = async (imageUri: string) => {
        setIsProcessing(true);
        setIngredients([]);
        setStatusMessage("Scanning receipt...");

        try {
            const formData = new FormData();
            formData.append("image_file", {
                uri: imageUri,
                name: "receipt.jpg",
                type: "image/jpeg",
            } as any);

            const response = await fetch(`${API_URL}/api/receipt/process`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.ingredients.length > 0) {
                setIngredients(data.ingredients);
                setStatusMessage(`Found ${data.ingredients.length} ingredient(s)`);
            } else {
                setStatusMessage(data.message || "No ingredients found. Try a clearer photo.");
            }
        } catch (error: any) {
            console.error("Failed to reach backend:", error.message);
            if (error.message.includes("Network request failed")) {
                setStatusMessage("Can't reach the server. Check your Wi-Fi and backend.");
            } else {
                setStatusMessage("Something went wrong. Please try again.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const removeIngredient = (indexToRemove: number) => {
        setIngredients((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const saveToFirestore = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Not Logged In", "Please log in to save ingredients.");
            return;
        }

        if (ingredients.length === 0) {
            Alert.alert("No Ingredients", "There are no ingredients to save.");
            return;
        }

        try {
            const pantryRef = collection(db, "users", user.uid, "pantry");

            for (const item of ingredients) {
                await addDoc(pantryRef, {
                    name: item.ingredient,
                    addedAt: serverTimestamp(),
                    source: item.source || "receipt",
                });
            }

            Alert.alert(
                "Saved!",
                `${ingredients.length} ingredient(s) added to your pantry.`,
                [{ text: "OK" }]
            );

            setIngredients([]);
            setPhoto(null);
            setStatusMessage(null);
        } catch (error: any) {
            console.error("Firestore save error:", error);
            Alert.alert("Save Failed", "Could not save ingredients. Please try again.");
        }
    };

    const takePicture = async () => {
        const capturedImage = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.8,
        });

        if (capturedImage.canceled) return;

        const tempUri = capturedImage.assets[0].uri;
        const fileName = `receipt-${Date.now()}.jpg`;
        const destinationUri = receiptsDir.uri + fileName;

        await FileSystem.moveAsync({
            from: tempUri,
            to: destinationUri,
        });

        setPhoto(destinationUri);
        await AsyncStorage.setItem('lastReceiptImage', destinationUri);
        await processReceipt(destinationUri);
    };

    const addIngredient = () => {
        const trimmed = newIngredient.trim().toLowerCase();
        if (!trimmed) return;

        setIngredients((prev) => [
            ...prev,
            {
                raw_text: "Manually added",
                ingredient: trimmed,
                confidence: 1.0,
                source: "manual",
            },
        ]);
        setNewIngredient("");
    };

    const hasResults = !isProcessing && ingredients.length > 0;

    return (
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView contentContainerStyle={styles.container}>

                {/* Page header */}
                <View style={styles.pageHeader}>
                    <Text style={styles.logoHandle}>CH</Text>
                    <Text style={styles.logoBlade}>OPPD</Text>
                </View>

                <Text style={styles.title}>Scan receipt</Text>
                {!hasResults && !isProcessing && (
                    <Text style={styles.subtitle}>
                        Take a photo of your grocery receipt and we'll pull out the ingredients
                    </Text>
                )}

                {/* Loading state */}
                {isProcessing && (
                    <View style={styles.processingBox}>
                        <ActivityIndicator size="large" color="#C4845A" />
                        <Text style={styles.statusText}>{statusMessage}</Text>
                    </View>
                )}

                {/* Status message when nothing was found or something failed */}
                {!isProcessing && statusMessage && ingredients.length === 0 && (
                    <Text style={styles.statusText}>{statusMessage}</Text>
                )}

                {/* Review list */}
                {hasResults && (
                    <View style={{ width: "100%" }}>
                        <Text style={styles.reviewHeader}>
                            Review ingredients ({ingredients.length})
                        </Text>

                        {ingredients.map((item: any, index: number) => (
                            <View key={index} style={styles.ingredientCard}>
                                <View style={{ flex: 1 }}>
                                    {editingIndex === index ? (
                                        <TextInput
                                            style={styles.editInput}
                                            value={item.ingredient}
                                            autoFocus={true}
                                            onChangeText={(text) => {
                                                setIngredients((prev) =>
                                                    prev.map((ing, i) =>
                                                        i === index ? { ...ing, ingredient: text } : ing
                                                    )
                                                );
                                            }}
                                            onBlur={() => setEditingIndex(null)}
                                            onSubmitEditing={() => setEditingIndex(null)}
                                        />
                                    ) : (
                                        <TouchableOpacity onPress={() => setEditingIndex(index)}>
                                            <Text style={styles.ingredientName}>{item.ingredient}</Text>
                                        </TouchableOpacity>
                                    )}
                                    <Text style={styles.ingredientSource}>
                                        Receipt: {item.raw_text}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => removeIngredient(index)}
                                    style={styles.removeButton}
                                >
                                    <Text style={styles.removeButtonText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}

                        {/* Add a missing ingredient */}
                        <View style={styles.addRow}>
                            <TextInput
                                style={styles.addInput}
                                placeholder="Add missing ingredient..."
                                placeholderTextColor="#C0A898"
                                value={newIngredient}
                                onChangeText={setNewIngredient}
                                onSubmitEditing={addIngredient}
                                returnKeyType="done"
                            />
                            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.primaryButton} onPress={saveToFirestore}>
                            <Text style={styles.primaryButtonText}>Save to pantry</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Scan button: filled when it's the main action, outlined when Save is */}
                {!isProcessing && (
                    <TouchableOpacity
                        style={hasResults ? styles.secondaryButton : styles.primaryButton}
                        onPress={takePicture}
                    >
                        <Text
                            style={hasResults ? styles.secondaryButtonText : styles.primaryButtonText}
                        >
                            {photo ? "Scan another receipt" : "Scan receipt"}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: "#FDF6F0",
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 60,
        backgroundColor: "#FDF6F0",
    },
    permissionContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
        backgroundColor: "#FDF6F0",
    },
    permissionText: {
        fontSize: 15,
        color: "#A08070",
        textAlign: "center",
        marginBottom: 20,
    },
    pageHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 24,
    },
    logoHandle: {
        fontSize: 28,
        fontWeight: "900",
        color: "#C4845A",
        letterSpacing: -1,
    },
    logoBlade: {
        fontSize: 28,
        fontWeight: "900",
        color: "#2C2420",
        letterSpacing: -1,
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#2C2420",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#A08070",
        marginBottom: 24,
    },
    processingBox: {
        alignItems: "center",
        marginVertical: 24,
    },
    statusText: {
        fontSize: 14,
        color: "#A08070",
        textAlign: "center",
        marginVertical: 12,
    },
    reviewHeader: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C2420",
        marginTop: 12,
        marginBottom: 12,
    },
    ingredientCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",
        flexDirection: "row",
        alignItems: "center",
    },
    ingredientName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C2420",
        textTransform: "capitalize",
    },
    ingredientSource: {
        fontSize: 12,
        color: "#A08070",
        marginTop: 2,
    },
    editInput: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C2420",
        borderBottomWidth: 1,
        borderBottomColor: "#C4845A",
        paddingVertical: 2,
    },
    removeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#E8D5C4",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    removeButtonText: {
        color: "#2C2420",
        fontSize: 13,
        fontWeight: "600",
    },
    addRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 16,
        gap: 10,
    },
    addInput: {
        flex: 1,
        height: 48,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 15,
        backgroundColor: "#fff",
        color: "#2C2420",
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#C4845A",
        justifyContent: "center",
        alignItems: "center",
    },
    addButtonText: {
        color: "#FDF6F0",
        fontSize: 24,
        fontWeight: "bold",
    },
    primaryButton: {
        width: "100%",
        height: 50,
        backgroundColor: "#C4845A",
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