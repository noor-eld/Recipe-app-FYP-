import {View, Text, StyleSheet} from 'react-native';
import {useSession} from "@/ctx";

export default function HomeScreen() {
  const { signOut } = useSession();
  return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.title}>Home Page</Text>
        <Text
            onPress={() => {
              signOut();
            }}>
          Sign Out
        </Text>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: 'white',
  },
})