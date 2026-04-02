// pantry.tsx
// Displays the user's saved ingredients from Firestore.
// Ingredients get here from the receipt scanner's "Save to Pantry" button.

import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

// This is the shape of each pantry item from Firestore
type PantryItem = {
    id: string;         // Firestore document ID
    name: string;       // Ingredient name (e.g., "strawberry")
    addedAt: any;       // Firestore timestamp
    source: string;     // "receipt" or "manual"
};

export default function PantryScreen() {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Listen to Firestore for real-time updates
    // onSnapshot is like a "live connection" — whenever data changes
    // in Firestore (add, edit, delete), this function runs automatically.
    // This is better than fetching once because if you scan a new receipt
    // and save, the pantry updates instantly without needing to refresh.
    useEffect(() => {
        const user = auth.currentUser;

        if (!user) {
            setIsLoading(false);
            return;
        }

        // Point to: users/{userId}/pantry
        const pantryRef = collection(db, "users", user.uid, "pantry");

        // onSnapshot returns an "unsubscribe" function.
        // We call it when the component unmounts to stop listening
        // (otherwise it keeps running in the background forever).
        const unsubscribe = onSnapshot(pantryRef, (snapshot) => {
            const pantryItems: PantryItem[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as PantryItem[];

            setItems(pantryItems);
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    // Delete an ingredient from Firestore
    const removeItem = async (itemId: string) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            // doc() points to one specific document: users/{userId}/pantry/{itemId}
            await deleteDoc(doc(db, "users", user.uid, "pantry", itemId));
            // No need to update state manually — onSnapshot will detect
            // the deletion and update the list automatically
        } catch (error) {
            console.error("Delete error:", error);
            Alert.alert("Error", "Could not delete ingredient.");
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#4A90D9" />
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>My Pantry</Text>
            <Text style={styles.subtitle}>
                {items.length > 0
                    ? `${items.length} ingredient(s) saved`
                    : "No ingredients yet. Scan a receipt to get started!"}
            </Text>

            {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemSource}>
                            Added via {item.source === "manual" ? "manual entry" : "receipt scan"}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => removeItem(item.id)}
                        style={styles.removeButton}
                    >
                        <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                </View>
            ))}
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
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 40,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#888",
        marginBottom: 20,
    },
    itemCard: {
        backgroundColor: "#f8f9fa",
        borderRadius: 10,
        padding: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e8e8e8",
        flexDirection: "row",
        alignItems: "center",
    },
    itemName: {
        fontSize: 17,
        fontWeight: "500",
        color: "#2c3e50",
        textTransform: "capitalize",
    },
    itemSource: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    removeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#ff4444",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    removeButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
});