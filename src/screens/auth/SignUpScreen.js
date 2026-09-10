import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet 
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} onPress={() => navigation.goBack()}>
              <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>
            
            <View style={styles.logoPlaceholder}>
              <Text style={[styles.logoText, { color: theme.primary }]}>P</Text>
            </View>
            
            <View style={{ width: 24 }} />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Sign Up</Text>
              <Text style={[styles.subtitle, { color: theme.subText }]}>Create your account to get started</Text>
            </View>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="shield-check-outline" size={14} color={theme.subText} />
              <Text style={[styles.badgeText, { color: theme.subText }]}>Secure & Private</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
            <Text style={[styles.errorText, { color: '#FF453A' }]}>
              {errorMessage}
            </Text>
          ) : null}

          <PrimaryButton 
            title="Create Account" 
            onPress={handleSignUp} 
          />

          <View style={styles.dividerContainer}>
            <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />
            <Text style={[styles.dividerText, { color: theme.subText }]}>OR</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.divider }]} />
          </View>

          <GoogleButton onPress={() => {}} />

          <View style={styles.loginContainer}>
            <Text style={[styles.footerText, { color: theme.subText }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginText, { color: theme.primary }]}>Log In</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.termsText, { color: theme.subText }]}>
            By signing up, you agree to our <Text style={{ color: theme.primary }}>Terms of Service</Text>{'\n'}
            and <Text style={{ color: theme.primary }}>Privacy Policy</Text>
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex1: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  logoPlaceholder: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  titleSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  badgeText: { fontSize: 12, marginLeft: 4 },
  form: { marginBottom: 16 },
  errorText: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { paddingHorizontal: 16, fontSize: 12 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 32 },
  footerText: { fontSize: 14 },
  loginText: { fontSize: 14, fontWeight: '600' },
  termsText: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});