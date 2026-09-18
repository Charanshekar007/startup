import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// --- MOCK NOTIFICATIONS ---
const MOCK_NOTIFICATIONS = [
  {
    id: '1', type: 'TEAM_INVITE', unread: true, time: '10m',
    avatar: 'https://ui-avatars.com/api/?name=TC&background=1e3a29&color=fff',
    title: 'Team Invitation',
    message: 'Captain Arjun invited you to join Thunder CC as an All-Rounder.',
    hasActions: true
  },
  {
    id: '2', type: 'MATCH_ALERT', unread: true, time: '1h',
    icon: 'whistle', iconColor: '#f39c12',
    title: 'Match Starting',
    message: 'Toss update: Thunder CC won the toss and elected to bat first against Warriors XI.',
  },
  {
    id: '3', type: 'LIKE', unread: false, time: '3h',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    title: 'Rahul Kumar',
    message: 'liked your match highlights video.',
    postImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
  },
  {
    id: '4', type: 'FOLLOW', unread: false, time: '1d',
    avatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
    title: 'Sneha Iyer',
    message: 'started following you.',
    isFollowing: false
  },
  {
    id: '5', type: 'TOURNAMENT', unread: false, time: '2d',
    icon: 'trophy', iconColor: '#3498db',
    title: 'Tournament Update',
    message: 'Kurukshetra Tournament fixtures for the Quarter Finals have been released.',
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [filter, setFilter] = useState('All');

  const renderNotification = (item) => {
    return (
      <TouchableOpacity 
        key={item.id} 
        className={`flex-row p-4 border-b border-[#222222] ${item.unread ? 'bg-[#0d1f13]' : ''}`}
      >
        
        {/* Left Side: Avatar or Icon */}
        <View className="mr-3 relative">
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} className="w-12 h-12 rounded-full" />
          ) : (
            <View 
              className="w-12 h-12 rounded-full items-center justify-center" 
              style={{ backgroundColor: `${item.iconColor}20` }}
            >
              <MaterialCommunityIcons name={item.icon} size={20} color={item.iconColor} />
            </View>
          )}
          {item.type === 'LIKE' && (
            <View className="absolute -bottom-1 -right-1 bg-[#e74c3c] w-5 h-5 rounded-full items-center justify-center border-2 border-[#0a0a0a]">
              <Feather name="heart" size={10} color="#fff" />
            </View>
          )}
        </View>

        {/* Center: Content */}
        <View className="flex-1 justify-center">
          <Text className="text-sm font-bold text-white leading-5">
            {item.title} <Text className="font-normal text-[#cccccc]">{item.message}</Text>
          </Text>
          <Text className="text-xs text-[#888888] mt-1">{item.time} ago</Text>

          {/* Conditional Actions based on type */}
          {item.type === 'TEAM_INVITE' && item.hasActions && (
            <View className="flex-row mt-3 gap-2">
              <TouchableOpacity className="bg-[#23c55e] py-2 px-4 rounded-lg flex-1 items-center">
                <Text className="text-black font-bold text-xs">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity className="border border-[#222222] py-2 px-4 rounded-lg flex-1 items-center">
                <Text className="text-[#888888] font-bold text-xs">Decline</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Right Side: Post Image or Follow Button */}
        {item.postImage && (
          <Image source={{ uri: item.postImage }} className="w-12 h-12 rounded-lg ml-3" />
        )}
        {item.type === 'FOLLOW' && (
          <TouchableOpacity className="bg-[#1a1a1a] border border-[#222222] px-4 h-8 rounded-full justify-center self-center ml-3">
            <Text className="text-white text-xs font-semibold">Follow</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Feather name="arrow-left" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Notifications</Text>
        </View>
        <TouchableOpacity>
          <Text className="text-[#23c55e] text-[13px] font-semibold">Mark all read</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-4 mb-4 border-b border-[#222222]">
        {['All', 'Mentions', 'Matches', 'Teams'].map((f) => (
          <TouchableOpacity 
            key={f} 
            className={`py-[10px] mr-6 ${filter === f ? 'border-b-2 border-[#23c55e]' : ''}`}
            onPress={() => setFilter(f)}
          >
            <Text className={`text-sm font-semibold ${filter === f ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerClassName="pb-10">
        {MOCK_NOTIFICATIONS.map(renderNotification)}
      </ScrollView>
    </SafeAreaView>
  );
}