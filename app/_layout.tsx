// All import statements remain the same except you need to import `useSession` from your `ctx.tsx` file.
import { SessionProvider, useSession } from '@/ctx';
import {Stack} from "expo-router";
import {SplashScreenController} from "@/splash";

export default function Root() {
    // Set up the auth context and render your layout inside of it.
    return (
        <SessionProvider>
            <SplashScreenController />
            <RootNavigator />
        </SessionProvider>
    );
}

function RootNavigator() {
    const { session } = useSession();

    return (
        <Stack>
            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(tabs)" />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen name="login" />
            </Stack.Protected>
        </Stack>
    );
}
