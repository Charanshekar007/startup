import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function SecurityCard({ title, subtitle }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
      <View style={styles.iconContainer}>
        <Feather name="shield" size={20} color={theme.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
  }
});