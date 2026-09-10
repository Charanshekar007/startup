import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function TeamCard({ name, location }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.inputBorder }]}>
      <View style={[styles.avatarPlaceholder, { backgroundColor: theme.inputBg }]}>
        <Ionicons name="shield" size={20} color={theme.primary} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
        <Text style={[styles.location, { color: theme.subText }]}>{location}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
  }
});