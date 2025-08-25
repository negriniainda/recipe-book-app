import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Icon} from 'react-native-paper';
import {theme} from '@/utils/theme';

// Importar navegadores de cada seção
import RecipesNavigator from './RecipesNavigator';
import {ShoppingListNavigator} from './ShoppingListNavigator';

// Placeholder screens (serão implementadas nas próximas tarefas)
import HomeScreen from '@/screens/home/HomeScreen';
import PlanningScreen from '@/screens/planning/PlanningScreen';
import CommunityScreen from '@/screens/community/CommunityScreen';
import ProfileScreen from '@/screens/auth/ProfileScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  RecipesTab: undefined;
  PlanningTab: undefined;
  ShoppingListTab: undefined;
  CommunityTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'HomeTab':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'RecipesTab':
              iconName = focused ? 'book-open' : 'book-open-outline';
              break;
            case 'PlanningTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'ShoppingListTab':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'CommunityTab':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon source={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline || '#e0e0e0',
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      })}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Início',
          tabBarLabel: 'Início',
        }}
      />
      <Tab.Screen
        name="RecipesTab"
        component={RecipesNavigator}
        options={{
          title: 'Receitas',
          tabBarLabel: 'Receitas',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="PlanningTab"
        component={PlanningScreen}
        options={{
          title: 'Planejamento',
          tabBarLabel: 'Planejar',
        }}
      />
      <Tab.Screen
        name="ShoppingListTab"
        component={ShoppingListNavigator}
        options={{
          title: 'Lista de Compras',
          tabBarLabel: 'Compras',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityScreen}
        options={{
          title: 'Comunidade',
          tabBarLabel: 'Comunidade',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
