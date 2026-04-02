// index.tsx (Home tab)
// Main screen — browse all recipes with pagination.
// Loads 20 recipes at a time from the backend.

import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useSession } from "@/ctx";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

// Shape of a recipe from the browse endpoint
type Recipe = {
    title: string;
    ingredient_count: number;
    ingredients: string[];
};

export default function HomeScreen() {
    const { signOut, session } = useSession();

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Fetch recipes from the backend
    const fetchRecipes = async (pageNum: number) => {
        try {
            const response = await fetch(
                `${API_URL}/api/recipes/browse?page=${pageNum}&per_page=20`
            );
            const data = await response.json();

            if (data.success) {
                if (pageNum === 1) {
                    // First page — replace the list
                    setRecipes(data.recipes);
                } else {
                    // Next pages — append to existing list
                    setRecipes((prev) => [...prev, ...data.recipes]);
                }
                setTotalPages(data.total_pages);
            }
        } catch (error) {
            console.error("Failed to fetch recipes:", error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    // Load first page on mount
    useEffect(() => {
        fetchRecipes(1);
    }, []);

    // Load more when user scrolls to the bottom
    // FlatList calls this automatically when the user nears the end
    const loadMore = () => {
        if (page < totalPages && !isLoadingMore) {
            setIsLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchRecipes(nextPage);
        }
    };

    // How each recipe card looks
    const renderRecipe = ({ item }: { item: Recipe }) => (
        <TouchableOpacity style={styles.recipeCard}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Text style={styles.recipeInfo}>
                {item.ingredient_count} ingredients
            </Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4A90D9" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={recipes}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                renderItem={renderRecipe}
                contentContainerStyle={styles.listContent}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListHeaderComponent={
                    <View style={{ marginBottom: 16 }}>
                        <Text style={styles.title}>Recipes</Text>
                        <Text style={styles.subtitle}>
                            Browse thousands of recipes
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <ActivityIndicator
                            size="small"
                            color="#4A90D9"
                            style={{ marginVertical: 16 }}
                        />
                    ) : null
                }
            />

            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        paddingHorizontal: 20,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    recipeCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#e8e8e8",
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2c3e50",
    },
    recipeInfo: {
        fontSize: 13,
        color: "#888",
        marginTop: 4,
    },
    signOutButton: {
        padding: 16,
        alignItems: "center",
    },
    signOutText: {
        color: "#E74C3C",
        fontSize: 16,
        fontWeight: "600",
    },
});