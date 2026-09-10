import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// --- REAL SCREENS ---
import CricketProfileScreen from '../screens/auth/CricketProfileScreen';
import ChooseSportScreen from '../screens/auth/ChooseSportScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// --- Temporary Placeholder Component for the remaining screens ---
function PlaceholderScreen({ route }) {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#020A0D' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: 'white' }}>
        {route.name} Screen
      </Text>
      <Text style={{ fontSize: 16, color: '#9AA4A7', marginBottom: 40 }}>
        UI coming soon!
      </Text>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={{ padding: 15, backgroundColor: '#32D74B', borderRadius: 8 }}
      >
        <Text style={{ color: 'black', fontWeight: 'bold' }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="ChooseSport" component={ChooseSportScreen} />
      
      {/* 
        The final missing piece is successfully added here! 
      */}
      <Stack.Screen name="CricketProfile" component={CricketProfileScreen} />
      
      {/* Connected Placeholder Screens */}
      <Stack.Screen name="ForgotPassword" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
}