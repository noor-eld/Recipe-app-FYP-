// recipeDetails.tsx
// Shows full recipe details — ingredients and cooking instructions.
// Receives recipe data via URL params from the home screen.

import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function RecipeDetails() {
    // useLocalSearchParams reads the data we passed when navigating here.
    // URL params are always strings, so ingredients comes as a JSON string
    // that we need to parse back into an array.
    const { title, ingredients, instructions } = useLocalSearchParams();

    // Parse ingredients from JSON string back into an array
    let ingredientList: string[] = [];
    try {
        ingredientList = JSON.parse(ingredients as string);
    } catch {
        ingredientList = [];
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{title}</Text>

            <Text style={styles.sectionHeader}>
                Ingredients ({ingredientList.length})
            </Text>
            {ingredientList.map((item, index) => (
                <Text key={index} style={styles.ingredientItem}>
                    • {item}
                </Text>
            ))}

            <Text style={styles.sectionHeader}>Instructions</Text>
            <Text style={styles.instructions}>{instructions}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginTop: 16,
        marginBottom: 8,
    },
    ingredientItem: {
        fontSize: 15,
        color: "#444",
        paddingVertical: 3,
        paddingLeft: 4,
    },
    instructions: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
    },
});