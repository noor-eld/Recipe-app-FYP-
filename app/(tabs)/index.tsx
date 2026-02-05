import {View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import {useSession} from "@/ctx";
import recipes from '../../data/recipes.json';
import RecipeDetails from "@/app/recipeDetails";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { signOut } = useSession();
  const router = useRouter();

  return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <FlatList
            data={recipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <Pressable
                    style={{
                        padding: 16,
                        marginBottom: 12,
                        borderRadius: 8,
                        backgroundColor: '#f2f2f2',
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: '600'}} onPress={() => router.navigate('/recipeDetails')}> {item.title} </Text>
                </Pressable>
            )}

        />
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