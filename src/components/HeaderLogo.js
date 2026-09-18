import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function HeaderLogo() {
  const { theme } = useTheme();

  return (
    <View
      className="w-20 h-20 rounded-full border justify-center items-center self-center mb-6"
      style={{ borderColor: theme.primary, backgroundColor: theme.background }}
    >
      <Text className="text-xs font-bold tracking-[0.5px]" style={{ color: theme.primary }}>APP</Text>
      <Text className="text-xs font-bold tracking-[0.5px]" style={{ color: theme.primary }}>LOGO</Text>
    </View>
  );
}