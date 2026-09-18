import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

// Reusable Components
import ProgressIndicator from '../../components/ProgressIndicator';
import OTPInput from '../../components/OTPInput';
import PrimaryButton from '../../components/PrimaryButton';

// Notice we added { route } here to receive data from the previous screen!
export default function VerificationScreen({ route }) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  // Grab the email passed from SignUp, or use a fallback if it's missing
  const userEmail = route?.params?.email || 'your.email@example.com';

  // --- State ---
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [timer, setTimer] = useState(59); // Real countdown timer state

  // --- Setup OTP and Timer ---
  useEffect(() => {
    generateAndSendOTP();
  }, []);

  // --- Countdown Logic ---
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval); // Cleanup when screen closes
  }, [timer]);

  const generateAndSendOTP = () => {
    // 1. Generate new OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    
    // 2. Restart Timer
    setTimer(59);

    // 3. Try to show alert (Web browsers might block this, which is why we show it on screen below too)
    if (Platform.OS === 'web') {
      window.alert(`📬 Mock Email Received\n\nYour verification code is: ${mockOtp}`);
    } else {
      Alert.alert("📬 Mock Email Received", `Your verification code is: ${mockOtp}`);
    }
  };

  // --- Verification Validation ---
  const handleVerify = () => {
    if (enteredOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit code.');
      return;
    }
    
    if (enteredOtp !== generatedOtp) {
      setErrorMessage('Invalid verification code. Please try again.');
      return;
    }

    setErrorMessage('');
    navigation.navigate('ChooseSport');
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      
      {/* Top Header & Progress */}
      <View className="flex-row items-center px-6 pt-2 mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View className="flex-1 px-8 pt-2">
           <ProgressIndicator totalSteps={4} currentStep={1} />
        </View>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerClassName="px-6 items-center" showsVerticalScrollIndicator={false}>
        
        {/* Success Illustration Mock */}
        <View className="h-[100px] justify-center items-center mb-6">
          <View className="absolute w-20 h-20 rounded-full" style={{ backgroundColor: theme.primary, opacity: 0.15, transform: [{ scale: 1.5 }] }} />
          <View className="w-[72px] h-[72px] rounded-[36px] justify-center items-center" style={{ backgroundColor: theme.primary }}>
             <Ionicons name="send" size={32} color="#000" className="-ml-1" />
          </View>
        </View>

        <Text className="text-2xl font-bold mb-2" style={{ color: theme.text }}>Account Created!</Text>
        
        {/* Now displaying the dynamic email! */}
        <Text className="text-sm text-center leading-5 mb-8" style={{ color: theme.subText }}>
          We've sent a verification code to{'\n'}
          <Text className="font-semibold" style={{ color: theme.text }}>{userEmail}</Text>
        </Text>

        {/* OTP Card */}
        <View className="w-full rounded-2xl border p-6 mb-8" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <Text className="text-lg font-bold mb-1" style={{ color: theme.text }}>Verify Your Email</Text>
          <Text className="text-[13px] mb-6" style={{ color: theme.subText }}>Enter the 6-digit code sent to your email.</Text>
          
          <OTPInput onOtpChange={setEnteredOtp} />

          {/* Error Message Display */}
          {errorMessage ? (
            <Text className="text-center mb-4 font-semibold text-[#FF453A]">
              {errorMessage}
            </Text>
          ) : null}

          {/* Dynamic Countdown Timer */}
          <View className="flex-row justify-center mb-6">
            <Text className="text-[13px]" style={{ color: theme.subText }}>Didn't receive code? </Text>
            {timer > 0 ? (
              <Text className="text-[13px]" style={{ color: theme.subText }}>
                Resend in 00:{timer < 10 ? `0${timer}` : timer}
              </Text>
            ) : (
              <TouchableOpacity onPress={generateAndSendOTP}>
                <Text className="text-[13px] font-bold" style={{ color: theme.primary }}>
                  Resend Now
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Validation Button */}
          <PrimaryButton 
            title="Verify Email" 
            onPress={handleVerify} 
          />
          
          {/* Developer Helper to bypass browser pop-up blockers */}
          <Text className="text-center mt-4 text-xs opacity-80" style={{ color: theme.primary }}>
            (Dev Mock OTP: {generatedOtp})
          </Text>
        </View>

        {/* Security Section */}
        <View className="w-full pl-4 mb-6">
          <View className="flex-col items-start">
            <View className="flex-row items-center mb-1">
              <Feather name="shield" size={18} color={theme.primary} className="mr-2" />
              <Text className="text-[13px] font-semibold" style={{ color: theme.primary }}>Secure Verification</Text>
            </View>
            <Text className="text-xs ml-[26px]" style={{ color: theme.subText }}>
              We never share your information{'\n'}with anyone.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Progress Footer */}
      <View className="px-6 pb-8">
        <ProgressIndicator totalSteps={4} currentStep={2} />
        <View className="flex-row mt-4">
           <Feather name="shield" size={40} color={theme.primary} className="mr-4" />
           <View className="flex-1">
             <Text className="text-sm font-bold mb-1" style={{ color: theme.text }}>VERIFICATION</Text>
             <Text className="text-xs mb-2" style={{ color: theme.subText }}>Email verification to keep your account secure.</Text>
             <Text className="text-xs mb-1" style={{ color: theme.subText }}><Feather name="check" size={14} color={theme.primary}/> 6-digit OTP verification</Text>
             <Text className="text-xs mb-1" style={{ color: theme.subText }}><Feather name="check" size={14} color={theme.primary}/> Resend option</Text>
             <Text className="text-xs mb-1" style={{ color: theme.subText }}><Feather name="check" size={14} color={theme.primary}/> Secure and private</Text>
           </View>
        </View>
      </View>

    </SafeAreaView>
  );
}