import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {ShoppingListScreen} from '../screens/shoppingList/ShoppingListScreen';
import {colors} from '../theme';

export type ShoppingListStackParamList = {
  ShoppingListMain: undefined;
};

const Stack = createStackNavigator<ShoppingListStackParamList>();

export const ShoppingListNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray[200],
        },
        headerTintColor: colors.gray[900],
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="ShoppingListMain"
        component={ShoppingListScreen}
        options={{
          headerShown: false, // Header is handled by the screen component
        }}
      />
    </Stack.Navigator>
  );
};