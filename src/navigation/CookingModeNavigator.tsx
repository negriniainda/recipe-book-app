import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {CookingModeScreen} from '../screens/cookingMode/CookingModeScreen';
import {colors} from '../theme';

export type CookingModeStackParamList = {
  CookingMode: {
    recipeId?: string;
    sessionId?: string;
    autoStart?: boolean;
  };
};

const Stack = createStackNavigator<CookingModeStackParamList>();

export const CookingModeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Cooking mode handles its own header
        gestureEnabled: false, // Prevent accidental navigation
        cardStyle: {backgroundColor: colors.white},
      }}
    >
      <Stack.Screen
        name="CookingMode"
        component={CookingModeScreen}
        options={{
          animationEnabled: false, // Instant transition for cooking mode
        }}
      />
    </Stack.Navigator>
  );
};