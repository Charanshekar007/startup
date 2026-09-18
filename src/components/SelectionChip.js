import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function SelectionChip({ label, icon, isSelected, onPress, isMultiSelect = false }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      className="flex-row items-center border rounded-lg py-2 px-3 mr-2 mb-2.5"
      style={[
        { backgroundColor: theme.background, borderColor: theme.inputBorder },
        isSelected && { 
          borderColor: theme.primary, 
          backgroundColor: theme.isDark ? 'rgba(50, 215, 75, 0.1)' : 'rgba(50, 215, 75, 0.15)' 
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {isMultiSelect && isSelected && (
        <MaterialCommunityIcons name="check" size={14} color={theme.primary} className="mr-1.5" />
      )}
      {!isMultiSelect && icon && (
        <MaterialCommunityIcons 
          name={icon} 
          size={16} 
          color={isSelected ? theme.primary : theme.subText} 
          className="mr-1.5" 
        />
      )}
      <Text className="text-xs font-medium" style={[{ color: theme.subText }, isSelected && { color: theme.primary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}