import { StyleSheet, Button, View, Text, } from 'react-native';
import {useRouter, useFocusEffect, Redirect, router} from 'expo-router';

import { useSession } from "../ctx"

export default function LoginPage() {
  const { signIn } = useSession();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Page</Text>
      <Button
        title="Log in"
        color="#f194ff"
        onPress={() => {
          signIn();
          router.replace('/(tabs)');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  }
})