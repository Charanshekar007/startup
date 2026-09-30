import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { getUserByCredentials } from '../../store/userRepository';

export default function LoginScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticate user against persistent user repository
  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Credentials', 'Please fill in both your email/username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const enteredInput = email.trim();
      const user = await getUserByCredentials(enteredInput, password);

      if (user) {
        login(user.account, user.sportProfiles, user.activeSport || 'Cricket');
      } else {
        Alert.alert(
          'Account Not Found', 
          'This account does not exist or the password is incorrect. Please try again or sign up.'
        );
      }
    } catch (err) {
      console.error('Sign in error:', err);
      Alert.alert('Sign In Error', 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="flex-1 p-6 justify-center">
        
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full border justify-center items-center mb-4" style={{ borderColor: theme.primary }}>
            <Text className="text-xs text-center" style={{ color: theme.primary }}>APP{'\n'}LOGO</Text>
          </View>
          <Text className="text-[28px] font-bold mb-1" style={{ color: theme.text }}>Welcome Back</Text>
          <Text className="text-sm" style={{ color: theme.subText }}>Start your sports journey</Text>
        </View>

        {/* Input Form */}
        <View className="mb-6">
          <Text className="text-sm font-semibold mb-2" style={{ color: theme.text }}>Email or Username</Text>
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

          <TouchableOpacity className="self-end mt-3 mb-5">
            <Text className="text-sm" style={{ color: theme.text }}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="h-14 rounded-xl justify-center items-center"
            style={{ backgroundColor: theme.primary }}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black text-base font-bold">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider & Google Login */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-[1px]" style={{ backgroundColor: theme.inputBorder }} />
          <Text className="px-4 text-sm" style={{ color: theme.subText }}>or continue with</Text>
          <View className="flex-1 h-[1px]" style={{ backgroundColor: theme.inputBorder }} />
        </View>

        <TouchableOpacity
          className="h-14 flex-row rounded-xl border justify-center items-center mb-6"
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