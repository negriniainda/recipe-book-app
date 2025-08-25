import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IconButton } from 'react-native-paper';
import { theme } from '../utils/theme';

import { View, Text } from 'react-native';

// Screens
import RecipesScreen from '../screens/recipe/RecipesScreen';
import ImportScreen from '../screens/recipe/ImportScreen';
import OCRImportScreen from '../screens/recipe/OCRImportScreen';

const RecipeDetailsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Recipe Details Screen - Coming Soon</Text>
  </View>
);

const AddRecipeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Add Recipe Screen - Coming Soon</Text>
  </View>
);

const RecipePreviewScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Recipe Preview Screen - Coming Soon</Text>
  </View>
);

export type RecipesStackParamList = {
  RecipesList: undefined;
  RecipeDetails: { recipeId: string };
  AddRecipe: undefined;
  ImportRecipe: undefined;
  OCRImport: undefined;
  RecipePreview: { recipe: any };
};

const Stack = createNativeStackNavigator<RecipesStackParamList>();

interface RecipesNavigatorProps {
  navigation?: any;
}

const RecipesNavigator: React.FC<RecipesNavigatorProps> = () => {
  return (
    <Stack.Navigator
      initialRouteName="RecipesList"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="RecipesList"
        component={RecipesScreen}
        options={({ navigation }) => ({
          title: 'Receitas',
          headerRight: () => (
            <IconButton
              icon="import"
              onPress={() => navigation.navigate('ImportRecipe')}
              iconColor={theme.colors.primary}
            />
          ),
        })}
      />

      <Stack.Screen
        name="RecipeDetails"
        component={RecipeDetailsScreen}
        options={() => ({
          title: 'Detalhes da Receita',
        })}
      />

      <Stack.Screen
        name="AddRecipe"
        component={AddRecipeScreen}
        options={{
          title: 'Nova Receita',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="ImportRecipe"
        component={ImportScreen}
        options={{
          title: 'Importar Receita',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="OCRImport"
        component={OCRImportScreen}
        options={{
          title: 'Importar via Foto',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="RecipePreview"
        component={RecipePreviewScreen}
        options={{
          title: 'Preview da Receita',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default RecipesNavigator;