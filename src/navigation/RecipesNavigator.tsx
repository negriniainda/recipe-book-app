import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import RecipesScreen from '@/screens/recipe/RecipesScreen';

export type RecipesStackParamList = {
  Recipes: undefined;
  RecipeDetail: {recipeId: string};
  CreateRecipe: undefined;
  EditRecipe: {recipeId: string};
  ImportRecipe: undefined;
};

const Stack = createNativeStackNavigator<RecipesStackParamList>();

const RecipesNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default RecipesNavigator;
