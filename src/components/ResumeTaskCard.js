/**
 * ResumeTaskCard.js
 * 
 * Reusable, compact NativeWind card displaying the active "Pick Up Where You Left Off" task.
 * 100% NativeWind className. Zero StyleSheet.create().
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ResumeTaskCard({ task, onMyTournamentsPress, className = '' }) {
  const navigation = useNavigation();

  if (!task) return null;

  const handlePressAction = () => {
    if (task.route) {
      navigation.navigate(task.route, task.params || {});
    }
  };

  const handleOpenMyTournaments = () => {
    if (onMyTournamentsPress) {
      onMyTournamentsPress();
    } else {
      navigation.navigate('MyTournaments', { returnDestination: 'Create' });
    }
  };

  const isLive = task.type === 'LIVE_MATCH';
  const isDraft = task.type === 'TOURNAMENT_DRAFT';

  return (
    <View className={`bg-[#121212] border border-[#262626] rounded-2xl p-4 mb-4 ${className}`}>
      {/* Card Header */}
      <View className="flex-row justify-between items-center mb-2.5">
        <View className="flex-row items-center">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              isLive ? 'bg-red-500 animate-pulse' : isDraft ? 'bg-amber-400' : 'bg-[#23c55e]'
            }`}
          />
          <Text className="text-[#888888] text-[11px] font-bold tracking-wider uppercase">
            Pick up where you left off
          </Text>
        </View>

        <TouchableOpacity onPress={handleOpenMyTournaments} className="flex-row items-center">
          <Text className="text-[#23c55e] text-[11px] font-bold mr-0.5">My Tournaments</Text>
          <Feather name="chevron-right" size={12} color="#23c55e" />
        </TouchableOpacity>
      </View>

      {/* Main Task Row */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center mb-1">
            <View
              className={`px-2 py-0.5 rounded-full mr-2 ${
                isLive ? 'bg-red-500/20' : isDraft ? 'bg-amber-500/20' : 'bg-[#23c55e]/20'
              }`}
            >
              <Text
                className={`text-[10px] font-black tracking-wide ${
                  isLive ? 'text-red-400' : isDraft ? 'text-amber-400' : 'text-[#23c55e]'
                }`}
              >
                {task.badge}
              </Text>
            </View>
            <Text className="text-[#888888] text-[11px]" numberOfLines={1}>
              {task.subtitle}
            </Text>
          </View>

          <Text className="text-white text-[15px] font-bold mb-1" numberOfLines={1}>
            {task.title}
          </Text>

          {Boolean(task.situation) && (
            <Text className="text-[#888888] text-xs" numberOfLines={1}>
              {task.situation}
            </Text>
          )}
        </View>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        onPress={handlePressAction}
        className={`w-full py-2.5 px-4 rounded-xl flex-row items-center justify-center ${
          isLive ? 'bg-red-500' : isDraft ? 'bg-amber-500' : 'bg-[#23c55e]'
        }`}
      >
        <Feather
          name={isLive ? 'radio' : isDraft ? 'edit-3' : 'play'}
          size={14}
          color={isLive ? '#fff' : '#000'}
          className="mr-2"
        />
        <Text
          className={`text-xs font-bold ${isLive ? 'text-white' : 'text-black'}`}
        >
          {task.actionText || 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
