import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ProgressIndicator({ totalSteps = 4, currentStep = 1, style }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View 
          key={index} 
          style={[
            styles.segment, 
            { backgroundColor: index < currentStep ? theme.primary : theme.divider },
            index === 0 && styles.first,
            index === totalSteps - 1 && styles.last
          ]} 
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    height: 3,
    marginBottom: 24,
  },
  segment: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  first: { marginLeft: 0 },
  last: { marginRight: 0 }
});