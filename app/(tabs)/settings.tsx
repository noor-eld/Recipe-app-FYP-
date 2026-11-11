import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSession } from '../../ctx';

export default function SettingsScreen() {
    const { session, signOut } = useSession();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Signed in as</Text>
                <Text style={styles.value}>{session?.email || "Unknown"}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>App version</Text>
                <Text style={styles.value}>1.0.0</Text>
            </View>

            <TouchableOpacity style={styles.signOutButton} onPress={() => {
                Alert.alert(
                    "Sign Out",
                    "Are you sure you want to sign out?",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Sign Out", style: "destructive", onPress: signOut }
                    ]
                )
            }}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        color: '#999',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    signOutButton: {
        backgroundColor: '#e74c3c',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    signOutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});