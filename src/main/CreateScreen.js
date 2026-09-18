import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Added MaterialIcons here to fix the crash!
import { Feather, MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'; 
import { useMatches } from '../context/MatchContext';

const { width } = Dimensions.get('window');

const theme = {
  bg: '#0a0a0a',
  card: '#121212',
  cardLight: '#1a1a1a',
  primary: '#23c55e',
  primaryDark: 'rgba(35, 197, 94, 0.15)',
  text: '#ffffff',
  subText: '#888888',
  border: '#222222',
};

// ==========================================
// MOCK DATA
// ==========================================
const TEAM_A = { name: 'Falcons CC', logo: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff' };
const TEAM_B = { name: 'Warriors XI', logo: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff' };

const PLAYERS_A = [
  { id: '1', name: 'Rohit Sharma (C)', role: 'Batter', img: 'https://ui-avatars.com/api/?name=RS&background=222&color=fff' },
  { id: '2', name: 'Arjun Reddy', role: 'All Rounder', img: 'https://ui-avatars.com/api/?name=AR&background=222&color=fff' },
  { id: '3', name: 'Vikram Singh', role: 'Batter', img: 'https://ui-avatars.com/api/?name=VS&background=222&color=fff' },
  { id: '4', name: 'Karthik Nair', role: 'WK Batter', img: 'https://ui-avatars.com/api/?name=KN&background=222&color=fff' },
];

// Added { navigation } prop to switch tabs at the end
export default function CreateScreen({ navigation }) {
  // State Machine: 0 = Hub, 1-7 = Flow Steps
  const [activeStep, setActiveStep] = useState(0);

  // Form State
  const [matchFormat, setMatchFormat] = useState('T20');
  const [matchType, setMatchType] = useState('Competitive');
  const [tossWinner, setTossWinner] = useState('A'); // Defaulted to avoid null errors
  const [tossDecision, setTossDecision] = useState('Bat');

  // Pull in our Global Store function
  const { addMatch } = useMatches();

  // Function to save the match and move to the live screen
  const handleStartMatch = () => {
    const newMatchData = {
      teamA: TEAM_A.name,
      teamB: TEAM_B.name,
      format: matchFormat,
      type: matchType,
      tossWinner: tossWinner === 'A' ? TEAM_A.name : TEAM_B.name,
      decision: tossDecision,
      status: 'Live',
      date: new Date().toLocaleDateString(),
    };

    // Fire it into the global store!
    addMatch(newMatchData);

    // Transition to the final "Match Started" screen
    setActiveStep(7);
  };

  // ==========================================
  // SHARED COMPONENTS
  // ==========================================
  const FlowHeader = ({ title, step, totalSteps }) => (
    <View className="flex-row justify-between items-center px-4 py-3 border-b border-[#222222]">
      <TouchableOpacity onPress={() => setActiveStep(activeStep > 0 ? activeStep - 1 : 0)} className="p-1">
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>
      <View className="items-center">
        <Text className="text-white text-base font-bold">{title}</Text>
        {step > 0 && <Text className="text-[#888888] text-[11px] mt-0.5 mb-2">Step {step} of {totalSteps}</Text>}
        {step > 0 && (
          <View className="w-[100px] h-1 bg-[#222222] rounded overflow-hidden">
            <View className="h-full bg-[#23c55e]" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </View>
        )}
      </View>
      <TouchableOpacity className="p-1">
        <Feather name="arrow-right" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  const PrimaryButton = ({ title, onPress }) => (
    <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#222222]">
      <TouchableOpacity className="bg-[#23c55e] py-4 rounded-xl items-center" onPress={onPress}>
        <Text className="text-black text-[15px] font-bold">{title}</Text>
      </TouchableOpacity>
    </View>
  );

  // ==========================================
  // STEP 0: CREATE HUB
  // ==========================================
  const renderHub = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="px-4 pt-4 pb-6">
        <View className="flex-row items-center mb-1">
          <MaterialCommunityIcons name="alpha-p-box" size={32} color={theme.primary} style={{ marginRight: 8 }} />
          <Text className="text-white text-[32px] font-bold">Create</Text>
        </View>
        <Text className="text-[#888888] text-sm">Build, organize, and play</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <TouchableOpacity className="w-full h-[180px] rounded-2xl overflow-hidden mb-4" onPress={() => setActiveStep(1)} activeOpacity={0.9}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }} className="w-full h-full opacity-70" />
          <View className="absolute top-0 left-0 right-0 bottom-0 p-5 justify-between">
            <View>
              <Text className="text-white text-2xl font-bold mb-1">Create Match</Text>
              <Text className="text-[#e0e0e0] text-[13px]">Set up a cricket match</Text>
            </View>
            <View className="w-10 h-10 rounded-full bg-[#23c55e] items-center justify-center self-end">
              <Feather name="arrow-right" size={20} color="#000" />
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row justify-between mb-4">
          <TouchableOpacity className="bg-[#121212] rounded-2xl p-4 border border-[#222222]" style={{ width: (width - 48) / 2 }}>
            <MaterialCommunityIcons name="account-group" size={28} color={theme.primary} className="mb-3" />
            <Text className="text-white text-[15px] font-bold mb-1">Create Team</Text>
            <Text className="text-[#888888] text-[11px] leading-4">Build your team and invite players</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#121212] rounded-2xl p-4 border border-[#222222]" style={{ width: (width - 48) / 2 }}>
            <Ionicons name="trophy" size={28} color="#f1c40f" className="mb-3" />
            <Text className="text-white text-[15px] font-bold mb-1">Create Tournament</Text>
            <Text className="text-[#888888] text-[11px] leading-4">Organize a tournament or league</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity className="bg-[#121212] rounded-2xl p-4 border border-[#222222]" style={{ width: (width - 48) / 2 }}>
            <Feather name="edit" size={28} color={theme.text} className="mb-3" />
            <Text className="text-white text-[15px] font-bold mb-1">Create Post</Text>
            <Text className="text-[#888888] text-[11px] leading-4">Share moments with the community</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#121212] rounded-2xl p-4 border border-[#222222]" style={{ width: (width - 48) / 2 }}>
            <Feather name="calendar" size={28} color={theme.primary} className="mb-3" />
            <Text className="text-white text-[15px] font-bold mb-1">Create Event</Text>
            <Text className="text-[#888888] text-[11px] leading-4">Plan an event or sports meetup</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity className="flex-row items-center justify-between bg-[#1a1a1a] rounded-2xl p-4 border border-[#222222]">
          <View className="flex-row items-center">
            <Ionicons name="flash" size={24} color="#f1c40f" style={{ marginRight: 12 }} />
            <View>
              <Text className="text-white text-base font-bold mb-0.5">Play Now</Text>
              <Text className="text-[#888888] text-xs">Find or start a game quickly</Text>
            </View>
          </View>
          <View className="w-10 h-10 rounded-full bg-[#23c55e] items-center justify-center self-end">
            <Feather name="arrow-right" size={20} color="#000" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // ==========================================
  // STEP 1: MATCH DETAILS
  // ==========================================
  const renderStep1 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Create Match" step={1} totalSteps={5} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Match Details</Text>
        <Text className="text-[#888888] text-[13px] mb-6">Fill in the basic information</Text>

        <TouchableOpacity className="flex-row justify-between items-center bg-[#121212] border border-[#222222] rounded-xl p-4 mb-4">
          <View><Text className="text-white text-sm font-bold mb-1">Team A</Text><Text className="text-[#888888] text-xs">Select or create team</Text></View>
          <Feather name="chevron-down" size={20} color={theme.subText} />
        </TouchableOpacity>
        <TouchableOpacity className="flex-row justify-between items-center bg-[#121212] border border-[#222222] rounded-xl p-4 mb-4">
          <View><Text className="text-white text-sm font-bold mb-1">Team B</Text><Text className="text-[#888888] text-xs">Select or create team</Text></View>
          <Feather name="chevron-down" size={20} color={theme.subText} />
        </TouchableOpacity>

        <Text className="text-white text-sm font-bold mb-3 mt-2">Match Format</Text>
        <View className="flex-row flex-wrap mb-4">
          {['T10', 'T20', 'ODI', 'Custom'].map(fmt => (
            <TouchableOpacity 
              key={fmt} 
              onPress={() => setMatchFormat(fmt)} 
              className={`border px-4 py-2 rounded-full mr-2.5 mb-2.5 ${matchFormat === fmt ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
            >
              <Text className={`text-[13px] font-semibold ${matchFormat === fmt ? 'text-[#23c55e]' : 'text-white'}`}>{fmt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-white text-sm font-bold mb-3 mt-2">Match Type</Text>
        <View className="flex-row flex-wrap mb-4">
          {['Competitive', 'Friendly', 'Practice'].map(type => (
            <TouchableOpacity 
              key={type} 
              onPress={() => setMatchType(type)} 
              className={`border px-4 py-2 rounded-full mr-2.5 mb-2.5 ${matchType === type ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
            >
              <Text className={`text-[13px] font-semibold ${matchType === type ? 'text-[#23c55e]' : 'text-white'}`}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-[#121212] rounded-xl border border-[#222222] mt-3">
          <TouchableOpacity className="flex-row justify-between items-center p-4 border-b border-[#222222]"><Text className="text-white text-sm">Venue</Text><View className="flex-row items-center"><Text className="text-[#888888] text-[13px] mr-2">Select venue</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center p-4 border-b border-[#222222]"><Text className="text-white text-sm">Date</Text><View className="flex-row items-center"><Text className="text-[#888888] text-[13px] mr-2">Select date</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center p-4 border-b border-[#222222]"><Text className="text-white text-sm">Time</Text><View className="flex-row items-center"><Text className="text-[#888888] text-[13px] mr-2">Select time</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center p-4 border-b border-[#222222]"><Text className="text-white text-sm">Overs</Text><View className="flex-row items-center"><Text className="text-[#888888] text-[13px] mr-2">20 Overs</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center p-4 border-b border-[#222222]"><Text className="text-white text-sm">Players / Squads</Text><View className="flex-row items-center"><Text className="text-[#888888] text-[13px] mr-2">Select players</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity className="flex-row justify-between items-center p-4"><Text className="text-white text-sm">Match Rules</Text><View className="flex-row items-center"><Text className="text-[#888888] text-[13px] mr-2">Set match rules</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue" onPress={() => setActiveStep(2)} />
    </View>
  );

  // ==========================================
  // STEP 2: MATCH SETUP (Review)
  // ==========================================
  const renderStep2 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Create Match" step={2} totalSteps={5} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Match Setup</Text>
        <Text className="text-[#888888] text-[13px] mb-6">Review and confirm match details</Text>

        <View className="flex-row justify-between items-center bg-[#121212] rounded-2xl p-6 border border-[#222222] mb-6">
          <View className="items-center flex-1">
            <Image source={{uri: TEAM_A.logo}} className="w-[70px] h-[70px] rounded-full bg-[#1a1a1a] mb-3" />
            <Text className="text-white text-sm font-bold text-center">{TEAM_A.name}</Text>
          </View>
          <Text className="text-[#888888] text-base font-bold mx-4">VS</Text>
          <View className="items-center flex-1">
            <Image source={{uri: TEAM_B.logo}} className="w-[70px] h-[70px] rounded-full bg-[#1a1a1a] mb-3" />
            <Text className="text-white text-sm font-bold text-center">{TEAM_B.name}</Text>
          </View>
        </View>

        <View className="w-full">
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Format</Text><Text className="text-white text-[13px] font-bold">{matchFormat}</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Match Type</Text><Text className="text-white text-[13px] font-bold">{matchType}</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Venue</Text><Text className="text-white text-[13px] font-bold text-right flex-1 pl-5">Rajiv Cricket Ground, Hyderabad</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Date</Text><Text className="text-white text-[13px] font-bold">18 May 2026</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Time</Text><Text className="text-white text-[13px] font-bold">04:00 PM</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Overs</Text><Text className="text-white text-[13px] font-bold">20 Overs</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Players</Text><Text className="text-white text-[13px] font-bold">11 vs 11</Text></View>
          <View className="flex-row justify-between py-3.5"><Text className="text-[#888888] text-[13px]">Match Rules</Text><Text className="text-white text-[13px] font-bold">Standard Cricket Rules</Text></View>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue to Toss" onPress={() => setActiveStep(3)} />
    </View>
  );

  // ==========================================
  // STEP 3: TOSS (Fixed duplicates and Icons)
  // ==========================================
  const renderStep3 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Create Match" step={3} totalSteps={5} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Toss</Text>
        <Text className="text-[#888888] text-[13px] mb-6">Select the team that won the toss</Text>

        <View className="flex-row justify-between">
          <TouchableOpacity 
            className={`w-[48%] border rounded-xl p-6 items-center ${tossWinner === 'A' ? 'border-[#23c55e] bg-[#23c55e]/15' : 'bg-[#121212] border-[#222222]'}`} 
            onPress={() => setTossWinner('A')}
          >
            <Image source={{uri: TEAM_A.logo}} className="w-[60px] h-[60px] rounded-full mb-3" />
            <Text className="text-white text-sm font-bold text-center">{TEAM_A.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`w-[48%] border rounded-xl p-6 items-center ${tossWinner === 'B' ? 'border-[#23c55e] bg-[#23c55e]/15' : 'bg-[#121212] border-[#222222]'}`} 
            onPress={() => setTossWinner('B')}
          >
            <Image source={{uri: TEAM_B.logo}} className="w-[60px] h-[60px] rounded-full mb-3" />
            <Text className="text-white text-sm font-bold text-center">{TEAM_B.name}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white text-[22px] font-bold mb-1 mt-6">Decision</Text>
        <Text className="text-[#888888] text-[13px] mb-6">What would you like to do?</Text>

        <View className="flex-row justify-between">
          <TouchableOpacity 
            className={`w-[48%] border rounded-xl p-4 items-center ${tossDecision === 'Bat' ? 'border-[#23c55e] bg-[#23c55e]/15' : 'bg-[#121212] border-[#222222]'}`} 
            onPress={() => setTossDecision('Bat')}
          >
            <MaterialIcons name="sports-cricket" size={24} color={tossDecision === 'Bat' ? theme.primary : theme.text} style={{ marginBottom: 8 }} />
            <Text className={`text-sm font-bold ${tossDecision === 'Bat' ? 'text-[#23c55e]' : 'text-white'}`}>Bat First</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`w-[48%] border rounded-xl p-4 items-center ${tossDecision === 'Bowl' ? 'border-[#23c55e] bg-[#23c55e]/15' : 'bg-[#121212] border-[#222222]'}`} 
            onPress={() => setTossDecision('Bowl')}
          >
            <Ionicons name="tennisball-outline" size={24} color={tossDecision === 'Bowl' ? theme.primary : theme.text} style={{ marginBottom: 8 }} />
            <Text className={`text-sm font-bold ${tossDecision === 'Bowl' ? 'text-[#23c55e]' : 'text-white'}`}>Bowl First</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue" onPress={() => setActiveStep(4)} />
    </View>
  );

  // ==========================================
  // STEP 4: PLAYING XI
  // ==========================================
  const renderStep4 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Create Match" step={4} totalSteps={5} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Playing XI</Text>
        <Text className="text-[#888888] text-[13px] mb-6">Select playing eleven for both teams</Text>

        <View className="bg-[#121212] border border-[#23c55e] rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4 border-b border-[#222222] pb-3">
            <View className="flex-row items-center">
              <Image source={{uri: TEAM_A.logo}} className="w-7 h-7 rounded-full mr-2.5" />
              <Text className="text-white text-[15px] font-bold">{TEAM_A.name}</Text>
            </View>
            <Text className="text-[#23c55e] text-xs font-bold">8 / 11 selected</Text>
          </View>
          {PLAYERS_A.map(p => (
            <View key={p.id} className="flex-row items-center mb-4">
              <Image source={{uri: p.img}} className="w-9 h-9 rounded-full mr-3" />
              <View className="flex-1">
                <Text className="text-white text-sm font-semibold">{p.name}</Text>
                <Text className="text-[#888888] text-[11px] mt-0.5">{p.role}</Text>
              </View>
              <Feather name="check-circle" size={20} color={theme.primary} />
            </View>
          ))}
          <TouchableOpacity className="flex-row items-center py-2">
            <Feather name="plus" size={16} color={theme.primary} style={{ marginRight: 8 }} />
            <Text className="text-[#23c55e] text-[13px] font-bold">Add more players</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-[#121212] border border-[#222222] rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4 border-b border-[#222222] pb-3">
            <View className="flex-row items-center">
              <Image source={{uri: TEAM_B.logo}} className="w-7 h-7 rounded-full mr-2.5" />
              <Text className="text-white text-[15px] font-bold">{TEAM_B.name}</Text>
            </View>
            <Text className="text-[#f1c40f] text-xs font-bold">7 / 11 selected</Text>
          </View>
          {PLAYERS_A.slice(0,2).map(p => (
            <View key={p.id} className="flex-row items-center mb-4">
              <Image source={{uri: p.img}} className="w-9 h-9 rounded-full mr-3" />
              <View className="flex-1"><Text className="text-white text-sm font-semibold">Manoj Kumar (C)</Text><Text className="text-[#888888] text-[11px] mt-0.5">All Rounder</Text></View>
              <Feather name="check-circle" size={20} color={theme.primary} />
            </View>
          ))}
          <TouchableOpacity className="flex-row items-center py-2">
            <Feather name="plus" size={16} color={theme.primary} style={{ marginRight: 8 }} />
            <Text className="text-[#23c55e] text-[13px] font-bold">Add more players</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue" onPress={() => setActiveStep(5)} />
    </View>
  );

  // ==========================================
  // STEP 5: OPENING PLAYERS
  // ==========================================
  const renderStep5 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Create Match" step={5} totalSteps={5} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Opening Players</Text>
        <Text className="text-[#888888] text-[13px] mb-6">Set the opening batter and bowler</Text>

        <Text className="text-[#23c55e] text-sm font-bold mb-3">Select Opening Batters</Text>
        
        <View className="flex-row items-center bg-[#121212] border border-[#222222] rounded-xl p-3 mb-3">
          <Text className="text-[#888888] text-sm font-bold w-5">1.</Text>
          <Image source={{uri: PLAYERS_A[1].img}} className="w-8 h-8 rounded-full mx-3" />
          <Text className="text-white text-sm font-semibold flex-1">{PLAYERS_A[1].name}</Text>
          <View className="flex-row items-center">
            <Text className="text-[#888888] text-[11px] mr-2">RHB</Text>
            <Feather name="chevron-down" size={16} color={theme.subText} />
          </View>
        </View>
        <View className="flex-row items-center bg-[#121212] border border-[#222222] rounded-xl p-3 mb-3">
          <Text className="text-[#888888] text-sm font-bold w-5">2.</Text>
          <Image source={{uri: PLAYERS_A[2].img}} className="w-8 h-8 rounded-full mx-3" />
          <Text className="text-white text-sm font-semibold flex-1">{PLAYERS_A[2].name}</Text>
          <View className="flex-row items-center">
            <Text className="text-[#888888] text-[11px] mr-2">LHB</Text>
            <Feather name="chevron-down" size={16} color={theme.subText} />
          </View>
        </View>

        <Text className="text-[#23c55e] text-sm font-bold mb-3 mt-6">Select Opening Bowler</Text>
        <View className="flex-row items-center bg-[#121212] border border-[#222222] rounded-xl p-3 mb-3">
          <Text className="text-[#888888] text-sm font-bold w-5">1.</Text>
          <Image source={{uri: PLAYERS_A[0].img}} className="w-8 h-8 rounded-full mx-3" />
          <Text className="text-white text-sm font-semibold flex-1">Manoj Kumar</Text>
          <View className="flex-row items-center">
            <Text className="text-[#888888] text-[11px] mr-2">RFM</Text>
            <Feather name="chevron-down" size={16} color={theme.subText} />
          </View>
        </View>
      </ScrollView>
      <PrimaryButton title="Start Scoring" onPress={() => setActiveStep(6)} />
    </View>
  );

  // ==========================================
  // STEP 6: MATCH CONFIRMATION
  // ==========================================
  const renderStep6 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Start Match" step={0} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8, alignItems: 'center' }}>
        
        <View className="w-20 h-20 rounded-full bg-[#23c55e]/15 border-2 border-[#23c55e] items-center justify-center mt-6 mb-4">
          <Feather name="check" size={40} color={theme.primary} />
        </View>
        <Text className="text-white text-2xl font-bold mb-2">Match is Ready!</Text>
        <Text className="text-[#888888] text-sm">Everything looks good.</Text>

        <View className="flex-row justify-between items-center bg-[#121212] rounded-2xl border border-[#222222] mt-8 mb-8 px-8 py-6 w-full">
          <View className="items-center flex-1">
            <Image source={{uri: TEAM_A.logo}} className="w-12 h-12 rounded-full mb-2" />
            <Text className="text-white text-xs font-bold text-center">{TEAM_A.name}</Text>
          </View>
          <Text className="text-[#888888] text-xs font-bold mx-6">VS</Text>
          <View className="items-center flex-1">
            <Image source={{uri: TEAM_B.logo}} className="w-12 h-12 rounded-full mb-2" />
            <Text className="text-white text-xs font-bold text-center">{TEAM_B.name}</Text>
          </View>
        </View>

        <View className="w-full">
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Format</Text><Text className="text-white text-[13px] font-bold">{matchFormat}</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Venue</Text><Text className="text-white text-[13px] font-bold text-right flex-1 pl-5">Rajiv Cricket Ground, Hyderabad</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Date & Time</Text><Text className="text-white text-[13px] font-bold">18 May 2026, 04:00 PM</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Overs</Text><Text className="text-white text-[13px] font-bold">20 Overs</Text></View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]"><Text className="text-[#888888] text-[13px]">Toss</Text><Text className="text-white text-[13px] font-bold">{tossWinner === 'A' ? TEAM_A.name : TEAM_B.name} won the toss</Text></View>
          <View className="flex-row justify-between py-3.5"><Text className="text-[#888888] text-[13px]">Decision</Text><Text className="text-white text-[13px] font-bold">{tossDecision} First</Text></View>
        </View>
      </ScrollView>
      {/* WIRED UP THE START BUTTON */}
      <PrimaryButton title="Start Match & Begin Scoring" onPress={handleStartMatch} />
    </View>
  );

  // ==========================================
  // STEP 7: LIVE MATCH STARTED
  // ==========================================
  const renderStep7 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Match Started" step={0} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        
        <View className="items-center mb-6">
          <Text className="text-white text-2xl font-bold mb-2">Let's begin the game!</Text>
          <View className="bg-[#e74c3c] px-2.5 py-1 rounded"><Text className="text-white text-[10px] font-bold tracking-widest">LIVE</Text></View>
        </View>

        <View className="bg-[#121212] rounded-2xl border border-[#222222] p-6 mb-6">
          <View className="flex-row justify-between items-center mb-6">
            <View className="items-center">
              <Image source={{uri: TEAM_A.logo}} className="w-[70px] h-[70px] rounded-full bg-[#1a1a1a] mb-3" />
              <Text className="text-white text-[32px] font-bold mt-3 mb-1">0/0</Text>
              <Text className="text-[#888888] text-[13px]">0.0 Overs</Text>
            </View>
            <Text className="text-[#888888] text-base font-bold mx-4">VS</Text>
            <View className="items-center">
              <Image source={{uri: TEAM_B.logo}} className="w-[70px] h-[70px] rounded-full bg-[#1a1a1a] mb-3" />
              <Text className="text-white text-sm font-bold text-center mt-3">{TEAM_B.name}</Text>
            </View>
          </View>
          <View className="border-t border-[#222222] pt-4 items-center">
            <Text className="text-white text-xs font-medium">{tossWinner === 'A' ? TEAM_A.name : TEAM_B.name} won the toss and elected to {tossDecision}</Text>
          </View>
        </View>

        <Text className="text-white text-sm font-bold mb-3">Next Up</Text>
        <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4">
          <View className="flex-row items-center mb-3">
            <Text className="text-[#888888] text-[11px] w-[60px]">On Strike</Text>
            <Image source={{uri: PLAYERS_A[1].img}} className="w-7 h-7 rounded-full mx-3" />
            <Text className="text-white text-[13px] font-semibold flex-1">{PLAYERS_A[1].name}</Text>
            <Text className="text-white text-[13px] font-bold">0 (0)</Text>
          </View>
          <View className="flex-row items-center mb-3 border-b border-[#222222] pb-4">
            <Text className="text-transparent text-[11px] w-[60px]">On Strike</Text>
            <Image source={{uri: PLAYERS_A[2].img}} className="w-7 h-7 rounded-full mx-3" />
            <Text className="text-white text-[13px] font-semibold flex-1">{PLAYERS_A[2].name}</Text>
            <Text className="text-white text-[13px] font-bold">0 (0)</Text>
          </View>
          <View className="flex-row items-center pt-4">
            <Text className="text-[#888888] text-[11px] w-[60px]">Bowler</Text>
            <Image source={{uri: PLAYERS_A[0].img}} className="w-7 h-7 rounded-full mx-3" />
            <Text className="text-white text-[13px] font-semibold flex-1">Manoj Kumar</Text>
            <Text className="text-white text-[13px] font-bold">0-0 (0.0)</Text>
          </View>
        </View>
      </ScrollView>
      {/* WIRED UP THE NAVIGATION BUTTON */}
      <PrimaryButton 
        title="Go to Live Scoring" 
        onPress={() => {
          setActiveStep(0);
          navigation.navigate('Matches');
        }} 
      />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {activeStep === 0 && renderHub()}
      {activeStep === 1 && renderStep1()}
      {activeStep === 2 && renderStep2()}
      {activeStep === 3 && renderStep3()}
      {activeStep === 4 && renderStep4()}
      {activeStep === 5 && renderStep5()}
      {activeStep === 6 && renderStep6()}
      {activeStep === 7 && renderStep7()}
    </SafeAreaView>
  );
}