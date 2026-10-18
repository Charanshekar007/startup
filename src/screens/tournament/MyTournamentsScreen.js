/**
 * MyTournamentsScreen.js
 * 
 * Central organizer & player hub for all tournaments:
 * - Filter by Drafts, Upcoming/Published, Live in progress, Completed
 * - Context-aware action buttons: Continue Editing, Resume Match, Open Tournament, View Standings
 * - Draft deletion with confirmation
 * - 100% NativeWind className. Zero StyleSheet objects.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { tournamentService } from '../../services/tournamentService.js';
import { useAuthStore } from '../../store/authStore.js';
import { playerService } from '../../services/playerService.js';
import { useMatches } from '../../context/MatchContext.js';

export default function MyTournamentsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { matches = [] } = useMatches() || {};

  const authAccount = useAuthStore((state) => state.accountData);
  const [currentUserId, setCurrentUserId] = useState(authAccount?.id || 'usr_arjun123');

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'DRAFTS' | 'UPCOMING' | 'LIVE' | 'COMPLETED'

  // Canonical Back navigation to Create tab or logical origin
  const handleBackToParent = useCallback(() => {
    if (route.params?.returnDestination === 'Profile') {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    } else {
      navigation.navigate('MainTabs', { screen: 'Create' });
    }
  }, [navigation, route.params?.returnDestination]);

  // Load current user and their tournaments
  const loadData = useCallback(async () => {
    try {
      let uId = currentUserId;
      const u = await playerService.getCurrentUser();
      if (u) {
        uId = u.id || u.playerId || currentUserId;
        setCurrentUserId(uId);
      }
      const data = await tournamentService.getUserTournaments(uId);
      setTournaments(data || []);
    } catch (err) {
      console.warn('Error loading user tournaments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useFocusEffect(
    useCallback(() => {
      loadData();

      // Intercept Android hardware back button to guarantee return to Create
      const onBackPress = () => {
        handleBackToParent();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [loadData, handleBackToParent])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Delete Draft Handler
  const handleDeleteDraft = (tournament) => {
    Alert.alert(
      'Delete Tournament Draft',
      `Are you sure you want to permanently delete "${tournament.name || 'Untitled Draft'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await tournamentService.deleteTournament(tournament.id, currentUserId);
              setTournaments((prev) => prev.filter((t) => t.id !== tournament.id));
              Alert.alert('Deleted', 'Tournament draft has been deleted.');
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete tournament draft.');
            }
          },
        },
      ]
    );
  };

  // Categorize tournaments
  const drafts = tournaments.filter((t) => t.status === 'draft');
  const liveTournaments = tournaments.filter((t) => {
    if (t.status !== 'published') return false;
    // Check if any fixture is currently Live
    const hasLiveFixture = (t.fixtures || []).some((f) => {
      const match = matches.find((m) => m.id === f.matchId || m.fixtureId === f.id);
      return f.status === 'Live' || match?.status === 'Live' || match?.status === 'In Progress';
    });
    return hasLiveFixture;
  });

  const completedTournaments = tournaments.filter((t) => {
    if (t.status === 'completed') return true;
    if (t.status !== 'published') return false;
    const fixtures = t.fixtures || [];
    return fixtures.length > 0 && fixtures.every((f) => f.status === 'Completed');
  });

  const upcomingTournaments = tournaments.filter((t) => {
    if (t.status !== 'published') return false;
    const isLive = liveTournaments.some((lt) => lt.id === t.id);
    const isDone = completedTournaments.some((ct) => ct.id === t.id);
    return !isLive && !isDone;
  });

  // Filter for active tab
  let filteredList = tournaments;
  if (activeTab === 'DRAFTS') filteredList = drafts;
  else if (activeTab === 'LIVE') filteredList = liveTournaments;
  else if (activeTab === 'UPCOMING') filteredList = upcomingTournaments;
  else if (activeTab === 'COMPLETED') filteredList = completedTournaments;

  const TABS = [
    { key: 'ALL', label: 'All', count: tournaments.length },
    { key: 'DRAFTS', label: 'Drafts', count: drafts.length },
    { key: 'LIVE', label: 'Live', count: liveTournaments.length },
    { key: 'UPCOMING', label: 'Upcoming', count: upcomingTournaments.length },
    { key: 'COMPLETED', label: 'Completed', count: completedTournaments.length },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#222222]">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBackToParent} className="p-1 mr-3">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-lg font-bold">My Tournaments</Text>
            <Text className="text-[#888888] text-[11px]">
              {tournaments.length} {tournaments.length === 1 ? 'Tournament' : 'Tournaments'} Organized
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('TournamentWizard')}
          className="bg-[#23c55e] px-3 py-1.5 rounded-xl flex-row items-center"
        >
          <Feather name="plus" size={14} color="#000" className="mr-1" />
          <Text className="text-black text-xs font-bold">New</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Filter Bar */}
      <View className="px-4 py-2.5 border-b border-[#1f1f1f]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-full mr-2 flex-row items-center ${
                  isActive ? 'bg-[#23c55e]' : 'bg-[#161616] border border-[#262626]'
                }`}
              >
                <Text
                  className={`text-xs font-bold mr-1.5 ${
                    isActive ? 'text-black' : 'text-[#888888]'
                  }`}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    className={`px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black/20' : 'bg-[#262626]'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        isActive ? 'text-black' : 'text-[#888888]'
                      }`}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tournaments List */}
      <ScrollView
        className="flex-1 px-4 pt-3"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#23c55e" />
        }
      >
        {loading ? (
          <View className="py-20 items-center justify-center">
            <Feather name="loader" size={28} color="#23c55e" />
            <Text className="text-[#888888] text-xs mt-3">Loading Tournaments...</Text>
          </View>
        ) : filteredList.length > 0 ? (
          <View className="gap-3.5 pb-20">
            {filteredList.map((item) => {
              const isDraft = item.status === 'draft';
              const isItemLive = liveTournaments.some((lt) => lt.id === item.id);
              const isItemDone = completedTournaments.some((ct) => ct.id === item.id);
              const acceptedTeamsCount = (item.registration?.teams || []).filter(
                (t) => t.status === 'accepted'
              ).length;
              const maxTeams = item.registration?.maxTeams || 8;
              const formatTitle = item.format?.type?.replace('_', ' ') || 'LEAGUE';

              // Draft Card
              if (isDraft) {
                const savedStep = item.lastSavedStep || 1;
                return (
                  <View
                    key={item.id}
                    className="bg-[#121212] p-4 rounded-2xl border border-[#2a2a2a]"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-row items-center flex-1 mr-2">
                        <View className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 items-center justify-center mr-3">
                          <Ionicons name="document-text" size={20} color="#f59e0b" />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center mb-0.5">
                            <View className="bg-amber-500/20 px-2 py-0.5 rounded-full mr-2">
                              <Text className="text-amber-400 text-[10px] font-black tracking-wide">
                                DRAFT
                              </Text>
                            </View>
                            <Text className="text-[#888888] text-[10px]">
                              Step {savedStep} of 6
                            </Text>
                          </View>
                          <Text className="text-white text-base font-bold" numberOfLines={1}>
                            {item.name || 'Untitled Tournament Draft'}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleDeleteDraft(item)}
                        className="p-1.5 rounded-lg bg-[#181818] border border-[#262626]"
                      >
                        <Feather name="trash-2" size={14} color="#ef4444" />
                      </TouchableOpacity>
                    </View>

                    <Text className="text-[#888888] text-xs mb-3">
                      {item.city || 'Local'} • {formatTitle} • {acceptedTeamsCount} Teams Added
                    </Text>

                    <View className="flex-row gap-2 pt-2 border-t border-[#1a1a1a]">
                      <TouchableOpacity
                        onPress={() => navigation.navigate('TournamentWizard', { existingDraft: item })}
                        className="flex-1 bg-[#23c55e] py-2.5 rounded-xl flex-row items-center justify-center"
                      >
                        <Feather name="edit-3" size={13} color="#000" className="mr-1.5" />
                        <Text className="text-black text-xs font-bold">Continue Editing</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              // Published Tournament Card
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.navigate('TournamentDetail', { tournamentId: item.id, returnDestination: 'MyTournaments' })}
                  activeOpacity={0.85}
                  className="bg-[#121212] p-4 rounded-2xl border border-[#222222]"
                >
                  <View className="flex-row justify-between items-start mb-2.5">
                    <View className="flex-row items-center flex-1 mr-2">
                      <Image
                        source={{ uri: item.logo || 'https://ui-avatars.com/api/?name=EZ' }}
                        className="w-11 h-11 rounded-xl bg-[#1a1a1a] mr-3"
                      />
                      <View className="flex-1">
                        <View className="flex-row items-center mb-0.5">
                          <View
                            className={`px-2 py-0.5 rounded-full mr-2 ${
                              isItemLive
                                ? 'bg-red-500/20'
                                : isItemDone
                                ? 'bg-gray-500/20'
                                : 'bg-[#23c55e]/20'
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-black ${
                                isItemLive
                                  ? 'text-red-400'
                                  : isItemDone
                                  ? 'text-gray-400'
                                  : 'text-[#23c55e]'
                              }`}
                            >
                              {isItemLive ? '● LIVE' : isItemDone ? 'COMPLETED' : 'UPCOMING'}
                            </Text>
                          </View>
                          <Text className="text-[#888888] text-[10px]">
                            {item.city} • {formatTitle}
                          </Text>
                        </View>
                        <Text className="text-white text-base font-bold" numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                    </View>

                    <Feather name="chevron-right" size={18} color="#666666" />
                  </View>

                  <View className="flex-row justify-between items-center bg-[#161616] p-2.5 rounded-xl border border-[#222222] mb-3">
                    <View className="flex-row items-center">
                      <Feather name="users" size={12} color="#888888" className="mr-1.5" />
                      <Text className="text-[#888888] text-xs">
                        {acceptedTeamsCount}/{maxTeams} Teams
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Feather name="calendar" size={12} color="#888888" className="mr-1.5" />
                      <Text className="text-[#888888] text-xs">
                        {item.startDate || 'Upcoming'}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="cricket" size={14} color="#23c55e" className="mr-1" />
                      <Text className="text-[#23c55e] text-xs font-bold">
                        {(item.fixtures || []).length} Fixtures
                      </Text>
                    </View>
                  </View>

                  {/* Context Aware Action Button */}
                  <View className="flex-row gap-2">
                    {isItemLive ? (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('TournamentDetail', {
                            tournamentId: item.id,
                            initialTab: 'Fixtures',
                            returnDestination: 'MyTournaments',
                          })
                        }
                        className="flex-1 bg-red-500 py-2.5 rounded-xl flex-row items-center justify-center"
                      >
                        <Feather name="radio" size={13} color="#fff" className="mr-1.5" />
                        <Text className="text-white text-xs font-bold">Resume Active Match</Text>
                      </TouchableOpacity>
                    ) : isItemDone ? (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('TournamentDetail', {
                            tournamentId: item.id,
                            initialTab: 'Standings',
                            returnDestination: 'MyTournaments',
                          })
                        }
                        className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] py-2.5 rounded-xl flex-row items-center justify-center"
                      >
                        <Feather name="award" size={13} color="#23c55e" className="mr-1.5" />
                        <Text className="text-[#23c55e] text-xs font-bold">View Results & Standings</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('TournamentDetail', {
                            tournamentId: item.id,
                            initialTab: 'Fixtures',
                            returnDestination: 'MyTournaments',
                          })
                        }
                        className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] py-2.5 rounded-xl flex-row items-center justify-center"
                      >
                        <Feather name="calendar" size={13} color="#23c55e" className="mr-1.5" />
                        <Text className="text-[#23c55e] text-xs font-bold">Open Tournament Dashboard</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View className="py-20 items-center justify-center px-4">
            <View className="w-16 h-16 rounded-full bg-[#161616] border border-[#262626] items-center justify-center mb-3">
              <Ionicons name="trophy-outline" size={32} color="#666" />
            </View>
            <Text className="text-white text-base font-bold mb-1">No Tournaments Found</Text>
            <Text className="text-[#888888] text-xs text-center mb-6">
              {activeTab === 'DRAFTS'
                ? "You don't have any saved tournament drafts."
                : activeTab === 'LIVE'
                ? 'No live tournament matches in progress right now.'
                : activeTab === 'COMPLETED'
                ? 'No completed tournaments yet.'
                : 'Organize leagues, knockout cups, and tournament fixtures with EZKORA.'}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('TournamentWizard')}
              className="bg-[#23c55e] px-5 py-3 rounded-xl flex-row items-center"
            >
              <Feather name="plus" size={16} color="#000" className="mr-1.5" />
              <Text className="text-black text-xs font-bold">Create Tournament</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
