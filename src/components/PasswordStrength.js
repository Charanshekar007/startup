import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function PasswordStrength() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        <View style={[styles.bar, { backgroundColor: theme.primary }]} />
        <View style={[styles.bar, { backgroundColor: theme.primary }]} />
        <View style={[styles.bar, { backgroundColor: theme.primary }]} />
        <View style={[styles.bar, { backgroundColor: theme.divider }]} />
      </View>
      <Text style={[styles.text, { color: theme.primary }]}>Strong</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -8, // Pulls it closer to the password input
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 16,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  }
});