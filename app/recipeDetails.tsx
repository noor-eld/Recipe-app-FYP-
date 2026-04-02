import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export default function RecipeDetails() {
    const { title } = useLocalSearchParams();

    const [recipe, setRecipe] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch full recipe details from backend
    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/recipes/detail?title=${encodeURIComponent(title as string)}`
                );
                const data = await response.json();

                if (data.success) {
                    setRecipe(data.recipe);
                }
            } catch (error) {
                console.error("Failed to fetch recipe:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecipe();
    }, [title]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4A90D9" />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: "#666" }}>Recipe not found</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{recipe.title}</Text>

            <Text style={styles.sectionHeader}>
                Ingredients ({recipe.ingredients.length})
            </Text>
            {recipe.ingredients.map((item: string, index: number) => (
                <Text key={index} style={styles.ingredientItem}>
                    •  {item}
                </Text>
            ))}

            <Text style={styles.sectionHeader}>Instructions</Text>
            <Text style={styles.instructions}>{recipe.instructions}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 20,
        paddingBottom: 40,
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