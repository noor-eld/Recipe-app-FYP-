import {View, Text, StyleSheet} from 'react-native';

export default function SettingsScreen() {
    return (
        <View>
            <Text style={styles.title}>Settings</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        color: 'white',
    },
})