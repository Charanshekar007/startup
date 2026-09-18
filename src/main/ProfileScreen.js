import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const theme = {
  bg: '#0a0a0a',
  card: '#121212',
  cardLight: '#1a1a1a',
  primary: '#23c55e',
  primaryDark: 'rgba(35, 197, 94, 0.15)',
  text: '#ffffff',
  subText: '#888888',
  border: '#222222',
  danger: '#e74c3c',
  dangerDark: 'rgba(231, 76, 60, 0.15)',
};

// ==========================================
// MOCK DATA
// ==========================================
const PROFILE = {
  name: 'Rahul Kumar',
  username: '@rahulkumar',
  location: 'Hyderabad, India',
  role: 'All-Rounder',
  batting: 'Right-Handed',
  bowling: 'Right-Arm Medium',
  avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  followers: '2.4K',
  following: '386',
  posts: '42',
  experience: 'College • Club • Turf',
  primaryTeam: 'Falcons CC',
};

const RECENT_PERFORMANCE = [
  { id: '1', score: '86*', balls: '52', fours: 7, sixes: 3, vs: 'Royal Strikers', potm: true, time: 'Yesterday', icon: 'cricket-bat' },
  { id: '2', score: '42', balls: '31', fours: 5, sixes: 1, vs: 'Warriors XI', potm: false, time: '3 days ago', icon: 'cricket-bat' },
  { id: '3', score: '3/24', balls: '4', overs: '4 Overs', vs: 'Titans CC', potm: false, time: '5 days ago', icon: 'cricket' },
];

const FORM_DATA = [
  { id: 'f1', score: 86, result: 'W' },
  { id: 'f2', score: 42, result: 'W' },
  { id: 'f3', score: 31, result: 'L' },
  { id: 'f4', score: 74, result: 'W' },
  { id: 'f5', score: 18, result: 'L' },
];

const MATCH_HISTORY = [
  { id: 'm1', format: 'T20', league: 'Kurukshetra T20 • Semi-Final', teamA: 'Falcons CC', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', teamB: 'Royal Strikers', logoB: 'https://ui-avatars.com/api/?name=RS&background=b9770e&color=fff', result: 'Won by 6 wickets', myScore: '86*', myBalls: '52', myFours: 7, mySixes: 3, potm: true, time: 'Yesterday' },
  { id: 'm2', format: 'T20', league: 'Hyderabad Turf League • League', teamA: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=WX&background=8e44ad&color=fff', teamB: 'Falcons CC', logoB: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', result: 'Lost by 3 runs', myScore: '42', myBalls: '31', myFours: 5, mySixes: 1, potm: false, time: '3 days ago' },
  { id: 'm3', format: 'T20', league: 'Hyderabad Turf League • League', teamA: 'Falcons CC', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', teamB: 'Titans CC', logoB: 'https://ui-avatars.com/api/?name=TC&background=2c3e50&color=fff', result: 'Won by 22 runs', myScore: '3/24', myBalls: '4', myFours: 4, mySixes: 0, extraInfo: '4 Overs • 2 Maidens', potm: false, time: '5 days ago' },
];

const POSTS_FEED = [
  { id: 'p1', text: "Big match tonight! 💪\nLet's go Falcons! 🦅🔥", time: '2h', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', likes: 128, comments: 24, shares: 12 },
  { id: 'p2', text: "Happy to contribute to the team's win today. 🙌\nGood team effort all around! 💚", time: '1d', isPerformance: true, likes: 96, comments: 18, shares: 8 },
  { id: 'p3', text: "Great practice session today!\nAlways working to get better. 🏏", time: '3d', images: [
    'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1624526267942-ab0f0b7148eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  ], likes: 78, comments: 14, shares: 6 }
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Overview');
  const TABS = ['Overview', 'Stats', 'Matches', 'Posts'];
  const MATCH_FILTERS = ['All', 'T20', 'ODI', 'T10', 'Turf', 'College'];
  const [activeMatchFilter, setActiveMatchFilter] = useState('All');

  // ==========================================
  // SHARED HEADER & INFO
  // ==========================================
  const renderProfileHeader = () => (
    <View className="px-4 pt-2">
      
      {/* Top Nav */}
      <View className="flex-row justify-between items-center mb-5">
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="chevron-left" size={28} color={theme.text} /></TouchableOpacity>
        <Text className="text-white text-base font-bold">Profile</Text>
        <View className="flex-row items-center">
          <TouchableOpacity style={{ marginRight: 16 }}><Feather name="share-2" size={22} color={theme.text} /></TouchableOpacity>
          <TouchableOpacity><Feather name="more-horizontal" size={24} color={theme.text} /></TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View className="flex-row items-center mb-5">
        <View className="w-[90px] h-[90px] rounded-full border-2 border-[#23c55e] p-0.5 mr-4">
          <Image source={{ uri: PROFILE.avatar }} className="w-full h-full rounded-full" />
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-white text-xl font-bold">{PROFILE.name}</Text>
            <MaterialCommunityIcons name="check-decagram" size={18} color={theme.primary} style={{ marginLeft: 4 }} />
          </View>
          <Text className="text-[#888888] text-[13px] mt-0.5 mb-1">{PROFILE.username}</Text>
          <View className="flex-row items-center mt-1">
            <Feather name="map-pin" size={12} color={theme.subText} />
            <Text className="text-[#888888] text-xs ml-1">{PROFILE.location}</Text>
          </View>
          
          <View className="self-start bg-[#23c55e]/15 px-2 py-1 rounded my-2"><Text className="text-[#23c55e] text-[11px] font-bold">{PROFILE.role}</Text></View>
          
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="cricket-bat" size={14} color={theme.subText} />
            <Text className="text-[#888888] text-[11px] ml-1">{PROFILE.batting} Batter</Text>
            <View className="w-[1px] h-3 bg-[#222222] mx-2" />
            <MaterialCommunityIcons name="cricket" size={14} color={theme.subText} />
            <Text className="text-[#888888] text-[11px] ml-1">{PROFILE.bowling}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-5">
        <TouchableOpacity className="flex-1 flex-row bg-[#23c55e] py-2.5 rounded-lg items-center justify-center">
          <MaterialCommunityIcons name="chat-outline" size={18} color="#000" style={{ marginRight: 6 }} />
          <Text className="text-black text-[13px] font-bold">Message</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row border border-[#222222] py-2.5 rounded-lg items-center justify-center">
          <Feather name="share-2" size={16} color={theme.text} style={{ marginRight: 6 }} />
          <Text className="text-white text-[13px] font-bold">Share Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View className="flex-row justify-evenly bg-[#1a1a1a] rounded-xl py-4 mb-6 border border-[#222222]">
        <View className="items-center">
          <View className="flex-row items-center mb-1"><Feather name="users" size={14} color={theme.subText} /><Text className="text-white text-base font-bold ml-1.5">{PROFILE.followers}</Text></View>
          <Text className="text-[#888888] text-[11px]">Followers</Text>
        </View>
        <View className="w-[1px] bg-[#222222]" />
        <View className="items-center">
          <View className="flex-row items-center mb-1"><Feather name="user-check" size={14} color={theme.subText} /><Text className="text-white text-base font-bold ml-1.5">{PROFILE.following}</Text></View>
          <Text className="text-[#888888] text-[11px]">Following</Text>
        </View>
        <View className="w-[1px] bg-[#222222]" />
        <View className="items-center">
          <View className="flex-row items-center mb-1"><Feather name="file-text" size={14} color={theme.subText} /><Text className="text-white text-base font-bold ml-1.5">{PROFILE.posts}</Text></View>
          <Text className="text-[#888888] text-[11px]">Posts</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-[#222222]">
        {TABS.map(tab => (
          <TouchableOpacity 
            key={tab} 
            className={`flex-1 py-3 items-center ${activeTab === tab ? 'border-b-2 border-[#23c55e]' : ''}`} 
            onPress={() => setActiveTab(tab)}
          >
            <Text className={`text-[13px] font-semibold ${activeTab === tab ? 'text-white' : 'text-[#888888]'}`}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ==========================================
  // TAB 1: OVERVIEW
  // ==========================================
  const renderOverview = () => (
    <View className="pt-4">
      
      {/* Cricket Identity Card */}
      <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 mx-4 mb-4">
        <Text className="text-[#888888] text-[10px] font-bold tracking-widest uppercase mb-3">CRICKET IDENTITY</Text>
        <View className="flex-row flex-wrap mb-3">
          <View className="w-1/2 mb-3"><Text className="text-[#888888] text-[11px] mb-1">Role</Text><Text className="text-white text-[13px] font-semibold">{PROFILE.role}</Text></View>
          <View className="w-1/2 mb-3"><Text className="text-[#888888] text-[11px] mb-1">Batting</Text><Text className="text-white text-[13px] font-semibold">{PROFILE.batting}</Text></View>
          <View className="w-1/2 mb-3"><Text className="text-[#888888] text-[11px] mb-1">Bowling</Text><Text className="text-white text-[13px] font-semibold">{PROFILE.bowling}</Text></View>
          <View className="w-1/2 mb-3"><Text className="text-[#888888] text-[11px] mb-1">Experience</Text><Text className="text-white text-[13px] font-semibold">{PROFILE.experience}</Text></View>
        </View>
        <View className="flex-row items-center border-t border-[#222222] pt-3">
          <Image source={{uri: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff'}} className="w-9 h-9 rounded-full bg-[#1a1a1a] mr-3" />
          <View>
            <Text className="text-[#888888] text-[11px] mb-1">Primary Team</Text>
            <Text className="text-white text-[13px] font-semibold">{PROFILE.primaryTeam}</Text>
          </View>
        </View>
      </View>

      {/* Recent Performance */}
      <View className="flex-row justify-between items-center px-4 mb-3 mt-2">
        <Text className="text-white text-base font-bold">Recent Performance</Text>
        <TouchableOpacity><Text className="text-[#23c55e] text-xs font-bold">See All</Text></TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {RECENT_PERFORMANCE.map(perf => (
          <View key={perf.id} className="w-[150px] bg-[#1a1a1a] rounded-xl border border-[#222222] p-3 mr-3">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-row items-baseline">
                <Text className="text-[#23c55e] text-xl font-bold">{perf.score}</Text>
                <Text className="text-[#888888] text-[11px]"> ({perf.balls})</Text>
              </View>
              <View className="w-6 h-6 rounded-full bg-[#121212] items-center justify-center"><MaterialCommunityIcons name={perf.icon} size={16} color={theme.subText} /></View>
            </View>
            <Text className="text-[#888888] text-[11px] mb-0.5">{perf.overs ? perf.overs : `${perf.fours} Fours • ${perf.sixes} Sixes`}</Text>
            <Text className="text-white text-[11px] mb-2">vs {perf.vs}</Text>
            {perf.potm && <View className="bg-[#23c55e]/15 px-1.5 py-0.5 rounded self-start mb-2"><Text className="text-[#23c55e] text-[9px] font-bold">Player of the Match</Text></View>}
            <View className="flex-row justify-between items-center border-t border-[#222222] pt-2 mt-auto">
              <Text className="text-[#888888] text-[10px]">{perf.time}</Text>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Form & Teams Grid */}
      <View className="flex-row px-4">
        {/* FORM */}
        <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 flex-1 mr-2 mb-4">
          <Text className="text-white text-[13px] font-bold mb-3">Form <Text style={{fontWeight:'normal', color:theme.subText}}>(Last 5 Matches)</Text></Text>
          <View className="flex-1 flex-row justify-between items-end pt-4">
            {FORM_DATA.map((data) => {
              const isWin = data.result === 'W';
              const barHeight = Math.max((data.score / 100) * 80, 10);
              return (
                <View key={data.id} className="items-center">
                  <Text className="text-white text-[9px] mb-1">{data.score}</Text>
                  <View 
                    className={`w-3.5 rounded-t-[2px] mb-1 ${isWin ? 'bg-[#23c55e]' : 'bg-[#e74c3c]'}`} 
                    style={{ height: barHeight }} 
                  />
                  <View className={`border px-1 py-0.5 rounded ${isWin ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#e74c3c]/15 border-[#e74c3c]'}`}>
                    <Text className={`text-[8px] font-bold ${isWin ? 'text-[#23c55e]' : 'text-[#e74c3c]'}`}>{data.result}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* TEAMS */}
        <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 flex-1 ml-2 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-[13px] font-bold">Teams</Text>
            <TouchableOpacity><Text className="text-[#23c55e] text-xs font-bold">See All</Text></TouchableOpacity>
          </View>
          <View className="flex-row items-center mb-3">
            <Image source={{uri: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff'}} className="w-7 h-7 rounded-full bg-[#1a1a1a] mr-2.5" />
            <View className="flex-1">
              <Text className="text-white text-xs font-semibold" numberOfLines={1}>Falcons CC</Text>
              <Text className="text-[#888888] text-[10px] mt-0.5">All-Rounder</Text>
            </View>
            <Text className="text-[#888888] text-[10px]">2025 – Present</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <Image source={{uri: 'https://ui-avatars.com/api/?name=WX&background=8e44ad&color=fff'}} className="w-7 h-7 rounded-full bg-[#1a1a1a] mr-2.5" />
            <View className="flex-1">
              <Text className="text-white text-xs font-semibold" numberOfLines={1}>Warriors XI</Text>
              <Text className="text-[#888888] text-[10px] mt-0.5">All-Rounder</Text>
            </View>
            <Text className="text-[#888888] text-[10px]">2024 – 2025</Text>
          </View>
        </View>
      </View>

      {/* Tournaments & Achievements Grid */}
      <View className="flex-row px-4">
        {/* TOURNAMENTS */}
        <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 flex-1 mr-2 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-[13px] font-bold">Tournaments</Text>
            <TouchableOpacity><Text className="text-[#23c55e] text-xs font-bold">See All</Text></TouchableOpacity>
          </View>
          <View className="flex-row items-center mb-3">
            <View className="w-7 h-7 rounded-full bg-[#f1c40f]/10 items-center justify-center mr-2.5"><Ionicons name="trophy" size={16} color="#f1c40f" /></View>
            <View className="flex-1">
              <Text className="text-white text-xs font-semibold" numberOfLines={1}>Kurukshetra T20</Text>
              <Text className="text-[#888888] text-[10px] mt-0.5">Semi-Finalist • 2026</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-3">
            <View className="w-7 h-7 rounded-full bg-[#f1c40f]/10 items-center justify-center mr-2.5"><Ionicons name="trophy" size={16} color="#f1c40f" /></View>
            <View className="flex-1">
              <Text className="text-white text-xs font-semibold" numberOfLines={1}>Hyderabad Turf</Text>
              <Text className="text-[#888888] text-[10px] mt-0.5">Winner • 2025</Text>
            </View>
          </View>
        </View>

        {/* ACHIEVEMENTS */}
        <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 flex-1 ml-2 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-[13px] font-bold">Achievements</Text>
            <TouchableOpacity><Text className="text-[#23c55e] text-xs font-bold">See All</Text></TouchableOpacity>
          </View>
          <View className="flex-row items-center mb-3">
            <Ionicons name="star" size={16} color="#f39c12" style={{ marginRight: 8 }} />
            <Text className="text-white text-xs font-semibold flex-1" numberOfLines={1}>POTM</Text>
            <Text className="text-[#888888] text-[10px]">8 Times</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="target" size={16} color="#e67e22" style={{ marginRight: 8 }} />
            <Text className="text-white text-xs font-semibold flex-1" numberOfLines={1}>500 Runs</Text>
            <Text className="text-[#888888] text-[10px]">Milestone</Text>
          </View>
          <View className="flex-row items-center mb-3">
            <MaterialCommunityIcons name="cricket" size={16} color="#e67e22" style={{ marginRight: 8 }} />
            <Text className="text-white text-xs font-semibold flex-1" numberOfLines={1}>50 Wickets</Text>
            <Text className="text-[#888888] text-[10px]">Milestone</Text>
          </View>
        </View>
      </View>

    </View>
  );

  // ==========================================
  // TAB 2: STATS
  // ==========================================
  const renderStats = () => (
    <View className="pt-4">
      
      {/* Batting Stats */}
      <View className="flex-row justify-between items-center px-4 mb-3 mt-2">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="cricket-bat" size={18} color={theme.subText} style={{ marginRight: 8 }} />
          <Text className="text-white text-base font-bold">Batting</Text>
        </View>
        <View className="flex-row items-center bg-[#121212] border border-[#222222] px-2.5 py-1 rounded-md">
          <Text className="text-white text-[11px] mr-1.5">All Formats</Text>
          <Feather name="chevron-down" size={14} color={theme.subText} />
        </View>
      </View>
      <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 mx-4 mb-4">
        <View className="flex-row flex-wrap justify-between">
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Matches</Text><Text className="text-white text-base font-bold">42</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Runs</Text><Text className="text-white text-base font-bold">1,286</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Average</Text><Text className="text-[#23c55e] text-base font-bold">38.7</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Strike Rate</Text><Text className="text-[#23c55e] text-base font-bold">142.4</Text></View>
        </View>
        <View className="h-[1px] bg-[#222222] my-3" />
        <View className="flex-row flex-wrap justify-between">
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Highest Score</Text><Text className="text-white text-base font-bold">86*</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">50s</Text><Text className="text-white text-base font-bold">12</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">100s</Text><Text className="text-white text-base font-bold">2</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">4s</Text><Text className="text-white text-base font-bold">134</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">6s</Text><Text className="text-white text-base font-bold">58</Text></View>
        </View>
      </View>

      {/* Bowling Stats */}
      <View className="flex-row justify-between items-center px-4 mb-3 mt-2">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="cricket" size={18} color={theme.subText} style={{ marginRight: 8 }} />
          <Text className="text-white text-base font-bold">Bowling</Text>
        </View>
        <View className="flex-row items-center bg-[#121212] border border-[#222222] px-2.5 py-1 rounded-md">
          <Text className="text-white text-[11px] mr-1.5">All Formats</Text>
          <Feather name="chevron-down" size={14} color={theme.subText} />
        </View>
      </View>
      <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 mx-4 mb-4">
        <View className="flex-row flex-wrap justify-between">
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Matches</Text><Text className="text-white text-base font-bold">42</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Overs</Text><Text className="text-white text-base font-bold">126.4</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Wickets</Text><Text className="text-[#23c55e] text-base font-bold">58</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Economy</Text><Text className="text-[#23c55e] text-base font-bold">7.2</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Average</Text><Text className="text-white text-base font-bold">17.9</Text></View>
        </View>
        <View className="h-[1px] bg-[#222222] my-3" />
        <View className="flex-row flex-wrap justify-between">
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Best Bowling</Text><Text className="text-white text-base font-bold">4/18</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">5 Wickets</Text><Text className="text-white text-base font-bold">1</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Maiden Overs</Text><Text className="text-white text-base font-bold">6</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Dot Balls</Text><Text className="text-white text-base font-bold">312</Text></View>
        </View>
      </View>

      {/* Fielding Stats */}
      <View className="flex-row justify-between items-center px-4 mb-3 mt-2">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="hand-back-right" size={18} color={theme.subText} style={{ marginRight: 8 }} />
          <Text className="text-white text-base font-bold">Fielding</Text>
        </View>
      </View>
      <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 mx-4 mb-4">
        <View className="flex-row flex-wrap justify-between">
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Catches</Text><Text className="text-[#23c55e] text-base font-bold">32</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Run Outs</Text><Text className="text-white text-base font-bold">7</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Stumpings</Text><Text className="text-white text-base font-bold">3</Text></View>
          <View className="items-center w-[22%] mb-3"><Text className="text-[#888888] text-[10px] mb-1">Direct Hits</Text><Text className="text-white text-base font-bold">2</Text></View>
        </View>
      </View>

      {/* Performance Trend Placeholder */}
      <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 mx-4 mb-4 mt-4">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Feather name="trending-up" size={16} color={theme.subText} style={{ marginRight: 8 }} />
            <View>
              <Text className="text-white text-[13px] font-bold">Performance Trend</Text>
              <Text className="text-[#888888] text-[11px] mt-0.5">Last 10 Innings</Text>
            </View>
          </View>
          <View className="flex-row items-center bg-[#121212] border border-[#222222] px-2.5 py-1 rounded-md">
            <Text className="text-white text-[11px] mr-1.5">Runs</Text>
            <Feather name="chevron-down" size={14} color={theme.subText} />
          </View>
        </View>
        <View className="h-[100px] bg-[#1a1a1a] rounded-lg overflow-hidden border border-[#222222]">
           <Image source={{uri: 'https://www.transparenttextures.com/patterns/stardust.png'}} className="absolute w-full h-full opacity-10" />
           {/* Visual Mock of the Graph */}
           <View className="flex-1 flex-row items-end justify-between px-2.5 pb-5">
             {[18, 74, 31, 86, 42, 0, 55, 24, 67, 33].map((val, i) => {
               const height = (val / 100) * 80;
               return (
                 <View key={i} className="items-center">
                   <Text className="text-white text-[10px] mb-1">{val}{val===86?'*':''}</Text>
                   <View className="w-1.5 h-1.5 rounded-full bg-[#23c55e]" style={{ marginBottom: height }} />
                   <View className={`border px-1 py-0.5 rounded w-4 h-4 rounded-sm p-0 justify-center items-center ${val > 20 ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#e74c3c]/15 border-[#e74c3c]'}`}>
                     <Text className={`text-[8px] font-bold ${val > 20 ? 'text-[#23c55e]' : 'text-[#e74c3c]'}`}>{val > 20 ? 'W' : 'L'}</Text>
                   </View>
                 </View>
               )
             })}
           </View>
        </View>
      </View>

    </View>
  );

  // ==========================================
  // TAB 3: MATCHES
  // ==========================================
  const renderMatches = () => (
    <View className="pt-4">
      
      {/* Match Summary */}
      <View className="flex-row justify-between items-center px-4 mb-3 mt-2">
        <Text className="text-white text-base font-bold">Match Summary</Text>
        <View className="flex-row items-center bg-[#121212] border border-[#222222] px-2.5 py-1 rounded-md">
          <Text className="text-white text-[11px] mr-1.5">All Formats</Text>
          <Feather name="chevron-down" size={14} color={theme.subText} />
        </View>
      </View>
      <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 mx-4 mb-4">
        <View className="flex-row flex-wrap justify-between">
          <View className="items-center w-[22%] mb-3"><Ionicons name="trophy-outline" size={18} color={theme.subText} style={{marginBottom:4}}/><Text className="text-[#888888] text-[10px] mb-1">Matches</Text><Text className="text-white text-base font-bold">42</Text></View>
          <View className="items-center w-[22%] mb-3"><Ionicons name="medal-outline" size={18} color={theme.subText} style={{marginBottom:4}}/><Text className="text-[#888888] text-[10px] mb-1">Won</Text><Text className="text-white text-base font-bold">26</Text></View>
          <View className="items-center w-[22%] mb-3"><Feather name="bar-chart-2" size={18} color={theme.subText} style={{marginBottom:4}}/><Text className="text-[#888888] text-[10px] mb-1">Win %</Text><Text className="text-white text-base font-bold">61.9%</Text></View>
          <View className="items-center w-[22%] mb-3"><Feather name="star" size={18} color={theme.subText} style={{marginBottom:4}}/><Text className="text-[#888888] text-[10px] mb-1">POTM</Text><Text className="text-white text-base font-bold">8</Text></View>
        </View>
      </View>

      {/* Match History Header & Filters */}
      <View className="flex-row justify-between items-center px-4 mb-3 mt-4">
        <View className="flex-row items-center">
          <Feather name="calendar" size={18} color={theme.text} style={{ marginRight: 8 }} />
          <Text className="text-white text-base font-bold">Match History</Text>
        </View>
        <Feather name="chevron-right" size={18} color={theme.subText} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {MATCH_FILTERS.map(filter => (
          <TouchableOpacity 
            key={filter} 
            className={`border px-4 py-1.5 rounded-2xl mr-2 ${activeMatchFilter === filter ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`} 
            onPress={() => setActiveMatchFilter(filter)}
          >
            <Text className={`text-xs font-semibold ${activeMatchFilter === filter ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Match List */}
      <View className="px-4 pb-6">
        {MATCH_HISTORY.map(match => (
          <View key={match.id} className="bg-[#121212] rounded-xl border border-[#222222] mb-4 overflow-hidden">
            <View className="flex-row items-center p-3 border-b border-[#222222]">
              <View className="bg-[#1a1a1a] border border-[#222222] px-1.5 py-0.5 rounded mr-2"><Text className="text-[#23c55e] text-[9px] font-bold">{match.format}</Text></View>
              <Text className="text-[#888888] text-[11px] flex-1" numberOfLines={1}>{match.league}</Text>
              <Text className="text-[#888888] text-[10px]">{match.time}</Text>
            </View>
            
            <View className="flex-row p-3">
              <View className="flex-1 pr-3 justify-center">
                <View className="flex-row items-center mb-2">
                  <Image source={{uri: match.logoA}} className="w-6 h-6 rounded-full bg-[#1a1a1a] mr-2" />
                  <Text className="text-white text-[13px] font-semibold">{match.teamA}</Text>
                </View>
                <Text className="text-[#888888] text-[10px] font-bold my-1 pl-2">VS</Text>
                <View className="flex-row items-center mb-2">
                  <Image source={{uri: match.logoB}} className="w-6 h-6 rounded-full bg-[#1a1a1a] mr-2" />
                  <Text className="text-white text-[13px] font-semibold">{match.teamB}</Text>
                </View>
                <Text className={`text-[11px] font-bold mt-2 ${match.result.includes('Won') ? 'text-[#23c55e]' : 'text-[#e74c3c]'}`}>{match.result}</Text>
              </View>

              <View className="w-[140px] bg-[#1a1a1a] rounded-lg border border-[#222222] p-2.5 relative">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[#888888] text-[9px] uppercase tracking-wider">Your Performance</Text>
                  {match.potm && <View className="flex-row items-center bg-[#f1c40f]/15 px-1 py-0.5 rounded"><Ionicons name="star" size={10} color="#f1c40f"/><Text className="text-[#f1c40f] text-[8px] font-bold ml-0.5">POTM</Text></View>}
                </View>
                <View className="flex-row items-baseline">
                  <Text className="text-white text-lg font-bold">{match.myScore}</Text>
                  <Text className="text-[#888888] text-[11px]"> ({match.myBalls})</Text>
                </View>
                <Text className="text-[#888888] text-[10px] mt-1">{match.extraInfo ? match.extraInfo : `${match.myFours} Fours • ${match.mySixes} Sixes`}</Text>
                <Feather name="chevron-right" size={16} color={theme.subText} style={{ position: 'absolute', right: 12, top: '50%' }} />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity className="bg-[#121212] border border-[#222222] rounded-lg py-3 flex-row justify-center items-center">
          <Text className="text-white text-xs font-bold mr-1">View All Matches</Text>
          <Feather name="chevron-right" size={16} color={theme.subText} />
        </TouchableOpacity>
      </View>

    </View>
  );

  // ==========================================
  // TAB 4: POSTS
  // ==========================================
  const renderPosts = () => (
    <View className="pt-4">
      
      {/* Post Filters */}
      <View className="flex-row justify-between px-4 mb-4">
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border-b-2 border-[#23c55e]">
          <Feather name="list" size={14} color={theme.primary} style={{ marginRight: 6 }} />
          <Text className="text-xs font-semibold text-white">All Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border-b-2 border-transparent">
          <Feather name="image" size={14} color={theme.subText} style={{ marginRight: 6 }} />
          <Text className="text-[#888888] text-xs font-semibold">Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border-b-2 border-transparent">
          <Feather name="play-circle" size={14} color={theme.subText} style={{ marginRight: 6 }} />
          <Text className="text-[#888888] text-xs font-semibold">Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border-b-2 border-transparent">
          <Feather name="bar-chart-2" size={14} color={theme.subText} style={{ marginRight: 6 }} />
          <Text className="text-[#888888] text-xs font-semibold">Performances</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      {POSTS_FEED.map((post) => (
        <View key={post.id} className="bg-[#0a0a0a] border-b border-[#222222] py-4 px-4">
          <View className="flex-row items-center mb-3">
            <Image source={{ uri: PROFILE.avatar }} className="w-9 h-9 rounded-full mr-2.5" />
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-bold">{PROFILE.name}</Text>
                <MaterialCommunityIcons name="check-decagram" size={14} color={theme.primary} style={{ marginLeft: 4 }} />
              </View>
              <Text className="text-[#888888] text-[11px] mt-0.5">{PROFILE.username} • {post.time}</Text>
            </View>
            <TouchableOpacity><Feather name="more-horizontal" size={20} color={theme.subText} /></TouchableOpacity>
          </View>

          <Text className="text-white text-[13px] leading-5 mb-3">{post.text}</Text>

          {/* Single Image */}
          {post.image && <Image source={{ uri: post.image }} className="w-full h-[200px] rounded-xl bg-[#1a1a1a] mb-3" />}

          {/* Performance Embed (Mocked based on image 4) */}
          {post.isPerformance && (
            <View className="bg-[#121212] rounded-xl border border-[#222222] p-4 mb-3">
              <View className="flex-row items-center mb-3">
                <Ionicons name="trophy" size={14} color="#f1c40f" style={{ marginRight: 6 }}/>
                <Text className="text-[#23c55e] text-xs font-bold">Player of the Match</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View>
                  <View className="flex-row items-baseline">
                    <Text className="text-white text-lg font-bold">86*</Text>
                    <Text className="text-[#888888] text-[11px]"> (52)</Text>
                  </View>
                  <Text className="text-[#888888] text-[10px] mt-1">7 Fours • 3 Sixes</Text>
                </View>
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <Image source={{uri: 'https://ui-avatars.com/api/?name=RS&background=b9770e&color=fff'}} className="w-5 h-5 rounded-full mr-1.5" />
                    <Text className="text-white text-xs font-bold">vs Royal Strikers</Text>
                  </View>
                  <Text className="text-[#23c55e] text-[11px] font-bold">Won by 6 wickets</Text>
                </View>
                <View className="items-center">
                  <View className="flex-row items-center mb-1">
                    <Feather name="calendar" size={12} color={theme.subText} style={{ marginRight: 4 }} />
                    <Text className="text-[#888888] text-[11px]">Yesterday</Text>
                  </View>
                  <Text className="text-[#888888] text-[11px]">T20 League</Text>
                </View>
              </View>
            </View>
          )}

          {/* Multiple Images Grid */}
          {post.images && (
            <View className="flex-row h-[200px] mb-3">
              <Image source={{ uri: post.images[0] }} className="w-full h-full rounded-lg bg-[#1a1a1a]" style={{ flex: 2, marginRight: 4 }} />
              <View className="flex-1">
                <Image source={{ uri: post.images[1] }} className="w-full h-full rounded-lg bg-[#1a1a1a]" style={{ marginBottom: 4 }} />
                <Image source={{ uri: post.images[2] }} className="w-full h-full rounded-lg bg-[#1a1a1a]" />
              </View>
            </View>
          )}

          <View className="flex-row items-center">
            <TouchableOpacity className="flex-row items-center mr-6"><Feather name="heart" size={18} color={theme.subText} /><Text className="text-[#888888] text-xs ml-1.5">{post.likes}</Text></TouchableOpacity>
            <TouchableOpacity className="flex-row items-center mr-6"><Feather name="message-circle" size={18} color={theme.subText} /><Text className="text-[#888888] text-xs ml-1.5">{post.comments}</Text></TouchableOpacity>
            <TouchableOpacity className="flex-row items-center mr-6"><Feather name="corner-up-right" size={18} color={theme.subText} /><Text className="text-[#888888] text-xs ml-1.5">{post.shares}</Text></TouchableOpacity>
            <View className="flex-1 items-end">
              <TouchableOpacity><Feather name="bookmark" size={18} color={theme.subText} /></TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* End of posts indicator */}
      <View className="items-center justify-center py-10">
        <View className="w-10 h-10 rounded-lg bg-[#1a1a1a] border border-[#222222] items-center justify-center mb-3"><Feather name="edit" size={20} color={theme.primary} /></View>
        <Text className="text-white text-sm font-bold mb-1">No more posts yet</Text>
        <Text className="text-[#888888] text-xs">New posts will appear here.</Text>
      </View>

    </View>
  );


  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {renderProfileHeader()}
        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Stats' && renderStats()}
        {activeTab === 'Matches' && renderMatches()}
        {activeTab === 'Posts' && renderPosts()}
      </ScrollView>
    </SafeAreaView>
  );
}