import {Button, StyleSheet, TouchableOpacity, View, Text, Image, ActivityIndicator} from 'react-native';
import React, { JSX, useState, useEffect, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { File, Directory, Paths } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

            const data = await response.json();
            console.log("Backend response:", JSON.stringify(data, null, 2));

            // saves ingredients to state so the screen can show them
            if (data.success && data.ingredients.length > 0) {
                setIngredients(data.ingredients);
            }
        } catch (error: any) {
            console.error("Failed to reach backend:", error.message);
        } finally {
            // Runs whether it succeeded or failed to stay up to date
            setIsProcessing(false);
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

    return (
        <View style={styles.container}>
            {photo && <Image source={{ uri: photo }} style={styles.preview} />}

            {/* Loading spinner while backend processes */}
            {isProcessing && (
                <ActivityIndicator size="large" color="#4A90D9" style={{ marginTop: 16 }} />
            )}

            {/* Ingredient list */}
            {ingredients.length > 0 && (
                <View style={{ width: "100%", paddingHorizontal: 20, marginTop: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
                        Found {ingredients.length} ingredient(s):
                    </Text>
                    {ingredients.map((item: any, index: number) => (
                        <Text key={index} style={{ fontSize: 15, paddingVertical: 4 }}>
                            • {item.ingredient}
                        </Text>
                    ))}
                </View>
            )}
            <Button title="Open Camera" onPress={takePicture} />
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});