import { View, Text, StyleSheet } from 'react-native';
import {JSX} from "react";

export default function ReceiptScanner(): JSX.Element {
    return (
        <View style={styles.container}>
            <Text>Tab [Home|Recipes|Receipt Scanner]</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
