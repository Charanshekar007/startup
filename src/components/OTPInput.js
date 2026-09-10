import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function OTPInput({ onOtpChange }) {
  const { theme } = useTheme();
  // Start completely empty
  const [otp, setOtp] = useState(['', '', '', '', '', '']); 
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    // Handle pasting a full 6-digit code
    if (text.length === 6) {
      const pastedOtp = text.split('').slice(0, 6);
      setOtp(pastedOtp);
      onOtpChange(pastedOtp.join(''));
      inputs.current[5].focus(); // Jump to end
      return;
    }

    // Normal typing (1 char per box)
    const newOtp = [...otp];
    newOtp[index] = text.slice(-1); // Ensure only 1 char gets saved
    setOtp(newOtp);
    onOtpChange(newOtp.join('')); // Send the full string back to the screen

    // Auto-advance focus to the next box
    if (text && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Backspace to previous box if current is empty
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          style={[
            styles.input,
            { 
              backgroundColor: theme.background, 
              // Highlight the border green if filled, otherwise normal border
              borderColor: digit ? theme.primary : theme.inputBorder,
              color: theme.text 
            }
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="numeric"
          maxLength={6} // Allow pasting up to 6 chars
          ref={(ref) => inputs.current[index] = ref}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});