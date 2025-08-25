import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {IconButton} from 'react-native-paper';
import {View, Text} from 'react-native';

// Screens
import MealPlanningScreen from '../screens/mealPlanning/MealPlanningScreen';

// Define theme inline to avoid import issues
const themeColors = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  surface: '#FFFFFF',
  background: '#F5F5F5',
  onSurface: '#1C1B1F',
};

export type MealPlanningStackParamList = {
  MealPlanningHome: undefined;
  MealPlanPreferences: undefined;
  MealPlanStats: undefined;
  WeeklyPlanGenerator: undefined;
};

const Stack = createNativeStackNavigator<MealPlanningStackParamList>();

interface MealPlanningNavigatorProps {
  navigation?: any;
}

const MealPlanningNavigator: React.FC<MealPlanningNavigatorProps> = () => {
  return (
    <Stack.Navigator
      initialRouteName="MealPlanningHome"
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.surface,
        },
        headerTintColor: themeColors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}>
      
      <Stack.Screen
        name="MealPlanningHome"
        component={MealPlanningScreen}
        options={({navigation}) => ({
          title: 'Planejamento de Refeições',
          headerRight: () => (
            <IconButton
              icon="cog"
              onPress={() => navigation.navigate('MealPlanPreferences')}
              iconColor={themeColors.primary}
            />
          ),
        })}
      />

      {/* TODO: Implement these screens */}
      <Stack.Screen
        name="MealPlanPreferences"
        component={() => (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Meal Plan Preferences - Coming Soon</Text>
          </View>
        )}
        options={{
          title: 'Preferências',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="MealPlanStats"
        component={() => (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Meal Plan Statistics - Coming Soon</Text>
          </View>
        )}
        options={{
          title: 'Estatísticas',
          presentation: 'modal',
        }}
      />

      <Stack.Screen
        name="WeeklyPlanGenerator"
        component={() => (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Weekly Plan Generator - Coming Soon</Text>
          </View>
        )}
        options={{
          title: 'Gerar Plano Semanal',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default MealPlanningNavigator;