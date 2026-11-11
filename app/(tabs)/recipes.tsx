import { View, Text, StyleSheet } from 'react-native';

export default function RecipesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saved Recipes</Text>
            <Text style={styles.subtitle}>Your favourited recipes will appear here.</Text>
            <Text style={styles.hint}>This feature is coming soon.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    hint: {
        fontSize: 14,
        color: '#999',
        fontStyle: 'italic',
    },
});