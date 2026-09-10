import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoPlaceholder, { borderColor: theme.primary }]}>
            <Text style={{ color: theme.primary, fontSize: 12, textAlign: 'center' }}>APP{'\n'}LOGO</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.subText }]}>Start your sports journey</Text>
        </View>

        {/* Input Form */}
        <View style={styles.form}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Email or Username</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Feather name="user" size={20} color={theme.subText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Enter your email or username"
              placeholderTextColor={theme.subText}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.inputLabel, { color: theme.text }]}>Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
            <Feather name="lock" size={20} color={theme.subText} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
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

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: theme.text }]}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.signInBtn, { backgroundColor: theme.primary }]}
            onPress={handleSignIn}
          >
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Divider & Google Login */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: theme.inputBorder }]} />
          <Text style={[styles.dividerText, { color: theme.subText }]}>or continue with</Text>
          <View style={[styles.divider, { backgroundColor: theme.inputBorder }]} />
        </View>

        <TouchableOpacity style={[styles.googleBtn, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginRight: 12 }}>G</Text>
          <Text style={[styles.googleBtnText, { color: theme.text }]}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ color: theme.subText }}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoPlaceholder: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14 },
  form: { marginBottom: 32 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 56 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16 },
  forgotPassword: { alignSelf: 'flex-end', marginTop: 12, marginBottom: 24 },
  forgotPasswordText: { fontSize: 14 },
  signInBtn: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  signInBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  divider: { flex: 1, height: 1 },
  dividerText: { paddingHorizontal: 16, fontSize: 14 },
  googleBtn: { height: 56, flexDirection: 'row', borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  googleBtnText: { fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
});