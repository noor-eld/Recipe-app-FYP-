import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

export default function RecipeDetails() {
    const { title } = useLocalSearchParams();
    const [recipe, setRecipe] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    // Split instructions into steps
    const getSteps = (instructions: string) => {
        if (!instructions) return [];
        // Split on period dollowed by a space and a capital letter (sentences)
        return instructions
            .split(/(?<=\.)\s+(?=[A-Z])/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    };

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

    const steps = getSteps(recipe.instructions);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{recipe.title}</Text>

            {/* Ingredients */}
            <View style={styles.card}>
                <Text style={styles.sectionHeader}>
                    Ingredients ({recipe.ingredients.length})
                </Text>
                {recipe.ingredients.map((item: string, index: number) => (
                    <View key={index} style={styles.ingredientRow}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.ingredientText}>{item}</Text>
                    </View>
                ))}
            </View>

            {/* Instructions */}
            <View style={styles.card}>
                <Text style={styles.sectionHeader}>Instructions</Text>
                {steps.length > 1 ? (
                    steps.map((step: string, index: number) => (
                        <View key={index} style={styles.stepRow}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.stepText}>{step}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.instructions}>{recipe.instructions}</Text>
                )}
            </View>
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
        padding: 16,
        paddingBottom: 40,
        backgroundColor: "#f5f5f5",
    },
    recipeImage: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginBottom: 16,
        backgroundColor: "#e0e0e0",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 16,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    ingredientRow: {
        flexDirection: "row",
        paddingVertical: 4,
        paddingLeft: 4,
    },
    bullet: {
        fontSize: 15,
        color: "#4A90D9",
        marginRight: 8,
        width: 12,
    },
    ingredientText: {
        fontSize: 15,
        color: "#444",
        flex: 1,
    },
    stepRow: {
        flexDirection: "row",
        marginBottom: 12,
        alignItems: "flex-start",
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#4A90D9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    stepText: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
        flex: 1,
    },
    instructions: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
    },
});