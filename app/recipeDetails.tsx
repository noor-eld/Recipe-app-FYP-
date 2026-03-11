import {Text, View} from "react-native";
import {JSX} from "react";
import recipes from "../data/recipes.json";
import { useLocalSearchParams } from "expo-router";


export default function RecipeDetails(): JSX.Element {
    const { id } = useLocalSearchParams();
    const recipe = recipes.find(r => r.id === id);

    if (!recipe) {
        return <Text>Recipe not found</Text>
    }

    return(
        <View>
            <Text>{recipe.title}</Text>
            <Text>{recipe.instructions}</Text>
        </View>
    );
}