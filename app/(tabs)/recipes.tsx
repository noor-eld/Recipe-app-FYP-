import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

export default function RecipesScreen() {
    return (
        <View style={styles.container}>

            {/* Page header */}
            <View style={styles.pageHeader}>
                <Text style={styles.logoHandle}>CH</Text>
                <Text style={styles.logoBlade}>OPPD</Text>
            </View>

            {/* Empty state */}
            <View style={styles.emptyState}>
                <View style={styles.iconCircle}>
                    <FontAwesome6 name="kitchen-set" size={28} color="#C4845A" />
                </View>
                <Text style={styles.title}>Saved recipes</Text>
                <Text style={styles.subtitle}>
                    Your favourite recipes will appear here.
                </Text>
                <Text style={styles.hint}>Coming soon</Text>
            </View>
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
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 80,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FBF0E8',
        borderWidth: 0.5,
        borderColor: '#E8D5C4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2C2420',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: '#A08070',
        textAlign: 'center',
        marginBottom: 12,
    },
    hint: {
        fontSize: 13,
        color: '#C4845A',
        fontWeight: '600',
    },
});