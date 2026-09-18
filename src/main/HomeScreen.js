import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { activeSport } = useAuthStore();
  const [activeTab, setActiveTab] = useState('FOR_YOU'); // Defaulting to FOR_YOU to match Image 2

  // --- MOCK DATA: GLOBAL FEED ---
  const feedPosts = [
    {
      id: '1',
      name: 'Arjun Reddy',
      username: '@arjunreddy07',
      sport: 'Cricket',
      location: 'Hyderabad, India',
      time: '2h',
      caption: 'Match day! Nothing feels better than doing what you love. 💚🏏',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 128,
      comments: 24,
    },
    {
      id: '2',
      name: 'Sneha Iyer',
      username: '@snehaiyer11',
      sport: 'Football',
      location: 'Bengaluru, India',
      time: '4h',
      caption: 'Training hard today for a stronger tomorrow. One step at a time. ⚽✨',
      image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      likes: 96,
      comments: 18,
    }
  ];

  // --- MOCK DATA: TRENDING (FOR YOU) ---
  const trendingVideos = [
    { id: 't1', title: "Kohli's century powers India to victory", time: '2h ago', views: '12K views', image: 'https://images.unsplash.com/photo-1624526267942-ab0f0b7148eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 't2', title: "Mumbai win the T20 Championship 2025", time: '5h ago', views: '18K views', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { id: 't3', title: "Top 5 finishes of the IPL 2025", time: '1d ago', views: '25K views', image: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      
      {/* --- 1. CUSTOM TOP HEADER --- */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <Text className="text-2xl font-black italic mr-1 text-[#2ecc71]">P</Text>
          <Text className="text-base font-black tracking-[0.5px] text-white">PLAYFIELD</Text>
        </View>

        <TouchableOpacity className="flex-row items-center border border-[#222222] px-[10px] py-[6px] rounded-2xl bg-[#161616]">
          <Feather name="map-pin" size={12} color="#2ecc71" />
          <Text className="text-xs font-semibold mx-[6px] text-white">Hyderabad</Text>
          <Feather name="chevron-down" size={14} color="#888888" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          {/* --- NOTIFICATIONS ONPRESS ADDED HERE --- */}
          <TouchableOpacity className="relative mr-4" onPress={() => navigation.navigate('Notifications')}>
            <Feather name="bell" size={22} color="#ffffff" />
            <View className="absolute -top-1 -right-[6px] rounded-full w-4 h-4 justify-center items-center bg-[#2ecc71]">
              <Text className="text-black text-[9px] font-bold">3</Text>
            </View>
          </TouchableOpacity>
          {/* --- MESSAGES ONPRESS ALREADY HERE --- */}
          <TouchableOpacity className="relative mr-4" onPress={() => navigation.navigate('Messages')}>
            <Feather name="message-square" size={22} color="#ffffff" />
            <View className="absolute -top-1 -right-[6px] rounded-full w-4 h-4 justify-center items-center bg-[#2ecc71]">
              <Text className="text-black text-[9px] font-bold">2</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}} className="w-8 h-8 rounded-full" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 2. SEARCH BAR --- */}
      <View className="px-4 pb-3">
        <View className="flex-row items-center border border-[#222222] rounded-full px-4 h-11 bg-[#161616]">
          <Feather name="search" size={20} color="#888888" className="mr-[10px]" />
          <TextInput 
            className="flex-1 text-sm text-white"
            placeholder="Search players, teams, matches..."
            placeholderTextColor="#888888"
          />
          <TouchableOpacity>
            <Feather name="sliders" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- 3. CUSTOM TOP TABS (FEED vs FOR YOU) --- */}
      <View className="flex-row border-b border-[#222222]">
        <TouchableOpacity 
          className={`flex-1 items-center py-3 ${activeTab === 'FEED' ? 'border-b-2 border-[#2ecc71]' : ''}`}
          onPress={() => setActiveTab('FEED')}
        >
          <Text className={`text-[13px] font-bold tracking-widest ${activeTab === 'FEED' ? 'text-[#2ecc71]' : 'text-[#888888]'}`}>FEED</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className={`flex-1 items-center py-3 ${activeTab === 'FOR_YOU' ? 'border-b-2 border-[#2ecc71]' : ''}`}
          onPress={() => setActiveTab('FOR_YOU')}
        >
          <Text className={`text-[13px] font-bold tracking-widest ${activeTab === 'FOR_YOU' ? 'text-[#2ecc71]' : 'text-[#888888]'}`}>FOR YOU</Text>
        </TouchableOpacity>
      </View>

      {/* --- 4. SCROLLABLE CONTENT AREA --- */}
      <ScrollView contentContainerClassName="pb-[100px]" showsVerticalScrollIndicator={false}>
        
        {activeTab === 'FEED' ? (
          /* ==========================================
             TAB 1: GLOBAL FEED
          ========================================== */
          <View>
            {feedPosts.map((post) => (
              <View key={post.id} className="pt-4">
                <View className="flex-row items-center px-4 mb-3">
                  <View className="w-11 h-11 rounded-full bg-[#333333] mr-3" />
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-[15px] font-bold text-white">{post.name}</Text>
                      <Feather name="check-circle" size={14} color="#2ecc71" className="ml-1" />
                    </View>
                    <Text className="text-xs mt-[2px] text-[#888888]">
                      {post.username} • <Text className={post.sport === 'Cricket' ? 'text-[#2ecc71]' : 'text-[#3498db]'}>{post.sport}</Text>
                    </Text>
                    <Text className="text-[11px] mt-[2px] text-[#888888]">
                      <Feather name="map-pin" size={10} /> {post.location} • {post.time}
                    </Text>
                  </View>
                  <TouchableOpacity><Feather name="more-vertical" size={20} color="#888888" /></TouchableOpacity>
                </View>

                <Image source={{ uri: post.image }} className="w-[92%] h-60 bg-[#222222] rounded-xl self-center" />
                <Text className="text-sm leading-5 px-4 mt-3 text-white">{post.caption}</Text>

                <View className="flex-row items-center px-4 mt-4 mb-4">
                  <TouchableOpacity className="flex-row items-center mr-6">
                    <Feather name="heart" size={20} color="#e74c3c" />
                    <Text className="text-sm font-semibold ml-2 text-white">{post.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center mr-6">
                    <Feather name="message-circle" size={20} color="#888888" />
                    <Text className="text-sm font-semibold ml-2 text-white">{post.comments}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center mr-6">
                    <Feather name="share" size={20} color="#888888" />
                    <Text className="text-sm font-semibold ml-2 text-white">Share</Text>
                  </TouchableOpacity>
                  <View className="flex-1 items-end">
                    <TouchableOpacity><Feather name="bookmark" size={20} color="#888888" /></TouchableOpacity>
                  </View>
                </View>
                <View className="h-[1px] w-full bg-[#222222]" />
              </View>
            ))}
          </View>
        ) : (
          /* ==========================================
             TAB 2: FOR YOU (PERSONALIZED CRICKET)
          ========================================== */
          <View className="p-4">
            
            {/* For You Header */}
            <View className="flex-row justify-between items-start mb-5">
              <View>
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={18} color="#2ecc71" />
                  <Text className="text-base font-bold ml-1 text-white"> For You • {activeSport || 'Cricket'}</Text>
                </View>
                <Text className="text-[13px] mt-1 ml-[22px] text-[#888888]">Personalized cricket content for you.</Text>
              </View>
              <TouchableOpacity className="flex-row items-center border border-[#222222] px-[10px] py-[6px] rounded-lg">
                <Feather name="sliders" size={14} color="#2ecc71" />
                <Text className="text-xs font-semibold ml-[6px] text-[#2ecc71]">Customize</Text>
              </TouchableOpacity>
            </View>

            {/* --- WIDGET 1: Player to Watch --- */}
            <View className="flex-row justify-between items-center mt-4 mb-2 px-1">
              <Text className="text-[13px] font-semibold text-[#2ecc71]">Player to Watch</Text>
            </View>
            <View className="border border-[#222222] rounded-xl p-4 mb-2 bg-[#161616]">
              <View className="flex-row">
                <Image source={{uri: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}} className="w-[70px] h-[90px] rounded-lg mr-4 bg-[#222222]" />
                <View className="flex-1 justify-center">
                  <View className="flex-row items-center">
                    <Text className="text-base font-bold text-white">Shubman Gill </Text>
                    <Feather name="check-circle" size={14} color="#2ecc71" />
                  </View>
                  <Text className="text-[13px] mt-1 text-[#888888]">Top Order Batter • Team India</Text>
                  <Text className="text-[13px] mt-2 italic text-[#888888]">In exceptional form this season.</Text>
                </View>
              </View>
              <View className="flex-row justify-between items-end mt-4">
                <View className="items-start">
                  <Text className="text-[11px] mb-1 text-[#888888]">Matches</Text>
                  <Text className="text-base font-bold text-white">12</Text>
                </View>
                <View className="items-start">
                  <Text className="text-[11px] mb-1 text-[#888888]">Runs</Text>
                  <Text className="text-base font-bold text-[#2ecc71]">842</Text>
                </View>
                <View className="items-start">
                  <Text className="text-[11px] mb-1 text-[#888888]">Avg</Text>
                  <Text className="text-base font-bold text-[#2ecc71]">70.16</Text>
                </View>
                <View className="items-start">
                  <Text className="text-[11px] mb-1 text-[#888888]">SR</Text>
                  <Text className="text-base font-bold text-[#2ecc71]">94.3</Text>
                </View>
                <TouchableOpacity className="border border-[#2ecc71] rounded-lg px-3 py-[6px]">
                  <Text className="text-xs font-bold text-[#2ecc71]">View Profile</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* --- WIDGET 2: Recent Performance --- */}
            <View className="flex-row justify-between items-center mt-4 mb-2 px-1">
              <Text className="text-[13px] font-semibold text-[#2ecc71]">Recent Performance</Text>
              <Text className="text-xs text-[#888888]">View all</Text>
            </View>
            <View className="border border-[#222222] rounded-xl p-4 mb-2 bg-[#161616] flex-row items-center">
              <Image source={{uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}} className="w-[60px] h-[60px] rounded-lg mr-4" />
              <View className="flex-1">
                <Text className="text-base font-bold text-white">Shubman Gill</Text>
                <Text className="text-base font-bold my-[2px] text-[#2ecc71]">112 (98)</Text>
                <Text className="text-[13px] mt-1 text-[#888888]">vs Australia</Text>
                <Text className="text-[11px] mt-1 text-[#888888]">ODI Series • 2d ago</Text>
              </View>
              <View className="items-end">
                <Text className="text-xs font-semibold text-[#2ecc71]">Team India won</Text>
                <Text className="text-[11px] mt-[2px] text-[#888888]">by 36 runs</Text>
                <View className="px-2 py-1 rounded mt-2 bg-[#1e3a29]">
                  <Text className="text-[10px] font-bold text-[#2ecc71]">Player of the Match</Text>
                </View>
              </View>
            </View>

            {/* --- WIDGET 3: Upcoming Match --- */}
            <View className="flex-row justify-between items-center mt-4 mb-2 px-1">
              <Text className="text-[13px] font-semibold text-[#2ecc71]">Upcoming Match</Text>
              <Text className="text-xs text-[#888888]">View all</Text>
            </View>
            <View className="border border-[#222222] rounded-xl p-4 mb-2 bg-[#161616]">
              <View className="items-center mb-4">
                <Text className="text-xs text-[#888888]">ODI Series • 1st ODI</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View className="items-center w-[30%]">
                  <View className="w-10 h-10 rounded-full bg-[#3498db] justify-center items-center mb-2">
                    <MaterialCommunityIcons name="cricket" size={24} color="#fff"/>
                  </View>
                  <Text className="text-sm font-bold text-white">India</Text>
                  <Text className="text-[11px] mt-[2px] text-[#888888]">Men</Text>
                </View>
                <View className="items-center">
                  <Text className="text-base font-bold mb-1 text-white">VS</Text>
                  <Text className="text-[11px] mt-[2px] text-[#888888]">Tomorrow • 2:00 PM</Text>
                  <Text className="text-[11px] mt-[2px] text-[#888888]">Hyderabad</Text>
                </View>
                <View className="items-center w-[30%]">
                  <Text className="text-sm font-bold text-white">England</Text>
                  <Text className="text-[11px] mt-[2px] text-[#888888]">Men</Text>
                  <View className="w-10 h-10 rounded-full bg-[#e74c3c] justify-center items-center mb-2">
                    <MaterialCommunityIcons name="shield-star-outline" size={24} color="#fff"/>
                  </View>
                </View>
              </View>
            </View>

            {/* --- WIDGET 4: Recommended Team --- */}
            <View className="flex-row justify-between items-center mt-4 mb-2 px-1">
              <Text className="text-[13px] font-semibold text-[#2ecc71]">Recommended Team</Text>
              <Text className="text-xs text-[#888888]">View all</Text>
            </View>
            <View className="border border-[#222222] rounded-xl p-4 mb-2 bg-[#161616] flex-row items-center">
              <View className="w-[50px] h-[50px] rounded-full bg-[#d35400] justify-center items-center mr-4">
                <Text className="text-white font-bold">SRH</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-base font-bold text-white">Sunrisers Hyderabad </Text>
                  <Feather name="check-circle" size={14} color="#2ecc71" />
                </View>
                <Text className="text-[13px] mt-1 text-[#888888]">T20 Franchise</Text>
                <Text className="text-xs mt-[2px] text-[#888888]">Strong squad for this season.</Text>
              </View>
              <View className="items-end">
                <TouchableOpacity className="border border-[#2ecc71] rounded-lg px-3 py-[6px]">
                  <Text className="text-xs font-bold text-[#2ecc71]">Follow</Text>
                </TouchableOpacity>
                <Text className="text-[10px] mt-[6px] text-[#888888]">28K Followers</Text>
              </View>
            </View>

            {/* --- WIDGET 5: Trending in Cricket --- */}
            <View className="flex-row justify-between items-center mt-4 mb-2 px-1">
              <Text className="text-[13px] font-semibold text-[#2ecc71]">Trending in Cricket</Text>
              <Text className="text-xs text-[#888888]">View all</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
              {trendingVideos.map((video) => (
                <View key={video.id} className="w-[220px] mr-4">
                  <View className="relative">
                    <Image source={{uri: video.image}} className="w-[220px] h-[130px] rounded-xl bg-[#222222]" />
                    <View className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 justify-center items-center border border-[#2ecc71]">
                      <Feather name="play" size={16} color="#2ecc71" />
                    </View>
                  </View>
                  <Text className="text-[13px] font-semibold mt-2 leading-[18px] text-white" numberOfLines={2}>{video.title}</Text>
                  <Text className="text-[11px] mt-1 text-[#888888]">{video.time} • {video.views}</Text>
                </View>
              ))}
            </ScrollView>

          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}