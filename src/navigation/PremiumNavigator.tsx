import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../utils/theme';

// Screens
import { PremiumPlansScreen } from '../screens/premium/PremiumPlansScreen';
import { ManagePremiumScreen } from '../screens/premium/ManagePremiumScreen';

export type PremiumStackParamList = {
  PremiumPlans: undefined;
  ManagePremium: undefined;
  PaymentMethods: undefined;
  BillingHistory: undefined;
  PremiumStats: undefined;
};

const Stack = createNativeStackNavigator<PremiumStackParamList>();

interface PremiumNavigatorProps {
  navigation?: any;
}

const PremiumNavigator: React.FC<PremiumNavigatorProps> = () => {
  return (
    <Stack.Navigator
      initialRouteName="PremiumPlans"
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
        presentation: 'modal',
      }}>
      <Stack.Screen
        name="PremiumPlans"
        component={PremiumPlansScreen}
        options={{
          title: 'Planos Premium',
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ManagePremium"
        component={ManagePremiumScreen}
        options={{
          title: 'Gerenciar Premium',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default PremiumNavigator;