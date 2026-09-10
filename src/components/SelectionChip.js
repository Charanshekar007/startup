import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function SelectionChip({ label, icon, isSelected, onPress, isMultiSelect = false }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.chip, 
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
        <MaterialCommunityIcons name="check" size={14} color={theme.primary} style={styles.icon} />
      )}
      {!isMultiSelect && icon && (
        <MaterialCommunityIcons 
          name={icon} 
          size={16} 
          color={isSelected ? theme.primary : theme.subText} 
          style={styles.icon} 
        />
      )}
      <Text style={[styles.text, { color: theme.subText }, isSelected && { color: theme.primary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  }
});