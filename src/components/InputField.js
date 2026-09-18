import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function InputField({ label, placeholder, iconName, ...props }) {
  const { theme } = useTheme();

  return (
    <View className="mb-5">
      <Text className="text-sm font-semibold mb-2" style={{ color: theme.text }}>{label}</Text>
      <View
        className="flex-row items-center border rounded-xl h-14 px-4"
        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
      >
        <Feather name={iconName} size={20} color={theme.iconColor} className="mr-3" />
        <TextInput
          className="flex-1 text-base h-full"
          style={{ color: theme.text }}
          placeholder={placeholder}
          placeholderTextColor={theme.subText}
          autoCapitalize="none"
          {...props}
        />
      </View>
    </View>
  );
}