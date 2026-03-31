import {
    Button, StyleSheet, TouchableOpacity, View, Text, Image, ActivityIndicator, Animated, Alert, TextInput,
    KeyboardAvoidingView, Platform
} from 'react-native';
import React, { JSX, useState, useEffect, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { File, Directory, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScrollView = Animated.ScrollView;
// import {Colors} from "@/constants/theme";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

// Reads computer's IP from the .env file instead
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export default function ReceiptScanner() {
    const [permission, requestPermission] = useCameraPermissions();
    // const [openCamera, ] = useState<boolean>(false);
    // const [setOpenCamera] = useState<boolean>(true);
    const [photo, setPhoto] = useState<string | null>(null);
    const [ingredients, setIngredients] = useState<any[]>([]); // store the ingredients the backend sends back
    const [isProcessing, setIsProcessing] = useState(false); // checks whether scanning is complete or not
    const cameraRef = useRef<CameraView | null>(null);
    const receiptsDir = new Directory(Paths.document, 'savedReceipts');
    const [statusMessage, setStatusMessage] = useState<string | null>(null); // aids with error messages
    const [editingIndex, setEditingIndex] = useState<number | null>(null); // tracks which ingredient is being edited
    const [newIngredient, setNewIngredient] = useState(""); // to add missing ingredients manually

    useEffect(() => {
        async function setup(){
            // create the directory if missing; safe to call multiple times
            await receiptsDir.create({ idempotent: true, intermediates: true });

            // reload last saved image if it exists
            const savedUri = await AsyncStorage.getItem('lastReceiptImage');
            if (savedUri){
                setPhoto(savedUri);
            }
        }

        setup();
    }, []);

    if (!permission){
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted){
        // Camera permissions are not granted yet.
        return(
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        )
    }

    // Sends the receipt photo to the FastAPI backend.
    // FormData is how apps send files over the internet — like attaching
    // a file to an email. FastAPI expects this format.
    const processReceipt = async (imageUri: string) => {
        setIsProcessing(true);
        setIngredients([]);
        setStatusMessage("Scanning receipt...");

        try {
            const formData = new FormData();

            // This "image_file" name MUST match main.py's parameter:
            // async def process_receipt(image_file: UploadFile = File(...))
            formData.append("image_file", {
                uri: imageUri,
                name: "receipt.jpg",
                type: "image/jpeg",
            } as any);
            // "as any" because React Native's FormData accepts this object format
            // but TypeScript doesn't officially know about it — so we tell TS to trust us.

            const response = await fetch(`${API_URL}/api/receipt/process`, {
                method: "POST",
                body: formData,
                // Do NOT set Content-Type header! fetch() sets it automatically
                // with the correct "boundary" for FormData. Setting it yourself breaks it.
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log("Backend response:", JSON.stringify(data, null, 2));

            // saves ingredients to state so the screen can show them
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
            // Runs whether it succeeded or failed to stay up to date
            setIsProcessing(false);
        }
    };

    // Remove an ingredient from the list by its index
    // This doesn't touch Firestore — it only updates what's on screen.
    // The ingredient is permanently removed only from the REVIEW list.
    const removeIngredient = (indexToRemove: number) => {
        setIngredients((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    // Save all reviewed ingredients to Firestore under the user's account
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
            // Get a reference to this user's pantry collection
            // Path: users/{userId}/pantry
            const pantryRef = collection(db, "users", user.uid, "pantry");

            // Save each ingredient as its own document
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

            // Clear the screen after saving
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
        console.log(destinationUri)

        await FileSystem.moveAsync({
            from: tempUri,
            to: destinationUri,
        });

        setPhoto(destinationUri);
        await AsyncStorage.setItem('lastReceiptImage', destinationUri);

        // send to backend
        await processReceipt(destinationUri);
    };

    // Manually add an ingredient the scanner missed
    const addIngredient = () => {
        const trimmed = newIngredient.trim().toLowerCase();

        if (!trimmed) return;

        // Add it to the list in the same format as backend results
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

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Receipt Scanner</Text>

            {/* Loading spinner while backend processes */}
            {isProcessing && (
                <View style={{ alignItems: "center", marginVertical: 16 }}>
                    <ActivityIndicator size="large" color="#4A90D9" />
                    <Text style={{ color: "#666", marginTop: 8 }}>{statusMessage}</Text>
                </View>
            )}

            {/* Status message when NOT processing and no ingredients */}
            {!isProcessing && statusMessage && ingredients.length === 0 && (
                <Text style={{ color: "#666", marginVertical: 12, textAlign: "center" }}>
                    {statusMessage}
                </Text>
            )}

            {/* Ingredient list with remove buttons and editing */}
            {!isProcessing && ingredients.length > 0 && (
                <View style={{ width: "100%", marginTop: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                        Review ingredients ({ingredients.length}):
                    </Text>

                    {ingredients.map((item: any, index: number) => (
                        <View key={index} style={styles.ingredientCard}>
                            <View style={{ flex: 1 }}>
                                {editingIndex === index ? (
                                    // EDIT MODE — show a text input
                                    <TextInput
                                        style={styles.editInput}
                                        value={item.ingredient}
                                        autoFocus={true}
                                        onChangeText={(text) => {
                                            // Update the ingredient name in our list
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
                                    // VIEW MODE — tap to edit
                                    <TouchableOpacity onPress={() => setEditingIndex(index)}>
                                        <Text style={{ fontSize: 16, fontWeight: "500" }}>
                                            {item.ingredient}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <Text style={{ fontSize: 12, color: "#999", marginTop: 2 }}>
                                    Receipt: {item.raw_text}
                                </Text>
                            </View>

                            {/* Remove button */}
                            <TouchableOpacity
                                onPress={() => removeIngredient(index)}
                                style={styles.removeButton}
                            >
                                <Text style={styles.removeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {/* Add missing ingredient */}
                    <View style={styles.addRow}>
                        <TextInput
                            style={styles.addInput}
                            placeholder="Add missing ingredient..."
                            placeholderTextColor="#999"
                            value={newIngredient}
                            onChangeText={setNewIngredient}
                            onSubmitEditing={addIngredient}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                            <Text style={styles.addButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Save to Pantry button */}
                    <TouchableOpacity style={styles.saveButton} onPress={saveToFirestore}>
                        <Text style={styles.saveButtonText}>Save to Pantry</Text>
                    </TouchableOpacity>
                </View>
            )}

            {!isProcessing && (
            <TouchableOpacity style={styles.scanButton} onPress={takePicture}>
                <Text style={styles.scanButtonText}>
                    {photo ? "Scan Another Receipt" : "Scan Receipt"}
                </Text>
            </TouchableOpacity>
            )}
        </ScrollView>
        </KeyboardAvoidingView>
    );

}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
        backgroundColor: "#fff",
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 64,
        alignItems: 'center',
    },
    preview: {
        width: 300,
        height: 300,
        resizeMode: 'contain',
    },
    button: {
        flex: 1,
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    image: {
        marginTop: 20,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'white',
    },
    backButton: {
        position: 'absolute',
        top: 48,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    backButtonText: {
        color: 'white',
        fontSize: 28,
        lineHeight: 30,
        fontWeight: 'bold',
    },
    ingredientCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e8e8e8",
        flexDirection: "row",        // puts name and X button side by side
        alignItems: "center",       // vertically centers them
    },
    removeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#ff4444",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    removeButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    saveButton: {
        backgroundColor: "#34C759",
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 12,
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    scanButton: {
        backgroundColor: "#4A90D9",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 10,
        marginTop: 16,
    },
    scanButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    editInput: {
        fontSize: 16,
        fontWeight: "500",
        borderBottomWidth: 1,
        borderBottomColor: "#4A90D9",
        paddingVertical: 2,
    },
    addRow: {
        flexDirection: "row",
        marginTop: 10,
        gap: 8,
    },
    addInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        backgroundColor: "#f8f9fa",
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: "#4A90D9",
        justifyContent: "center",
        alignItems: "center",
    },
    addButtonText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
});