// index.tsx (Home tab)
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
import { useRouter } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000";

type Recipe = {
    title: string;
    ingredient_count: number;
    ingredients: string[];
    instructions: string;
};

export default function HomeScreen() {
    const { session } = useSession();

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const router = useRouter();
    const [recommended, setRecommended] = useState<any[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(true);

    const fetchRecommendations = async () => {
        const user = auth.currentUser;
        if (!user) {
            setIsLoadingRecs(false);
            return;
        }

        try {
            const pantryRef = collection(db, "users", user.uid, "pantry");
            const snapshot = await getDocs(pantryRef);
            const pantryItems = snapshot.docs.map((doc) => doc.data().name);

            if (pantryItems.length === 0) {
                setIsLoadingRecs(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/recipes/recommend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pantryItems),
            });

            const data = await response.json();
            if (data.success) {
                setRecommended(data.recipes);
            }
        } catch (error) {
            console.error("Failed to fetch recommendations:", error);
        } finally {
            setIsLoadingRecs(false);
        }
    };

    const fetchRecipes = async (pageNum: number) => {
        try {
            const response = await fetch(
                `${API_URL}/api/recipes/browse?page=${pageNum}&per_page=20`
            );
            const data = await response.json();

            if (data.success) {
                if (pageNum === 1) {
                    setRecipes(data.recipes);
                } else {
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

    useEffect(() => {
        fetchRecipes(1);
        fetchRecommendations();
    }, []);

    const loadMore = () => {
        if (page < totalPages && !isLoadingMore) {
            setIsLoadingMore(true);
            const nextPage = page + 1;
            setPage(nextPage);
            fetchRecipes(nextPage);
        }
    };

    const renderRecipe = ({ item }: { item: Recipe }) => (
        <TouchableOpacity
            style={styles.recipeCard}
            onPress={() =>
                router.push({
                    pathname: "/recipeDetails",
                    params: { title: item.title },
                })
            }
        >
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Text style={styles.recipeInfo}>
                {item.ingredient_count} ingredients
            </Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#C4845A" />
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

                        {/* Page header */}
                        <View style={styles.pageHeader}>
                            <Text style={styles.logoHandle}>CH</Text>
                            <Text style={styles.logoBlade}>OPPD</Text>
                        </View>

                        {/* Recommendations section */}
                        <Text style={styles.sectionHeader}>Recommended for you</Text>

                        {isLoadingRecs ? (
                            <ActivityIndicator
                                size="small"
                                color="#C4845A"
                                style={{ marginVertical: 12 }}
                            />
                        ) : recommended.length > 0 ? (
                            <View style={{ marginBottom: 24 }}>
                                <View style={styles.recHeaderRow}>
                                    <Text style={styles.sectionSubtitle}>
                                        Based on your pantry
                                    </Text>
                                    <TouchableOpacity onPress={fetchRecommendations}>
                                        <FontAwesome name="refresh" size={16} color="#C4845A" />
                                    </TouchableOpacity>
                                </View>
                                {recommended.slice(0, 5).map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.recCard}
                                        onPress={() =>
                                            router.push({
                                                pathname: "/recipeDetails",
                                                params: { title: item.title },
                                            })
                                        }
                                    >
                                        <Text style={styles.recipeTitle}>{item.title}</Text>
                                        <Text style={styles.matchScore}>
                                            {Math.round(item.match_score * 100)}% match
                                        </Text>
                                        <Text style={styles.recipeInfo}>
                                            Missing:{" "}
                                            {item.missing_ingredients.length === 0
                                                ? "nothing!"
                                                : item.missing_ingredients.join(", ")}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyRecs}>
                                <Text style={styles.emptyRecsText}>
                                    Add ingredients to your pantry to get recommendations
                                </Text>
                            </View>
                        )}

                        <Text style={styles.sectionHeader}>Browse all recipes</Text>
                    </View>
                }
                ListFooterComponent={
                    isLoadingMore ? (
                        <ActivityIndicator
                            size="small"
                            color="#C4845A"
                            style={{ marginVertical: 16 }}
                        />
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#FDF6F0",
    },
    container: {
        flex: 1,
        backgroundColor: "#FDF6F0",
        paddingTop: 60,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    pageHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 28,
    },
    logoHandle: {
        fontSize: 28,
        fontWeight: "900",
        color: "#C4845A",
        letterSpacing: -1,
    },
    logoBlade: {
        fontSize: 28,
        fontWeight: "900",
        color: "#2C2420",
        letterSpacing: -1,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2C2420",
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#A08070",
    },
    recHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    recCard: {
        backgroundColor: "#FBF0E8",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",
    },
    recipeCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",
    },
    recipeTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#2C2420",
    },
    recipeInfo: {
        fontSize: 13,
        color: "#A08070",
        marginTop: 4,
    },
    matchScore: {
        fontSize: 13,
        color: "#C4845A",
        fontWeight: "600",
        marginTop: 2,
    },
    emptyRecs: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",
    },
    emptyRecsText: {
        fontSize: 14,
        color: "#A08070",
    },
});