import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function SportCard({ sport, description, icon, isSelected, onPress }) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[
        styles.card, 
        { 
          backgroundColor: theme.inputBg, 
          borderColor: isSelected ? theme.primary : theme.inputBorder 
        },
        isSelected && { backgroundColor: theme.isDark ? 'rgba(50, 215, 75, 0.05)' : 'rgba(50, 215, 75, 0.1)' }
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={32} color={theme.text} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.text }]}>{sport}</Text>
        <Text style={[styles.description, { color: theme.subText }]}>{description}</Text>
      </View>
      <View style={styles.radioContainer}>
        {isSelected ? (
          <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
        ) : (
          <View style={[styles.emptyCircle, { borderColor: theme.subText }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
  }
});