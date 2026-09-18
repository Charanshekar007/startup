import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function ProgressIndicator({ totalSteps = 4, currentStep = 1, style }) {
  const { theme } = useTheme();

  return (
    <View className="flex-row w-full h-[3px] mb-6" style={style}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View 
          key={index} 
          className={`flex-1 mx-[2px] rounded-sm ${index === 0 ? 'ml-0' : ''} ${index === totalSteps - 1 ? 'mr-0' : ''}`}
          style={{ backgroundColor: index < currentStep ? theme.primary : theme.divider }}
        />
      ))}
    </View>
  );
}