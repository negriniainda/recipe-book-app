import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CommunityScreen from '@/screens/community/CommunityScreen';

export type CommunityStackParamList = {
  Community: undefined;
  UserProfile: {userId: string};
  RecipeDetail: {recipeId: string};
  CreatePost: undefined;
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

const CommunityNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Community"
        component={CommunityScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default CommunityNavigator;
