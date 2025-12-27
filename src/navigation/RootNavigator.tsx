import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import LoaderScreen from '../screens/LoaderScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MenuScreen from '../screens/MenuScreen';

import StartAdventureScreen from '../screens/StartAdventureScreen';
import OverlordsScreen from '../screens/OverlordsScreen';
import ExchangerScreen from '../screens/ExchangerScreen';
import SavedStoriesScreen from '../screens/SavedStoriesScreen';
import WhatsInsideScreen from '../screens/WhatsInsideScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Loader"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Menu" component={MenuScreen} />
      <Stack.Screen
        name="StartAdventure"
        component={StartAdventureScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen name="Overlords" component={OverlordsScreen} />
      <Stack.Screen
        name="Exchanger"
        component={ExchangerScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="SavedStories"
        component={SavedStoriesScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="WhatsInside"
        component={WhatsInsideScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen name="Statistics" component={StatisticsScreen} />
    </Stack.Navigator>
  );
}
