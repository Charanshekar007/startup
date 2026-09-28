import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useMatches } from '../context/MatchContext';
import {
  TEAM_A_DEFAULT,
  TEAM_B_DEFAULT,
  SQUAD_A,
  SQUAD_B,
} from '../data/cricketSquads';

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

export default function CreateScreen({ navigation }) {
  // State Machine: 0 = Hub, 1 = Details, 2 = Setup (Review), 3 = Toss, 4 = Playing XI, 5 = Opening Players, 6 = Match Ready, 7 = Live Preview
  const [activeStep, setActiveStep] = useState(0);

  // Teams State
  const [teamA, setTeamA] = useState(TEAM_A_DEFAULT);
  const [teamB, setTeamB] = useState(TEAM_B_DEFAULT);

  // Match Configuration State
  const [matchFormat, setMatchFormat] = useState('T20'); // 'T10' | 'T20' | 'ODI' | 'Custom'
  const [oversPerInnings, setOversPerInnings] = useState(20);
  const [customOversInput, setCustomOversInput] = useState('20');
  const [showCustomOversModal, setShowCustomOversModal] = useState(false);

  const [matchType, setMatchType] = useState('Competitive'); // 'Competitive' | 'Friendly' | 'Practice'
  const [venue, setVenue] = useState('Rajiv Cricket Ground, Hyderabad');
  const [matchDate, setMatchDate] = useState('18 May 2026');
  const [matchTime, setMatchTime] = useState('04:00 PM');
  const [matchRules, setMatchRules] = useState('Standard Cricket Rules');

  // Edit Detail Modals
  const [editingField, setEditingField] = useState(null); // 'venue' | 'date' | 'time' | 'rules' | 'teamA' | 'teamB'
  const [editValue, setEditValue] = useState('');

  // Toss State
  const [tossWinner, setTossWinner] = useState('A'); // 'A' | 'B'
  const [tossDecision, setTossDecision] = useState('Bat'); // 'Bat' | 'Bowl'

  // Playing XI Selection State (Ids of selected players)
  const [selectedXI_A, setSelectedXI_A] = useState(SQUAD_A.slice(0, 11).map((p) => p.id));
  const [selectedXI_B, setSelectedXI_B] = useState(SQUAD_B.slice(0, 11).map((p) => p.id));

  // Opening Players State
  const [strikerId, setStrikerId] = useState(null);
  const [nonStrikerId, setNonStrikerId] = useState(null);
  const [openingBowlerId, setOpeningBowlerId] = useState(null);
  const [wicketkeeperId, setWicketkeeperId] = useState(null);

  // Player Picker Modal State
  const [pickerConfig, setPickerConfig] = useState(null); // { title, role, team, players, currentId, onSelect }

  // Global Match Store
  const { addMatch, setActiveMatch } = useMatches();

  // Update overs whenever format changes
  const handleSelectFormat = (fmt) => {
    setMatchFormat(fmt);
    if (fmt === 'T10') {
      setOversPerInnings(10);
    } else if (fmt === 'T20') {
      setOversPerInnings(20);
    } else if (fmt === 'ODI') {
      setOversPerInnings(50);
    } else if (fmt === 'Custom') {
      setShowCustomOversModal(true);
    }
  };

  const handleSaveCustomOvers = () => {
    const val = parseInt(customOversInput, 10);
    if (!val || val <= 0) {
      Alert.alert('Invalid Overs', 'Please enter a valid number of overs greater than 0.');
      return;
    }
    setOversPerInnings(val);
    setShowCustomOversModal(false);
  };

  // Determine Batting and Bowling Teams based on Toss
  const winnerTeam = tossWinner === 'A' ? teamA : teamB;
  const loserTeam = tossWinner === 'A' ? teamB : teamA;
  const firstInningsBattingTeam = tossDecision === 'Bat' ? winnerTeam : loserTeam;
  const firstInningsBowlingTeam = tossDecision === 'Bat' ? loserTeam : winnerTeam;

  const battingSquad = firstInningsBattingTeam.id === teamA.id ? SQUAD_A : SQUAD_B;
  const bowlingSquad = firstInningsBowlingTeam.id === teamA.id ? SQUAD_A : SQUAD_B;
  const battingXI_Ids = firstInningsBattingTeam.id === teamA.id ? selectedXI_A : selectedXI_B;
  const bowlingXI_Ids = firstInningsBowlingTeam.id === teamA.id ? selectedXI_A : selectedXI_B;

  const battingXIPlayers = battingSquad.filter((p) => battingXI_Ids.includes(p.id));
  const bowlingXIPlayers = bowlingSquad.filter((p) => bowlingXI_Ids.includes(p.id));

  // Auto-initialize opening players when reaching Step 5
  useEffect(() => {
    if (activeStep === 5) {
      if (battingXIPlayers.length >= 2) {
        if (!strikerId || !battingXI_Ids.includes(strikerId)) {
          setStrikerId(battingXIPlayers[0].id);
        }
        if (!nonStrikerId || !battingXI_Ids.includes(nonStrikerId) || nonStrikerId === battingXIPlayers[0].id) {
          setNonStrikerId(battingXIPlayers[1].id);
        }
      }
      if (bowlingXIPlayers.length >= 1) {
        // Find best bowler
        const defaultBowler = bowlingXIPlayers.find((p) => p.role.includes('Bowler')) || bowlingXIPlayers[bowlingXIPlayers.length - 1];
        if (!openingBowlerId || !bowlingXI_Ids.includes(openingBowlerId)) {
          setOpeningBowlerId(defaultBowler.id);
        }
        // Find best keeper
        const defaultKeeper = bowlingXIPlayers.find((p) => p.role.includes('WK')) || bowlingXIPlayers[0];
        if (!wicketkeeperId || !bowlingXI_Ids.includes(wicketkeeperId)) {
          setWicketkeeperId(defaultKeeper.id);
        }
      }
    }
  }, [activeStep, firstInningsBattingTeam.id, selectedXI_A, selectedXI_B]);

  // Player toggle for Playing XI
  const togglePlayerXI_A = (id) => {
    if (selectedXI_A.includes(id)) {
      if (selectedXI_A.length <= 1) {
        Alert.alert('Playing XI', 'You must have at least 1 player selected.');
        return;
      }
      setSelectedXI_A(selectedXI_A.filter((pId) => pId !== id));
    } else {
      if (selectedXI_A.length >= 11) {
        Alert.alert('Playing XI Limit', 'You have already selected 11 players for ' + teamA.name + '. Deselect a player first.');
        return;
      }
      setSelectedXI_A([...selectedXI_A, id]);
    }
  };

  const togglePlayerXI_B = (id) => {
    if (selectedXI_B.includes(id)) {
      if (selectedXI_B.length <= 1) {
        Alert.alert('Playing XI', 'You must have at least 1 player selected.');
        return;
      }
      setSelectedXI_B(selectedXI_B.filter((pId) => pId !== id));
    } else {
      if (selectedXI_B.length >= 11) {
        Alert.alert('Playing XI Limit', 'You have already selected 11 players for ' + teamB.name + '. Deselect a player first.');
        return;
      }
      setSelectedXI_B([...selectedXI_B, id]);
    }
  };

  // Validate Playing XI
  const handleValidatePlayingXI = () => {
    if (selectedXI_A.length !== 11) {
      Alert.alert(
        'Incomplete Playing XI',
        `Please select exactly 11 players for ${teamA.name}. Currently selected: ${selectedXI_A.length}/11.`
      );
      return;
    }
    if (selectedXI_B.length !== 11) {
      Alert.alert(
        'Incomplete Playing XI',
        `Please select exactly 11 players for ${teamB.name}. Currently selected: ${selectedXI_B.length}/11.`
      );
      return;
    }
    setActiveStep(5);
  };

  // Validate Opening Players
  const handleValidateOpeningPlayers = () => {
    if (!strikerId || !nonStrikerId) {
      Alert.alert('Select Batters', 'Please select both opening batters.');
      return;
    }
    if (strikerId === nonStrikerId) {
      Alert.alert('Duplicate Batter', 'Striker and Non-striker must be different players.');
      return;
    }
    if (!openingBowlerId) {
      Alert.alert('Select Bowler', 'Please select the opening bowler.');
      return;
    }
    if (!wicketkeeperId) {
      Alert.alert('Select Wicketkeeper', 'Please select the wicketkeeper.');
      return;
    }
    setActiveStep(6);
  };

  // Build match data and start game
  const handleStartMatch = () => {
    const strikerPlayer = battingXIPlayers.find((p) => p.id === strikerId) || battingXIPlayers[0];
    const nonStrikerPlayer = battingXIPlayers.find((p) => p.id === nonStrikerId) || battingXIPlayers[1];
    const openingBowler = bowlingXIPlayers.find((p) => p.id === openingBowlerId) || bowlingXIPlayers[bowlingXIPlayers.length - 1];
    const wicketkeeper = bowlingXIPlayers.find((p) => p.id === wicketkeeperId) || bowlingXIPlayers[0];

    const newMatchData = {
      id: `match_${Date.now()}`,
      teamA: teamA.name,
      teamB: teamB.name,
      teamAObj: teamA,
      teamBObj: teamB,
      format: matchFormat,
      type: matchType,
      venue,
      date: matchDate,
      time: matchTime,
      oversPerInnings,
      tossWinner: winnerTeam.name,
      decision: tossDecision,
      firstInningsBattingTeam: firstInningsBattingTeam.name,
      firstInningsBowlingTeam: firstInningsBowlingTeam.name,
      playingXI_A: SQUAD_A.filter((p) => selectedXI_A.includes(p.id)),
      playingXI_B: SQUAD_B.filter((p) => selectedXI_B.includes(p.id)),
      firstInningsSetup: {
        striker: { ...strikerPlayer, runs: 0, balls: 0, fours: 0, sixes: 0 },
        nonStriker: { ...nonStrikerPlayer, runs: 0, balls: 0, fours: 0, sixes: 0 },
        bowler: { ...openingBowler, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0 },
        wicketkeeper,
      },
      status: 'Live',
      isFreshMatch: true,
    };

    // Save into global store
    addMatch(newMatchData);
    setActiveMatch(newMatchData);

    // Reset create flow and navigate to Live Scoring
    setActiveStep(0);
    navigation.navigate('LiveScoring', { matchData: newMatchData });
  };

  // ==========================================
  // SHARED COMPONENTS
  // ==========================================
  const FlowHeader = ({ title, step, totalSteps }) => (
    <View className="flex-row justify-between items-center px-4 py-3 border-b border-[#222222]">
      <TouchableOpacity
        onPress={() => setActiveStep(activeStep > 0 ? activeStep - 1 : 0)}
        className="p-1"
      >
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>
      <View className="items-center">
        <Text className="text-white text-base font-bold">{title}</Text>
        {step > 0 && (
          <Text className="text-[#888888] text-[11px] mt-0.5 mb-2">
            Step {step} of {totalSteps}
          </Text>
        )}
        {step > 0 && (
          <View className="w-[100px] h-1 bg-[#222222] rounded overflow-hidden">
            <View
              className="h-full bg-[#23c55e]"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </View>
        )}
      </View>
      <TouchableOpacity
        onPress={() => {
          if (activeStep < 7) setActiveStep(activeStep + 1);
        }}
        className="p-1"
      >
        <Feather name="arrow-right" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  const PrimaryButton = ({ title, onPress, disabled = false }) => (
    <View className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#222222]">
      <TouchableOpacity
        className={`py-4 rounded-xl items-center ${disabled ? 'bg-[#23c55e]/30' : 'bg-[#23c55e]'}`}
        onPress={onPress}
        disabled={disabled}
      >
        <Text className={`text-[15px] font-bold ${disabled ? 'text-[#888888]' : 'text-black'}`}>
          {title}
        </Text>
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
          <MaterialCommunityIcons
            name="alpha-p-box"
            size={32}
            color={theme.primary}
            style={{ marginRight: 8 }}
          />
          <Text className="text-white text-[32px] font-bold">Create</Text>
        </View>
        <Text className="text-[#888888] text-sm">Build, organize, and play</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <TouchableOpacity
          className="w-full h-[180px] rounded-2xl overflow-hidden mb-4"
          onPress={() => setActiveStep(1)}
          activeOpacity={0.9}
        >
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            }}
            className="w-full h-full opacity-70"
          />
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
          <TouchableOpacity
            className="bg-[#121212] rounded-2xl p-4 border border-[#222222]"
            style={{ width: (width - 48) / 2 }}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={28}
              color={theme.primary}
              className="mb-3"
            />
            <Text className="text-white text-[15px] font-bold mb-1">Create Team</Text>
            <Text className="text-[#888888] text-[11px] leading-4">
              Build your team and invite players
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#121212] rounded-2xl p-4 border border-[#222222]"
            style={{ width: (width - 48) / 2 }}
          >
            <Ionicons name="trophy" size={28} color="#f1c40f" className="mb-3" />
            <Text className="text-white text-[15px] font-bold mb-1">Create Tournament</Text>
            <Text className="text-[#888888] text-[11px] leading-4">
              Organize a tournament or league
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className="bg-[#121212] rounded-2xl p-4 border border-[#222222]"
            style={{ width: (width - 48) / 2 }}
          >
            <Feather name="edit" size={28} color={theme.text} className="mb-3" />
            <Text className="text-white text-[15px] font-bold mb-1">Create Post</Text>
            <Text className="text-[#888888] text-[11px] leading-4">
              Share moments with the community
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-[#121212] rounded-2xl p-4 border border-[#222222]"
            style={{ width: (width - 48) / 2 }}
          >
            <Feather name="calendar" size={28} color={theme.primary} className="mb-3" />
            <Text className="text-white text-[15px] font-bold mb-1">Create Event</Text>
            <Text className="text-[#888888] text-[11px] leading-4">
              Plan an event or sports meetup
            </Text>
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
      <FlowHeader title="Create Match" step={1} totalSteps={6} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Match Details</Text>
        <Text className="text-[#888888] text-[13px] mb-6">Fill in the basic information</Text>

        {/* Team A Card */}
        <TouchableOpacity
          onPress={() => {
            setEditingField('teamA');
            setEditValue(teamA.name);
          }}
          className="flex-row justify-between items-center bg-[#121212] border border-[#222222] rounded-xl p-4 mb-4"
        >
          <View className="flex-row items-center flex-1">
            <Image source={{ uri: teamA.logo }} className="w-10 h-10 rounded-full mr-3 bg-[#1a1a1a]" />
            <View>
              <Text className="text-white text-sm font-bold mb-0.5">Team A</Text>
              <Text className="text-[#23c55e] text-xs font-semibold">{teamA.name}</Text>
            </View>
          </View>
          <Feather name="edit-2" size={18} color={theme.subText} />
        </TouchableOpacity>

        {/* Team B Card */}
        <TouchableOpacity
          onPress={() => {
            setEditingField('teamB');
            setEditValue(teamB.name);
          }}
          className="flex-row justify-between items-center bg-[#121212] border border-[#222222] rounded-xl p-4 mb-4"
        >
          <View className="flex-row items-center flex-1">
            <Image source={{ uri: teamB.logo }} className="w-10 h-10 rounded-full mr-3 bg-[#1a1a1a]" />
            <View>
              <Text className="text-white text-sm font-bold mb-0.5">Team B</Text>
              <Text className="text-[#23c55e] text-xs font-semibold">{teamB.name}</Text>
            </View>
          </View>
          <Feather name="edit-2" size={18} color={theme.subText} />
        </TouchableOpacity>

        {/* Match Format */}
        <Text className="text-white text-sm font-bold mb-3 mt-2">Match Format</Text>
        <View className="flex-row flex-wrap mb-4">
          {['T10', 'T20', 'ODI', 'Custom'].map((fmt) => (
            <TouchableOpacity
              key={fmt}
              onPress={() => handleSelectFormat(fmt)}
              className={`border px-4 py-2 rounded-full mr-2.5 mb-2.5 ${
                matchFormat === fmt
                  ? 'bg-[#23c55e]/15 border-[#23c55e]'
                  : 'bg-[#121212] border-[#222222]'
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  matchFormat === fmt ? 'text-[#23c55e]' : 'text-white'
                }`}
              >
                {fmt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Match Type */}
        <Text className="text-white text-sm font-bold mb-3 mt-2">Match Type</Text>
        <View className="flex-row flex-wrap mb-4">
          {['Competitive', 'Friendly', 'Practice'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setMatchType(type)}
              className={`border px-4 py-2 rounded-full mr-2.5 mb-2.5 ${
                matchType === type
                  ? 'bg-[#23c55e]/15 border-[#23c55e]'
                  : 'bg-[#121212] border-[#222222]'
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  matchType === type ? 'text-[#23c55e]' : 'text-white'
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Details */}
        <View className="bg-[#121212] rounded-xl border border-[#222222] mt-3">
          <TouchableOpacity
            onPress={() => {
              setEditingField('venue');
              setEditValue(venue);
            }}
            className="flex-row justify-between items-center p-4 border-b border-[#222222]"
          >
            <Text className="text-white text-sm">Venue</Text>
            <View className="flex-row items-center flex-1 justify-end pl-4">
              <Text className="text-[#888888] text-[13px] mr-2" numberOfLines={1}>
                {venue}
              </Text>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEditingField('date');
              setEditValue(matchDate);
            }}
            className="flex-row justify-between items-center p-4 border-b border-[#222222]"
          >
            <Text className="text-white text-sm">Date</Text>
            <View className="flex-row items-center">
              <Text className="text-[#888888] text-[13px] mr-2">{matchDate}</Text>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEditingField('time');
              setEditValue(matchTime);
            }}
            className="flex-row justify-between items-center p-4 border-b border-[#222222]"
          >
            <Text className="text-white text-sm">Time</Text>
            <View className="flex-row items-center">
              <Text className="text-[#888888] text-[13px] mr-2">{matchTime}</Text>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setCustomOversInput(`${oversPerInnings}`);
              setShowCustomOversModal(true);
            }}
            className="flex-row justify-between items-center p-4 border-b border-[#222222]"
          >
            <Text className="text-white text-sm">Overs Per Innings</Text>
            <View className="flex-row items-center">
              <Text className="text-[#23c55e] text-[13px] font-bold mr-2">
                {oversPerInnings} Overs
              </Text>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </View>
          </TouchableOpacity>

          <View className="flex-row justify-between items-center p-4 border-b border-[#222222]">
            <Text className="text-white text-sm">Players / Squads</Text>
            <View className="flex-row items-center">
              <Text className="text-[#888888] text-[13px] mr-2">11 vs 11</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setEditingField('rules');
              setEditValue(matchRules);
            }}
            className="flex-row justify-between items-center p-4"
          >
            <Text className="text-white text-sm">Match Rules</Text>
            <View className="flex-row items-center">
              <Text className="text-[#888888] text-[13px] mr-2">{matchRules}</Text>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue to Match Setup" onPress={() => setActiveStep(2)} />
    </View>
  );

  // ==========================================
  // STEP 2: MATCH SETUP (Review)
  // ==========================================
  const renderStep2 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Match Setup" step={2} totalSteps={6} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Match Setup</Text>
        <Text className="text-[#888888] text-[13px] mb-6">Review and confirm match details</Text>

        <View className="flex-row justify-between items-center bg-[#121212] rounded-2xl p-6 border border-[#222222] mb-6">
          <View className="items-center flex-1">
            <Image source={{ uri: teamA.logo }} className="w-[70px] h-[70px] rounded-full bg-[#1a1a1a] mb-3" />
            <Text className="text-white text-sm font-bold text-center">{teamA.name}</Text>
          </View>
          <Text className="text-[#888888] text-base font-bold mx-4">VS</Text>
          <View className="items-center flex-1">
            <Image source={{ uri: teamB.logo }} className="w-[70px] h-[70px] rounded-full bg-[#1a1a1a] mb-3" />
            <Text className="text-white text-sm font-bold text-center">{teamB.name}</Text>
          </View>
        </View>

        <View className="w-full">
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]">
            <Text className="text-[#888888] text-[13px]">Format</Text>
            <Text className="text-white text-[13px] font-bold">{matchFormat}</Text>
          </View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]">
            <Text className="text-[#888888] text-[13px]">Match Type</Text>
            <Text className="text-white text-[13px] font-bold">{matchType}</Text>
          </View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]">
            <Text className="text-[#888888] text-[13px]">Venue</Text>
            <Text className="text-white text-[13px] font-bold text-right flex-1 pl-5">{venue}</Text>
          </View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]">
            <Text className="text-[#888888] text-[13px]">Date</Text>
            <Text className="text-white text-[13px] font-bold">{matchDate}</Text>
          </View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]">
            <Text className="text-[#888888] text-[13px]">Time</Text>
            <Text className="text-white text-[13px] font-bold">{matchTime}</Text>
          </View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]">
            <Text className="text-[#888888] text-[13px]">Overs</Text>
            <Text className="text-[#23c55e] text-[13px] font-bold">{oversPerInnings} Overs</Text>
          </View>
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]">
            <Text className="text-[#888888] text-[13px]">Players</Text>
            <Text className="text-white text-[13px] font-bold">11 vs 11</Text>
          </View>
          <View className="flex-row justify-between py-3.5">
            <Text className="text-[#888888] text-[13px]">Match Rules</Text>
            <Text className="text-white text-[13px] font-bold">{matchRules}</Text>
          </View>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue to Toss" onPress={() => setActiveStep(3)} />
    </View>
  );

  // ==========================================
  // STEP 3: TOSS
  // ==========================================
  const renderStep3 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Match Toss" step={3} totalSteps={6} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Toss</Text>
        <Text className="text-[#888888] text-[13px] mb-6">Select the team that won the toss</Text>

        <View className="flex-row justify-between mb-4">
          <TouchableOpacity
            className={`w-[48%] border rounded-xl p-6 items-center ${
              tossWinner === 'A'
                ? 'border-[#23c55e] bg-[#23c55e]/15'
                : 'bg-[#121212] border-[#222222]'
            }`}
            onPress={() => setTossWinner('A')}
          >
            <Image source={{ uri: teamA.logo }} className="w-[60px] h-[60px] rounded-full mb-3" />
            <Text className="text-white text-sm font-bold text-center">{teamA.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`w-[48%] border rounded-xl p-6 items-center ${
              tossWinner === 'B'
                ? 'border-[#23c55e] bg-[#23c55e]/15'
                : 'bg-[#121212] border-[#222222]'
            }`}
            onPress={() => setTossWinner('B')}
          >
            <Image source={{ uri: teamB.logo }} className="w-[60px] h-[60px] rounded-full mb-3" />
            <Text className="text-white text-sm font-bold text-center">{teamB.name}</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white text-[22px] font-bold mb-1 mt-4">Decision</Text>
        <Text className="text-[#888888] text-[13px] mb-6">What did the toss winner elect to do?</Text>

        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className={`w-[48%] border rounded-xl p-4 items-center ${
              tossDecision === 'Bat'
                ? 'border-[#23c55e] bg-[#23c55e]/15'
                : 'bg-[#121212] border-[#222222]'
            }`}
            onPress={() => setTossDecision('Bat')}
          >
            <MaterialIcons
              name="sports-cricket"
              size={24}
              color={tossDecision === 'Bat' ? theme.primary : theme.text}
              style={{ marginBottom: 8 }}
            />
            <Text
              className={`text-sm font-bold ${
                tossDecision === 'Bat' ? 'text-[#23c55e]' : 'text-white'
              }`}
            >
              Bat First
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`w-[48%] border rounded-xl p-4 items-center ${
              tossDecision === 'Bowl'
                ? 'border-[#23c55e] bg-[#23c55e]/15'
                : 'bg-[#121212] border-[#222222]'
            }`}
            onPress={() => setTossDecision('Bowl')}
          >
            <Ionicons
              name="tennisball-outline"
              size={24}
              color={tossDecision === 'Bowl' ? theme.primary : theme.text}
              style={{ marginBottom: 8 }}
            />
            <Text
              className={`text-sm font-bold ${
                tossDecision === 'Bowl' ? 'text-[#23c55e]' : 'text-white'
              }`}
            >
              Bowl First
            </Text>
          </TouchableOpacity>
        </View>

        {/* Automatic determination banner */}
        <View className="bg-[#121212] border border-[#23c55e]/40 rounded-xl p-4">
          <Text className="text-[#23c55e] text-xs font-bold uppercase tracking-wider mb-2">
            Innings 1 Matchup
          </Text>
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-[#888888] text-xs">Batting Team:</Text>
            <Text className="text-white text-xs font-bold">{firstInningsBattingTeam.name}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[#888888] text-xs">Bowling Team:</Text>
            <Text className="text-white text-xs font-bold">{firstInningsBowlingTeam.name}</Text>
          </View>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue to Playing XI" onPress={() => setActiveStep(4)} />
    </View>
  );

  // ==========================================
  // STEP 4: PLAYING XI
  // ==========================================
  const renderStep4 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Select Playing XI" step={4} totalSteps={6} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Playing XI</Text>
        <Text className="text-[#888888] text-[13px] mb-6">
          Select exactly 11 players for both teams
        </Text>

        {/* Team A Playing XI */}
        <View className="bg-[#121212] border border-[#222222] rounded-xl p-4 mb-5">
          <View className="flex-row justify-between items-center mb-4 border-b border-[#222222] pb-3">
            <View className="flex-row items-center">
              <Image source={{ uri: teamA.logo }} className="w-7 h-7 rounded-full mr-2.5" />
              <Text className="text-white text-[15px] font-bold">{teamA.name}</Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className={`text-xs font-bold mr-2 ${
                  selectedXI_A.length === 11 ? 'text-[#23c55e]' : 'text-[#f1c40f]'
                }`}
              >
                {selectedXI_A.length} / 11 selected
              </Text>
              {selectedXI_A.length !== 11 && (
                <TouchableOpacity
                  onPress={() => setSelectedXI_A(SQUAD_A.slice(0, 11).map((p) => p.id))}
                  className="bg-[#23c55e]/20 px-2 py-0.5 rounded"
                >
                  <Text className="text-[#23c55e] text-[10px] font-bold">Select 11</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {SQUAD_A.map((p) => {
            const isSelected = selectedXI_A.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => togglePlayerXI_A(p.id)}
                className={`flex-row items-center p-2 rounded-lg mb-2 ${
                  isSelected ? 'bg-[#1a2e1d]/40 border border-[#23c55e]/40' : 'bg-[#181818]'
                }`}
              >
                <Image source={{ uri: p.img }} className="w-8 h-8 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-white text-xs font-semibold">{p.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {p.role} • {p.style}
                  </Text>
                </View>
                {isSelected ? (
                  <Feather name="check-circle" size={18} color={theme.primary} />
                ) : (
                  <Feather name="circle" size={18} color="#555" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Team B Playing XI */}
        <View className="bg-[#121212] border border-[#222222] rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4 border-b border-[#222222] pb-3">
            <View className="flex-row items-center">
              <Image source={{ uri: teamB.logo }} className="w-7 h-7 rounded-full mr-2.5" />
              <Text className="text-white text-[15px] font-bold">{teamB.name}</Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className={`text-xs font-bold mr-2 ${
                  selectedXI_B.length === 11 ? 'text-[#23c55e]' : 'text-[#f1c40f]'
                }`}
              >
                {selectedXI_B.length} / 11 selected
              </Text>
              {selectedXI_B.length !== 11 && (
                <TouchableOpacity
                  onPress={() => setSelectedXI_B(SQUAD_B.slice(0, 11).map((p) => p.id))}
                  className="bg-[#23c55e]/20 px-2 py-0.5 rounded"
                >
                  <Text className="text-[#23c55e] text-[10px] font-bold">Select 11</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {SQUAD_B.map((p) => {
            const isSelected = selectedXI_B.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => togglePlayerXI_B(p.id)}
                className={`flex-row items-center p-2 rounded-lg mb-2 ${
                  isSelected ? 'bg-[#1a2e1d]/40 border border-[#23c55e]/40' : 'bg-[#181818]'
                }`}
              >
                <Image source={{ uri: p.img }} className="w-8 h-8 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-white text-xs font-semibold">{p.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {p.role} • {p.style}
                  </Text>
                </View>
                {isSelected ? (
                  <Feather name="check-circle" size={18} color={theme.primary} />
                ) : (
                  <Feather name="circle" size={18} color="#555" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <PrimaryButton title="Continue to Opening Players" onPress={handleValidatePlayingXI} />
    </View>
  );

  // ==========================================
  // STEP 5: OPENING PLAYERS
  // ==========================================
  const renderStep5 = () => {
    const strikerPlayer = battingXIPlayers.find((p) => p.id === strikerId) || battingXIPlayers[0];
    const nonStrikerPlayer = battingXIPlayers.find((p) => p.id === nonStrikerId) || battingXIPlayers[1];
    const openingBowler = bowlingXIPlayers.find((p) => p.id === openingBowlerId) || bowlingXIPlayers[bowlingXIPlayers.length - 1];
    const wicketkeeper = bowlingXIPlayers.find((p) => p.id === wicketkeeperId) || bowlingXIPlayers[0];

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <FlowHeader title="Opening Players" step={5} totalSteps={6} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
          <Text className="text-white text-[22px] font-bold mb-1">Opening Players</Text>
          <Text className="text-[#888888] text-[13px] mb-6">
            Set the opening batters, bowler and wicketkeeper
          </Text>

          {/* Section: Opening Batters (Batting Team) */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[#23c55e] text-sm font-bold">
              Select Opening Batters ({firstInningsBattingTeam.name})
            </Text>
            <View className="bg-[#1e2e1e] px-2 py-0.5 rounded">
              <Text className="text-[#23c55e] text-[10px] font-bold">BATTING</Text>
            </View>
          </View>

          {/* Striker */}
          <Text className="text-[#888888] text-xs mb-1.5 font-medium">Striker (Batter 1)</Text>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Striker',
                role: 'Striker',
                team: firstInningsBattingTeam.name,
                players: battingXIPlayers.filter((p) => p.id !== nonStrikerId),
                currentId: strikerId,
                onSelect: (id) => setStrikerId(id),
              });
            }}
            className="flex-row items-center bg-[#121212] border border-[#222222] rounded-xl p-3.5 mb-3"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">1.</Text>
            {strikerPlayer && (
              <>
                <Image source={{ uri: strikerPlayer.img }} className="w-8 h-8 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{strikerPlayer.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {strikerPlayer.role} • {strikerPlayer.style}
                  </Text>
                </View>
              </>
            )}
            <Feather name="chevron-down" size={18} color={theme.subText} />
          </TouchableOpacity>

          {/* Non-Striker */}
          <Text className="text-[#888888] text-xs mb-1.5 font-medium">Non-Striker (Batter 2)</Text>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Non-Striker',
                role: 'Non-Striker',
                team: firstInningsBattingTeam.name,
                players: battingXIPlayers.filter((p) => p.id !== strikerId),
                currentId: nonStrikerId,
                onSelect: (id) => setNonStrikerId(id),
              });
            }}
            className="flex-row items-center bg-[#121212] border border-[#222222] rounded-xl p-3.5 mb-5"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">2.</Text>
            {nonStrikerPlayer && (
              <>
                <Image source={{ uri: nonStrikerPlayer.img }} className="w-8 h-8 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{nonStrikerPlayer.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {nonStrikerPlayer.role} • {nonStrikerPlayer.style}
                  </Text>
                </View>
              </>
            )}
            <Feather name="chevron-down" size={18} color={theme.subText} />
          </TouchableOpacity>

          {/* Section: Opening Bowler (Bowling Team) */}
          <View className="flex-row items-center justify-between mb-3 mt-2">
            <Text className="text-[#23c55e] text-sm font-bold">
              Select Opening Bowler ({firstInningsBowlingTeam.name})
            </Text>
            <View className="bg-[#2a1b1b] px-2 py-0.5 rounded">
              <Text className="text-[#ef4444] text-[10px] font-bold">BOWLING</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Opening Bowler',
                role: 'Bowler',
                team: firstInningsBowlingTeam.name,
                players: bowlingXIPlayers,
                currentId: openingBowlerId,
                onSelect: (id) => setOpeningBowlerId(id),
              });
            }}
            className="flex-row items-center bg-[#121212] border border-[#222222] rounded-xl p-3.5 mb-5"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">1.</Text>
            {openingBowler && (
              <>
                <Image source={{ uri: openingBowler.img }} className="w-8 h-8 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{openingBowler.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {openingBowler.role} • {openingBowler.style}
                  </Text>
                </View>
              </>
            )}
            <Feather name="chevron-down" size={18} color={theme.subText} />
          </TouchableOpacity>

          {/* Section: Wicketkeeper (Fielding Team) */}
          <View className="flex-row items-center justify-between mb-3 mt-2">
            <Text className="text-[#23c55e] text-sm font-bold">
              Select Wicketkeeper ({firstInningsBowlingTeam.name})
            </Text>
            <View className="bg-[#1f2937] px-2 py-0.5 rounded">
              <Text className="text-[#60a5fa] text-[10px] font-bold">FIELDING</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Wicketkeeper',
                role: 'Wicketkeeper',
                team: firstInningsBowlingTeam.name,
                players: bowlingXIPlayers,
                currentId: wicketkeeperId,
                onSelect: (id) => setWicketkeeperId(id),
              });
            }}
            className="flex-row items-center bg-[#121212] border border-[#222222] rounded-xl p-3.5 mb-4"
          >
            <MaterialCommunityIcons
              name="hand-back-left"
              size={18}
              color={theme.subText}
              style={{ width: 24 }}
            />
            {wicketkeeper && (
              <>
                <Image source={{ uri: wicketkeeper.img }} className="w-8 h-8 rounded-full mr-3" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{wicketkeeper.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {wicketkeeper.role} • {wicketkeeper.style}
                  </Text>
                </View>
              </>
            )}
            <Feather name="chevron-down" size={18} color={theme.subText} />
          </TouchableOpacity>
        </ScrollView>
        <PrimaryButton title="Confirm Players & Continue" onPress={handleValidateOpeningPlayers} />
      </View>
    );
  };

  // ==========================================
  // STEP 6: MATCH CONFIRMATION (MATCH READY)
  // ==========================================
  const renderStep6 = () => {
    const strikerPlayer = battingXIPlayers.find((p) => p.id === strikerId) || battingXIPlayers[0];
    const nonStrikerPlayer = battingXIPlayers.find((p) => p.id === nonStrikerId) || battingXIPlayers[1];
    const openingBowler = bowlingXIPlayers.find((p) => p.id === openingBowlerId) || bowlingXIPlayers[bowlingXIPlayers.length - 1];
    const wicketkeeper = bowlingXIPlayers.find((p) => p.id === wicketkeeperId) || bowlingXIPlayers[0];

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <FlowHeader title="Match Ready" step={6} totalSteps={6} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8, alignItems: 'center' }}>
          <View className="w-20 h-20 rounded-full bg-[#23c55e]/15 border-2 border-[#23c55e] items-center justify-center mt-6 mb-4">
            <Feather name="check" size={40} color={theme.primary} />
          </View>
          <Text className="text-white text-2xl font-bold mb-1">Match is Ready!</Text>
          <Text className="text-[#888888] text-sm mb-6">Everything looks good. Ready to begin.</Text>

          <View className="flex-row justify-between items-center bg-[#121212] rounded-2xl border border-[#222222] mb-6 px-8 py-6 w-full">
            <View className="items-center flex-1">
              <Image source={{ uri: teamA.logo }} className="w-12 h-12 rounded-full mb-2" />
              <Text className="text-white text-xs font-bold text-center">{teamA.name}</Text>
            </View>
            <Text className="text-[#888888] text-xs font-bold mx-6">VS</Text>
            <View className="items-center flex-1">
              <Image source={{ uri: teamB.logo }} className="w-12 h-12 rounded-full mb-2" />
              <Text className="text-white text-xs font-bold text-center">{teamB.name}</Text>
            </View>
          </View>

          <View className="w-full bg-[#121212] rounded-xl border border-[#222222] p-4 mb-4">
            <View className="flex-row justify-between py-2 border-b border-[#222222]">
              <Text className="text-[#888888] text-[13px]">Format</Text>
              <Text className="text-white text-[13px] font-bold">{matchFormat}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-[#222222]">
              <Text className="text-[#888888] text-[13px]">Venue</Text>
              <Text className="text-white text-[13px] font-bold text-right flex-1 pl-4" numberOfLines={1}>
                {venue}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-[#222222]">
              <Text className="text-[#888888] text-[13px]">Date & Time</Text>
              <Text className="text-white text-[13px] font-bold">{matchDate}, {matchTime}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-[#222222]">
              <Text className="text-[#888888] text-[13px]">Overs</Text>
              <Text className="text-[#23c55e] text-[13px] font-bold">{oversPerInnings} Overs / Innings</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-[#222222]">
              <Text className="text-[#888888] text-[13px]">Toss</Text>
              <Text className="text-white text-[13px] font-bold">
                {winnerTeam.name} elected to {tossDecision}
              </Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-[#222222]">
              <Text className="text-[#888888] text-[13px]">Innings 1 Batting</Text>
              <Text className="text-[#23c55e] text-[13px] font-bold">{firstInningsBattingTeam.name}</Text>
            </View>
            <View className="flex-row justify-between py-2 border-b border-[#222222]">
              <Text className="text-[#888888] text-[13px]">Batters</Text>
              <Text className="text-white text-[13px] font-bold">
                {strikerPlayer?.name} & {nonStrikerPlayer?.name}
              </Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="text-[#888888] text-[13px]">Opening Bowler</Text>
              <Text className="text-white text-[13px] font-bold">{openingBowler?.name}</Text>
            </View>
          </View>
        </ScrollView>
        <PrimaryButton title="Let's Begin the Game" onPress={() => setActiveStep(7)} />
      </View>
    );
  };

  // ==========================================
  // STEP 7: LIVE MATCH PREVIEW (LET'S BEGIN THE GAME)
  // ==========================================
  const renderStep7 = () => {
    const strikerPlayer = battingXIPlayers.find((p) => p.id === strikerId) || battingXIPlayers[0];
    const nonStrikerPlayer = battingXIPlayers.find((p) => p.id === nonStrikerId) || battingXIPlayers[1];
    const openingBowler = bowlingXIPlayers.find((p) => p.id === openingBowlerId) || bowlingXIPlayers[bowlingXIPlayers.length - 1];
    const wicketkeeper = bowlingXIPlayers.find((p) => p.id === wicketkeeperId) || bowlingXIPlayers[0];

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <FlowHeader title="Match Started" step={0} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
          <View className="items-center mb-6">
            <Text className="text-white text-2xl font-bold mb-2">Let's begin the game!</Text>
            <View className="bg-[#e74c3c] px-2.5 py-1 rounded">
              <Text className="text-white text-[10px] font-bold tracking-widest">LIVE</Text>
            </View>
          </View>

          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-6 mb-6">
            <View className="flex-row justify-between items-center mb-6">
              <View className="items-center">
                <Image
                  source={{ uri: firstInningsBattingTeam.logo }}
                  className="w-[70px] h-[70px] rounded-full bg-[#1a1a1a] mb-3"
                />
                <Text className="text-white text-[32px] font-bold mt-2 mb-0.5">0/0</Text>
                <Text className="text-[#888888] text-[13px]">0.0 Overs (Max {oversPerInnings})</Text>
                <Text className="text-[#23c55e] text-xs font-bold mt-1">
                  {firstInningsBattingTeam.name}
                </Text>
              </View>
              <Text className="text-[#888888] text-base font-bold mx-4">VS</Text>
              <View className="items-center">
                <Image
                  source={{ uri: firstInningsBowlingTeam.logo }}
                  className="w-[70px] h-[70px] rounded-full bg-[#1a1a1a] mb-3"
                />
                <Text className="text-white text-sm font-bold text-center mt-3">
                  {firstInningsBowlingTeam.name}
                </Text>
                <Text className="text-[#888888] text-xs mt-1">Fielding</Text>
              </View>
            </View>
            <View className="border-t border-[#222222] pt-4 items-center">
              <Text className="text-white text-xs font-medium text-center">
                {winnerTeam.name} won the toss and elected to {tossDecision}
              </Text>
            </View>
          </View>

          <Text className="text-white text-sm font-bold mb-3">Next Up</Text>
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4">
            <View className="flex-row items-center mb-3">
              <Text className="text-[#888888] text-[11px] w-[65px]">On Strike</Text>
              <Image source={{ uri: strikerPlayer?.img }} className="w-7 h-7 rounded-full mx-3" />
              <Text className="text-white text-[13px] font-semibold flex-1">
                {strikerPlayer?.name}
              </Text>
              <Text className="text-white text-[13px] font-bold">0 (0)</Text>
            </View>
            <View className="flex-row items-center mb-3 border-b border-[#222222] pb-4">
              <Text className="text-[#888888] text-[11px] w-[65px]">Non-Striker</Text>
              <Image source={{ uri: nonStrikerPlayer?.img }} className="w-7 h-7 rounded-full mx-3" />
              <Text className="text-white text-[13px] font-semibold flex-1">
                {nonStrikerPlayer?.name}
              </Text>
              <Text className="text-white text-[13px] font-bold">0 (0)</Text>
            </View>
            <View className="flex-row items-center pt-1 mb-3 border-b border-[#222222] pb-4">
              <Text className="text-[#888888] text-[11px] w-[65px]">Bowler</Text>
              <Image source={{ uri: openingBowler?.img }} className="w-7 h-7 rounded-full mx-3" />
              <Text className="text-white text-[13px] font-semibold flex-1">
                {openingBowler?.name}
              </Text>
              <Text className="text-white text-[13px] font-bold">0-0 (0.0)</Text>
            </View>
            <View className="flex-row items-center pt-1">
              <Text className="text-[#888888] text-[11px] w-[65px]">Keeper</Text>
              <Image source={{ uri: wicketkeeper?.img }} className="w-7 h-7 rounded-full mx-3" />
              <Text className="text-white text-[13px] font-semibold flex-1">
                {wicketkeeper?.name}
              </Text>
              <Text className="text-[#888888] text-[11px]">WK</Text>
            </View>
          </View>
        </ScrollView>
        <PrimaryButton title="Go to Live Scoring" onPress={handleStartMatch} />
      </View>
    );
  };

  // ==========================================
  // MODALS
  // ==========================================
  const renderCustomOversModal = () => (
    <Modal visible={showCustomOversModal} transparent animationType="fade">
      <View className="flex-1 bg-black/75 justify-center items-center px-4">
        <View className="bg-[#121212] border border-[#222222] rounded-2xl p-5 w-full max-w-sm">
          <Text className="text-white text-lg font-bold mb-1">Custom Overs Per Innings</Text>
          <Text className="text-[#888888] text-xs mb-4">
            Enter the number of overs per innings for this match
          </Text>
          <TextInput
            keyboardType="number-pad"
            value={customOversInput}
            onChangeText={setCustomOversInput}
            placeholder="e.g. 15"
            placeholderTextColor="#666"
            className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white text-base font-bold mb-4"
          />
          <View className="flex-row justify-end">
            <TouchableOpacity
              onPress={() => setShowCustomOversModal(false)}
              className="px-4 py-2 mr-2"
            >
              <Text className="text-[#888888] text-sm font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveCustomOvers}
              className="bg-[#23c55e] px-5 py-2 rounded-lg"
            >
              <Text className="text-black text-sm font-bold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEditFieldModal = () => (
    <Modal visible={!!editingField} transparent animationType="fade">
      <View className="flex-1 bg-black/75 justify-center items-center px-4">
        <View className="bg-[#121212] border border-[#222222] rounded-2xl p-5 w-full max-w-sm">
          <Text className="text-white text-lg font-bold mb-1">
            Edit{' '}
            {editingField === 'venue'
              ? 'Venue'
              : editingField === 'date'
              ? 'Date'
              : editingField === 'time'
              ? 'Time'
              : editingField === 'teamA'
              ? 'Team A Name'
              : editingField === 'teamB'
              ? 'Team B Name'
              : 'Match Rules'}
          </Text>
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white text-sm font-semibold mb-4 mt-2"
          />
          <View className="flex-row justify-end">
            <TouchableOpacity onPress={() => setEditingField(null)} className="px-4 py-2 mr-2">
              <Text className="text-[#888888] text-sm font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (editingField === 'venue') setVenue(editValue);
                else if (editingField === 'date') setMatchDate(editValue);
                else if (editingField === 'time') setMatchTime(editValue);
                else if (editingField === 'rules') setMatchRules(editValue);
                else if (editingField === 'teamA') setTeamA((prev) => ({ ...prev, name: editValue }));
                else if (editingField === 'teamB') setTeamB((prev) => ({ ...prev, name: editValue }));
                setEditingField(null);
              }}
              className="bg-[#23c55e] px-5 py-2 rounded-lg"
            >
              <Text className="text-black text-sm font-bold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPlayerPickerModal = () => {
    if (!pickerConfig) return null;
    return (
      <Modal visible={!!pickerConfig} transparent animationType="slide">
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-[#121212] border-t border-[#222222] rounded-t-3xl max-h-[75%] p-5">
            <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-[#222222]">
              <View>
                <Text className="text-white text-lg font-bold">{pickerConfig.title}</Text>
                <Text className="text-[#888888] text-xs">
                  {pickerConfig.team} Playing XI
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPickerConfig(null)} className="p-1">
                <Feather name="x" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {pickerConfig.players.map((p) => {
                const isSelected = p.id === pickerConfig.currentId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      pickerConfig.onSelect(p.id);
                      setPickerConfig(null);
                    }}
                    className={`flex-row items-center p-3 rounded-xl mb-2 ${
                      isSelected
                        ? 'bg-[#1a2e1d] border border-[#23c55e]'
                        : 'bg-[#181818] border border-[#222222]'
                    }`}
                  >
                    <Image source={{ uri: p.img }} className="w-9 h-9 rounded-full mr-3" />
                    <View className="flex-1">
                      <Text className="text-white text-sm font-bold">{p.name}</Text>
                      <Text className="text-[#888888] text-xs">
                        {p.role} • {p.style}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

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

      {renderCustomOversModal()}
      {renderEditFieldModal()}
      {renderPlayerPickerModal()}
    </SafeAreaView>
  );
}