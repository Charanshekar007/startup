import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Top Header & Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.topProgressWrapper}>
           <ProgressIndicator totalSteps={4} currentStep={1} />
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Success Illustration Mock */}
        <View style={styles.illustrationContainer}>
          <View style={[styles.glow, { backgroundColor: theme.primary, opacity: 0.15 }]} />
          <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
             <Ionicons name="send" size={32} color="#000" style={{ marginLeft: -4 }} />
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Account Created!</Text>
        
        {/* Now displaying the dynamic email! */}
        <Text style={[styles.subtitle, { color: theme.subText }]}>
          We've sent a verification code to{'\n'}
          <Text style={{ color: theme.text, fontWeight: '600' }}>{userEmail}</Text>
        </Text>

        {/* OTP Card */}
        <View style={[styles.card, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Verify Your Email</Text>
          <Text style={[styles.cardSubtitle, { color: theme.subText }]}>Enter the 6-digit code sent to your email.</Text>
          
          <OTPInput onOtpChange={setEnteredOtp} />

          {/* Error Message Display */}
          {errorMessage ? (
            <Text style={{ color: '#FF453A', textAlign: 'center', marginBottom: 16, fontWeight: '600' }}>
              {errorMessage}
            </Text>
          ) : null}

          {/* Dynamic Countdown Timer */}
          <View style={styles.resendContainer}>
            <Text style={[styles.resendText, { color: theme.subText }]}>Didn't receive code? </Text>
            {timer > 0 ? (
              <Text style={[styles.resendText, { color: theme.subText }]}>
                Resend in 00:{timer < 10 ? `0${timer}` : timer}
              </Text>
            ) : (
              <TouchableOpacity onPress={generateAndSendOTP}>
                <Text style={[styles.resendText, { color: theme.primary, fontWeight: 'bold' }]}>
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
          <Text style={{ color: theme.primary, textAlign: 'center', marginTop: 16, fontSize: 12, opacity: 0.8 }}>
            (Dev Mock OTP: {generatedOtp})
          </Text>
        </View>

        {/* Security Section */}
        <View style={styles.securityWrapper}>
          <View style={styles.verticalSecurity}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Feather name="shield" size={18} color={theme.primary} style={{ marginRight: 8 }} />
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>Secure Verification</Text>
            </View>
            <Text style={{ color: theme.subText, fontSize: 12, marginLeft: 26 }}>
              We never share your information{'\n'}with anyone.
            </Text>
          </View>
        </View>

      </ScrollView>

      {/* Bottom Progress Footer */}
      <View style={styles.bottomProgress}>
        <ProgressIndicator totalSteps={4} currentStep={2} />
        <View style={styles.footerVerificationInfo}>
           <Feather name="shield" size={40} color={theme.primary} style={styles.footerIcon} />
           <View style={{flex: 1}}>
             <Text style={[styles.footerTitle, { color: theme.text }]}>VERIFICATION</Text>
             <Text style={[styles.footerDesc, { color: theme.subText }]}>Email verification to keep your account secure.</Text>
             <Text style={[styles.footerCheck, { color: theme.subText }]}><Feather name="check" size={14} color={theme.primary}/> 6-digit OTP verification</Text>
             <Text style={[styles.footerCheck, { color: theme.subText }]}><Feather name="check" size={14} color={theme.primary}/> Resend option</Text>
             <Text style={[styles.footerCheck, { color: theme.subText }]}><Feather name="check" size={14} color={theme.primary}/> Secure and private</Text>
           </View>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    marginBottom: 16,
  },
  topProgressWrapper: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  illustrationContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  glow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    transform: [{ scale: 1.5 }],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  resendText: {
    fontSize: 13,
  },
  securityWrapper: {
    width: '100%',
    paddingLeft: 16,
    marginBottom: 24,
  },
  verticalSecurity: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  bottomProgress: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  footerVerificationInfo: {
    flexDirection: 'row',
    marginTop: 16,
  },
  footerIcon: {
    marginRight: 16,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerDesc: {
    fontSize: 12,
    marginBottom: 8,
  },
  footerCheck: {
    fontSize: 12,
    marginBottom: 4,
  }
});