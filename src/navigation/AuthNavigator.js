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
    <View className="flex-1 justify-center items-center bg-[#020A0D]">
      <Text className="text-2xl font-bold mb-5 text-white">
        {route.name} Screen
      </Text>
      <Text className="text-base text-[#9AA4A7] mb-10">
        UI coming soon!
      </Text>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        className="p-[15px] bg-[#32D74B] rounded-lg"
      >
        <Text className="text-black font-bold">Go Back</Text>
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