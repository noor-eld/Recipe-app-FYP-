import { Button, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import React, { JSX, useState, useEffect, useRef } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { File, Directory, Paths } from 'expo-file-system';

export default function ReceiptScanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const [imageUri, setImageUri] = useState(null);
    // const [openCamera, ] = useState<boolean>(false);
    // const [setOpenCamera] = useState<boolean>(true);
    const [photo, setPhoto] = useState<string | null>(null);
    const cameraRef = useRef<CameraView | null>(null);
    const directory = new Directory(Paths.document, 'savedReceipts');

    // check to see if saved receipts directory exists
    useEffect(() => {
        async function setup(){
            const exists = await directory.exists;

            if(!exists){
                await directory.create();
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

    const takePicture = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            {photo && <Image source={{ uri: photo }} style={styles.preview} />}
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