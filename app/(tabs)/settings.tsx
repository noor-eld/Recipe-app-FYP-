import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSession } from '../../ctx';

export default function SettingsScreen() {
    const { session, signOut } = useSession();

    return (
        <View style={styles.container}>

            {/* Page header */}
            <View style={styles.pageHeader}>
                <Text style={styles.logoHandle}>CH</Text>
                <Text style={styles.logoBlade}>OPPD</Text>
            </View>

            <Text style={styles.title}>Settings</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Signed in as</Text>
                <Text style={styles.value}>{session?.email || "Unknown"}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>App version</Text>
                <Text style={styles.value}>1.0.0</Text>
            </View>

            <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => {
                    Alert.alert(
                        "Sign out",
                        "Are you sure you want to sign out?",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Sign out", style: "destructive", onPress: signOut },
                        ]
                    );
                }}
            >
                <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDF6F0',
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 24,
    },
    logoHandle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#C4845A',
        letterSpacing: -1,
    },
    logoBlade: {
        fontSize: 28,
        fontWeight: '900',
        color: '#2C2420',
        letterSpacing: -1,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#2C2420',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: '#E8D5C4',
    },
    label: {
        fontSize: 13,
        color: '#A08070',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#2C2420',
    },
    signOutButton: {
        height: 50,
        backgroundColor: 'transparent',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C4845A',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    signOutText: {
        color: '#C4845A',
        fontSize: 16,
        fontWeight: '600',
    },
});