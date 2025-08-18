import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PlanningScreen from '@/screens/planning/PlanningScreen';

export type PlanningStackParamList = {
  Planning: undefined;
  MealPlan: {date?: string};
  ShoppingList: {listId?: string};
  CreateShoppingList: undefined;
};

const Stack = createNativeStackNavigator<PlanningStackParamList>();

const PlanningNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Planning"
        component={PlanningScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default PlanningNavigator;
