import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {View, Text} from 'react-native';
import MealPlanScreen from '../screens/mealPlan/MealPlanScreen';

// Placeholder components for screens that don't exist yet
const PlanningScreen = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text>Planning Overview Screen - Coming Soon</Text>
  </View>
);

const ShoppingListScreen = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text>Shopping List Screen - Coming Soon</Text>
  </View>
);

const CreateShoppingListScreen = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text>Create Shopping List Screen - Coming Soon</Text>
  </View>
);

export type PlanningStackParamList = {
  Planning: undefined;
  MealPlan: {date?: string};
  ShoppingList: {listId?: string};
  CreateShoppingList: undefined;
};

const Stack = createNativeStackNavigator<PlanningStackParamList>();

const PlanningNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MealPlan"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1C1B1F',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="Planning"
        component={PlanningScreen}
        options={{
          title: 'Planejamento',
        }}
      />
      
      <Stack.Screen
        name="MealPlan"
        component={MealPlanScreen}
        options={{
          title: 'Plano de Refeições',
        }}
      />
      
      <Stack.Screen
        name="ShoppingList"
        component={ShoppingListScreen}
        options={{
          title: 'Lista de Compras',
        }}
      />
      
      <Stack.Screen
        name="CreateShoppingList"
        component={CreateShoppingListScreen}
        options={{
          title: 'Nova Lista de Compras',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default PlanningNavigator;
