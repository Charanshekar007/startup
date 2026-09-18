import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function PrimaryButton({ title, onPress, disabled }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      className="h-14 rounded-xl items-center justify-center w-full"
      style={{ backgroundColor: disabled ? theme.divider : theme.primary }} 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text 
        className="text-base font-bold"
        style={{ color: disabled ? theme.subText : theme.buttonText }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}