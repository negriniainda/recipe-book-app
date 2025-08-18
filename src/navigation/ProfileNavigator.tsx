import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import ProfileScreen from '@/screens/auth/ProfileScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  ChangePassword: undefined;
  Privacy: undefined;
  Support: undefined;
  MyRecipes: undefined;
  Favorites: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
