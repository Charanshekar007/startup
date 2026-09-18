import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

export default function StepProgress({ steps, currentStep }) {
  const { theme } = useTheme();

  return (
    <View className="flex-row justify-between mb-8 px-2.5">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        
        return (
          <View key={step.id} className="items-center flex-1">
            <View className="flex-row items-center w-full">
              <View 
                className="w-6 h-6 rounded-full border justify-center items-center z-[2]"
                style={[
                  { backgroundColor: theme.inputBg, borderColor: theme.inputBorder },
                  isCompleted && { backgroundColor: theme.primary, borderColor: theme.primary },
                  isActive && { 
                    borderColor: theme.primary, 
                    backgroundColor: theme.isDark ? 'rgba(50, 215, 75, 0.1)' : 'rgba(50, 215, 75, 0.2)' 
                  }
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color="#000" />
                ) : (
                  <Text className="text-[10px] font-bold" style={[{ color: theme.subText }, isActive && { color: theme.primary }]}>
                    {stepNum}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View 
                  className="flex-1 h-[1px] absolute left-1/2 w-full z-[1]"
                  style={[{ backgroundColor: theme.inputBorder }, isCompleted && { backgroundColor: theme.primary }]} 
                />
              )}
            </View>
            <Text className="text-[10px] mt-2 text-center" style={[{ color: theme.subText }, (isActive || isCompleted) && { color: theme.text }]}>
              {step.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}