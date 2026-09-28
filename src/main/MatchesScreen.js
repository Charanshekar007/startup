import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMatches } from '../context/MatchContext';

export default function MatchesScreen() {
  const navigation = useNavigation();
  const { matches = [] } = useMatches() || {};
  const [activeTab, setActiveTab] = useState('LIVE'); 
  const tabs = ['LIVE', 'UPCOMING', 'FOLLOWING', 'COMPLETED', 'MY MATCHES'];

  const colors = {
    primary: '#23c55e',
    upcoming: '#3498db',
    teamMember: '#f39c12',
  };

  // ==========================================
  // ALL MOCK DATA & CONTEXT DATA
  // ==========================================
  
  const contextLive = (matches || [])
    .filter((m) => m.status === 'Live')
    .map((m) => ({
      id: m.id,
      league: `${m.format || 'T20'} • ${m.type || 'PRACTICE'}`,
      teamA: m.teamA,
      teamB: m.teamB,
      logoA: m.teamAObj?.logo || 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff',
      logoB: m.teamBObj?.logo || 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
      scoreA: m.scoreA || '0/0',
      oversA: m.oversA || '0.0 Ov',
      scoreB: m.scoreB || '-/-',
      oversB: m.oversB || 'Yet to bat',
      status: `${m.tossWinner || m.teamA} elected to ${m.decision || 'Bat'}`,
      venue: m.venue || 'Rajiv Cricket Ground, Hyderabad',
      matchData: m,
    }));

  const contextCompleted = (matches || [])
    .filter((m) => m.status === 'Completed')
    .map((m) => ({
      id: m.id,
      league: `${m.format || 'T20'} • COMPLETED`,
      date: m.date || 'Today',
      teamA: m.teamA,
      teamB: m.teamB,
      logoA: m.teamAObj?.logo || 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff',
      logoB: m.teamBObj?.logo || 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
      scoreA: m.scoreA || '165/7',
      oversA: m.oversA || '20.0 Ov',
      scoreB: m.scoreB || '166/4',
      oversB: m.oversB || '18.2 Ov',
      winner: m.winner ? (m.margin === 'Super Over' ? `${m.winner} won via Super Over` : `${m.winner} won`) : 'Match Completed',
      margin: m.margin === 'Super Over' ? '' : (m.margin || ''),
      venue: m.venue || 'Rajiv Cricket Ground, Hyderabad',
      matchData: m,
    }));

  
  const liveMatches = [
    { id: 'l1', league: 'KURUKSHETRA LEAGUE • T20', teamA: 'Falcons CC', teamB: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff', scoreA: '186/7', oversA: '32.3 Ov', scoreB: '152/4', oversB: '30.1 Ov', status: 'Falcons CC elected to bat', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'l2', league: 'CITY PREMIER LEAGUE • T20', teamA: 'Tigers XI', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', scoreA: '98/2', oversA: '11.4 Ov', scoreB: '-/-', oversB: 'Yet to bat', status: 'Tigers XI elected to bat', venue: 'Greenfield Stadium, Bengaluru' },
  ];

  const upcomingMatches = [
    { id: 'u1', dateLabel: 'TOMORROW', time: '4:00 PM', teamA: 'Falcons CC', teamB: 'Titans XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=TX&background=4a235a&color=fff', league: 'Kurukshetra League • T20', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'u2', dateLabel: 'MAY 18, 2025', time: '6:00 PM', teamA: 'Tigers XI', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', league: 'City Premier League • T20', venue: 'Greenfield Stadium, Bengaluru' },
    { id: 'u3', dateLabel: 'MAY 20, 2025', time: '10:30 AM', teamA: 'Royals CC', teamB: 'Strikers XI', logoA: 'https://ui-avatars.com/api/?name=RC&background=9a7d0a&color=fff', logoB: 'https://ui-avatars.com/api/?name=SX&background=c0392b&color=fff', league: 'City Premier League • T20', venue: 'M Chinnaswamy Stadium, Bengaluru' },
  ];

  const followingMatches = [
    { id: 'f1', type: 'LIVE', league: 'KURUKSHETRA LEAGUE • T20', teamA: 'Falcons CC', teamB: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff', scoreA: '186/7', oversA: '32.3 Ov', scoreB: '152/4', oversB: '30.1 Ov', status: 'Falcons CC elected to bat', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'f2', type: 'UPCOMING', league: 'CITY PREMIER LEAGUE • T20', teamA: 'Tigers XI', teamB: 'Titans XI', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=TX&background=4a235a&color=fff', date: 'Tomorrow', time: '4:00 PM', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'f3', type: 'COMPLETED', league: 'CITY PREMIER LEAGUE • T20', teamA: 'Royals CC', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=RC&background=9a7d0a&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', scoreA: '168/8', oversA: '20.0 Ov', scoreB: '140/10', oversB: '18.3 Ov', status: 'Royals CC won by 28 runs', venue: 'Greenfield Stadium, Bengaluru' },
  ];

  const completedMatches = [
    { id: 'c1', league: 'KURUKSHETRA LEAGUE • T20', date: 'Yesterday', teamA: 'Falcons CC', teamB: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff', scoreA: '186/7', oversA: '20.0 Ov', scoreB: '152/9', oversB: '20.0 Ov', winner: 'Falcons CC won', margin: 'by 34 runs', venue: 'Rajiv Cricket Ground, Hyderabad' },
    { id: 'c2', league: 'CITY PREMIER LEAGUE • T20', date: 'May 23, 2025', teamA: 'Tigers XI', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', scoreA: '198/6', oversA: '20.0 Ov', scoreB: '195/8', oversB: '20.0 Ov', winner: 'Tigers XI won', margin: 'by 6 wickets', venue: 'Greenfield Stadium, Bengaluru' },
  ];

  const playingMatches = [
    { id: 'p1', type: 'LIVE NOW', league: 'KURUKSHETRA LEAGUE • T20', teamA: 'Falcons CC', teamB: 'Warriors XI', logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff', logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff', scoreA: '186/7', oversA: '32.3 Ov', scoreB: '152/4', oversB: '30.1 Ov', status: 'Falcons CC elected to bat', venue: 'Rajiv Cricket Ground, Hyderabad', roleTitle: 'Player', roleColor: colors.primary, roleNumber: '17', roleDesc: 'Top Order\nBatsman', isPlayer: true },
    { id: 'p2', type: 'UPCOMING', league: 'CITY PREMIER LEAGUE • T20', teamA: 'Tigers XI', teamB: 'Titans XI', logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff', logoB: 'https://ui-avatars.com/api/?name=TX&background=4a235a&color=fff', date: 'May 26, 2025', time: '4:00 PM', venue: 'Rajiv Cricket Ground, Hyderabad', roleTitle: 'Player', roleColor: colors.upcoming, roleNumber: '8', roleDesc: 'Middle Order\nBatsman', isPlayer: true },
    { id: 'p3', type: 'UPCOMING', league: 'DELHI PREMIER LEAGUE • ODI', teamA: 'Eagles CC', teamB: 'Strikers XI', logoA: 'https://ui-avatars.com/api/?name=EC&background=2c3e50&color=fff', logoB: 'https://ui-avatars.com/api/?name=SX&background=c0392b&color=fff', date: 'May 30, 2025', time: '10:00 AM', venue: 'Arun Jaitley Stadium, Delhi', roleTitle: 'Team Member', roleColor: colors.teamMember, roleNumber: null, roleDesc: 'Squad\nMember', isPlayer: false },
  ];

  const organizingMatches = [
    { id: 'o1', type: 'UPCOMING', league: 'Kurukshetra League • T20', teamA: 'Royals CC', teamB: 'Panthers CC', logoA: 'https://ui-avatars.com/api/?name=RC&background=9a7d0a&color=fff', logoB: 'https://ui-avatars.com/api/?name=PC&background=2c3e50&color=fff', date: 'May 30, 2025', time: '3:30 PM', venue: 'Kurukshetra Sports Complex', rolePillText: 'ORGANIZER', rolePillIcon: 'account-tie' },
  ];

  const scoringMatches = [
    { id: 's1', type: 'LIVE', league: 'City Premier League • T20', teamA: 'Lions CC', teamB: 'Kings CC', logoA: 'https://ui-avatars.com/api/?name=LC&background=b9770e&color=fff', logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff', scoreA: '98/2', oversA: '11.4 Ov', scoreB: '-/-', oversB: 'Yet to bat', status: null, venue: 'Greenfield Stadium, Bengaluru', rolePillText: 'SCORER', rolePillIcon: 'pencil' },
  ];

  // ==========================================
  // HEADERS
  // ==========================================
  
  const SectionHeader = ({ icon, title, iconColor }) => (
    <View className="flex-row justify-between items-center mb-3 mt-2">
      <View className="flex-row items-center">
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} className="mr-2" />
        <Text className="text-xs font-bold tracking-widest text-white">{title}</Text>
      </View>
      <TouchableOpacity className="flex-row items-center">
        <Text className="text-[#23c55e] text-xs mr-1">View all</Text>
        <Feather name="chevron-right" size={14} color="#23c55e" />
      </TouchableOpacity>
    </View>
  );

  const SubtitledHeader = ({ icon, title, subtitle }) => (
    <View className="mb-4 mt-2">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name={icon} size={20} color="#23c55e" className="mr-2" />
          <Text className="text-xs font-bold tracking-widest text-white">{title}</Text>
        </View>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-[#23c55e] text-xs mr-1">View all</Text>
          <Feather name="chevron-right" size={14} color="#23c55e" />
        </TouchableOpacity>
      </View>
      <Text className="text-[#888888] text-xs mt-1">{subtitle}</Text>
    </View>
  );

  // ==========================================
  // CARD COMPONENTS (ALL TABS)
  // ==========================================
  
  const LiveCard = ({ match }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate('LiveScoring', { matchData: match.matchData || match })}
      className="bg-[#121212] border border-[#1a4024] rounded-xl mb-4"
    >
      <View className="flex-row justify-between items-center p-3 pb-0">
        <View className="px-[6px] py-[3px] rounded bg-[#23c55e]"><Text className="text-[9px] font-bold text-black">LIVE</Text></View>
        <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase flex-1 ml-2">{match.league}</Text>
        <View className="w-[34px]" />
      </View>
      <View className="flex-row justify-between items-center px-4 py-4">
        <View className="items-center w-20">
          <Image source={{ uri: match.logoA }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
          <Text className="text-white text-xs font-semibold text-center">{match.teamA}</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="flex-row items-center justify-center w-full">
            <View className="items-center w-[70px]">
              <Text className="text-white text-[22px] font-bold">{match.scoreA}</Text>
              <Text className="text-[11px] mt-1 text-[#888888]">{match.oversA}</Text>
            </View>
            <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-2"><Text className="text-[#888888] text-[10px]">VS</Text></View>
            <View className="items-center w-[70px]">
              <Text className="text-white text-[22px] font-bold">{match.scoreB}</Text>
              <Text className="text-[11px] mt-1 text-[#888888]">{match.oversB}</Text>
            </View>
          </View>
          <View className="border border-[#23c55e] bg-[#0a1f10] px-[10px] py-1 rounded-xl mt-3"><Text className="text-[#23c55e] text-[11px] font-semibold text-center">{match.status}</Text></View>
        </View>
        <View className="items-center w-20">
          <Image source={{ uri: match.logoB }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
          <Text className="text-white text-xs font-semibold text-center">{match.teamB}</Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center p-3 border-t border-[#222222]">
        <View className="flex-row items-center flex-1">
          <Feather name="map-pin" size={12} color="#23c55e" />
          <Text className="text-[#888888] text-[11px] ml-[6px]">{match.venue}</Text>
        </View>
        <Feather name="chevron-right" size={16} color="#888888" />
      </View>
    </TouchableOpacity>
  );

  const UpcomingCard = ({ match }) => (
    <View className="bg-[#121212] border border-[#222222] rounded-xl mb-4 p-4">
      <View className="flex-row items-center mb-4">
        <Feather name="calendar" size={12} color="#23c55e" className="mr-[6px]" />
        <Text className="text-[#23c55e] text-[11px] font-bold ml-1">{match.dateLabel} • {match.time}</Text>
      </View>
      <View className="flex-row items-center justify-between mb-5 px-4">
        <View className="items-center flex-1">
          <Image source={{ uri: match.logoA }} className="w-14 h-14 rounded-full mb-2 bg-[#222222]" />
          <Text className="text-white text-[13px] font-semibold text-center" numberOfLines={1}>{match.teamA}</Text>
        </View>
        <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-2"><Text className="text-[#888888] text-[10px]">VS</Text></View>
        <View className="items-center flex-1">
          <Image source={{ uri: match.logoB }} className="w-14 h-14 rounded-full mb-2 bg-[#222222]" />
          <Text className="text-white text-[13px] font-semibold text-center" numberOfLines={1}>{match.teamB}</Text>
        </View>
      </View>
      <View className="flex-row justify-between items-end">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center mb-[6px]">
            <Feather name="map-pin" size={12} color="#23c55e" className="mr-[6px]" />
            <Text className="text-[#888888] text-[11px] ml-1" numberOfLines={1}>{match.venue}</Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="award" size={12} color="#888888" className="mr-[6px]" />
            <Text className="text-[#888888] text-[11px] ml-1" numberOfLines={1}>{match.league}</Text>
          </View>
        </View>
        <TouchableOpacity className="flex-row items-center border border-[#23c55e] px-3 py-[6px] rounded-md bg-transparent">
          <Feather name="plus" size={12} color="#23c55e" />
          <Text className="text-[#23c55e] text-[11px] font-bold ml-1">Follow</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FollowingCard = ({ match }) => {
    const isLive = match.type === 'LIVE';
    const isUpcoming = match.type === 'UPCOMING';
    const isCompleted = match.type === 'COMPLETED';

    let borderColorClass = 'border-[#222222]';
    let pillBgClass = 'bg-[#1a1a1a]';
    let pillTextClass = 'text-[#888888]';
    
    if (isLive) { 
      borderColorClass = 'border-[#1a4024]'; 
      pillBgClass = 'bg-[#23c55e]'; 
      pillTextClass = 'text-black'; 
    } else if (isUpcoming) { 
      pillBgClass = 'bg-[#3498db]/15'; 
      pillTextClass = 'text-[#3498db]'; 
    }

    return (
      <View className={`bg-[#121212] border rounded-xl mb-4 ${borderColorClass}`}>
        <View className="flex-row justify-between items-center p-3 pb-0">
          <View className={`px-[6px] py-[3px] rounded ${pillBgClass}`}>
            <Text className={`text-[9px] font-bold ${pillTextClass}`}>{match.type}</Text>
          </View>
          <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase flex-1 ml-2">{match.league}</Text>
          <View className="w-10" />
        </View>
        <View className="flex-row justify-between items-center px-4 py-4">
          <View className="items-center w-20">
            <Image source={{ uri: match.logoA }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
            <Text className="text-white text-xs font-semibold text-center">{match.teamA}</Text>
          </View>
          <View className="flex-1 items-center justify-center">
            {isUpcoming ? (
              <View className="items-center">
                <Feather name="calendar" size={16} color="#888888" className="mb-[6px]" />
                <Text className="text-[#888888] text-[11px] mb-1">{match.date}</Text>
                <Text className="text-white text-base font-bold">{match.time}</Text>
              </View>
            ) : (
              <>
                {isCompleted && <Text className="text-[#23c55e] text-[11px] font-semibold text-center mb-3">{match.status}</Text>}
                <View className="flex-row items-center justify-center w-full">
                  <View className="items-center w-[70px]">
                    <Text className="text-white text-[22px] font-bold">{match.scoreA}</Text>
                    <Text className={`text-[11px] mt-1 ${isLive ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{match.oversA}</Text>
                  </View>
                  {isLive ? (
                    <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-2"><Text className="text-[#888888] text-[10px]">VS</Text></View>
                  ) : (
                    <View className="w-8 mx-2" />
                  )}
                  <View className="items-center w-[70px]">
                    <Text className="text-white text-[22px] font-bold">{match.scoreB}</Text>
                    <Text className={`text-[11px] mt-1 ${isLive ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{match.oversB}</Text>
                  </View>
                </View>
                {isLive && <Text className="text-[#23c55e] text-[11px] font-semibold text-center mt-3">{match.status}</Text>}
              </>
            )}
          </View>
          <View className="items-center w-20">
            <Image source={{ uri: match.logoB }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
            <Text className="text-white text-xs font-semibold text-center">{match.teamB}</Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center p-3 border-t border-[#222222]">
          <View className="flex-row items-center flex-1">
            <Feather name="map-pin" size={12} color="#23c55e" />
            <Text className="text-[#888888] text-[11px] ml-[6px]">{match.venue}</Text>
          </View>
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="check-circle" size={14} color="#23c55e" />
            <Text className="text-[#23c55e] text-[11px] font-bold ml-1 mr-2">Following</Text>
            <Feather name="chevron-right" size={16} color="#888888" />
          </View>
        </View>
      </View>
    );
  };

  const CompletedCard = ({ match }) => (
    <View className="bg-[#121212] border border-[#222222] rounded-xl mb-4">
      <View className="flex-row justify-between items-center px-4 pt-4 pb-1">
        <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase flex-1">{match.league}</Text>
        <Text className="text-[#888888] text-[11px]">{match.date}</Text>
      </View>
      <View className="flex-row justify-between items-center px-4 py-4">
        <View className="items-center w-20">
          <Image source={{ uri: match.logoA }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
          <Text className="text-white text-xs font-semibold text-center">{match.teamA}</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <View className="flex-row items-center justify-center w-full">
            <View className="items-center w-[70px]">
              <Text className="text-white text-[22px] font-bold">{match.scoreA}</Text>
              <Text className="text-[11px] mt-1 text-[#888888]">{match.oversA}</Text>
            </View>
            <View className="items-center px-2">
              <Text className="text-[#23c55e] text-[11px] font-semibold">{match.winner}</Text>
              <Text className="text-[#888888] text-[10px] mt-1">{match.margin}</Text>
            </View>
            <View className="items-center w-[70px]">
              <Text className="text-white text-[22px] font-bold">{match.scoreB}</Text>
              <Text className="text-[11px] mt-1 text-[#888888]">{match.oversB}</Text>
            </View>
          </View>
        </View>
        <View className="items-center w-20">
          <Image source={{ uri: match.logoB }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
          <Text className="text-white text-xs font-semibold text-center">{match.teamB}</Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center p-3 border-t border-[#222222]">
        <View className="flex-row items-center flex-1">
          <Feather name="map-pin" size={12} color="#23c55e" />
          <Text className="text-[#888888] text-[11px] ml-[6px]">{match.venue}</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="border border-[#1a4024] px-3 py-1 rounded-xl mr-2">
            <Text className="text-[#23c55e] text-[11px] font-semibold">Scorecard</Text>
          </TouchableOpacity>
          <Feather name="chevron-right" size={16} color="#888888" />
        </View>
      </View>
    </View>
  );

  const MyMatchesSidebarCard = ({ match }) => {
    const isLive = match.type === 'LIVE NOW';
    let borderColorClass = isLive ? 'border-[#1a4024]' : 'border-[#222222]';
    let pillBgClass = isLive ? 'bg-[#23c55e]' : 'bg-[#3498db]/15';
    let pillTextClass = isLive ? 'text-black' : 'text-[#3498db]';

    return (
      <View className={`bg-[#121212] border rounded-xl mb-4 flex-row overflow-hidden ${borderColorClass}`}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center p-3 pb-0 pr-2">
            <View className={`px-[6px] py-[3px] rounded ${pillBgClass}`}><Text className={`text-[9px] font-bold ${pillTextClass}`}>{match.type}</Text></View>
            <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase flex-1 ml-2" numberOfLines={1}>{match.league}</Text>
          </View>
          <View className="flex-row justify-between items-center px-3 py-4">
            <View className="items-center w-20">
              <Image source={{ uri: match.logoA }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
              <Text className="text-white text-xs font-semibold text-center">{match.teamA}</Text>
            </View>
            <View className="flex-1 items-center justify-center">
              {isLive ? (
                <View className="flex-row items-center justify-center w-full">
                  <View className="items-center w-[70px]">
                    <Text className="text-white text-[22px] font-bold">{match.scoreA}</Text>
                    <Text className="text-[11px] mt-1 text-[#23c55e]">{match.oversA}</Text>
                  </View>
                  <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-1"><Text className="text-[#888888] text-[10px]">VS</Text></View>
                  <View className="items-center w-[70px]">
                    <Text className="text-white text-[22px] font-bold">{match.scoreB}</Text>
                    <Text className="text-[11px] mt-1 text-[#23c55e]">{match.oversB}</Text>
                  </View>
                </View>
              ) : (
                <View className="items-center">
                  <Feather name="calendar" size={14} color="#888888" className="mb-1" />
                  <Text className="text-[#888888] text-[10px] mb-[2px]">{match.date}</Text>
                  <Text className="text-white text-sm font-bold">{match.time}</Text>
                </View>
              )}
            </View>
            <View className="items-center w-20">
              <Image source={{ uri: match.logoB }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
              <Text className="text-white text-xs font-semibold text-center">{match.teamB}</Text>
            </View>
          </View>
          {isLive && match.status && (
            <View className="items-center mb-3">
              <View className="border border-[#23c55e] bg-[#0a1f10] px-[10px] py-1 rounded-xl"><Text className="text-[#23c55e] text-[11px] font-semibold text-center">{match.status}</Text></View>
            </View>
          )}
          <View className="flex-row justify-between items-center px-3 pb-4">
            <View className="flex-row items-center flex-1">
              <Feather name="map-pin" size={12} color="#23c55e" />
              <Text className="text-[#888888] text-[11px] ml-[6px]" numberOfLines={1}>{match.venue}</Text>
            </View>
          </View>
        </View>
        <View className="w-[90px] border-l border-[#222222] bg-[#111111] items-center py-4 px-1">
          <Text className="text-[#888888] text-[9px] font-bold uppercase mb-1">YOUR ROLE</Text>
          <Text className="text-xs font-bold mb-3 text-center" style={{ color: match.roleColor }}>{match.roleTitle}</Text>
          <View className="items-center justify-center mb-3 relative">
            {match.isPlayer ? (
              <>
                <MaterialCommunityIcons name="tshirt-crew-outline" size={38} color={match.roleColor} />
                <Text className="absolute text-white text-[11px] font-bold top-3">{match.roleNumber}</Text>
              </>
            ) : (
              <MaterialCommunityIcons name="account-group-outline" size={34} color={match.roleColor} />
            )}
          </View>
          <Text className="text-[#888888] text-[9px] text-center leading-3">{match.roleDesc}</Text>
        </View>
      </View>
    );
  };

  const MyMatchesRoleCard = ({ match }) => {
    const isLive = match.type === 'LIVE';
    let borderColorClass = isLive ? 'border-[#1a4024]' : 'border-[#222222]';
    let pillBgClass = isLive ? 'bg-[#23c55e]' : 'bg-[#3498db]/15';
    let pillTextClass = isLive ? 'text-black' : 'text-[#3498db]';

    return (
      <View className={`bg-[#121212] border rounded-xl mb-4 ${borderColorClass}`}>
        <View className="flex-row justify-between items-center p-3 pb-0">
          <View className="flex-row items-center flex-1">
            <View className={`px-[6px] py-[3px] rounded mr-2 ${pillBgClass}`}><Text className={`text-[9px] font-bold ${pillTextClass}`}>{match.type}</Text></View>
            <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase flex-1" numberOfLines={1}>{match.league}</Text>
          </View>
          <View className="flex-row items-center border border-[#23c55e] px-2 py-1 rounded-md">
            <MaterialCommunityIcons name={match.rolePillIcon} size={12} color="#23c55e" className="mr-1" />
            <Text className="text-[#23c55e] text-[10px] font-bold tracking-[0.5px] ml-1">{match.rolePillText}</Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center px-4 py-4">
          <View className="items-center w-20">
            <Image source={{ uri: match.logoA }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
            <Text className="text-white text-xs font-semibold text-center">{match.teamA}</Text>
          </View>
          <View className="flex-1 items-center justify-center">
            {isLive ? (
              <View className="flex-row items-center justify-center w-full">
                <View className="items-center w-[70px]">
                  <Text className="text-white text-[22px] font-bold">{match.scoreA}</Text>
                  <Text className="text-[11px] mt-1 text-[#23c55e]">{match.oversA}</Text>
                </View>
                <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-2"><Text className="text-[#888888] text-[10px]">VS</Text></View>
                <View className="items-center w-[70px]">
                  <Text className="text-white text-[22px] font-bold">{match.scoreB}</Text>
                  <Text className="text-[11px] mt-1 text-[#23c55e]">{match.oversB}</Text>
                </View>
              </View>
            ) : (
              <View className="items-center">
                <Text className="text-[#888888] text-[10px] mb-[2px]">{match.date}</Text>
                <Text className="text-white text-sm font-bold">{match.time}</Text>
              </View>
            )}
          </View>
          <View className="items-center w-20">
            <Image source={{ uri: match.logoB }} className="w-11 h-11 rounded-full mb-2 bg-[#222222]" />
            <Text className="text-white text-xs font-semibold text-center">{match.teamB}</Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center p-3 border-t border-[#222222]">
          <View className="flex-row items-center flex-1">
            <Feather name="map-pin" size={12} color="#23c55e" />
            <Text className="text-[#888888] text-[11px] ml-[6px]" numberOfLines={1}>{match.venue}</Text>
          </View>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-[#23c55e] text-[11px] font-bold mr-1">View Details</Text>
            <Feather name="chevron-right" size={14} color="#23c55e" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================
  
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <Text className="text-2xl font-black italic mr-3 text-[#23c55e]">P</Text>
          <Text className="text-[22px] font-bold text-white">Matches</Text>
        </View>
        <View className="flex-row items-center">
          {/* --- NOTIFICATIONS ONPRESS ADDED HERE --- */}
          <TouchableOpacity className="relative ml-5" onPress={() => navigation.navigate('Notifications')}>
            <Feather name="bell" size={22} color="#ffffff" />
            <View className="absolute -top-1 -right-[6px] rounded-full w-4 h-4 justify-center items-center bg-[#23c55e]"><Text className="text-black text-[9px] font-bold">3</Text></View>
          </TouchableOpacity>
          {/* --- MESSAGES ONPRESS ALREADY HERE --- */}
          <TouchableOpacity className="relative ml-5" onPress={() => navigation.navigate('Messages')}>
            <Feather name="message-square" size={22} color="#ffffff" />
            <View className="absolute -top-1 -right-[6px] rounded-full w-4 h-4 justify-center items-center bg-[#23c55e]"><Text className="text-black text-[9px] font-bold">2</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      <View className="border-b border-[#222222]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-2">
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab} 
              className={`py-[14px] px-4 mr-1 ${activeTab === tab ? 'border-b-2 border-[#23c55e]' : ''}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className={`text-xs font-bold tracking-[0.5px] ${activeTab === tab ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerClassName="pb-[100px] px-4 pt-4" showsVerticalScrollIndicator={false}>
        
        {/* --- LIVE TAB --- */}
        {activeTab === 'LIVE' && (
          <View>
            <SectionHeader icon="record-circle-outline" title="LIVE MATCHES" iconColor="#23c55e" />
            {[...contextLive, ...liveMatches].map(m => <LiveCard key={m.id} match={m} />)}
          </View>
        )}

        {/* --- UPCOMING TAB --- */}
        {activeTab === 'UPCOMING' && (
          <View>
            <SectionHeader icon="calendar-month-outline" title="UPCOMING MATCHES" iconColor="#23c55e" />
            {upcomingMatches.map(m => <UpcomingCard key={m.id} match={m} />)}
          </View>
        )}

        {/* --- FOLLOWING TAB --- */}
        {activeTab === 'FOLLOWING' && (
          <View>
             <SubtitledHeader icon="star" title="FOLLOWING MATCHES" subtitle="Matches you follow across all categories" />
             {followingMatches.map(m => <FollowingCard key={m.id} match={m} />)}
          </View>
        )}

        {/* --- COMPLETED TAB --- */}
        {activeTab === 'COMPLETED' && (
          <View>
             <SubtitledHeader icon="trophy-outline" title="COMPLETED MATCHES" subtitle="Past results and completed fixtures" />
             {[...contextCompleted, ...completedMatches].map(m => <CompletedCard key={m.id} match={m} />)}
          </View>
        )}

        {/* --- MY MATCHES TAB --- */}
        {activeTab === 'MY MATCHES' && (
          <View>
             <View className="flex-row justify-between items-start mb-4 mt-2">
               <View>
                 <View className="flex-row items-center">
                   <MaterialCommunityIcons name="account" size={20} color="#23c55e" className="mr-2" />
                   <Text className="text-xs font-bold tracking-widest text-white">MY MATCHES</Text>
                 </View>
                 <Text className="text-[#888888] text-xs mt-1">Matches you're part of</Text>
               </View>
               <TouchableOpacity className="flex-row items-center">
                 <Text className="text-[#23c55e] text-xs mr-1">Filter</Text>
                 <Feather name="sliders" size={14} color="#23c55e" />
               </TouchableOpacity>
             </View>

             {playingMatches.map(m => <MyMatchesSidebarCard key={m.id} match={m} />)}

             <View className="mt-3 mb-4">
               <View className="flex-row items-center">
                 <MaterialCommunityIcons name="shield-check" size={18} color="#23c55e" className="mr-2" />
                 <Text className="text-xs font-bold tracking-widest text-white">ORGANIZING ({organizingMatches.length})</Text>
               </View>
               <Text className="text-[#888888] text-[11px] mt-1">Matches you are organizing or managing</Text>
             </View>
             
             {organizingMatches.map(m => <MyMatchesRoleCard key={m.id} match={m} />)}

             <View className="mt-3 mb-4">
               <View className="flex-row items-center">
                 <MaterialCommunityIcons name="clipboard-check" size={18} color="#23c55e" className="mr-2" />
                 <Text className="text-xs font-bold tracking-widest text-white">SCORING ({scoringMatches.length})</Text>
               </View>
               <Text className="text-[#888888] text-[11px] mt-1">Matches where you are scoring</Text>
             </View>
             
             {scoringMatches.map(m => <MyMatchesRoleCard key={m.id} match={m} />)}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}