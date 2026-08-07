// pantry.tsx
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    TextInput,
    Keyboard,
    Modal,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

type PantryItem = {
    id: string;
    name: string;
    addedAt: any;
    source: string;
};

export default function PantryScreen() {
    const [items, setItems] = useState<PantryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newIngredient, setNewIngredient] = useState("");
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setIsLoading(false);
            return;
        }

        const pantryRef = collection(db, "users", user.uid, "pantry");
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

    const removeItem = async (itemId: string) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            await deleteDoc(doc(db, "users", user.uid, "pantry", itemId));
        } catch (error) {
            Alert.alert("Error", "Could not delete ingredient.");
        }
    };

    const addItem = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const trimmed = newIngredient.trim().toLowerCase();
        if (!trimmed) return;
        try {
            const pantryRef = collection(db, "users", user.uid, "pantry");
            await addDoc(pantryRef, {
                name: trimmed,
                addedAt: serverTimestamp(),
                source: "manual",
            });
            setNewIngredient("");
            Keyboard.dismiss();
            setShowModal(false);
        } catch (error) {
            Alert.alert("Error", "Could not add ingredient.");
        }
    };

    const editItem = (item: PantryItem) => {
        Alert.prompt(
            "Edit ingredient",
            "Update the ingredient name:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Save",
                    onPress: async (newName?: string) => {
                        const trimmed = newName?.trim().toLowerCase();
                        if (!trimmed) return;
                        const user = auth.currentUser;
                        if (!user) return;
                        try {
                            await updateDoc(doc(db, "users", user.uid, "pantry", item.id), {
                                name: trimmed,
                            });
                        } catch (error) {
                            Alert.alert("Error", "Could not update ingredient.");
                        }
                    },
                },
            ],
            "plain-text",
            item.name
        );
    };

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#C4845A" />
            </View>
        );
    }

    return (
        <View style={styles.wrapper}>
            <ScrollView contentContainerStyle={styles.container}>

                {/* Page header */}
                <View style={styles.pageHeader}>
                    <Text style={styles.logoHandle}>CH</Text>
                    <Text style={styles.logoBlade}>OPPD</Text>
                </View>

                <Text style={styles.title}>My pantry</Text>
                <Text style={styles.subtitle}>
                    {items.length > 0
                        ? `${items.length} ingredient(s) saved`
                        : "No ingredients yet — scan a receipt to get started"}
                </Text>

                {items.map((item) => (
                    <View key={item.id} style={styles.itemCard}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => editItem(item)}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemSource}>
                                {item.source === "manual" ? "Added manually" : "Added via receipt scan"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => removeItem(item.id)}
                            style={styles.removeButton}
                        >
                            <Text style={styles.removeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}

                {/* Bottom padding so FAB doesn't cover last item */}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowModal(true)}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* Bottom sheet modal */}
            {/*
                Modal is a React Native component that overlays on top of everything.
                transparent={true} keeps the background visible but dimmed.
                animationType="slide" makes it slide up from the bottom smoothly.
                TouchableWithoutFeedback on the backdrop closes the modal when
                the user taps outside of it.
            */}
            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => {
                    Keyboard.dismiss();
                    setShowModal(false);
                }}>
                    <View style={styles.modalBackdrop}>
                        <TouchableWithoutFeedback>
                            <KeyboardAvoidingView
                                behavior="padding"
                                keyboardVerticalOffset={0}
                            >
                            <View style={styles.bottomSheet}>
                                {/* Handle bar — visual hint that you can swipe down */}
                                <View style={styles.handle} />

                                <Text style={styles.sheetTitle}>Add ingredient</Text>

                                <TextInput
                                    style={styles.sheetInput}
                                    placeholder="e.g. olive oil"
                                    placeholderTextColor="#C0A898"
                                    value={newIngredient}
                                    onChangeText={setNewIngredient}
                                    onSubmitEditing={addItem}
                                    returnKeyType="done"
                                    autoFocus={true}
                                />

                                <TouchableOpacity style={styles.sheetButton} onPress={addItem}>
                                    <Text style={styles.sheetButtonText}>Add to pantry</Text>
                                </TouchableOpacity>
                            </View>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
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
    wrapper: {
        flex: 1,
        backgroundColor: "#FDF6F0",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    pageHeader: {
        flexDirection: "row",
        alignItems: "baseline",
        marginBottom: 24,
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
    title: {
        fontSize: 26,
        fontWeight: "700",
        color: "#2C2420",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#A08070",
        marginBottom: 20,
    },
    itemCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",
        flexDirection: "row",
        alignItems: "center",
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2C2420",
        textTransform: "capitalize",
    },
    itemSource: {
        fontSize: 12,
        color: "#A08070",
        marginTop: 2,
    },
    removeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#E8D5C4",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    removeButtonText: {
        color: "#2C2420",
        fontSize: 13,
        fontWeight: "600",
    },
    fab: {
        position: "absolute",
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#C4845A",
        justifyContent: "center",
        alignItems: "center",
    },
    fabText: {
        color: "#FDF6F0",
        fontSize: 32,
        fontWeight: "300",
        lineHeight: 36,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(44, 36, 32, 0.4)",
        justifyContent: "flex-end",
    },
    bottomSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 40,
        borderTopWidth: 0.5,
        borderColor: "#E8D5C4",
    },
    handle: {
        width: 36,
        height: 4,
        backgroundColor: "#E8D5C4",
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#2C2420",
        marginBottom: 14,
    },
    sheetInput: {
        backgroundColor: "#FDF6F0",
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: "#E8D5C4",
        padding: 14,
        fontSize: 15,
        color: "#2C2420",
        marginBottom: 14,
    },
    sheetButton: {
        backgroundColor: "#C4845A",
        borderRadius: 12,
        padding: 15,
        alignItems: "center",
    },
    sheetButtonText: {
        color: "#FDF6F0",
        fontSize: 15,
        fontWeight: "600",
    },
});