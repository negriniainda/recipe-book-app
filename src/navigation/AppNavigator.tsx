import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAppSelector} from '@/store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import {LoadingScreen} from '@/components/auth/AuthGuard';

const Stack = createNativeStackNavigator();

const AppNavigator: React.FC = () => {
  const {isAuthenticated, loading} = useAppSelector(state => state.auth);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
