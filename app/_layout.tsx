// All import statements remain the same except you need to import `useSession` from your `ctx.tsx` file.
import { SessionProvider, useSession } from '@/ctx';
import {Stack} from "expo-router";

// All of the above code remains unchanged. Update the `RootNavigator` to protect routes based on your `SessionProvider` below.

export default function RootNavigator() {
    const { session } = useSession();

    return (
        <Stack>
            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(app)" />
            </Stack.Protected>

            <Stack.Protected guard={!session}>
                <Stack.Screen name="login" />
            </Stack.Protected>
        </Stack>
    );
}
