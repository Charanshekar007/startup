import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

// 1. Import our global store
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // 2. Bring in the login function from Zustand
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // --- UPDATED PRODUCTION-STYLE LOGIN LOGIC ---
  const handleSignIn = () => {
    // 1. VALIDATION: Check for empty fields
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Credentials', 'Please fill in both your email and password.');
      return;
    }

    const enteredEmail = email.trim().toLowerCase();

    // 2. SCENARIO A: Valid Single-Sport User
    if (enteredEmail === 'player@test.com' && password === 'password123') {
      
      const mockAccountData = {
        email: enteredEmail,
        username: 'star_player',
        id: 'usr_101'
      };

      const mockSportProfiles = [
        { 
          id: 'prof_1', 
          sport: 'Cricket', 
          role: 'Batter', 
          experience: 'Advanced',
          teams: [{ name: 'My Local Club', location: 'City' }] 
        }
      ];

      // Logs them straight into the Cricket Dashboard
      login(mockAccountData, mockSportProfiles, mockSportProfiles[0].sport);
    } 
    
    // 3. SCENARIO B: Valid Multi-Sport User
    else if (enteredEmail === 'multi@test.com' && password === 'password123') {
      
      // We will route them to the selection screen here later!
      Alert.alert('Multiple Profiles Found', 'Routing to Continue With screen... (Coming Soon)');
    } 
    
    // 4. SCENARIO C: Account Does Not Exist (Wrong credentials)
    else {
      Alert.alert(
        'Account Not Found', 
        'This account does not exist or the password is incorrect. Please try again or sign up.'
      );
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-1 p-6 justify-center">
        
        {/* Header */}
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-full border justify-center items-center mb-6" style={{ borderColor: theme.primary }}>
            <Text className="text-xs text-center" style={{ color: theme.primary }}>APP{'\n'}LOGO</Text>
          </View>
          <Text className="text-[28px] font-bold mb-2" style={{ color: theme.text }}>Welcome Back</Text>
          <Text className="text-sm" style={{ color: theme.subText }}>Start your sports journey</Text>
        </View>

        {/* Input Form */}
        <View className="mb-8">
          <Text className="text-sm font-semibold mb-2 mt-4" style={{ color: theme.text }}>Email or Username</Text>
          <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
            <Feather name="user" size={20} color={theme.subText} className="mr-3" />
            <TextInput
              className="flex-1 text-base"
              style={{ color: theme.text }}
              placeholder="Enter your email or username"
              placeholderTextColor={theme.subText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <Text className="text-sm font-semibold mb-2 mt-4" style={{ color: theme.text }}>Password</Text>
          <View className="flex-row items-center border rounded-xl px-4 h-14" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
            <Feather name="lock" size={20} color={theme.subText} className="mr-3" />
            <TextInput
              className="flex-1 text-base"
              style={{ color: theme.text }}
              placeholder="Enter your password"
              placeholderTextColor={theme.subText}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={20} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="self-end mt-3 mb-6">
            <Text className="text-sm" style={{ color: theme.text }}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="h-14 rounded-xl justify-center items-center"
            style={{ backgroundColor: theme.primary }}
            onPress={handleSignIn}
          >
            <Text className="text-black text-base font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Divider & Google Login */}
        <View className="flex-row items-center mb-8">
          <View className="flex-1 h-[1px]" style={{ backgroundColor: theme.inputBorder }} />
          <Text className="px-4 text-sm" style={{ color: theme.subText }}>or continue with</Text>
          <View className="flex-1 h-[1px]" style={{ backgroundColor: theme.inputBorder }} />
        </View>

        <TouchableOpacity
          className="h-14 flex-row rounded-xl border justify-center items-center mb-8"
          style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
        >
          <Text className="text-lg font-bold mr-3" style={{ color: theme.text }}>G</Text>
          <Text className="text-base font-semibold" style={{ color: theme.text }}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View className="flex-row justify-center">
          <Text style={{ color: theme.subText }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text className="font-bold" style={{ color: theme.primary }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}