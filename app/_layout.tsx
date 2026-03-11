// Traffic controller
// It decides: are you logged in? Show the tabs. Not logged in? Show the login screen.

import { SessionProvider, useSession } from "@/ctx";
import { Stack } from "expo-router";
import { SplashScreenController } from "@/splash";
import { View, ActivityIndicator } from "react-native";

export default function Root() {
    return (
        // SessionProvider wraps everything so all screens can access auth info
        <SessionProvider>
            <SplashScreenController />
            <RootNavigator />
        </SessionProvider>
    );
}

function RootNavigator() {
    const { session, isLoading } = useSession();

    // While Firebase is checking if the user is logged in (happens on app start),
    // show a loading spinner instead of flashing the login screen for a split second.
    // Without this, users would briefly see the login page every time they open the app,
    // even if they're already logged in. That looks janky.
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <Stack>
            {/*
        guard={!!session} means:
        - If session exists (user is logged in) → !!session is true → show tabs
        - If session is null (not logged in) → !!session is false → show login
      */}
            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen name="login" options={{ headerShown: false }} />
            </Stack.Protected>
        </Stack>
    );
}