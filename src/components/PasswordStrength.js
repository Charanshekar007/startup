import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function PasswordStrength() {
  const { theme } = useTheme();

  return (
    <View className="flex-row items-center mb-6 -mt-2">
      <View className="flex-1 flex-row mr-4">
        <View className="flex-1 h-1 rounded-sm mr-1" style={{ backgroundColor: theme.primary }} />
        <View className="flex-1 h-1 rounded-sm mr-1" style={{ backgroundColor: theme.primary }} />
        <View className="flex-1 h-1 rounded-sm mr-1" style={{ backgroundColor: theme.primary }} />
        <View className="flex-1 h-1 rounded-sm mr-1" style={{ backgroundColor: theme.divider }} />
      </View>
      <Text className="text-xs font-semibold" style={{ color: theme.primary }}>Strong</Text>
    </View>
  );
}