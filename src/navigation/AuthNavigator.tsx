import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {theme} from '@/utils/theme';

// Importar telas de autenticação
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {token: string};
  VerifyEmail: {token: string};
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: 'Criar conta',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: 'Recuperar senha',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
