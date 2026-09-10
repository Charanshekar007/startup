import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function PrimaryButton({ title, onPress, disabled }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: disabled ? theme.divider : theme.primary }
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[
        styles.text, 
        { color: disabled ? theme.subText : theme.buttonText }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  }
});