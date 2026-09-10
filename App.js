import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { MatchProvider } from './src/context/MatchContext'; // <-- 1. ADDED IMPORT

import AuthNavigator from './src/navigation/AuthNavigator';
import MainTabs from './src/navigation/MainTabs';

import MessagingModule from './src/main/MessagingModule';
import NotificationsScreen from './src/main/NotificationsScreen';

import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Messages" component={MessagingModule} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MatchProvider> {/* <-- 2. WRAPPED AROUND NAVIGATION */}
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </MatchProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}