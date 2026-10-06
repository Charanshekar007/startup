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
import { playerService } from '../services/playerService';
import { teamService } from '../services/teamService';
import { CURRENT_MOCK_USER } from '../data/mockPlayers';
import { INITIAL_MOCK_TEAMS } from '../data/mockTeams';

const getActiveMembers = (team) => {
  if (!team || !Array.isArray(team.members)) return [];
  return team.members.filter((m) => m.status === 'accepted');
};

const getPendingMembers = (team) => {
  if (!team || !Array.isArray(team.members)) return [];
  return team.members.filter((m) => m.status === 'pending');
};

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

  // Available Teams from frontend teamService
  const [availableTeams, setAvailableTeams] = useState(INITIAL_MOCK_TEAMS);

  // Teams State (Default to mock teams)
  const [teamA, setTeamA] = useState(INITIAL_MOCK_TEAMS[0]);
  const [teamB, setTeamB] = useState(INITIAL_MOCK_TEAMS[1]);

  // Current authenticated mock user (Requirement 24)
  const [currentUser, setCurrentUser] = useState(CURRENT_MOCK_USER);

  // Match Draft State (Requirement 16 & 18)
  const [matchDraft, setMatchDraft] = useState({
    teamAId: INITIAL_MOCK_TEAMS[0].id,
    teamBId: INITIAL_MOCK_TEAMS[1].id,
    teamAPlayingXI: (INITIAL_MOCK_TEAMS[0].members || []).slice(0, 11).map((p) => p.id),
    teamBPlayingXI: (INITIAL_MOCK_TEAMS[1].members || []).slice(0, 11).map((p) => p.id),
  });

  // Team Selection / Creation Modal State
  const [teamPickerSlot, setTeamPickerSlot] = useState(null); // 'A' | 'B' | null
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamShortName, setNewTeamShortName] = useState('');
  const [newTeamLocation, setNewTeamLocation] = useState('');
  const [newTeamType, setNewTeamType] = useState('Club');
  const [newTeamLogo, setNewTeamLogo] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Squad / Member Management Modal State (Requirements 3, 4, 5, 8, 9)
  const [managingSquadTeam, setManagingSquadTeam] = useState(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [searchPlayerUid, setSearchPlayerUid] = useState('');
  const [isSearchingPlayer, setIsSearchingPlayer] = useState(false);
  const [searchedPlayer, setSearchedPlayer] = useState(null);
  const [searchPlayerError, setSearchPlayerError] = useState('');
  const [isInvitingPlayer, setIsInvitingPlayer] = useState(false);

  // Team Picker Search State (Requirement 11 & 12)
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

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
  const [editingField, setEditingField] = useState(null); // 'venue' | 'date' | 'time' | 'rules'
  const [editValue, setEditValue] = useState('');

  // Toss State
  const [tossWinner, setTossWinner] = useState('A'); // 'A' | 'B'
  const [tossDecision, setTossDecision] = useState('Bat'); // 'Bat' | 'Bowl'

  // Playing XI Selection State (Ids of selected players - Exactly 11 players per team)
  const [selectedXI_A, setSelectedXI_A] = useState(
    (INITIAL_MOCK_TEAMS[0].members || []).slice(0, 11).map((p) => p.id)
  );
  const [selectedXI_B, setSelectedXI_B] = useState(
    (INITIAL_MOCK_TEAMS[1].members || []).slice(0, 11).map((p) => p.id)
  );

  // Opening Players State
  const [strikerId, setStrikerId] = useState(null);
  const [nonStrikerId, setNonStrikerId] = useState(null);
  const [openingBowlerId, setOpeningBowlerId] = useState(null);
  const [wicketkeeperId, setWicketkeeperId] = useState(null);

  // Player Picker Modal State
  const [pickerConfig, setPickerConfig] = useState(null); // { title, role, team, players, currentId, onSelect }

  // Global Match Store
  const { addMatch, setActiveMatch } = useMatches();

  // Load mock user and teams from services on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const user = await playerService.getCurrentUser();
        if (isMounted && user) {
          setCurrentUser(user);
        }

        const teams = await teamService.getTeams();
        if (isMounted && Array.isArray(teams) && teams.length >= 2) {
          setAvailableTeams(teams);
          const initialTeamA = teams[0];
          const initialTeamB = teams[1];
          setTeamA(initialTeamA);
          setTeamB(initialTeamB);

          const xiA = (initialTeamA.members || []).slice(0, 11).map((p) => p.id);
          const xiB = (initialTeamB.members || []).slice(0, 11).map((p) => p.id);
          setSelectedXI_A(xiA);
          setSelectedXI_B(xiB);

          setMatchDraft({
            teamAId: initialTeamA.id,
            teamBId: initialTeamB.id,
            teamAPlayingXI: xiA,
            teamBPlayingXI: xiB,
          });
        }
      } catch (err) {
        console.warn('Error loading mock data from services:', err);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const battingSquad = firstInningsBattingTeam.id === teamA.id ? getActiveMembers(teamA) : getActiveMembers(teamB);
  const bowlingSquad = firstInningsBowlingTeam.id === teamA.id ? getActiveMembers(teamA) : getActiveMembers(teamB);
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
        const defaultBowler =
          bowlingXIPlayers.find((p) => (p.role || '').includes('Bowler')) ||
          bowlingXIPlayers[bowlingXIPlayers.length - 1];
        if (!openingBowlerId || !bowlingXI_Ids.includes(openingBowlerId)) {
          setOpeningBowlerId(defaultBowler.id);
        }
        // Find best keeper
        const defaultKeeper =
          bowlingXIPlayers.find((p) => (p.role || '').includes('WK')) || bowlingXIPlayers[0];
        if (!wicketkeeperId || !bowlingXI_Ids.includes(wicketkeeperId)) {
          setWicketkeeperId(defaultKeeper.id);
        }
      }
    }
  }, [activeStep, firstInningsBattingTeam.id, selectedXI_A, selectedXI_B]);

  // Player toggle for Playing XI (Requirement 14 & 15: Exactly 11 players, block 12th)
  const togglePlayerXI_A = (id) => {
    if (selectedXI_A.includes(id)) {
      setSelectedXI_A(selectedXI_A.filter((pId) => pId !== id));
    } else {
      if (selectedXI_A.length >= 11) {
        Alert.alert(
          'Playing XI Limit',
          'Playing XI already has 11 players.'
        );
        return;
      }
      setSelectedXI_A([...selectedXI_A, id]);
    }
  };

  const togglePlayerXI_B = (id) => {
    if (selectedXI_B.includes(id)) {
      setSelectedXI_B(selectedXI_B.filter((pId) => pId !== id));
    } else {
      if (selectedXI_B.length >= 11) {
        Alert.alert(
          'Playing XI Limit',
          'Playing XI already has 11 players.'
        );
        return;
      }
      setSelectedXI_B([...selectedXI_B, id]);
    }
  };

  // Validate Playing XI (Requirement 15: Exactly 11 players per team, saves match draft)
  const handleValidatePlayingXI = async () => {
    if (selectedXI_A.length !== 11) {
      const diff = 11 - selectedXI_A.length;
      Alert.alert(
        'Incomplete Playing XI',
        selectedXI_A.length < 11
          ? `Select ${diff} more player${diff > 1 ? 's' : ''} for ${teamA.name}. Exactly 11 players required.`
          : `Playing XI can contain only 11 players for ${teamA.name}. Currently selected: ${selectedXI_A.length}.`
      );
      return;
    }
    if (selectedXI_B.length !== 11) {
      const diff = 11 - selectedXI_B.length;
      Alert.alert(
        'Incomplete Playing XI',
        selectedXI_B.length < 11
          ? `Select ${diff} more player${diff > 1 ? 's' : ''} for ${teamB.name}. Exactly 11 players required.`
          : `Playing XI can contain only 11 players for ${teamB.name}. Currently selected: ${selectedXI_B.length}.`
      );
      return;
    }

    // Save match draft without mutating permanent team squads (Requirement 16, 17, 18)
    const draft = {
      teamAId: teamA.id,
      teamBId: teamB.id,
      teamAPlayingXI: selectedXI_A,
      teamBPlayingXI: selectedXI_B,
    };
    setMatchDraft(draft);
    await teamService.createMatchDraft(draft);

    setActiveStep(5);
  };

  // Team A / Team B Validation before entering match steps (Requirement 13 & 26)
  const handleValidateMatchTeams = (nextStep = 2) => {
    if (teamA.id === teamB.id) {
      Alert.alert('Invalid Selection', 'Please select two different teams.');
      return false;
    }

    const activeA = getActiveMembers(teamA);
    const activeB = getActiveMembers(teamB);

    if (activeA.length < 11) {
      const diff = 11 - activeA.length;
      Alert.alert(
        'Squad Incomplete',
        `11 players required for Playing XI. ${teamA.name} currently has ${activeA.length} player${activeA.length === 1 ? '' : 's'} in the squad. (Need ${diff} more).`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Manage Squad',
            onPress: () => setManagingSquadTeam(teamA),
          },
        ]
      );
      return false;
    }

    if (activeB.length < 11) {
      const diff = 11 - activeB.length;
      Alert.alert(
        'Squad Incomplete',
        `11 players required for Playing XI. ${teamB.name} currently has ${activeB.length} player${activeB.length === 1 ? '' : 's'} in the squad. (Need ${diff} more).`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Manage Squad',
            onPress: () => setManagingSquadTeam(teamB),
          },
        ]
      );
      return false;
    }

    setActiveStep(nextStep);
    return true;
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

  // Create Team Submission Handler (Creator automatically becomes Owner + Captain + Squad Member)
  const handleCreateTeamSubmit = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Missing Team Name', 'Please enter a name for the new team.');
      return;
    }
    setIsCreatingTeam(true);
    try {
      const created = await teamService.createTeam(
        {
          name: newTeamName.trim(),
          shortName: newTeamShortName.trim(),
          location: newTeamLocation.trim(),
          logo: newTeamLogo.trim() || undefined,
          sport: 'Cricket',
          teamType: newTeamType,
        },
        currentUser
      );

      const updatedTeams = await teamService.getTeams();
      setAvailableTeams(updatedTeams);

      if (teamPickerSlot === 'A') {
        setTeamA(created);
        setSelectedXI_A([currentUser.playerId || currentUser.id]);
      } else if (teamPickerSlot === 'B') {
        setTeamB(created);
        setSelectedXI_B([currentUser.playerId || currentUser.id]);
      }

      setShowCreateTeamModal(false);
      setTeamPickerSlot(null);
      setNewTeamName('');
      setNewTeamShortName('');
      setNewTeamLocation('');
      setNewTeamLogo('');
      setNewTeamType('Club');

      // Open Team Members modal immediately so creator can add players to squad
      setManagingSquadTeam(created);

      Alert.alert(
        'Team Created',
        `"${created.name}" created! You are the Team Owner & Captain. Add players using Player UID to build your squad, or tap Add Later.`
      );
    } catch (err) {
      console.error('Error creating team:', err);
      Alert.alert('Error', 'Failed to create team. Please try again.');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  // Search Player by Player UID (Requirement 3, 5, 20)
  const handleSearchPlayerByUid = async () => {
    const cleanUid = searchPlayerUid.trim();
    if (!cleanUid) {
      setSearchPlayerError('Please enter a Player UID (e.g. SP-7K4M-92QX)');
      setSearchedPlayer(null);
      return;
    }

    setIsSearchingPlayer(true);
    setSearchPlayerError('');
    setSearchedPlayer(null);

    try {
      const player = await playerService.searchPlayersByUid(cleanUid);
      if (!player) {
        setSearchPlayerError('Player not found');
        return;
      }

      // Check if player is already in team or is the captain (Requirement 5)
      const currentTeam = managingSquadTeam;
      if (currentTeam) {
        const pId = player.playerId || player.id;
        const pUid = (player.playerUid || '').toUpperCase();

        const isDuplicate = (currentTeam.members || []).some(
          (m) =>
            m.playerId === pId ||
            m.id === pId ||
            (m.playerUid && m.playerUid.toUpperCase() === pUid)
        );

        if (isDuplicate || currentTeam.captainId === pId) {
          setSearchPlayerError('Player is already in this team.');
          return;
        }
      }

      setSearchedPlayer(player);
    } catch (err) {
      console.error('Error searching player:', err);
      setSearchPlayerError('Error searching player.');
    } finally {
      setIsSearchingPlayer(false);
    }
  };

  // Add Player to current team's local squad state (Requirement 4 & 5)
  const handleAddPlayerToSquad = async () => {
    if (!searchedPlayer || !managingSquadTeam) return;

    setIsInvitingPlayer(true);
    try {
      const result = await teamService.addPlayerToTeam(managingSquadTeam.id, searchedPlayer);

      if (!result.success) {
        setSearchPlayerError(result.error || 'Failed to add player.');
        return;
      }

      setManagingSquadTeam(result.team);
      const updatedTeams = await teamService.getTeams();
      setAvailableTeams(updatedTeams);
      if (teamA?.id === result.team.id) setTeamA(result.team);
      if (teamB?.id === result.team.id) setTeamB(result.team);

      setShowAddPlayerModal(false);
      setSearchPlayerUid('');
      setSearchedPlayer(null);
      setSearchPlayerError('');

      Alert.alert(
        'Player Added',
        `${searchedPlayer.name} has been added to ${result.team.name} squad.`
      );
    } catch (err) {
      console.error('Error adding player:', err);
      Alert.alert('Error', 'Failed to add player.');
    } finally {
      setIsInvitingPlayer(false);
    }
  };

  // Remove member from team squad
  const handleRemoveMember = async (playerId) => {
    if (!managingSquadTeam) return;

    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this player from the team squad?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await teamService.removePlayerFromTeam(managingSquadTeam.id, playerId);
            if (result.success) {
              setManagingSquadTeam(result.team);
              const updatedTeams = await teamService.getTeams();
              setAvailableTeams(updatedTeams);
              if (teamA?.id === result.team.id) {
                setTeamA(result.team);
                setSelectedXI_A((prev) => prev.filter((id) => id !== playerId));
              }
              if (teamB?.id === result.team.id) {
                setTeamB(result.team);
                setSelectedXI_B((prev) => prev.filter((id) => id !== playerId));
              }
            } else {
              Alert.alert('Error', result.error || 'Failed to remove member.');
            }
          },
        },
      ]
    );
  };

  // Start Match & Transition to Live Scoring
  const handleStartMatch = () => {
    const baseXI_A = getActiveMembers(teamA).filter((p) => selectedXI_A.includes(p.id));
    const baseXI_B = getActiveMembers(teamB).filter((p) => selectedXI_B.includes(p.id));

    const strikerPlayer =
      battingXIPlayers.find((p) => p.id === strikerId) || battingXIPlayers[0];
    const nonStrikerPlayer =
      battingXIPlayers.find((p) => p.id === nonStrikerId) || battingXIPlayers[1];
    const openingBowler =
      bowlingXIPlayers.find((p) => p.id === openingBowlerId) ||
      bowlingXIPlayers[bowlingXIPlayers.length - 1];
    const wicketkeeper =
      bowlingXIPlayers.find((p) => p.id === wicketkeeperId) || bowlingXIPlayers[0];

    const newMatchData = {
      id: `match_${Date.now()}`,
      teamA: teamA.name,
      teamB: teamB.name,
      teamAId: teamA.id,
      teamBId: teamB.id,
      teamAObj: teamA,
      teamBObj: teamB,
      matchDraft: {
        teamAId: teamA.id,
        teamBId: teamB.id,
        teamAPlayingXI: selectedXI_A,
        teamBPlayingXI: selectedXI_B,
      },
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
      playingXI_A: baseXI_A,
      playingXI_B: baseXI_B,
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
        {/* Create Match Hero Card */}
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

        {/* Hub Action Cards */}
        <View className="flex-row justify-between mb-4">
          {/* Create Team Card - Reuses real team creation flow */}
          <TouchableOpacity
            onPress={() => {
              setTeamPickerSlot(null);
              setShowCreateTeamModal(true);
            }}
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
        <Text className="text-[#888888] text-[13px] mb-6">Select teams and configure match parameters</Text>

        {/* Team A Card (Option A: Select Existing / Option B: Create Team) */}
        <View className="flex-row justify-between items-center bg-[#121212] border border-[#222222] rounded-xl p-4 mb-4">
          <TouchableOpacity
            onPress={() => setTeamPickerSlot('A')}
            className="flex-row items-center flex-1 mr-2"
          >
            <Image
              source={{ uri: teamA.logo }}
              className="w-11 h-11 rounded-full mr-3 bg-[#1a1a1a]"
            />
            <View className="flex-1">
              <Text className="text-[#888888] text-xs font-semibold uppercase tracking-wider mb-0.5">
                Team A (Home)
              </Text>
              <Text className="text-white text-base font-bold">{teamA.name}</Text>
              <Text
                className={`text-[11px] font-medium mt-0.5 ${
                  getActiveMembers(teamA).length >= 11 ? 'text-[#23c55e]' : 'text-[#f1c40f]'
                }`}
              >
                {teamA.location || 'Local Ground'} • {getActiveMembers(teamA).length} players{' '}
                {getActiveMembers(teamA).length >= 11 ? '✓ Ready' : `(Need ${11 - getActiveMembers(teamA).length})`}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setManagingSquadTeam(teamA)}
              className="bg-[#1e2e1e] px-2.5 py-1.5 rounded-lg border border-[#23c55e]/40 mr-2"
            >
              <Text className="text-xs text-[#23c55e] font-bold">Squad</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTeamPickerSlot('A')}
              className="bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#333]"
            >
              <Text className="text-xs text-white font-bold">Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Team B Card (Option A: Select Existing / Option B: Create Team) */}
        <View className="flex-row justify-between items-center bg-[#121212] border border-[#222222] rounded-xl p-4 mb-4">
          <TouchableOpacity
            onPress={() => setTeamPickerSlot('B')}
            className="flex-row items-center flex-1 mr-2"
          >
            <Image
              source={{ uri: teamB.logo }}
              className="w-11 h-11 rounded-full mr-3 bg-[#1a1a1a]"
            />
            <View className="flex-1">
              <Text className="text-[#888888] text-xs font-semibold uppercase tracking-wider mb-0.5">
                Team B (Opponent)
              </Text>
              <Text className="text-white text-base font-bold">{teamB.name}</Text>
              <Text
                className={`text-[11px] font-medium mt-0.5 ${
                  getActiveMembers(teamB).length >= 11 ? 'text-[#23c55e]' : 'text-[#f1c40f]'
                }`}
              >
                {teamB.location || 'Local Ground'} • {getActiveMembers(teamB).length} players{' '}
                {getActiveMembers(teamB).length >= 11 ? '✓ Ready' : `(Need ${11 - getActiveMembers(teamB).length})`}
              </Text>
            </View>
          </TouchableOpacity>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setManagingSquadTeam(teamB)}
              className="bg-[#1e2e1e] px-2.5 py-1.5 rounded-lg border border-[#23c55e]/40 mr-2"
            >
              <Text className="text-xs text-[#23c55e] font-bold">Squad</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setTeamPickerSlot('B')}
              className="bg-[#1a1a1a] px-3 py-1.5 rounded-lg border border-[#333]"
            >
              <Text className="text-xs text-white font-bold">Change</Text>
            </TouchableOpacity>
          </View>
        </View>

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
            <Text className="text-white text-sm">Rules</Text>
            <View className="flex-row items-center">
              <Text className="text-[#888888] text-[13px] mr-2">{matchRules}</Text>
              <Feather name="chevron-right" size={16} color={theme.subText} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue to Match Setup" onPress={() => handleValidateMatchTeams(2)} />
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
          <View className="flex-row justify-between py-3.5 border-b border-[#222222]">
            <Text className="text-[#888888] text-[13px]">Rules</Text>
            <Text className="text-white text-[13px] font-bold">{matchRules}</Text>
          </View>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue to Toss" onPress={() => handleValidateMatchTeams(3)} />
    </View>
  );

  // ==========================================
  // STEP 3: TOSS
  // ==========================================
  const renderStep3 = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <FlowHeader title="Toss" step={3} totalSteps={6} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
        <Text className="text-white text-[22px] font-bold mb-1">Match Toss</Text>
        <Text className="text-[#888888] text-[13px] mb-6">
          Record who won the toss and their decision
        </Text>

        {/* Toss Winner Selector */}
        <Text className="text-white text-sm font-bold mb-3">Who won the toss?</Text>
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className={`w-[48%] border rounded-xl p-4 items-center ${
              tossWinner === 'A'
                ? 'border-[#23c55e] bg-[#23c55e]/15'
                : 'bg-[#121212] border-[#222222]'
            }`}
            onPress={() => setTossWinner('A')}
          >
            <Image
              source={{ uri: teamA.logo }}
              className="w-10 h-10 rounded-full mb-2 bg-[#1a1a1a]"
            />
            <Text
              className={`text-sm font-bold text-center ${
                tossWinner === 'A' ? 'text-[#23c55e]' : 'text-white'
              }`}
            >
              {teamA.name}
            </Text>
            <Text className="text-[#888888] text-[10px] mt-0.5">Team A</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`w-[48%] border rounded-xl p-4 items-center ${
              tossWinner === 'B'
                ? 'border-[#23c55e] bg-[#23c55e]/15'
                : 'bg-[#121212] border-[#222222]'
            }`}
            onPress={() => setTossWinner('B')}
          >
            <Image
              source={{ uri: teamB.logo }}
              className="w-10 h-10 rounded-full mb-2 bg-[#1a1a1a]"
            />
            <Text
              className={`text-sm font-bold text-center ${
                tossWinner === 'B' ? 'text-[#23c55e]' : 'text-white'
              }`}
            >
              {teamB.name}
            </Text>
            <Text className="text-[#888888] text-[10px] mt-0.5">Team B</Text>
          </TouchableOpacity>
        </View>

        {/* Toss Decision Selector */}
        <Text className="text-white text-sm font-bold mb-3">Elected to?</Text>
        <View className="flex-row justify-between mb-6">
          <TouchableOpacity
            className={`w-[48%] border rounded-xl p-4 items-center ${
              tossDecision === 'Bat'
                ? 'border-[#23c55e] bg-[#23c55e]/15'
                : 'bg-[#121212] border-[#222222]'
            }`}
            onPress={() => setTossDecision('Bat')}
          >
            <MaterialCommunityIcons
              name="cricket"
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
      <PrimaryButton title="Continue to Playing XI" onPress={() => handleValidateMatchTeams(4)} />
    </View>
  );

  // ==========================================
  // STEP 4: PLAYING XI (Uses Real Team Members with Player IDs)
  // ==========================================
  const renderStep4 = () => {
    const activeTeamA = getActiveMembers(teamA);
    const activeTeamB = getActiveMembers(teamB);

    return (
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
                  Selected: {selectedXI_A.length} / 11 {selectedXI_A.length === 11 ? '✓' : ''}
                </Text>
                {selectedXI_A.length !== 11 && activeTeamA.length >= 11 && (
                  <TouchableOpacity
                    onPress={() => setSelectedXI_A(activeTeamA.slice(0, 11).map((p) => p.id))}
                    className="bg-[#23c55e]/20 px-2 py-0.5 rounded"
                  >
                    <Text className="text-[#23c55e] text-[10px] font-bold">Select 11</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {activeTeamA.map((p) => {
              const isSelected = selectedXI_A.includes(p.id);
              const isMe = currentUser?.playerId && (p.id === currentUser.playerId || p.playerId === currentUser.playerId);

              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => togglePlayerXI_A(p.id)}
                  className={`flex-row items-center p-2 rounded-lg mb-2 ${
                    isSelected ? 'bg-[#1a2e1d]/40 border border-[#23c55e]/40' : 'bg-[#181818]'
                  }`}
                >
                  <Image
                    source={{
                      uri:
                        p.avatar ||
                        p.img ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1e3a29&color=fff`,
                    }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white text-xs font-semibold mr-1.5">{p.name}</Text>
                      {isMe && (
                        <View className="bg-[#23c55e]/20 border border-[#23c55e] px-1.5 py-0.2 rounded">
                          <Text className="text-[#23c55e] text-[9px] font-bold">YOU</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[#888888] text-[10px]">
                      {p.role} • {p.style || p.battingStyle || 'Player'}
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
                  Selected: {selectedXI_B.length} / 11 {selectedXI_B.length === 11 ? '✓' : ''}
                </Text>
                {selectedXI_B.length !== 11 && activeTeamB.length >= 11 && (
                  <TouchableOpacity
                    onPress={() => setSelectedXI_B(activeTeamB.slice(0, 11).map((p) => p.id))}
                    className="bg-[#23c55e]/20 px-2 py-0.5 rounded"
                  >
                    <Text className="text-[#23c55e] text-[10px] font-bold">Select 11</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {activeTeamB.map((p) => {
              const isSelected = selectedXI_B.includes(p.id);
              const isMe = currentUser?.playerId && (p.id === currentUser.playerId || p.playerId === currentUser.playerId);

              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => togglePlayerXI_B(p.id)}
                  className={`flex-row items-center p-2 rounded-lg mb-2 ${
                    isSelected ? 'bg-[#1a2e1d]/40 border border-[#23c55e]/40' : 'bg-[#181818]'
                  }`}
                >
                  <Image
                    source={{
                      uri:
                        p.avatar ||
                        p.img ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=b9770e&color=fff`,
                    }}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white text-xs font-semibold mr-1.5">{p.name}</Text>
                      {isMe && (
                        <View className="bg-[#23c55e]/20 border border-[#23c55e] px-1.5 py-0.2 rounded">
                          <Text className="text-[#23c55e] text-[9px] font-bold">YOU</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[#888888] text-[10px]">
                      {p.role} • {p.style || p.battingStyle || 'Player'}
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
  };

  // ==========================================
  // STEP 5: OPENING PLAYERS
  // ==========================================
  const renderStep5 = () => {
    const strikerPlayer = battingXIPlayers.find((p) => p.id === strikerId) || battingXIPlayers[0];
    const nonStrikerPlayer = battingXIPlayers.find((p) => p.id === nonStrikerId) || battingXIPlayers[1];
    const openingBowler =
      bowlingXIPlayers.find((p) => p.id === openingBowlerId) ||
      bowlingXIPlayers[bowlingXIPlayers.length - 1];
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
                <Image
                  source={{
                    uri:
                      strikerPlayer.avatar ||
                      strikerPlayer.img ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(strikerPlayer.name)}&background=1e3a29&color=fff`,
                  }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{strikerPlayer.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {strikerPlayer.role} • {strikerPlayer.style || strikerPlayer.battingStyle}
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
                <Image
                  source={{
                    uri:
                      nonStrikerPlayer.avatar ||
                      nonStrikerPlayer.img ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(nonStrikerPlayer.name)}&background=1e3a29&color=fff`,
                  }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{nonStrikerPlayer.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {nonStrikerPlayer.role} • {nonStrikerPlayer.style || nonStrikerPlayer.battingStyle}
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
                <Image
                  source={{
                    uri:
                      openingBowler.avatar ||
                      openingBowler.img ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(openingBowler.name)}&background=1e3a29&color=fff`,
                  }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{openingBowler.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {openingBowler.role} • {openingBowler.style || openingBowler.bowlingStyle}
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
                <Image
                  source={{
                    uri:
                      wicketkeeper.avatar ||
                      wicketkeeper.img ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(wicketkeeper.name)}&background=1e3a29&color=fff`,
                  }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{wicketkeeper.name}</Text>
                  <Text className="text-[#888888] text-[10px]">
                    {wicketkeeper.role} • {wicketkeeper.style || wicketkeeper.battingStyle}
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
    const openingBowler =
      bowlingXIPlayers.find((p) => p.id === openingBowlerId) ||
      bowlingXIPlayers[bowlingXIPlayers.length - 1];
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
        <PrimaryButton title="Go to Live Scoring" onPress={handleStartMatch} />
      </View>
    );
  };

  // ==========================================
  // STEP 7: LIVE PREVIEW
  // ==========================================
  const renderStep7 = () => {
    const strikerPlayer = battingXIPlayers.find((p) => p.id === strikerId) || battingXIPlayers[0];
    const nonStrikerPlayer = battingXIPlayers.find((p) => p.id === nonStrikerId) || battingXIPlayers[1];
    const openingBowler =
      bowlingXIPlayers.find((p) => p.id === openingBowlerId) ||
      bowlingXIPlayers[bowlingXIPlayers.length - 1];
    const wicketkeeper = bowlingXIPlayers.find((p) => p.id === wicketkeeperId) || bowlingXIPlayers[0];

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <FlowHeader title="Live Match Preview" step={7} totalSteps={7} />
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 }}>
          <Text className="text-white text-[22px] font-bold mb-1">Live Match Preview</Text>
          <Text className="text-[#888888] text-[13px] mb-4">
            Simulated view of the live scoring interface
          </Text>

          <View className="bg-[#121212] border border-[#222222] rounded-2xl p-5 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-[#ef4444] px-2.5 py-0.5 rounded-full flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse" />
                <Text className="text-white text-[10px] font-bold uppercase">LIVE</Text>
              </View>
              <Text className="text-[#888888] text-xs">
                {matchFormat} • Innings 1 • 0.0 / {oversPerInnings} Ov
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: firstInningsBattingTeam.logo }}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <View>
                  <Text className="text-white text-base font-bold">
                    {firstInningsBattingTeam.name}
                  </Text>
                  <Text className="text-[#888888] text-xs">
                    Toss: {winnerTeam.name} ({tossDecision})
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-white text-3xl font-extrabold">0 / 0</Text>
                <Text className="text-[#888888] text-xs font-semibold">CRR: 0.00</Text>
              </View>
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

  // 1. Team Picker Modal (Option A & Option B with search and squad view)
  const renderTeamPickerModal = () => {
    const currentUserId = currentUser?.playerId || 'player-001';
    const cleanQuery = teamSearchQuery.trim().toLowerCase();

    const filteredTeams = cleanQuery
      ? availableTeams.filter(
          (t) =>
            t.name.toLowerCase().includes(cleanQuery) ||
            (t.shortName && t.shortName.toLowerCase().includes(cleanQuery))
        )
      : availableTeams;

    const myTeams = filteredTeams.filter(
      (t) =>
        t.captainId === currentUserId ||
        (t.members || []).some(
          (m) =>
            (m.playerId === currentUserId || m.id === currentUserId) &&
            m.status === 'accepted'
        )
    );
    const otherTeams = filteredTeams.filter((t) => !myTeams.some((mt) => mt.id === t.id));

    const handleSelectTeam = (selectedTeam) => {
      // Prevent selecting the same team for Team A and Team B (Requirement 13)
      if (
        (teamPickerSlot === 'A' && teamB?.id === selectedTeam.id) ||
        (teamPickerSlot === 'B' && teamA?.id === selectedTeam.id)
      ) {
        Alert.alert('Invalid Selection', 'Please select two different teams.');
        return;
      }

      const activeMembers = getActiveMembers(selectedTeam);
      if (teamPickerSlot === 'A') {
        setTeamA(selectedTeam);
        setSelectedXI_A(activeMembers.slice(0, 11).map((p) => p.id));
      } else if (teamPickerSlot === 'B') {
        setTeamB(selectedTeam);
        setSelectedXI_B(activeMembers.slice(0, 11).map((p) => p.id));
      }
      setTeamPickerSlot(null);
      setTeamSearchQuery('');
    };

    const renderTeamCard = (t) => {
      const currentSelected =
        teamPickerSlot === 'A' ? teamA?.id === t.id : teamB?.id === t.id;
      const isOtherTeam =
        teamPickerSlot === 'A' ? teamB?.id === t.id : teamA?.id === t.id;
      const activeMembers = getActiveMembers(t);
      const isReady = activeMembers.length >= 11;

      return (
        <View
          key={t.id}
          className={`flex-row items-center p-3.5 rounded-xl mb-3 border ${
            currentSelected
              ? 'bg-[#1a2e1d] border-[#23c55e]'
              : isOtherTeam
              ? 'bg-[#141414] border-[#222222] opacity-60'
              : 'bg-[#181818] border-[#262626]'
          }`}
        >
          <TouchableOpacity
            onPress={() => handleSelectTeam(t)}
            className="flex-row items-center flex-1 mr-2"
          >
            <Image source={{ uri: t.logo }} className="w-11 h-11 rounded-full mr-3.5 bg-[#222]" />
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-white text-sm font-bold mr-2">{t.name}</Text>
                {t.shortName && (
                  <View className="bg-[#222] px-1.5 py-0.5 rounded">
                    <Text className="text-[#888888] text-[10px] font-bold">{t.shortName}</Text>
                  </View>
                )}
              </View>
              <Text className="text-[#888888] text-xs mt-0.5">
                {t.location || 'Local Ground'} • {activeMembers.length} active players
              </Text>
              <Text
                className={`text-[10px] font-semibold mt-0.5 ${
                  isReady ? 'text-[#23c55e]' : 'text-[#f1c40f]'
                }`}
              >
                {isReady ? '✓ Match Ready' : `⚠️ 11 players required for Playing XI (Have ${activeMembers.length})`}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setManagingSquadTeam(t)}
              className="bg-[#1e2e1e] px-2.5 py-1.5 rounded-lg border border-[#23c55e]/40 mr-2"
            >
              <Text className="text-xs text-[#23c55e] font-bold">Squad</Text>
            </TouchableOpacity>
            {currentSelected ? (
              <Feather name="check-circle" size={20} color={theme.primary} />
            ) : isOtherTeam ? (
              <TouchableOpacity
                onPress={() => Alert.alert('Invalid Selection', 'Please select two different teams.')}
                className="bg-[#222] px-2 py-1 rounded"
              >
                <Text className="text-[#888] text-[10px] font-semibold">Opponent</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleSelectTeam(t)}
              >
                <Feather name="chevron-right" size={18} color="#555" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    };

    return (
      <Modal visible={!!teamPickerSlot} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#121212] border-t border-[#222222] rounded-t-3xl max-h-[85%] p-5">
            <View className="flex-row justify-between items-center mb-3">
              <View>
                <Text className="text-white text-lg font-bold">
                  Select Team {teamPickerSlot}
                </Text>
                <Text className="text-[#888888] text-xs">
                  Pick an existing team or create a new team
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setTeamPickerSlot(null);
                  setTeamSearchQuery('');
                }}
                className="w-8 h-8 rounded-full bg-[#1a1a1a] items-center justify-center"
              >
                <Feather name="x" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Team Search (Requirement 11 & 12) */}
            <View className="flex-row items-center bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-1 mb-3">
              <Feather name="search" size={16} color="#888" style={{ marginRight: 8 }} />
              <TextInput
                value={teamSearchQuery}
                onChangeText={setTeamSearchQuery}
                placeholder="Search teams by name or code..."
                placeholderTextColor="#666"
                className="flex-1 text-white text-xs py-2"
              />
              {teamSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setTeamSearchQuery('')}>
                  <Feather name="x-circle" size={16} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            {/* Create Team Button */}
            <TouchableOpacity
              onPress={() => {
                setShowCreateTeamModal(true);
              }}
              className="flex-row items-center justify-center bg-[#23c55e]/15 border border-[#23c55e] rounded-xl p-3 mb-4"
            >
              <Feather name="plus-circle" size={18} color={theme.primary} style={{ marginRight: 8 }} />
              <Text className="text-[#23c55e] text-xs font-bold">+ Create New Team</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
              {myTeams.length > 0 && (
                <View className="mb-4">
                  <Text className="text-[#888888] text-[11px] font-bold uppercase tracking-wider mb-2">
                    My Teams
                  </Text>
                  {myTeams.map(renderTeamCard)}
                </View>
              )}

              <View>
                <Text className="text-[#888888] text-[11px] font-bold uppercase tracking-wider mb-2">
                  {cleanQuery ? 'Search Results' : 'Available Teams'}
                </Text>
                {otherTeams.length > 0 ? (
                  otherTeams.map(renderTeamCard)
                ) : myTeams.length === 0 ? (
                  <View className="py-6 items-center">
                    <Text className="text-[#888888] text-xs">No teams found matching "{cleanQuery}"</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // 2. Create Team Modal (Requirement 2 & 22: Real captain, no fake players)
  const renderCreateTeamModal = () => (
    <Modal visible={showCreateTeamModal} transparent animationType="fade">
      <View className="flex-1 bg-black/80 justify-center items-center px-4">
        <View className="bg-[#121212] border border-[#222222] rounded-2xl p-5 w-full max-w-sm max-h-[90%]">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-white text-lg font-bold">Create New Team</Text>
              <TouchableOpacity onPress={() => setShowCreateTeamModal(false)} className="p-1">
                <Feather name="x" size={20} color="#888" />
              </TouchableOpacity>
            </View>
            <Text className="text-[#888888] text-xs mb-4">
              Build your team with a real roster and invite players
            </Text>

            <Text className="text-white text-xs font-bold mb-1">Team Name</Text>
            <TextInput
              value={newTeamName}
              onChangeText={(txt) => {
                setNewTeamName(txt);
                if (!newTeamShortName || newTeamShortName.length <= 3) {
                  const words = txt.trim().split(/\s+/);
                  const suggested =
                    words.length > 1
                      ? words.map((w) => w[0]).join('').toUpperCase()
                      : txt.slice(0, 3).toUpperCase();
                  setNewTeamShortName(suggested);
                }
              }}
              placeholder="e.g. Royal Strikers"
              placeholderTextColor="#666"
              className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm mb-3"
            />

            <Text className="text-white text-xs font-bold mb-1">Short Name / Code</Text>
            <TextInput
              value={newTeamShortName}
              onChangeText={setNewTeamShortName}
              maxLength={4}
              placeholder="e.g. RS"
              placeholderTextColor="#666"
              className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm mb-3"
            />

            {/* Sport selector (Cricket) */}
            <View className="flex-row items-center justify-between mb-3 bg-[#181818] border border-[#222] rounded-xl px-3 py-2">
              <Text className="text-[#888888] text-xs font-semibold">Sport</Text>
              <View className="flex-row items-center bg-[#23c55e]/15 px-2.5 py-1 rounded-lg border border-[#23c55e]/40">
                <Text className="text-[#23c55e] text-xs font-bold">🏏 Cricket</Text>
              </View>
            </View>

            {/* Team Type selector */}
            <Text className="text-white text-xs font-bold mb-1.5">Team Type</Text>
            <View className="flex-row flex-wrap gap-1.5 mb-3">
              {['Club', 'College', 'Turf', 'Friends', 'Other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNewTeamType(type)}
                  className={`px-3 py-1.5 rounded-lg border mr-1 mb-1 ${
                    newTeamType === type
                      ? 'bg-[#23c55e]/20 border-[#23c55e]'
                      : 'bg-[#1a1a1a] border-[#333]'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      newTeamType === type ? 'text-[#23c55e]' : 'text-[#888]'
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-white text-xs font-bold mb-1">Location / Ground (Optional)</Text>
            <TextInput
              value={newTeamLocation}
              onChangeText={setNewTeamLocation}
              placeholder="e.g. Hyderabad, India"
              placeholderTextColor="#666"
              className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm mb-3"
            />

            <Text className="text-white text-xs font-bold mb-1">Team Logo URL (Optional)</Text>
            <TextInput
              value={newTeamLogo}
              onChangeText={setNewTeamLogo}
              placeholder="Leave blank for auto-generated logo"
              placeholderTextColor="#666"
              className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-2.5 text-white text-sm mb-4"
            />

            {/* Captain & Squad Section: Creator is automatically Owner + Captain + Squad Member */}
            <View className="bg-[#181818] border border-[#222222] rounded-xl p-3 mb-5">
              <Text className="text-[#888888] text-[11px] mb-1">Owner & Captain</Text>
              <View className="flex-row items-center">
                <View className="w-2 h-2 rounded-full bg-[#23c55e] mr-2" />
                <Text className="text-white text-xs font-semibold">
                  {currentUser?.name || 'Player'} (Owner & Captain) • 1 Member
                </Text>
              </View>
              <Text className="text-[#888888] text-[10px] mt-1">
                You are automatically added as the Team Owner, Captain, and initial Squad Member.
              </Text>
            </View>

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={() => setShowCreateTeamModal(false)}
                className="px-4 py-2.5 mr-2"
              >
                <Text className="text-[#888888] text-sm font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateTeamSubmit}
                disabled={isCreatingTeam}
                className="bg-[#23c55e] px-5 py-2.5 rounded-xl items-center"
              >
                <Text className="text-black text-sm font-bold">
                  {isCreatingTeam ? 'Creating...' : 'Create Team'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // 2b. Team Members Screen Modal (Requirement 4, 9, 10: Squad view, readiness banner, member removal)
  const renderTeamMembersModal = () => {
    if (!managingSquadTeam) return null;
    const activeMembers = getActiveMembers(managingSquadTeam);
    const pendingMembers = getPendingMembers(managingSquadTeam);
    const isReady = activeMembers.length >= 11;
    const remaining = 11 - activeMembers.length;
    const captain =
      activeMembers.find((m) => m.isCaptain || m.playerId === managingSquadTeam.captainId) ||
      activeMembers[0];

    return (
      <Modal visible={!!managingSquadTeam} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-end">
          <View className="bg-[#121212] border-t border-[#222222] rounded-t-3xl max-h-[90%] p-5">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center flex-1 mr-3">
                <Image
                  source={{ uri: managingSquadTeam.logo }}
                  className="w-10 h-10 rounded-full mr-3 bg-[#1a1a1a]"
                />
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-white text-lg font-bold mr-2" numberOfLines={1}>
                      {managingSquadTeam.name}
                    </Text>
                    {managingSquadTeam.shortName && (
                      <View className="bg-[#222] px-1.5 py-0.5 rounded">
                        <Text className="text-[#888888] text-[10px] font-bold">
                          {managingSquadTeam.shortName}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-[#888888] text-xs">
                    {activeMembers.length} Squad Member{activeMembers.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setManagingSquadTeam(null)}
                className="w-8 h-8 rounded-full bg-[#1a1a1a] items-center justify-center"
              >
                <Feather name="x" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Squad Readiness Banner (Requirement 6 & 9) */}
            <View
              className={`p-3.5 rounded-xl border mb-4 ${
                isReady
                  ? 'bg-[#1a2e1d]/50 border-[#23c55e]/50'
                  : 'bg-[#2a2210]/50 border-[#f1c40f]/50'
              }`}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text
                  className={`text-xs font-bold uppercase tracking-wider ${
                    isReady ? 'text-[#23c55e]' : 'text-[#f1c40f]'
                  }`}
                >
                  {isReady ? 'Squad Ready ✓' : `${activeMembers.length} Members`}
                </Text>
                <Text
                  className={`text-xs font-semibold ${
                    isReady ? 'text-[#23c55e]' : 'text-[#f1c40f]'
                  }`}
                >
                  {isReady ? `${activeMembers.length} Members` : `Need ${remaining} More`}
                </Text>
              </View>
              <Text className="text-[#cccccc] text-xs">
                {isReady
                  ? `11 players required for Playing XI (Squad has ${activeMembers.length} members ✓)`
                  : `11 players required for Playing XI. Add ${remaining} more player${remaining > 1 ? 's' : ''} to complete your squad.`}
              </Text>
            </View>

            {/* + Add Player Button (Requirement 4 & 5) */}
            <TouchableOpacity
              onPress={() => {
                setSearchPlayerUid('');
                setSearchedPlayer(null);
                setSearchPlayerError('');
                setShowAddPlayerModal(true);
              }}
              className="flex-row items-center justify-center bg-[#23c55e] py-3 rounded-xl mb-4"
            >
              <Feather name="user-plus" size={18} color="#000" style={{ marginRight: 8 }} />
              <Text className="text-black text-sm font-bold">+ Add Player</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
              {/* Captain Section (Requirement 8) */}
              {captain && (
                <View className="mb-4">
                  <Text className="text-[#888888] text-xs font-bold uppercase tracking-wider mb-2">
                    Captain
                  </Text>
                  <View className="flex-row items-center bg-[#181818] border border-[#23c55e]/40 p-3 rounded-xl">
                    <Image
                      source={{
                        uri:
                          captain.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(captain.name)}&background=1e3a29&color=23c55e`,
                      }}
                      className="w-10 h-10 rounded-full mr-3 bg-[#222]"
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-white text-sm font-bold mr-1.5">{captain.name}</Text>
                        <View className="bg-[#23c55e]/20 px-1.5 py-0.5 rounded">
                          <Text className="text-[#23c55e] text-[10px] font-bold">✓ Captain</Text>
                        </View>
                      </View>
                      <Text className="text-[#888888] text-xs mt-0.5">
                        @{captain.username || 'captain'} • UID: {captain.playerUid || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Accepted Players Section */}
              <View className="mb-4">
                <Text className="text-[#888888] text-xs font-bold uppercase tracking-wider mb-2">
                  Squad Players ({activeMembers.length})
                </Text>
                {activeMembers.map((m, idx) => {
                  const isCap = m.isCaptain || m.playerId === managingSquadTeam.captainId;

                  return (
                    <View
                      key={m.playerId || m.id || idx}
                      className="flex-row items-center justify-between bg-[#181818] border border-[#222222] p-3 rounded-xl mb-2"
                    >
                      <View className="flex-row items-center flex-1 mr-2">
                        <Text className="text-[#888888] text-xs font-bold w-6">{idx + 1}.</Text>
                        <Image
                          source={{
                            uri:
                              m.avatar ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=1e3a29&color=fff`,
                          }}
                          className="w-9 h-9 rounded-full mr-2.5 bg-[#222]"
                        />
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <Text className="text-white text-xs font-bold mr-1.5">{m.name}</Text>
                            {isCap && (
                              <View className="bg-[#23c55e]/20 px-1 py-0.2 rounded">
                                <Text className="text-[#23c55e] text-[9px] font-bold">CAPTAIN</Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-[#888888] text-[11px] mt-0.5">
                            {m.role || 'Player'} • UID: {m.playerUid || 'N/A'}
                          </Text>
                        </View>
                      </View>

                      {!isCap && (
                        <TouchableOpacity
                          onPress={() => handleRemoveMember(m.playerId || m.id)}
                          className="p-2 rounded-lg bg-[#2a1a1a]"
                        >
                          <Feather name="trash-2" size={15} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Pending Invitations Section (Requirement 6) */}
              {pendingMembers.length > 0 && (
                <View className="mb-4">
                  <Text className="text-[#f1c40f] text-xs font-bold uppercase tracking-wider mb-2">
                    Pending Invitations ({pendingMembers.length})
                  </Text>
                  {pendingMembers.map((p, idx) => (
                    <View
                      key={p.playerId || p.id || idx}
                      className="bg-[#181818] border border-[#f1c40f]/30 p-3 rounded-xl mb-2"
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center flex-1">
                          <Image
                            source={{
                              uri:
                                p.avatar ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=2a2210&color=f1c40f`,
                            }}
                            className="w-8 h-8 rounded-full mr-2.5 bg-[#222]"
                          />
                          <View className="flex-1">
                            <Text className="text-white text-xs font-bold">{p.name}</Text>
                            <Text className="text-[#888888] text-[10px]">
                              UID: {p.playerUid} • Status: Pending
                            </Text>
                          </View>
                        </View>
                        <View className="bg-[#f1c40f]/20 px-2 py-0.5 rounded">
                          <Text className="text-[#f1c40f] text-[10px] font-bold">Pending</Text>
                        </View>
                      </View>

                      <View className="flex-row justify-end space-x-2">
                        <TouchableOpacity
                          onPress={() => handleRejectInvite(p.playerId || p.id)}
                          className="bg-[#222] px-3 py-1.5 rounded-lg mr-2"
                        >
                          <Text className="text-[#888888] text-xs font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleAcceptInvite(p.playerId || p.id)}
                          className="bg-[#23c55e]/20 border border-[#23c55e] px-3 py-1.5 rounded-lg"
                        >
                          <Text className="text-[#23c55e] text-xs font-bold">Accept Invite</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Done / Team Ready button */}
            <TouchableOpacity
              onPress={() => setManagingSquadTeam(null)}
              className="bg-[#23c55e] py-3 rounded-xl items-center mt-2"
            >
              <Text className="text-black text-sm font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // 2c. Add Player Modal supporting 4 Options (Search UID, Scan QR, Invite, Add Later)
  const renderAddPlayerModal = () => (
    <Modal visible={showAddPlayerModal} transparent animationType="fade">
      <View className="flex-1 bg-black/80 justify-center items-center px-4">
        <View className="bg-[#121212] border border-[#222222] rounded-2xl p-5 w-full max-w-sm">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-white text-lg font-bold">Add Player</Text>
            <TouchableOpacity onPress={() => setShowAddPlayerModal(false)} className="p-1">
              <Feather name="x" size={20} color="#888" />
            </TouchableOpacity>
          </View>
          <Text className="text-[#888888] text-xs mb-3">
            Add team members to your squad using their Player UID
          </Text>

          {/* Add Player Options Tabs */}
          <View className="flex-row bg-[#181818] rounded-xl p-1 mb-3.5 border border-[#222]">
            <TouchableOpacity
              className="flex-1 py-1.5 rounded-lg bg-[#23c55e]/20 border border-[#23c55e] items-center"
            >
              <Text className="text-[#23c55e] text-xs font-bold">Search UID</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'Scan Player QR will be available in an upcoming update.')}
              className="flex-1 py-1.5 rounded-lg items-center flex-row justify-center"
            >
              <Text className="text-[#888888] text-xs font-medium mr-1">Scan QR</Text>
              <View className="bg-[#333] px-1 py-0.2 rounded">
                <Text className="text-[#aaa] text-[8px] font-bold">SOON</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert('Coming Soon', 'Invite Player links will be available in an upcoming update.')}
              className="flex-1 py-1.5 rounded-lg items-center flex-row justify-center"
            >
              <Text className="text-[#888888] text-xs font-medium mr-1">Invite</Text>
              <View className="bg-[#333] px-1 py-0.2 rounded">
                <Text className="text-[#aaa] text-[8px] font-bold">SOON</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* UID Input */}
          <Text className="text-white text-xs font-bold mb-1">Player UID</Text>
          <View className="flex-row items-center bg-[#1a1a1a] border border-[#333] rounded-xl px-3 py-1 mb-3">
            <Feather name="search" size={16} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              value={searchPlayerUid}
              onChangeText={(txt) => {
                setSearchPlayerUid(txt);
                setSearchPlayerError('');
                setSearchedPlayer(null);
              }}
              placeholder="e.g. SP-7K4M-92QX"
              placeholderTextColor="#666"
              autoCapitalize="characters"
              autoCorrect={false}
              className="flex-1 text-white text-sm py-2 font-mono"
            />
            {searchPlayerUid.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchPlayerUid('');
                  setSearchedPlayer(null);
                  setSearchPlayerError('');
                }}
              >
                <Feather name="x-circle" size={16} color="#888" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearchPlayerByUid}
            disabled={isSearchingPlayer}
            className="bg-[#1e2e1e] border border-[#23c55e]/60 py-2.5 rounded-xl items-center mb-3"
          >
            <Text className="text-[#23c55e] text-xs font-bold">
              {isSearchingPlayer ? 'Searching...' : 'Search Player'}
            </Text>
          </TouchableOpacity>

          {/* Error Message */}
          {searchPlayerError ? (
            <View className="bg-[#2a1a1a] border border-[#ef4444]/40 p-3 rounded-xl mb-3">
              <Text className="text-[#ef4444] text-xs text-center font-semibold">
                {searchPlayerError}
              </Text>
            </View>
          ) : null}

          {/* Confirmation Card */}
          {searchedPlayer && (
            <View className="bg-[#181818] border border-[#23c55e] rounded-xl p-3.5 mb-3">
              <View className="flex-row items-center justify-between mb-2.5 border-b border-[#222222] pb-1.5">
                <Text className="text-[#23c55e] text-xs font-bold uppercase tracking-wider">
                  Player Found
                </Text>
                <Feather name="check-circle" size={16} color={theme.primary} />
              </View>

              <View className="flex-row items-center mb-3">
                <Image
                  source={{
                    uri:
                      searchedPlayer.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        searchedPlayer.name
                      )}&background=1e3a29&color=23c55e`,
                  }}
                  className="w-11 h-11 rounded-full mr-3 bg-[#222]"
                />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">
                    {searchedPlayer.name}
                  </Text>
                  <Text className="text-[#888888] text-xs">
                    {searchedPlayer.username?.startsWith('@') ? searchedPlayer.username : `@${searchedPlayer.username}`}
                  </Text>
                  <Text className="text-[#23c55e] text-[11px] font-mono mt-0.5">
                    Player UID: {searchedPlayer.playerUid}
                  </Text>
                  {searchedPlayer.role && (
                    <Text className="text-[#888888] text-[10px] mt-0.5">
                      {searchedPlayer.role} • {searchedPlayer.style || 'Player'}
                    </Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddPlayerToSquad}
                disabled={isInvitingPlayer}
                className="bg-[#23c55e] py-2.5 rounded-xl items-center"
              >
                <Text className="text-black text-sm font-bold">
                  {isInvitingPlayer ? 'Adding...' : 'Add Player to Squad'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Add Later button */}
          <TouchableOpacity
            onPress={() => {
              setShowAddPlayerModal(false);
              setSearchPlayerUid('');
              setSearchedPlayer(null);
              setSearchPlayerError('');
            }}
            className="py-2.5 items-center rounded-xl bg-[#1a1a1a] border border-[#333] mb-2"
          >
            <Text className="text-white text-xs font-semibold">Add Later</Text>
          </TouchableOpacity>

          {/* Cancel button */}
          <TouchableOpacity
            onPress={() => setShowAddPlayerModal(false)}
            className="py-1.5 items-center"
          >
            <Text className="text-[#888888] text-xs font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // 3. Custom Overs Modal
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
            <TouchableOpacity onPress={handleSaveCustomOvers} className="bg-[#23c55e] px-5 py-2 rounded-lg">
              <Text className="text-black text-sm font-bold">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // 4. Edit Field Modal (Venue, Date, Time, Rules)
  const renderEditFieldModal = () => (
    <Modal visible={!!editingField} transparent animationType="fade">
      <View className="flex-1 bg-black/75 justify-center items-center px-4">
        <View className="bg-[#121212] border border-[#222222] rounded-2xl p-5 w-full max-w-sm">
          <Text className="text-white text-lg font-bold mb-1">
            {editingField === 'venue'
              ? 'Edit Venue'
              : editingField === 'date'
              ? 'Edit Date'
              : editingField === 'time'
              ? 'Edit Time'
              : 'Edit Rules'}
          </Text>
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            placeholder="Enter value"
            placeholderTextColor="#666"
            className="bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white text-sm mb-4 mt-3"
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

  // 5. Player Picker Modal (Striker, Non-striker, Bowler, Keeper)
  const renderPlayerPickerModal = () => {
    if (!pickerConfig) return null;

    return (
      <Modal visible={!!pickerConfig} transparent animationType="slide">
        <View className="flex-1 bg-black/75 justify-end">
          <View className="bg-[#121212] border-t border-[#222222] rounded-t-3xl max-h-[70%] p-5">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-white text-lg font-bold">{pickerConfig.title}</Text>
                <Text className="text-[#888888] text-xs">
                  {pickerConfig.team} • {pickerConfig.role}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPickerConfig(null)} className="p-1">
                <Feather name="x" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {pickerConfig.players.map((p) => {
                const isSelected = p.id === pickerConfig.currentId;
                const isMe = currentUser?.playerId && (p.id === currentUser.playerId || p.playerId === currentUser.playerId);

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
                    <Image
                      source={{
                        uri:
                          p.avatar ||
                          p.img ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1e3a29&color=fff`,
                      }}
                      className="w-9 h-9 rounded-full mr-3"
                    />
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-white text-sm font-bold mr-1.5">{p.name}</Text>
                        {isMe && (
                          <View className="bg-[#23c55e]/20 border border-[#23c55e] px-1.5 py-0.2 rounded">
                            <Text className="text-[#23c55e] text-[9px] font-bold">YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-[#888888] text-xs">
                        {p.role} • {p.style || p.battingStyle || 'Player'}
                      </Text>
                    </View>
                    {isSelected && <Feather name="check" size={20} color={theme.primary} />}
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
      {renderTeamPickerModal()}
      {renderCreateTeamModal()}
      {renderTeamMembersModal()}
      {renderAddPlayerModal()}
      {renderPlayerPickerModal()}
    </SafeAreaView>
  );
}