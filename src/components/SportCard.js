import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function SportCard({ sport, description, icon, isSelected, onPress }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      className="flex-row items-center border rounded-xl p-4 mb-4"
      style={[
        { 
          backgroundColor: theme.inputBg, 
          borderColor: isSelected ? theme.primary : theme.inputBorder 
        },
        isSelected && { backgroundColor: theme.isDark ? 'rgba(50, 215, 75, 0.05)' : 'rgba(50, 215, 75, 0.1)' }
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="w-12 h-12 rounded-full justify-center items-center mr-4" style={{ backgroundColor: theme.background }}>
        <Ionicons name={icon} size={32} color={theme.text} />
      </View>
      <View className="flex-1 pr-4">
        <Text className="text-[15px] font-semibold mb-1" style={{ color: theme.text }}>{sport}</Text>
        <Text className="text-xs leading-4" style={{ color: theme.subText }}>{description}</Text>
      </View>
      <View className="justify-center items-center">
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
        ) : (
          <View className="w-[22px] h-[22px] rounded-full border" style={{ borderColor: theme.subText }} />
        )}
      </View>
    </TouchableOpacity>
  );
}