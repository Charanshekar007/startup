import './global.css';
import './src/theme/iconSetup';
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
import LiveScoringScreen from './src/main/LiveScoringScreen';
import TournamentWizardScreen from './src/screens/tournament/TournamentWizardScreen';
import TournamentDetailScreen from './src/screens/tournament/TournamentDetailScreen';
import MyTournamentsScreen from './src/screens/tournament/MyTournamentsScreen';

import { useAuthStore } from './src/store/authStore';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Messages" component={MessagingModule} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="LiveScoring" component={LiveScoringScreen} />
      <Stack.Screen
        name="TournamentWizard"
        component={TournamentWizardScreen}
        getId={({ params }) => params?.existingDraft?.id || params?.draft?.id || 'new_tournament'}
      />
      <Stack.Screen
        name="TournamentDetail"
        component={TournamentDetailScreen}
        getId={({ params }) => params?.tournamentId}
      />
      <Stack.Screen name="MyTournaments" component={MyTournamentsScreen} />
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