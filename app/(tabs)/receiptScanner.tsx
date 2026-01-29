import { Button, StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { JSX, useState } from "react";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Asset } from "expo-asset";
import {FlipType, SaveFormat, useImageManipulator} from "expo-image-manipulator";

export default function ReceiptScanner(): JSX.Element {
    const [permission, requestPermission] = useCameraPermissions();
    const [imageUri, ] = useState(null);

    if (!permission){
        return <View />;
    }

    if (!permission.granted){
        return(
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="grant permission" />
            </View>
        )
    }

    const takePhotoWithNativeCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, // Optional: allows user to crop
            quality: 1, // Highest quality
        })

        if (!result.canceled){
            console.log(result.assets[0].uri);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.buttonContainer}>
                <Button title="Take Photo with Native Camera" onPress={takePhotoWithNativeCamera}/>
                    {imageUri && <Image source={{ uri: imageUri}} style={styles.image} />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
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
        flexDirection: 'row',
        backgroundColor: 'transparent',
        width: '100%',
        paddingHorizontal: 64,
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
        width: 300,
        height: 300,
        marginTop: 20,
    },
});