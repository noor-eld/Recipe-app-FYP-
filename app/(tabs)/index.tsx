// index.tsx (inside app/(tabs)/ — the Home tab)
// This is the main screen users see after logging in.

import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { useSession } from "@/ctx";
import recipes from "../../data/recipes.json";
import { useRouter } from "expo-router";

export default function HomeScreen() {
    // Get signOut function and session (the logged-in user) from our auth context
    const { signOut, session } = useSession();
    const router = useRouter();

    return (
        <View style={styles.container}>
            {/* Show who's logged in — session.email comes from Firebase */}
            <Text style={styles.welcomeText}>
                Welcome, {session?.email ?? "User"}
            </Text>

            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.recipeCard}
                        onPress={() =>
                            router.push({
                                pathname: "/recipeDetails",
                                params: { id: item.id },
                            })
                        }
                    >
                        <Text style={styles.recipeTitle}>{item.title}</Text>
                    </Pressable>
                )}
            />

            {/* Sign Out button */}
            <Pressable style={styles.signOutButton} onPress={signOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: 60,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    listContent: {
        paddingHorizontal: 16,
    },
    recipeCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        backgroundColor: "#f2f2f2",
    },
    recipeTitle: {
        fontSize: 18,
        fontWeight: "600",
    },
    signOutButton: {
        padding: 16,
        alignItems: "center",
        marginBottom: 20,
    },
    signOutText: {
        color: "#E74C3C",
        fontSize: 16,
        fontWeight: "600",
    },
});