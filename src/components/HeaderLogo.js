import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function HeaderLogo() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderColor: theme.primary, backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.primary }]}>APP</Text>
      <Text style={[styles.text, { color: theme.primary }]}>LOGO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});