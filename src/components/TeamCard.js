import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function TeamCard({ name, location }) {
  const { theme } = useTheme();

  return (
    <View
      className="flex-row items-center border rounded-xl p-3 mb-4"
      style={{ backgroundColor: theme.background, borderColor: theme.inputBorder }}
    >
      <View
        className="w-10 h-10 rounded-full justify-center items-center mr-3"
        style={{ backgroundColor: theme.inputBg }}
      >
        <Ionicons name="shield" size={20} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold mb-0.5" style={{ color: theme.text }}>{name}</Text>
        <Text className="text-xs" style={{ color: theme.subText }}>{location}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
    </View>
  );
}