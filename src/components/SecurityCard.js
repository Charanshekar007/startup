import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function SecurityCard({ title, subtitle }) {
  const { theme } = useTheme();

  return (
    <View
      className="flex-row items-center p-4 rounded-xl border mb-6"
      style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}
    >
      <View className="mr-3">
        <Feather name="shield" size={20} color={theme.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-[13px] font-semibold mb-0.5" style={{ color: theme.primary }}>{title}</Text>
        <Text className="text-xs" style={{ color: theme.subText }}>{subtitle}</Text>
      </View>
    </View>
  );
}