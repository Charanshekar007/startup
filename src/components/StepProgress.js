import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function StepProgress({ steps, currentStep }) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        
        return (
          <View key={step.id} style={styles.stepWrapper}>
            <View style={styles.indicatorContainer}>
              <View style={[
                styles.circle, 
                { backgroundColor: theme.inputBg, borderColor: theme.inputBorder },
                isCompleted && { backgroundColor: theme.primary, borderColor: theme.primary },
                isActive && { 
                  borderColor: theme.primary, 
                  backgroundColor: theme.isDark ? 'rgba(50, 215, 75, 0.1)' : 'rgba(50, 215, 75, 0.2)' 
                }
              ]}>
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="#000" />
                ) : (
                  <Text style={[styles.stepNum, { color: theme.subText }, isActive && { color: theme.primary }]}>
                    {stepNum}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View style={[styles.line, { backgroundColor: theme.inputBorder }, isCompleted && { backgroundColor: theme.primary }]} />
              )}
            </View>
            <Text style={[styles.label, { color: theme.subText }, (isActive || isCompleted) && { color: theme.text }]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  line: {
    flex: 1,
    height: 1,
    position: 'absolute',
    left: '50%',
    width: '100%',
    zIndex: 1,
  },
  label: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  }
});