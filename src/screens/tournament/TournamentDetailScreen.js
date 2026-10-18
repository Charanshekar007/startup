import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { tournamentService } from '../../services/tournamentService.js';
import { subscribeToTournament } from '../../store/tournamentRepository.js';
import { getTeams } from '../../store/teamRepository.js';
import { useAuthStore } from '../../store/authStore.js';
import { playerService } from '../../services/playerService.js';
import { useMatches } from '../../context/MatchContext.js';
import TeamSquadBottomSheet from '../../components/tournament/TeamSquadBottomSheet.js';

const { width } = Dimensions.get('window');

export default function TournamentDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const tournamentId = route.params?.tournamentId;

  const { addMatch, matches } = useMatches() || {};

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    (route.params?.initialTab || 'FIXTURES').toUpperCase()
  ); // 'OVERVIEW' | 'FIXTURES' | 'STANDINGS' | 'TEAMS' | 'MANAGE'

  // Current authenticated user
  const authAccount = useAuthStore((state) => state.accountData);
  const [currentUserId, setCurrentUserId] = useState(authAccount?.id || 'usr_arjun123');
  const [myTeams, setMyTeams] = useState([]);

  // Filter stage in fixtures
  const [fixtureStageFilter, setFixtureStageFilter] = useState('ALL');

  // Groups format tab in standings
  const [standingsGroupTab, setStandingsGroupTab] = useState('A');

  // Registration modal for team captains
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedApplyingTeam, setSelectedApplyingTeam] = useState(null);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Invite modal for organizers
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [allTeams, setAllTeams] = useState([]);
  const [inviteSearch, setInviteSearch] = useState('');

  // Selected squad viewing modal
  const [viewingSquadTeam, setViewingSquadTeam] = useState(null);
  const viewingSquadTeamRef = React.useRef(viewingSquadTeam);
  viewingSquadTeamRef.current = viewingSquadTeam;

  // Load tournament and subscribe to updates
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!tournamentId) return;
      try {
        const data = await tournamentService.getTournament(tournamentId);
        if (isMounted && data) {
          setTournament(data);
        }

        const teamsList = await getTeams();
        if (isMounted) {
          setAllTeams(teamsList || []);
        }

        const u = await playerService.getCurrentUser();
        if (isMounted && u) {
          const uId = u.id || u.playerId || 'usr_arjun123';
          setCurrentUserId(uId);

          // Find teams captained or owned by current user
          const userCaptained = (teamsList || []).filter(
            (t) =>
              t.captainId === uId ||
              t.ownerId === uId ||
              (t.members || []).some((m) => (m.userId === uId || m.playerId === uId) && m.isCaptain)
          );
          setMyTeams(userCaptained);
        }
      } catch (e) {
        console.error('Error loading tournament detail:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    // Subscribe to real-time changes
    const unsub = subscribeToTournament(tournamentId, (updated) => {
      if (isMounted && updated) {
        setTournament(updated);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [tournamentId]);

  // Explicit dashboard back handler: navigate directly to logical parent (MyTournaments, Discover, Profile, etc.)
  const handleBackToLogicalParent = useCallback(() => {
    const returnDest = route.params?.returnDestination;
    if (returnDest === 'Discover') {
      navigation.navigate('MainTabs', { screen: 'Discover' });
    } else if (returnDest === 'Profile') {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    } else if (returnDest === 'Home') {
      navigation.navigate('MainTabs', { screen: 'Home' });
    } else {
      navigation.navigate('MyTournaments');
    }
  }, [navigation, route.params?.returnDestination]);

  // Navigate to full player profile from squad sheet
  const handleViewFullProfile = useCallback(
    (player) => {
      const pId = player?.id || player?.playerId || player?.userId || player?.stableId;
      if (!pId) return;
      setViewingSquadTeam(null);
      navigation.navigate('MainTabs', {
        screen: 'Profile',
        params: {
          userId: pId,
          returnDestination: 'TournamentDetail',
          tournamentId,
          initialTab: 'TEAMS',
        },
      });
    },
    [navigation, tournamentId]
  );

  // Refresh tournament data and synchronize activeTab on screen focus (e.g. returning from match)
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function refresh() {
        if (!tournamentId) return;
        try {
          const data = await tournamentService.getTournament(tournamentId);
          if (isMounted && data) {
            setTournament(data);
          }
        } catch (e) {
          console.error('Error refreshing tournament on focus:', e);
        }
      }
      refresh();
      if (route.params?.initialTab) {
        setActiveTab(String(route.params.initialTab).toUpperCase());
      }

      // Intercept Android hardware back button: dismiss squad sheet first if open, else return directly to logical parent
      const onBackPress = () => {
        if (viewingSquadTeamRef.current) {
          setViewingSquadTeam(null);
          return true;
        }
        handleBackToLogicalParent();
        return true;
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        isMounted = false;
        subscription.remove();
      };
    }, [tournamentId, route.params?.initialTab, handleBackToLogicalParent])
  );

  if (loading || !tournament) {
    return (
      <SafeAreaView className="flex-1 bg-[#0a0a0a] items-center justify-center">
        <Feather name="loader" size={28} color="#23c55e" />
        <Text className="text-[#888888] text-xs mt-3">Loading Tournament...</Text>
      </SafeAreaView>
    );
  }

  const isOrganizer = tournament.organizerId === currentUserId;
  const acceptedTeams = (tournament.registration?.teams || []).filter((t) => t.status === 'accepted');
  const pendingTeams = (tournament.registration?.teams || []).filter((t) => t.status === 'pending');
  const maxTeams = tournament.registration?.maxTeams || 16;
  const isFull = acceptedTeams.length >= maxTeams;

  // Check if current user has an accepted or pending team in this tournament
  const userRegisteredTeam = myTeams.find((mt) =>
    (tournament.registration?.teams || []).some((tt) => tt.teamId === mt.id)
  );
  const userTeamStatus = userRegisteredTeam
    ? (tournament.registration?.teams || []).find((tt) => tt.teamId === userRegisteredTeam.id)?.status
    : null;

  // Handle Match Start from Fixture
  const handleStartFixtureMatch = async (fixture) => {
    try {
      if (!isOrganizer) {
        Alert.alert('Permission Denied', 'Only the tournament organizer can officially start match scoring.');
        return;
      }

      // Check if match already exists in MatchContext
      const existingMatch = (matches || []).find((m) => m.id === fixture.matchId || m.fixtureId === fixture.id);
      let matchPayload = existingMatch;

      if (!matchPayload) {
        matchPayload = await tournamentService.getFixtureMatchData(tournament, fixture);
        if (addMatch) {
          addMatch(matchPayload);
        }
      }

      // Explicitly attach tournament and fixture metadata
      matchPayload.tournamentId = tournament.id;
      matchPayload.tournamentName = tournament.name;
      matchPayload.fixtureId = fixture.id;

      // Navigate to Live Scoring Screen
      navigation.navigate('LiveScoring', {
        matchData: matchPayload,
        isScorer: true,
        tournamentId: tournament.id,
        fixtureId: fixture.id,
        returnDestination: route.params?.returnDestination || 'MyTournaments',
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to start fixture match.');
    }
  };

  // Handle Watch Match
  const handleWatchFixtureMatch = async (fixture) => {
    try {
      const existingMatch = (matches || []).find((m) => m.id === fixture.matchId || m.fixtureId === fixture.id);
      const matchPayload = existingMatch || (await tournamentService.getFixtureMatchData(tournament, fixture));
      matchPayload.tournamentId = tournament.id;
      matchPayload.tournamentName = tournament.name;
      matchPayload.fixtureId = fixture.id;
      navigation.navigate('LiveScoring', {
        matchData: matchPayload,
        isSpectator: true,
        tournamentId: tournament.id,
        fixtureId: fixture.id,
        returnDestination: route.params?.returnDestination || 'MyTournaments',
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to open match viewer.');
    }
  };

  // Submit Application
  const handleSubmitApplication = async () => {
    if (!selectedApplyingTeam) {
      Alert.alert('Selection Required', 'Please select a team to register.');
      return;
    }
    setIsSubmittingApp(true);
    try {
      await tournamentService.applyToTournament(tournament.id, selectedApplyingTeam.id, currentUserId);
      Alert.alert('Application Submitted!', `Your team "${selectedApplyingTeam.name}" has applied. Waiting for organizer approval.`);
      setShowApplyModal(false);
      setSelectedApplyingTeam(null);
    } catch (err) {
      Alert.alert('Registration Error', err.message || 'Failed to submit application.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // Organizer decides on application
  const handleDecideApplication = async (teamId, decision) => {
    try {
      await tournamentService.decideApplication(tournament.id, teamId, decision, currentUserId);
    } catch (err) {
      Alert.alert('Action Failed', err.message || 'Could not update application status.');
    }
  };

  // Organizer invites team
  const handleSendInvite = async (teamId) => {
    try {
      await tournamentService.inviteTeam(tournament.id, teamId, currentUserId);
      Alert.alert('Invitation Sent!', 'Team invitation has been issued.');
    } catch (err) {
      Alert.alert('Invite Error', err.message || 'Failed to invite team.');
    }
  };

  // -------------------------------------------------------------------------
  // TAB 1: OVERVIEW
  // -------------------------------------------------------------------------
  const renderOverviewTab = () => (
    <View className="gap-3 pb-8">
      {/* Registration Status Banner */}
      {tournament.visibility === 'public' && tournament.status !== 'completed' && (
        <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-white text-xs font-bold">Team Registration</Text>
              <Text className="text-[#888888] text-[11px]">
                {acceptedTeams.length}/{maxTeams} Teams Enrolled {isFull ? '(FULL)' : ''}
              </Text>
            </View>
            <View className={`px-2.5 py-1 rounded-full ${isFull ? 'bg-red-500/20' : 'bg-[#23c55e]/20'}`}>
              <Text className={`text-[10px] font-bold ${isFull ? 'text-red-400' : 'text-[#23c55e]'}`}>
                {isFull ? 'CAPACITY FULL' : 'OPEN FOR ENTRY'}
              </Text>
            </View>
          </View>

          {/* User's Team Status */}
          {userTeamStatus ? (
            <View className="flex-row items-center bg-[#1a1a1a] p-3 rounded-xl border border-[#262626]">
              <Ionicons
                name={userTeamStatus === 'accepted' ? 'checkmark-circle' : 'time'}
                size={18}
                color={userTeamStatus === 'accepted' ? '#23c55e' : '#f1c40f'}
                className="mr-2"
              />
              <Text className="text-white text-xs font-semibold flex-1">
                Your Team ({userRegisteredTeam?.name}):{' '}
                <Text className={userTeamStatus === 'accepted' ? 'text-[#23c55e]' : 'text-[#f1c40f]'}>
                  {userTeamStatus.toUpperCase()}
                </Text>
              </Text>
            </View>
          ) : (
            myTeams.length > 0 && !isFull && (
              <TouchableOpacity
                className="bg-[#23c55e] py-3 rounded-xl items-center mt-2"
                onPress={() => {
                  setSelectedApplyingTeam(myTeams[0]);
                  setShowApplyModal(true);
                }}
              >
                <Text className="text-black text-xs font-bold">Register My Team</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      )}

      {/* Quick Specs Grid */}
      <View className="flex-row gap-2.5">
        <View className="flex-1 bg-[#121212] p-3 rounded-2xl border border-[#222222] items-center">
          <MaterialCommunityIcons name="cricket" size={20} color="#23c55e" className="mb-1" />
          <Text className="text-white text-xs font-bold">{tournament.rules?.matchFormat || 'T20'}</Text>
          <Text className="text-[#888888] text-[10px]">{tournament.rules?.oversPerInnings || 20} Overs</Text>
        </View>
        <View className="flex-1 bg-[#121212] p-3 rounded-2xl border border-[#222222] items-center">
          <MaterialCommunityIcons name="baseball" size={20} color="#23c55e" className="mb-1" />
          <Text className="text-white text-xs font-bold">{tournament.rules?.ballType || 'Leather'}</Text>
          <Text className="text-[#888888] text-[10px]">Ball Type</Text>
        </View>
        <View className="flex-1 bg-[#121212] p-3 rounded-2xl border border-[#222222] items-center">
          <MaterialCommunityIcons name="account-group" size={20} color="#23c55e" className="mb-1" />
          <Text className="text-white text-xs font-bold">{acceptedTeams.length}/{maxTeams}</Text>
          <Text className="text-[#888888] text-[10px]">Teams</Text>
        </View>
        <View className="flex-1 bg-[#121212] p-3 rounded-2xl border border-[#222222] items-center">
          <MaterialCommunityIcons name="calendar-check" size={20} color="#23c55e" className="mb-1" />
          <Text className="text-white text-xs font-bold">{(tournament.fixtures || []).length}</Text>
          <Text className="text-[#888888] text-[10px]">Matches</Text>
        </View>
      </View>

      {/* Description */}
      {Boolean(tournament.description) && (
        <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
          <Text className="text-white text-xs font-bold mb-1.5">About the Tournament</Text>
          <Text className="text-[#888888] text-xs leading-5">{tournament.description}</Text>
        </View>
      )}

      {/* Rules & Points Card */}
      <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
        <Text className="text-white text-xs font-bold mb-3 flex-row items-center">
          <Ionicons name="ribbon-outline" size={14} color="#23c55e" /> Scoring & Points System
        </Text>
        <View className="flex-row justify-between mb-3">
          <View className="items-center bg-[#1a1a1a] flex-1 mx-1 p-2 rounded-xl">
            <Text className="text-white text-xs font-bold">{tournament.rules?.pointsWin ?? 2} PTS</Text>
            <Text className="text-[#888888] text-[10px]">Win</Text>
          </View>
          <View className="items-center bg-[#1a1a1a] flex-1 mx-1 p-2 rounded-xl">
            <Text className="text-white text-xs font-bold">{tournament.rules?.pointsTie ?? 1} PTS</Text>
            <Text className="text-[#888888] text-[10px]">Tie</Text>
          </View>
          <View className="items-center bg-[#1a1a1a] flex-1 mx-1 p-2 rounded-xl">
            <Text className="text-white text-xs font-bold">{tournament.rules?.pointsNoResult ?? 1} PTS</Text>
            <Text className="text-[#888888] text-[10px]">No Result</Text>
          </View>
          <View className="items-center bg-[#1a1a1a] flex-1 mx-1 p-2 rounded-xl">
            <Text className="text-white text-xs font-bold">{tournament.rules?.pointsLoss ?? 0} PTS</Text>
            <Text className="text-[#888888] text-[10px]">Loss</Text>
          </View>
        </View>
        <Text className="text-[#666666] text-[11px]">
          Tie-breaks resolved deterministically: Points → Net Run Rate (NRR) → Total Wins → Head-to-Head.
        </Text>
      </View>

      {/* Venue & Organizer Card */}
      <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222] gap-3">
        <View className="flex-row items-center">
          <Feather name="map-pin" size={16} color="#23c55e" className="mr-2.5" />
          <View className="flex-1">
            <Text className="text-white text-xs font-bold">{tournament.venue}</Text>
            <Text className="text-[#888888] text-[11px]">{tournament.city}, India</Text>
          </View>
        </View>
        <View className="flex-row items-center pt-2 border-t border-[#1a1a1a]">
          <Feather name="user-check" size={16} color="#23c55e" className="mr-2.5" />
          <View className="flex-1">
            <Text className="text-white text-xs font-bold">Organized by {tournament.organizerName || 'EZKORA'}</Text>
            <Text className="text-[#888888] text-[11px]">Official Tournament Director</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // -------------------------------------------------------------------------
  // TAB 2: FIXTURES
  // -------------------------------------------------------------------------
  const renderFixturesTab = () => {
    const allFixtures = tournament.fixtures || [];
    const stages = ['ALL', ...new Set(allFixtures.map((f) => f.stage))];
    const filtered =
      fixtureStageFilter === 'ALL'
        ? allFixtures
        : allFixtures.filter((f) => f.stage === fixtureStageFilter);

    return (
      <View className="pb-8">
        {/* Stage Filter */}
        {stages.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 py-1">
            {stages.map((st) => (
              <TouchableOpacity
                key={st}
                className={`px-3 py-1.5 rounded-full mr-2 border ${fixtureStageFilter === st ? 'bg-[#23c55e] border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
                onPress={() => setFixtureStageFilter(st)}
              >
                <Text className={`text-xs font-bold ${fixtureStageFilter === st ? 'text-black' : 'text-[#888888]'}`}>
                  {st === 'ALL' ? 'All Matches' : st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {filtered.length > 0 ? (
          <View className="gap-3">
            {filtered.map((fix) => {
              const matchedLive = (matches || []).find((m) => m.id === fix.matchId || m.fixtureId === fix.id);
              const effectiveStatus = (matchedLive?.status === 'Completed' || fix.status === 'Completed')
                ? 'Completed'
                : (matchedLive?.status === 'Live' || fix.status === 'Live')
                  ? 'Live'
                  : fix.status || 'Scheduled';
              const isCompleted = effectiveStatus === 'Completed';
              const isLive = effectiveStatus === 'Live';
              const displayScoreA = matchedLive?.scoreA || fix.scoreA;
              const displayOversA = matchedLive?.oversA || fix.oversA;
              const displayScoreB = matchedLive?.scoreB || fix.scoreB;
              const displayOversB = matchedLive?.oversB || fix.oversB;
              const displayResultText = matchedLive?.resultText || matchedLive?.matchResult?.resultText || fix.resultText;
              const displayWinnerId = matchedLive?.winner === fix.teamA?.name
                ? fix.teamA?.id
                : (matchedLive?.winner === fix.teamB?.name ? fix.teamB?.id : fix.winnerId);

              return (
                <View key={fix.id} className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
                  {/* Fixture Header */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-[#888888] text-[10px] font-bold uppercase">{fix.stageName}</Text>
                    <View className="flex-row items-center">
                      <View
                        className={`px-2 py-0.5 rounded-full mr-2 ${
                          isLive
                            ? 'bg-red-500/20'
                            : isCompleted
                            ? 'bg-[#1a1a1a]'
                            : 'bg-blue-500/20'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-bold ${
                            isLive ? 'text-red-400' : isCompleted ? 'text-[#888888]' : 'text-blue-400'
                          }`}
                        >
                          {isLive ? '● LIVE' : isCompleted ? 'FINAL' : 'UPCOMING'}
                        </Text>
                      </View>
                      <Text className="text-[#888888] text-[11px]">{fix.date} • {fix.time}</Text>
                    </View>
                  </View>

                  {/* Team A */}
                  <View className="flex-row justify-between items-center py-1">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Image source={{ uri: fix.teamA?.logo || 'https://ui-avatars.com/api/?name=A' }} className="w-6 h-6 rounded-full bg-[#1a1a1a] mr-2" />
                      <Text className={`text-xs font-bold ${displayWinnerId === fix.teamA?.id ? 'text-[#23c55e]' : 'text-white'}`} numberOfLines={1}>
                        {fix.teamA?.name}
                      </Text>
                    </View>
                    {displayScoreA ? (
                      <View className="items-end">
                        <Text className="text-white text-xs font-bold">{displayScoreA}</Text>
                        <Text className="text-[#888888] text-[10px]">{displayOversA}</Text>
                      </View>
                    ) : (
                      <Text className="text-[#666666] text-xs">-</Text>
                    )}
                  </View>

                  {/* Team B */}
                  <View className="flex-row justify-between items-center py-1">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Image source={{ uri: fix.teamB?.logo || 'https://ui-avatars.com/api/?name=B' }} className="w-6 h-6 rounded-full bg-[#1a1a1a] mr-2" />
                      <Text className={`text-xs font-bold ${displayWinnerId === fix.teamB?.id ? 'text-[#23c55e]' : 'text-white'}`} numberOfLines={1}>
                        {fix.teamB?.name}
                      </Text>
                    </View>
                    {displayScoreB ? (
                      <View className="items-end">
                        <Text className="text-white text-xs font-bold">{displayScoreB}</Text>
                        <Text className="text-[#888888] text-[10px]">{displayOversB}</Text>
                      </View>
                    ) : (
                      <Text className="text-[#666666] text-xs">-</Text>
                    )}
                  </View>

                  {/* Result Text */}
                  {Boolean(displayResultText) && (
                    <Text className="text-[#23c55e] text-[11px] font-semibold mt-2 pt-2 border-t border-[#1a1a1a]">
                      {displayResultText}
                    </Text>
                  )}

                  {/* Fixture Action CTA */}
                  <View className="flex-row justify-between items-center mt-3 pt-2.5 border-t border-[#1a1a1a]">
                    <Text className="text-[#666666] text-[10px]" numberOfLines={1}>
                      <Feather name="map-pin" size={10} /> {fix.venue}
                    </Text>

                    {isLive ? (
                      isOrganizer ? (
                        <TouchableOpacity
                          className="bg-[#23c55e] py-1.5 px-3 rounded-lg flex-row items-center"
                          onPress={() => handleStartFixtureMatch(fix)}
                        >
                          <Feather name="play" size={12} color="#000" className="mr-1" />
                          <Text className="text-black text-xs font-bold">Resume Match</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          className="bg-red-500 py-1.5 px-3 rounded-lg flex-row items-center"
                          onPress={() => handleWatchFixtureMatch(fix)}
                        >
                          <Feather name="tv" size={12} color="#fff" className="mr-1" />
                          <Text className="text-white text-xs font-bold">Watch Live</Text>
                        </TouchableOpacity>
                      )
                    ) : isCompleted ? (
                      <TouchableOpacity
                        className="bg-[#1a1a1a] border border-[#262626] py-1.5 px-3 rounded-lg flex-row items-center"
                        onPress={() => handleWatchFixtureMatch(fix)}
                      >
                        <Feather name="file-text" size={12} color="#888" className="mr-1" />
                        <Text className="text-white text-xs font-bold">Scorecard</Text>
                      </TouchableOpacity>
                    ) : isOrganizer ? (
                      <TouchableOpacity
                        className="bg-[#23c55e] py-1.5 px-3 rounded-lg flex-row items-center"
                        onPress={() => handleStartFixtureMatch(fix)}
                      >
                        <Feather name="play" size={12} color="#000" className="mr-1" />
                        <Text className="text-black text-xs font-bold">Start Match</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-[#666666] text-xs italic">Upcoming</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="bg-[#121212] p-8 rounded-2xl border border-[#222222] items-center justify-center">
            <Feather name="calendar" size={32} color="#666666" className="mb-2" />
            <Text className="text-white text-sm font-bold mb-1">No Fixtures Available</Text>
            <Text className="text-[#888888] text-xs text-center">
              Fixtures have not been scheduled yet for this tournament stage.
            </Text>
          </View>
        )}
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // TAB 3: STANDINGS / BRACKET
  // -------------------------------------------------------------------------
  const renderStandingsTab = () => {
    const formatType = tournament.format?.type || 'LEAGUE';

    // 1. KNOCKOUT BRACKET VIEW
    if (formatType === 'KNOCKOUT') {
      const allFixtures = tournament.fixtures || [];
      const rounds = [...new Set(allFixtures.map((f) => f.round))].sort((a, b) => a - b);

      return (
        <View className="pb-8">
          <Text className="text-white text-sm font-bold mb-1">Direct Knockout Bracket</Text>
          <Text className="text-[#888888] text-xs mb-4">Single elimination. Winner advances to next round.</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
            {rounds.map((rNum) => {
              const roundFixes = allFixtures.filter((f) => f.round === rNum);
              const roundTitle = roundFixes[0]?.stageName?.split(' ')[0] || `Round ${rNum}`;

              return (
                <View key={rNum} className="mr-4 w-60">
                  <View className="bg-[#161616] p-2.5 rounded-xl border border-[#262626] mb-3 items-center">
                    <Text className="text-[#23c55e] text-xs font-bold uppercase">{roundTitle}</Text>
                  </View>
                  <View className="gap-3">
                    {roundFixes.map((f) => (
                      <View key={f.id} className="bg-[#121212] p-3 rounded-2xl border border-[#222222]">
                        <Text className="text-[#666666] text-[10px] mb-1.5">{f.stageName}</Text>
                        <View className="flex-row justify-between items-center py-1 border-b border-[#1a1a1a]">
                          <Text className={`text-xs font-bold ${f.winnerId === f.teamA?.id ? 'text-[#23c55e]' : 'text-white'}`} numberOfLines={1}>
                            {f.teamA?.name}
                          </Text>
                          {Boolean(f.scoreA) && <Text className="text-white text-xs font-bold">{f.scoreA}</Text>}
                        </View>
                        <View className="flex-row justify-between items-center py-1">
                          <Text className={`text-xs font-bold ${f.winnerId === f.teamB?.id ? 'text-[#23c55e]' : 'text-white'}`} numberOfLines={1}>
                            {f.teamB?.name}
                          </Text>
                          {Boolean(f.scoreB) && <Text className="text-white text-xs font-bold">{f.scoreB}</Text>}
                        </View>
                        {f.isBye && (
                          <Text className="text-[#f1c40f] text-[10px] mt-1 italic">Advanced via Bye</Text>
                        )}
                        {Boolean(f.resultText) && !f.isBye && (
                          <Text className="text-[#23c55e] text-[10px] mt-1 font-semibold" numberOfLines={1}>
                            {f.resultText}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      );
    }

    // 2. LEAGUE OR GROUPS STANDINGS TABLE
    const standingsData = tournamentService.calculateStandings(tournament);
    const isGroups = formatType === 'GROUPS_PLAYOFFS';

    const currentRows = isGroups
      ? (standingsData[standingsGroupTab] || [])
      : (standingsData || []);

    return (
      <View className="pb-8">
        {/* Groups Switcher if Groups Format */}
        {isGroups && (
          <View className="flex-row gap-2 mb-3">
            {['A', 'B'].map((grp) => (
              <TouchableOpacity
                key={grp}
                className={`flex-1 py-2 rounded-xl border items-center ${standingsGroupTab === grp ? 'bg-[#23c55e] border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
                onPress={() => setStandingsGroupTab(grp)}
              >
                <Text className={`text-xs font-bold ${standingsGroupTab === grp ? 'text-black' : 'text-[#888888]'}`}>
                  Group {grp} Standings
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View className="bg-[#121212] rounded-2xl border border-[#222222] overflow-hidden">
          {/* Table Header */}
          <View className="flex-row items-center px-3 py-2.5 bg-[#161616] border-b border-[#262626]">
            <Text className="w-8 text-[#888888] text-[11px] font-bold">#</Text>
            <Text className="flex-1 text-[#888888] text-[11px] font-bold">Team</Text>
            <Text className="w-7 text-center text-[#888888] text-[11px] font-bold">P</Text>
            <Text className="w-7 text-center text-[#888888] text-[11px] font-bold">W</Text>
            <Text className="w-7 text-center text-[#888888] text-[11px] font-bold">L</Text>
            <Text className="w-7 text-center text-[#888888] text-[11px] font-bold">T</Text>
            <Text className="w-12 text-center text-[#888888] text-[11px] font-bold">NRR</Text>
            <Text className="w-9 text-right text-white text-[11px] font-bold">PTS</Text>
          </View>

          {/* Table Rows */}
          {currentRows.length > 0 ? (
            currentRows.map((row, idx) => {
              const isQualified = idx < (tournament.format?.qualifiersPerGroup || 2);
              return (
                <View
                  key={row.teamId}
                  className={`flex-row items-center px-3 py-3 ${idx < currentRows.length - 1 ? 'border-b border-[#1a1a1a]' : ''} ${isQualified ? 'bg-[#23c55e]/5' : ''}`}
                >
                  <View className="w-8 flex-row items-center">
                    <Text className={`text-xs font-bold ${isQualified ? 'text-[#23c55e]' : 'text-white'}`}>{row.rank}</Text>
                    {isQualified && <View className="w-1 h-3 rounded-full bg-[#23c55e] ml-1.5" />}
                  </View>
                  <View className="flex-1 flex-row items-center mr-1">
                    <Image source={{ uri: row.logo || 'https://ui-avatars.com/api/?name=T' }} className="w-5 h-5 rounded-full bg-[#222] mr-2" />
                    <Text className="text-white text-xs font-bold" numberOfLines={1}>{row.teamName}</Text>
                  </View>
                  <Text className="w-7 text-center text-[#888888] text-xs">{row.played}</Text>
                  <Text className="w-7 text-center text-[#888888] text-xs font-semibold">{row.won}</Text>
                  <Text className="w-7 text-center text-[#888888] text-xs">{row.lost}</Text>
                  <Text className="w-7 text-center text-[#888888] text-xs">{row.tied}</Text>
                  <Text className="w-12 text-center text-xs font-mono text-[#888888]">
                    {row.nrr > 0 ? `+${row.nrr.toFixed(3)}` : row.nrr.toFixed(3)}
                  </Text>
                  <Text className="w-9 text-right text-[#23c55e] text-xs font-bold">{row.points}</Text>
                </View>
              );
            })
          ) : (
            <View className="p-6 items-center">
              <Text className="text-[#888888] text-xs">No standings recorded yet.</Text>
            </View>
          )}
        </View>

        <Text className="text-[#666666] text-[10px] mt-2 px-1">
          P: Played, W: Won, L: Lost, T: Tied, NRR: Net Run Rate, PTS: Total Points.
          {isGroups && ' Top teams marked in green qualify for the Semi-Finals.'}
        </Text>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // TAB 4: TEAMS
  // -------------------------------------------------------------------------
  const renderTeamsTab = () => (
    <View className="pb-8">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-white text-sm font-bold">Enrolled Teams ({acceptedTeams.length})</Text>
        {isOrganizer && !isFull && (
          <TouchableOpacity
            className="flex-row items-center bg-[#23c55e]/20 border border-[#23c55e] px-3 py-1.5 rounded-xl"
            onPress={() => setShowInviteModal(true)}
          >
            <Feather name="user-plus" size={13} color="#23c55e" className="mr-1.5" />
            <Text className="text-[#23c55e] text-xs font-bold">Invite Team</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="gap-2.5">
        {acceptedTeams.map((team) => (
          <TouchableOpacity
            key={team.teamId}
            className="bg-[#121212] p-3.5 rounded-2xl border border-[#222222] flex-row items-center justify-between"
            onPress={() => setViewingSquadTeam(team)}
          >
            <View className="flex-row items-center flex-1 mr-2">
              <Image source={{ uri: team.logo }} className="w-10 h-10 rounded-full bg-[#1a1a1a] mr-3" />
              <View className="flex-1">
                <Text className="text-white text-xs font-bold">{team.teamName}</Text>
                <Text className="text-[#888888] text-[10px]">{team.location}</Text>
                {team.group && (
                  <Text className="text-[#23c55e] text-[10px] font-semibold mt-0.5">Group {team.group}</Text>
                )}
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[#23c55e] text-xs font-bold">Active Squad</Text>
              <Text className="text-[#888888] text-[10px]">Tap to view</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // -------------------------------------------------------------------------
  // TAB 5: MANAGE (ORGANIZER ONLY)
  // -------------------------------------------------------------------------
  const renderManageTab = () => (
    <View className="gap-4 pb-8">
      {/* Pending Applications Section */}
      <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
        <Text className="text-white text-xs font-bold mb-1">Pending Team Applications ({pendingTeams.length})</Text>
        <Text className="text-[#888888] text-[11px] mb-3">Review and approve teams wanting to join your tournament.</Text>

        {pendingTeams.length > 0 ? (
          <View className="gap-2.5">
            {pendingTeams.map((t) => (
              <View key={t.teamId} className="bg-[#161616] p-3 rounded-xl border border-[#262626]">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <Image source={{ uri: t.logo }} className="w-8 h-8 rounded-full bg-[#222] mr-2" />
                    <View className="flex-1">
                      <Text className="text-white text-xs font-bold">{t.teamName}</Text>
                      <Text className="text-[#888888] text-[10px]">{t.location} • {t.type}</Text>
                    </View>
                  </View>
                </View>

                <View className="flex-row gap-2 mt-1">
                  <TouchableOpacity
                    className="flex-1 bg-[#23c55e] py-1.5 rounded-lg items-center"
                    onPress={() => handleDecideApplication(t.teamId, 'accepted')}
                  >
                    <Text className="text-black text-xs font-bold">Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-[#222222] py-1.5 rounded-lg items-center"
                    onPress={() => handleDecideApplication(t.teamId, 'waitlisted')}
                  >
                    <Text className="text-[#f1c40f] text-xs font-semibold">Waitlist</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-500/20 py-1.5 rounded-lg items-center"
                    onPress={() => handleDecideApplication(t.teamId, 'rejected')}
                  >
                    <Text className="text-red-400 text-xs font-semibold">Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-[#666666] text-xs italic">No pending applications at this time.</Text>
        )}
      </View>

      {/* Tournament Lifecycle Action */}
      <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
        <Text className="text-white text-xs font-bold mb-1">Tournament Status</Text>
        <Text className="text-[#888888] text-[11px] mb-3">Current Status: <Text className="text-[#23c55e] font-bold">{tournament.status.toUpperCase()}</Text></Text>

        <View className="flex-row gap-2">
          {tournament.status === 'draft' && (
            <TouchableOpacity
              className="flex-1 bg-[#23c55e] py-2.5 rounded-xl items-center"
              onPress={async () => {
                tournament.status = 'published';
                await tournamentService.saveTournament(tournament);
                Alert.alert('Published', 'Tournament is now published and open for public registration.');
              }}
            >
              <Text className="text-black text-xs font-bold">Publish Tournament</Text>
            </TouchableOpacity>
          )}

          {tournament.status === 'published' && (
            <TouchableOpacity
              className="flex-1 bg-[#23c55e] py-2.5 rounded-xl items-center"
              onPress={async () => {
                tournament.status = 'in_progress';
                await tournamentService.saveTournament(tournament);
                Alert.alert('Tournament Started', 'Tournament is now in progress.');
              }}
            >
              <Text className="text-black text-xs font-bold">Start Tournament</Text>
            </TouchableOpacity>
          )}

          {tournament.status === 'in_progress' && (
            <TouchableOpacity
              className="flex-1 bg-[#1a1a1a] border border-[#262626] py-2.5 rounded-xl items-center"
              onPress={async () => {
                tournament.status = 'completed';
                await tournamentService.saveTournament(tournament);
                Alert.alert('Tournament Finalized', 'Tournament marked as completed.');
              }}
            >
              <Text className="text-white text-xs font-bold">Finalize Tournament</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header Banner */}
      <View className="px-4 py-3 border-b border-[#222222] flex-row items-center justify-between">
        <TouchableOpacity onPress={handleBackToLogicalParent} className="p-1">
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <View className="px-2.5 py-0.5 rounded-full bg-[#23c55e]/20 mr-2">
            <Text className="text-[#23c55e] text-[10px] font-bold uppercase">{tournament.status}</Text>
          </View>
          <View className="px-2.5 py-0.5 rounded-full bg-[#1a1a1a] border border-[#333]">
            <Text className="text-[#888888] text-[10px] font-bold">{tournament.format?.type?.replace('_', ' ')}</Text>
          </View>
        </View>
      </View>

      {/* Tournament Identity Card */}
      <View className="px-4 pt-3 pb-2 border-b border-[#1a1a1a]">
        <View className="flex-row items-center">
          <Image
            source={{ uri: tournament.logo || 'https://ui-avatars.com/api/?name=EZ' }}
            className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#222222] mr-3"
          />
          <View className="flex-1">
            <Text className="text-white text-base font-bold" numberOfLines={1}>{tournament.name}</Text>
            <Text className="text-[#888888] text-xs">
              <Feather name="map-pin" size={11} /> {tournament.city} • {tournament.venue}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View className="flex-row border-b border-[#222222] px-2">
        {[
          { id: 'OVERVIEW', label: 'Overview' },
          { id: 'FIXTURES', label: 'Fixtures' },
          { id: 'STANDINGS', label: tournament.format?.type === 'KNOCKOUT' ? 'Bracket' : 'Standings' },
          { id: 'TEAMS', label: 'Teams' },
          ...(isOrganizer ? [{ id: 'MANAGE', label: 'Manage' }] : []),
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`py-3 px-3.5 border-b-2 ${activeTab === tab.id ? 'border-[#23c55e]' : 'border-transparent'}`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text className={`text-xs font-bold ${activeTab === tab.id ? 'text-[#23c55e]' : 'text-[#888888]'}`}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {activeTab === 'OVERVIEW' && renderOverviewTab()}
        {activeTab === 'FIXTURES' && renderFixturesTab()}
        {activeTab === 'STANDINGS' && renderStandingsTab()}
        {activeTab === 'TEAMS' && renderTeamsTab()}
        {activeTab === 'MANAGE' && isOrganizer && renderManageTab()}
      </ScrollView>

      {/* Apply Team Modal */}
      {showApplyModal && (
        <Modal transparent animationType="slide">
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#121212] p-5 rounded-t-3xl border-t border-[#262626]">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-sm font-bold">Register Your Team</Text>
                <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                  <Feather name="x" size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <Text className="text-[#888888] text-xs mb-3">
                Select which team you would like to enter into {tournament.name}:
              </Text>

              {myTeams.map((team) => (
                <TouchableOpacity
                  key={team.id}
                  className={`p-3 rounded-xl border mb-2 flex-row items-center justify-between ${selectedApplyingTeam?.id === team.id ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#161616] border-[#262626]'}`}
                  onPress={() => setSelectedApplyingTeam(team)}
                >
                  <View className="flex-row items-center">
                    <Image source={{ uri: team.logo }} className="w-8 h-8 rounded-full mr-2.5" />
                    <View>
                      <Text className="text-white text-xs font-bold">{team.name}</Text>
                      <Text className="text-[#888888] text-[10px]">{team.location}</Text>
                    </View>
                  </View>
                  {selectedApplyingTeam?.id === team.id && <Feather name="check-circle" size={16} color="#23c55e" />}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="bg-[#23c55e] py-3.5 rounded-xl items-center mt-3"
                onPress={handleSubmitApplication}
                disabled={isSubmittingApp}
              >
                <Text className="text-black text-xs font-bold">
                  {isSubmittingApp ? 'Submitting...' : 'Confirm Registration'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Invite Team Modal */}
      {showInviteModal && (
        <Modal transparent animationType="slide">
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#121212] p-5 rounded-t-3xl border-t border-[#262626] max-h-[80%]">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-white text-sm font-bold">Invite Teams</Text>
                <TouchableOpacity onPress={() => setShowInviteModal(false)}>
                  <Feather name="x" size={20} color="#888" />
                </TouchableOpacity>
              </View>

              <View className="flex-row items-center bg-[#161616] border border-[#262626] rounded-xl px-3 py-2 mb-3">
                <Feather name="search" size={14} color="#888" className="mr-2" />
                <TextInput
                  className="flex-1 text-white text-xs"
                  placeholder="Search teams..."
                  placeholderTextColor="#666"
                  value={inviteSearch}
                  onChangeText={setInviteSearch}
                />
              </View>

              <ScrollView className="max-h-80">
                {allTeams
                  .filter((t) => t.name.toLowerCase().includes(inviteSearch.toLowerCase()))
                  .map((t) => {
                    const isAlreadyIn = (tournament.registration?.teams || []).some((tt) => tt.teamId === t.id);
                    return (
                      <View key={t.id} className="flex-row items-center justify-between p-2.5 border-b border-[#1a1a1a]">
                        <View className="flex-row items-center flex-1 mr-2">
                          <Image source={{ uri: t.logo }} className="w-8 h-8 rounded-full mr-2.5" />
                          <View className="flex-1">
                            <Text className="text-white text-xs font-bold">{t.name}</Text>
                            <Text className="text-[#888888] text-[10px]">{t.location}</Text>
                          </View>
                        </View>
                        {isAlreadyIn ? (
                          <Text className="text-[#888888] text-[10px]">Already added</Text>
                        ) : (
                          <TouchableOpacity
                            className="bg-[#23c55e] py-1 px-3 rounded-lg"
                            onPress={() => handleSendInvite(t.id)}
                          >
                            <Text className="text-black text-xs font-bold">Invite</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Premium Animated Team Squad Bottom Sheet */}
      <TeamSquadBottomSheet
        visible={Boolean(viewingSquadTeam)}
        team={viewingSquadTeam}
        allTeams={allTeams}
        matches={matches || []}
        tournament={tournament}
        onClose={() => setViewingSquadTeam(null)}
        onNavigateProfile={handleViewFullProfile}
      />
    </SafeAreaView>
  );
}
