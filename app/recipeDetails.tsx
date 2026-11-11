import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
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

    // Split instructions into steps (on a full stop followed by a capital letter)
    const getSteps = (instructions: string) => {
        if (!instructions) return [];
        return instructions
            .split(/(?<=\.)\s+(?=[A-Z])/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    };

    // Styles the native header so it blends into the page:
    // same background colour, no divider line, terracotta back arrow, no title text
    const headerOptions = (
        <Stack.Screen
            options={{
                headerTitle: "",
                headerBackTitle: "",
                headerShadowVisible: false,
                headerStyle: { backgroundColor: "#FDF6F0" },
                headerTintColor: "#C4845A",
            }}
        />
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                {headerOptions}
                <ActivityIndicator size="large" color="#C4845A" />
            </View>
        );
    }

    if (!recipe) {
        return (
            <View style={styles.centered}>
                {headerOptions}
                <Text style={styles.notFound}>Recipe not found</Text>
            </View>
        );
    }

    const steps = getSteps(recipe.instructions);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {headerOptions}

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
        backgroundColor: "#FDF6F0",
    },
    notFound: {
        fontSize: 15,
        color: "#A08070",
    },
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 40,
        backgroundColor: "#FDF6F0",
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#2C2420",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2C2420",
        marginBottom: 12,
    },
    ingredientRow: {
        flexDirection: "row",
        paddingVertical: 4,
        paddingLeft: 4,
    },
    bullet: {
        fontSize: 15,
        color: "#C4845A",
        marginRight: 8,
        width: 12,
    },
    ingredientText: {
        fontSize: 15,
        color: "#2C2420",
        flex: 1,
    },
    stepRow: {
        flexDirection: "row",
        marginBottom: 14,
        alignItems: "flex-start",
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: "#C4845A",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        marginTop: 2,
    },
    stepNumberText: {
        color: "#FDF6F0",
        fontSize: 14,
        fontWeight: "bold",
    },
    stepText: {
        fontSize: 15,
        color: "#2C2420",
        lineHeight: 22,
        flex: 1,
    },
    instructions: {
        fontSize: 15,
        color: "#2C2420",
        lineHeight: 22,
    },
});