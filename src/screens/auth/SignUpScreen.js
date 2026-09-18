import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

// Reusing your existing components
import InputField from '../../components/InputField';
import PasswordInput from '../../components/PasswordInput';
import GoogleButton from '../../components/GoogleButton';

// The components we just made
import PasswordStrength from '../../components/PasswordStrength';
import SecurityCard from '../../components/SecurityCard';
import PrimaryButton from '../../components/PrimaryButton';

export default function SignUpScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();

  // --- Form State ---
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- Validation State ---
  const [errorMessage, setErrorMessage] = useState('');

  // --- Validation Logic ---
  const handleSignUp = () => {
    // 1. Check if any field is empty
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all details to create your account.');
      return;
    }

    // 2. Validate Email Format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // 3. Validate Password Length
    if (password.length < 8) {
      setErrorMessage('Your password must be at least 8 characters long.');
      return;
    }

    // 4. Clear errors and proceed, passing the email to the Verification screen!
    setErrorMessage('');
    navigation.navigate('Verification', { email: email }); // <--- Added!
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerClassName="px-6 pb-8 pt-4" showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <View className="w-8 h-8 justify-center items-center">
              <Text className="text-2xl font-black italic" style={{ color: theme.primary }}>P</Text>
            </View>
            
            <View className="w-6" />
          </View>

          {/* Title Section */}
          <View className="flex-row justify-between items-start mb-8">
            <View>
              <Text className="text-[28px] font-bold mb-2" style={{ color: theme.text }}>Sign Up</Text>
              <Text className="text-sm" style={{ color: theme.subText }}>Create your account to get started</Text>
            </View>
            <View className="flex-row items-center mt-2">
              <MaterialCommunityIcons name="shield-check-outline" size={14} color={theme.subText} />
              <Text className="text-xs ml-1" style={{ color: theme.subText }}>Secure & Private</Text>
            </View>
          </View>

          {/* Form */}
          <View className="mb-4">
            <InputField 
              label="Full Name" 
              placeholder="e.g. Arjun Reddy" 
              iconName="user" 
              value={fullName}
              onChangeText={setFullName}
            />
            <InputField 
              label="Username" 
              placeholder="e.g. arjunreddy_07" 
              iconName="at-sign" 
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <InputField 
              label="Email" 
              placeholder="e.g. arjunreddy07@gmail.com" 
              iconName="mail" 
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <PasswordInput 
              label="Password" 
              placeholder="••••••••••••" 
              value={password}
              onChangeText={setPassword}
            />
            <PasswordStrength />
          </View>

          <SecurityCard 
            title="Your account is protected" 
            subtitle="We never share your information" 
          />

          {errorMessage ? (
            <Text className="text-[13px] font-semibold text-center mb-3 text-[#FF453A]">
              {errorMessage}
            </Text>
          ) : null}

          <PrimaryButton 
            title="Create Account" 
            onPress={handleSignUp} 
          />

          <View className="flex-row items-center my-6">
            <View className="flex-1 h-[1px]" style={{ backgroundColor: theme.divider }} />
            <Text className="px-4 text-xs" style={{ color: theme.subText }}>OR</Text>
            <View className="flex-1 h-[1px]" style={{ backgroundColor: theme.divider }} />
          </View>

          <GoogleButton onPress={() => {}} />

          <View className="flex-row justify-center mb-8">
            <Text className="text-sm" style={{ color: theme.subText }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-sm font-semibold" style={{ color: theme.primary }}>Log In</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-xs text-center leading-[18px]" style={{ color: theme.subText }}>
            By signing up, you agree to our <Text style={{ color: theme.primary }}>Terms of Service</Text>{'\n'}
            and <Text style={{ color: theme.primary }}>Privacy Policy</Text>
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}