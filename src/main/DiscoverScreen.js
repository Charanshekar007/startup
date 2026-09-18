import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, Dimensions, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// ==========================================
// MOCK DATA
// ==========================================
const DISCOVER_CATEGORIES = [
  { id: '1', title: 'Players', subtitle: 'Find cricketers', icon: 'account-outline' },
  { id: '2', title: 'Teams', subtitle: 'Explore teams', icon: 'account-group-outline' },
  { id: '3', title: 'Matches', subtitle: 'Live & upcoming', icon: 'calendar-month-outline' },
  { id: '4', title: 'Tournaments', subtitle: 'Local & global', icon: 'trophy-outline' },
  { id: '5', title: 'Grounds', subtitle: 'Cricket venues', icon: 'stadium-variant' },
  { id: '6', title: 'Events', subtitle: 'Cricket events', icon: 'ticket-confirmation-outline' },
  { id: '7', title: 'Rankings', subtitle: 'Top performers', icon: 'chart-bar' },
  { id: '8', title: 'Trending', subtitle: "What's hot", icon: 'fire' },
];

const TRENDING_NOW = [
  { id: 't1', title: 'KPL Season 7', subtitle: 'Live Now', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', isLive: true },
  { id: 't2', title: 'Top Batters', subtitle: 'This Month', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  { id: 't3', title: 'Emerging Players', subtitle: 'To Watch', image: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
];

const SEARCH_TABS = ['All', 'Players', 'Teams', 'Matches', 'Tournaments', 'Grounds', 'Events'];

const SEARCH_RESULTS = {
  players: [
    { id: 'p1', name: 'Rahul Kumar', role: 'Batter • Right Handed', location: 'Hyderabad, Telangana', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', rating: '4.6' },
    { id: 'p2', name: 'Rahul Singh', role: 'All Rounder • Right Handed', location: 'Delhi, India', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', rating: '4.3' },
    { id: 'p3', name: 'Rahul Chaudhary', role: 'Bowler • Left Arm Fast', location: 'Jaipur, Rajasthan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80', rating: '4.2' },
  ],
  teams: [
    { id: 'tm1', name: 'Rahul Warriors', location: 'Hyderabad, Telangana', logo: 'https://ui-avatars.com/api/?name=RW&background=1e3a29&color=fff' },
    { id: 'tm2', name: 'Rahul Strikers', location: 'Delhi, India', logo: 'https://ui-avatars.com/api/?name=RS&background=b9770e&color=fff' },
    { id: 'tm3', name: 'Rahul XI', location: 'Mumbai, Maharashtra', logo: 'https://ui-avatars.com/api/?name=RX&background=c0392b&color=fff' },
  ],
  matches: [
    { 
      id: 'm1', league: 'Kurukshetra Premier League', venue: 'Tau Devi Lal Stadium, Panchkula',
      teamA: 'Falcons CC', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', scoreA: '186/7', oversA: '32.3 Overs',
      teamB: 'Warriors XI', logoB: 'https://ui-avatars.com/api/?name=WX&background=8e44ad&color=fff', scoreB: '152/4', oversB: '30.1 Overs' 
    }
  ],
  tournaments: [
    { id: 'tr1', name: 'Kurukshetra Premier League', season: 'Season 7 • T20', dates: 'May 10 - Jun 10, 2025', location: 'Panchkula, Haryana', logo: 'https://ui-avatars.com/api/?name=KPL&background=1a1a1a&color=23c55e' }
  ]
};

export default function DiscoverScreen() {
  const navigation = useNavigation();
  
  // Toggles between the Discover Dashboard and Search Results View
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState('All');

  // ==========================================
  // VIEW 1: MAIN DISCOVER DASHBOARD
  // ==========================================
  const renderDiscoverMain = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* HEADER */}
      <View className="flex-row justify-between items-start px-4 pt-4 pb-2">
        <View>
          <Text className="text-[32px] font-bold text-white mb-1">Discover</Text>
          <Text className="text-[13px] text-[#888888]">Explore the cricket world around you.</Text>
        </View>
        <TouchableOpacity className="relative mt-2" onPress={() => navigation.navigate('Notifications')}>
          <Feather name="bell" size={24} color="#ffffff" />
          <View className="absolute -top-[2px] -right-[2px] w-2 h-2 rounded-full bg-[#e74c3c]" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="pb-[100px]" showsVerticalScrollIndicator={false}>
        
        {/* FAKE SEARCH BAR (Triggers Search State) */}
        <View className="flex-row px-4 mt-4 mb-6 items-center">
          <TouchableOpacity 
            className="flex-1 flex-row items-center bg-[#161616] rounded-xl px-4 h-12 border border-[#222222]" 
            onPress={() => setIsSearchActive(true)}
            activeOpacity={0.9}
          >
            <Feather name="search" size={20} color="#888888" className="mr-[10px]" />
            <Text className="text-[#888888] text-[15px]">Search players, teams, matches...</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-12 h-12 rounded-xl bg-[#161616] border border-[#222222] items-center justify-center ml-3">
            <Feather name="sliders" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* CATEGORY GRID */}
        <View className="flex-row flex-wrap justify-between px-4 mb-4">
          {DISCOVER_CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              className="bg-[#121212] rounded-2xl p-4 items-center mb-3 border border-[#222222]"
              style={{ width: (width - 44) / 3 }}
            >
              <View className="mb-3">
                <MaterialCommunityIcons name={cat.icon} size={28} color="#23c55e" />
              </View>
              <Text className="text-white text-sm font-bold text-center mb-1">{cat.title}</Text>
              <Text className="text-[#888888] text-[10px] text-center">{cat.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TRENDING NOW SCROLL */}
        <View className="flex-row justify-between items-center px-4 mb-4 mt-2">
          <Text className="text-lg font-bold text-white">Trending Now</Text>
          <TouchableOpacity><Text className="text-[13px] font-bold text-[#23c55e]">View All</Text></TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4">
          {TRENDING_NOW.map(item => (
            <TouchableOpacity key={item.id} className="w-[140px] h-[180px] rounded-2xl mr-4 overflow-hidden border border-[#222222]">
              <Image source={{ uri: item.image }} className="w-full h-full" />
              <View className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 pt-6">
                <Text className="text-white text-sm font-bold mb-1" numberOfLines={1}>{item.title}</Text>
                <View className="flex-row items-center">
                  {item.isLive && <View className="w-[6px] h-[6px] rounded-full bg-[#23c55e] mr-1" />}
                  <Text className={`text-[11px] ${item.isLive ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{item.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );

  // ==========================================
  // VIEW 2: SEARCH RESULTS
  // ==========================================
  const renderSearchResults = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* SEARCH HEADER */}
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity 
          onPress={() => {
            setIsSearchActive(false);
            setSearchQuery('');
            Keyboard.dismiss();
          }} 
          className="pr-4"
        >
          <Feather name="arrow-left" size={24} color="#ffffff" />
        </TouchableOpacity>
        
        <View className="flex-1 flex-row items-center bg-[#161616] rounded-xl px-4 h-11 border border-[#222222]">
          <Feather name="search" size={18} color="#888888" className="mr-[10px]" />
          <TextInput 
            className="flex-1 text-white text-[15px]"
            placeholder="Search..."
            placeholderTextColor="#888888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color="#888888" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity className="pl-4">
          <Feather name="sliders" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* SEARCH TABS */}
      <View className="border-b border-[#222222] pb-0">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4">
          {SEARCH_TABS.map(tab => (
            <TouchableOpacity 
              key={tab} 
              className={`pb-3 mr-6 ${activeSearchTab === tab ? 'border-b-2 border-[#23c55e]' : ''}`}
              onPress={() => setActiveSearchTab(tab)}
            >
              <Text className={`text-sm font-semibold ${activeSearchTab === tab ? 'text-white' : 'text-[#888888]'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="pb-[100px]" showsVerticalScrollIndicator={false}>
        
        {/* PLAYERS RESULTS */}
        {(activeSearchTab === 'All' || activeSearchTab === 'Players') && (
          <View className="px-4 mt-4">
            <View className="flex-row justify-between items-center px-4 mb-4 mt-2">
              <Text className="text-base font-bold text-white">Players</Text>
              {activeSearchTab === 'All' && <TouchableOpacity><Text className="text-[13px] font-bold text-[#23c55e]">See All</Text></TouchableOpacity>}
            </View>
            <View className="bg-[#121212] rounded-2xl border border-[#222222] overflow-hidden">
              {SEARCH_RESULTS.players.map((p, index) => (
                <TouchableOpacity key={p.id} className={`flex-row p-4 items-center ${index !== SEARCH_RESULTS.players.length - 1 ? 'border-b border-[#222222]' : ''}`}>
                  <Image source={{ uri: p.avatar }} className="w-11 h-11 rounded-full mr-3" />
                  <View className="flex-1">
                    <Text className="text-white text-[15px] font-bold mb-[2px]">{p.name}</Text>
                    <Text className="text-[#888888] text-xs mb-[2px]">{p.role}</Text>
                    <Text className="text-[#666666] text-[11px]">{p.location}</Text>
                  </View>
                  <View className="flex-row items-center bg-[#161616] border border-[#222222] px-2 py-1 rounded-lg">
                    <Feather name="star" size={10} color="#23c55e" className="mr-1" />
                    <Text className="text-white text-[11px] font-bold">{p.rating}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* TEAMS RESULTS */}
        {(activeSearchTab === 'All' || activeSearchTab === 'Teams') && (
          <View className="px-4 mt-4">
            <View className="flex-row justify-between items-center px-4 mb-4 mt-2">
              <Text className="text-base font-bold text-white">Teams</Text>
              {activeSearchTab === 'All' && <TouchableOpacity><Text className="text-[13px] font-bold text-[#23c55e]">See All</Text></TouchableOpacity>}
            </View>
            <View className="bg-[#121212] rounded-2xl border border-[#222222] overflow-hidden">
              {SEARCH_RESULTS.teams.map((t, index) => (
                <TouchableOpacity key={t.id} className={`flex-row p-4 items-center ${index !== SEARCH_RESULTS.teams.length - 1 ? 'border-b border-[#222222]' : ''}`}>
                  <Image source={{ uri: t.logo }} className="w-11 h-11 rounded-full mr-3 bg-[#161616]" />
                  <View className="flex-1">
                    <Text className="text-white text-[15px] font-bold mb-[2px]">{t.name}</Text>
                    <Text className="text-[#666666] text-[11px]">{t.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* MATCHES RESULTS */}
        {(activeSearchTab === 'All' || activeSearchTab === 'Matches') && (
          <View className="px-4 mt-4">
            <View className="flex-row justify-between items-center px-4 mb-4 mt-2">
              <Text className="text-base font-bold text-white">Matches</Text>
              {activeSearchTab === 'All' && <TouchableOpacity><Text className="text-[13px] font-bold text-[#23c55e]">See All</Text></TouchableOpacity>}
            </View>
            {SEARCH_RESULTS.matches.map((m) => (
              <TouchableOpacity key={m.id} className="bg-[#121212] rounded-2xl border border-[#222222] p-4">
                <Text className="text-[#888888] text-[11px] text-center mb-4">{m.league}</Text>
                <View className="flex-row justify-between items-center mb-4">
                  <View className="items-center flex-1">
                    <Image source={{ uri: m.logoA }} className="w-12 h-12 rounded-full mb-2 bg-[#161616]" />
                    <Text className="text-[#888888] text-[11px] mb-2">{m.teamA}</Text>
                    <Text className="text-white text-xl font-bold">{m.scoreA}</Text>
                    <Text className="text-[#888888] text-[11px] mt-1">({m.oversA})</Text>
                  </View>
                  <Text className="text-[#888888] text-xs font-bold w-[30px] text-center">VS</Text>
                  <View className="items-center flex-1">
                    <Image source={{ uri: m.logoB }} className="w-12 h-12 rounded-full mb-2 bg-[#161616]" />
                    <Text className="text-[#888888] text-[11px] mb-2">{m.teamB}</Text>
                    <Text className="text-white text-xl font-bold">{m.scoreB}</Text>
                    <Text className="text-[#888888] text-[11px] mt-1">({m.oversB})</Text>
                  </View>
                </View>
                <View className="flex-row items-center border-t border-[#222222] pt-3 mt-2">
                  <Feather name="map-pin" size={12} color="#888888" className="mr-[6px]" />
                  <Text className="text-[#888888] text-[11px]">{m.venue}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* TOURNAMENTS RESULTS */}
        {(activeSearchTab === 'All' || activeSearchTab === 'Tournaments') && (
          <View className="px-4 mt-4">
            <View className="flex-row justify-between items-center px-4 mb-4 mt-2">
              <Text className="text-base font-bold text-white">Tournaments</Text>
            </View>
            <View className="bg-[#121212] rounded-2xl border border-[#222222] overflow-hidden">
              {SEARCH_RESULTS.tournaments.map((t, index) => (
                <TouchableOpacity key={t.id} className={`flex-row p-4 items-center ${index !== SEARCH_RESULTS.tournaments.length - 1 ? 'border-b border-[#222222]' : ''}`}>
                  <Image source={{ uri: t.logo }} className="w-11 h-11 rounded-lg mr-3 bg-[#161616]" />
                  <View className="flex-1">
                    <Text className="text-white text-[15px] font-bold mb-[2px]">{t.name}</Text>
                    <Text className="text-[#888888] text-xs mb-[2px]">{t.season}</Text>
                    <Text className="text-[#888888] text-xs mb-[2px]">{t.dates}</Text>
                    <Text className="text-[#666666] text-[11px]"><Feather name="map-pin" size={10}/> {t.location}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {isSearchActive ? renderSearchResults() : renderDiscoverMain()}
    </SafeAreaView>
  );
}