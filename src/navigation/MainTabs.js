import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

// Import ALL our real Screens!
import HomeScreen from '../main/HomeScreen';
import MatchesScreen from '../main/MatchesScreen';
import DiscoverScreen from '../main/DiscoverScreen';
import ProfileScreen from '../main/ProfileScreen';
import CreateScreen from '../main/CreateScreen'; // <-- IMPORTED THE REAL CREATE SCREEN

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primary || '#2ecc71', 
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#121212', 
          borderTopWidth: 1,
          borderTopColor: '#222',
          height: 65 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Matches') iconName = 'award';
          else if (route.name === 'Discover') iconName = 'search';
          else if (route.name === 'Profile') iconName = 'user';

          // Special Custom Button for 'Create' (The central +)
          if (route.name === 'Create') {
            return (
              <View 
                className="w-12 h-12 rounded-full justify-center items-center mb-1"
                style={{ backgroundColor: theme.primary || '#2ecc71' }}
              >
                <Feather name="plus" size={24} color="#000" />
              </View>
            );
          }

          return <Feather name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen 
        name="Create" 
        component={CreateScreen} 
        options={{ tabBarLabel: 'Create' }} 
      />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}