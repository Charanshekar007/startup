import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function PasswordInput({ label, placeholder, ...props }) {
  const { theme } = useTheme();
  const [isSecure, setIsSecure] = useState(true);

  return (
    <View className="mb-3">
      <Text className="text-sm font-semibold mb-2" style={{ color: theme.text }}>{label}</Text>
      <View
        className="flex-row items-center border rounded-xl h-14 px-4"
        style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
      >
        <Feather name="lock" size={20} color={theme.iconColor} className="mr-3" />
        <TextInput
          className="flex-1 text-base h-full"
          style={{ color: theme.text }}
          placeholder={placeholder}
          placeholderTextColor={theme.subText}
          secureTextEntry={isSecure}
          autoCapitalize="none"
          {...props}
        />
        <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="p-1">
          <Feather name={isSecure ? 'eye' : 'eye-off'} size={20} color={theme.subText} />
        </TouchableOpacity>
      </View>
    </View>
  );
}