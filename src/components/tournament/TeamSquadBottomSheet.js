import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { getActiveMembers, getTeamById, getTeams } from '../../store/teamRepository.js';
import { getUserById, getUserByPlayerUid } from '../../store/userRepository.js';
import { calculatePlayerStats } from '../../services/playerStatsService.js';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function getInitials(name) {
  if (!name || typeof name !== 'string') return 'EZ';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * TeamSquadBottomSheet
 *
 * Full-screen translucent team overlay displaying real enrolled team squad members
 * with an expanding athlete identity card on player selection.
 *
 * Strictly built with React Native and NativeWind className styling.
 */
export default function TeamSquadBottomSheet({
  visible,
  team,
  allTeams = [],
  matches = [],
  tournament,
  onClose,
  onNavigateProfile,
}) {
  const insets = useSafeAreaInsets();

  // Full team data (with members roster)
  const [teamDetails, setTeamDetails] = useState(team);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Selected player for signature expanding profile interaction
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [enrichedUser, setEnrichedUser] = useState(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize and fetch full team record whenever team prop changes
  useEffect(() => {
    let isMounted = true;

    async function resolveTeamData() {
      if (!team) {
        setTeamDetails(null);
        setSelectedPlayer(null);
        setEnrichedUser(null);
        setSearchQuery('');
        return;
      }

      const tId = team.teamId || team.id;
      const tName = team.teamName || team.name || '';

      // 1. If team already has populated members array, use it immediately
      if (Array.isArray(team.members) && team.members.length > 0) {
        setTeamDetails(team);
        return;
      }

      // 2. Check allTeams prop if present
      const matchInAll = (allTeams || []).find(
        (t) =>
          (t.id && t.id === tId) ||
          (t.teamId && t.teamId === tId) ||
          (tName && t.name && t.name.toLowerCase() === tName.toLowerCase())
      );
      if (matchInAll && Array.isArray(matchInAll.members) && matchInAll.members.length > 0) {
        setTeamDetails(matchInAll);
        return;
      }

      // 3. Fetch from repository by ID or search all teams by name
      setLoadingRoster(true);
      try {
        let full = tId ? await getTeamById(tId) : null;
        if (!full || !Array.isArray(full.members) || full.members.length === 0) {
          const allFromDb = await getTeams();
          full = (allFromDb || []).find(
            (t) =>
              (t.id && t.id === tId) ||
              (t.teamId && t.teamId === tId) ||
              (tName && t.name && t.name.toLowerCase() === tName.toLowerCase())
          );
        }
        if (isMounted) {
          setTeamDetails(full || team);
        }
      } catch (err) {
        console.error('Error resolving team squad roster:', err);
        if (isMounted) setTeamDetails(team);
      } finally {
        if (isMounted) setLoadingRoster(false);
      }
    }

    resolveTeamData();
    return () => {
      isMounted = false;
    };
  }, [team, allTeams]);

  // Derive genuine active squad members from real team record
  const activeMembers = useMemo(() => {
    const rawMembers = getActiveMembers(teamDetails || team);
    return rawMembers.map((m, idx) => ({
      ...m,
      stableId: m.id || m.playerId || m.userId || `squad_p_${idx}`,
      displayName: m.name || m.username || 'Squad Member',
    }));
  }, [teamDetails, team]);

  // Clear selected player if no longer part of active members
  useEffect(() => {
    if (selectedPlayer && activeMembers.length > 0) {
      const stillPresent = activeMembers.some(
        (m) =>
          m.stableId === (selectedPlayer.id || selectedPlayer.playerId || selectedPlayer.userId || selectedPlayer.stableId)
      );
      if (!stillPresent) {
        setSelectedPlayer(null);
        setEnrichedUser(null);
      }
    }
  }, [activeMembers, selectedPlayer]);

  // Asynchronously enrich selected player from userRepository (if registered user exists)
  useEffect(() => {
    let isMounted = true;
    async function loadUserDetails() {
      if (!selectedPlayer) {
        setEnrichedUser(null);
        return;
      }
      const pId = selectedPlayer.id || selectedPlayer.playerId || selectedPlayer.userId || selectedPlayer.stableId;
      try {
        let user = null;
        if (pId) {
          user = await getUserById(pId);
        }
        if (!user && selectedPlayer.playerUid) {
          user = await getUserByPlayerUid(selectedPlayer.playerUid);
        }
        if (isMounted && user) {
          setEnrichedUser(user);
        }
      } catch (e) {
        // Fallback to selectedPlayer's own fields
      }
    }
    loadUserDetails();
    return () => {
      isMounted = false;
    };
  }, [selectedPlayer]);

  // Filter squad list by search query (name, cricket role, username, UID)
  const filteredMembers = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return activeMembers;
    const q = searchQuery.trim().toLowerCase();
    return activeMembers.filter(
      (m) =>
        (m.displayName && m.displayName.toLowerCase().includes(q)) ||
        (m.role && m.role.toLowerCase().includes(q)) ||
        (m.username && m.username.toLowerCase().includes(q)) ||
        (m.playerUid && m.playerUid.toLowerCase().includes(q))
    );
  }, [activeMembers, searchQuery]);

  // Derive real statistics for the currently selected player from completed matches
  const playerStats = useMemo(() => {
    if (!selectedPlayer) return null;
    const pId = selectedPlayer.id || selectedPlayer.playerId || selectedPlayer.userId || selectedPlayer.stableId;
    return calculatePlayerStats(matches, pId);
  }, [selectedPlayer, matches]);

  // Merge selected player with enriched user profile data
  const effectivePlayer = useMemo(() => {
    if (!selectedPlayer) return null;
    const sportProfile = enrichedUser?.sportProfiles?.[0] || {};
    return {
      ...selectedPlayer,
      avatar: enrichedUser?.account?.avatar || selectedPlayer.avatar || selectedPlayer.img,
      displayName: enrichedUser?.account?.name || selectedPlayer.displayName || selectedPlayer.name || 'Athlete',
      username: enrichedUser?.account?.username || selectedPlayer.username,
      playerUid: enrichedUser?.account?.playerUid || enrichedUser?.playerUid || selectedPlayer.playerUid,
      role: sportProfile.role || selectedPlayer.role || 'Squad Member',
      battingStyle:
        sportProfile.battingStyle ||
        selectedPlayer.battingStyle ||
        selectedPlayer.style?.split('/')[0]?.trim() ||
        'Right-Handed',
      bowlingStyle:
        sportProfile.bowlingStyle ||
        selectedPlayer.bowlingStyle ||
        selectedPlayer.style?.split('/')[1]?.trim() ||
        'Right-Arm Medium',
      experience: sportProfile.experience || selectedPlayer.experience,
      primaryTeam:
        sportProfile.primaryTeam ||
        selectedPlayer.primaryTeam ||
        teamDetails?.name ||
        team?.teamName ||
        'Enrolled Team',
      isVerified: Boolean(
        enrichedUser?.account?.isVerified ||
          enrichedUser?.isVerified ||
          selectedPlayer.isVerified ||
          selectedPlayer.verified
      ),
    };
  }, [selectedPlayer, enrichedUser, teamDetails, team]);

  // Handle player row tap: expand upward or collapse if tapping same player
  const handleTogglePlayer = useCallback((player) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPlayer((prev) => {
      if (!prev) return player;
      const prevId = prev.id || prev.playerId || prev.userId || prev.stableId;
      const nextId = player.id || player.playerId || player.userId || player.stableId;
      if (prevId === nextId) {
        return null; // Collapse when tapped again
      }
      return player; // Update profile smoothly without closing overlay
    });
  }, []);

  // Collapse profile panel
  const handleCollapseProfile = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPlayer(null);
  }, []);

  // Navigate to full player profile
  const handleViewFullProfile = useCallback(
    (player) => {
      if (onNavigateProfile) {
        onNavigateProfile(player);
      }
    },
    [onNavigateProfile]
  );

  if (!visible || !team) return null;

  const teamName = teamDetails?.name || team.teamName || team.name || 'Team Squad';
  const teamShort = teamDetails?.shortName || team.shortName;
  const teamLocation = teamDetails?.location || team.location;
  const teamLogo = teamDetails?.logo || team.logo;
  const captain = activeMembers.find(
    (m) => m.isCaptain || m.id === (teamDetails?.captainId || team.captainId)
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Translucent dark scrim: dims background while allowing tournament screen to remain faintly visible */}
      <View className="flex-1 bg-black/80">
        {/* Full-Screen Overlay Container */}
        <View
          style={{
            marginTop: Math.max(16, insets.top + 8),
            paddingBottom: Math.max(12, insets.bottom + 4),
          }}
          className="flex-1 bg-[#101211]/98 border-t border-x border-[#282828] rounded-t-[28px] overflow-hidden shadow-2xl"
        >
          {/* Top Drag Handle */}
          <View className="items-center pt-2.5 pb-1">
            <View className="w-12 h-1 rounded-full bg-[#333333]" />
          </View>

          {/* Team Header Section */}
          <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#1f1f1f]">
            <View className="flex-row items-center flex-1 mr-3">
              {teamLogo ? (
                <Image
                  source={{ uri: teamLogo }}
                  className="w-12 h-12 rounded-full mr-3.5 bg-[#1a1a1a] border border-[#2a2a2a]"
                />
              ) : (
                <View className="w-12 h-12 rounded-full mr-3.5 bg-[#1a2e1d] border border-[#23c55e]/40 items-center justify-center">
                  <Text className="text-[#23c55e] text-base font-black">{getInitials(teamName)}</Text>
                </View>
              )}
              <View className="flex-1">
                <View className="flex-row items-center flex-wrap">
                  <Text className="text-white text-base font-bold mr-2" numberOfLines={1}>
                    {teamName}
                  </Text>
                  {Boolean(teamShort) && (
                    <View className="bg-[#1a1a1a] border border-[#2a2a2a] px-1.5 py-0.5 rounded">
                      <Text className="text-[#888888] text-[9px] font-bold">{teamShort}</Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center mt-1 flex-wrap gap-1.5">
                  {Boolean(teamLocation) && (
                    <Text className="text-[#888888] text-[11px] mr-1">
                      <Feather name="map-pin" size={10} color="#888888" /> {teamLocation}
                    </Text>
                  )}
                  <View className="bg-[#1a2e1d] border border-[#23c55e]/30 px-2 py-0.5 rounded">
                    <Text className="text-[#23c55e] text-[9px] font-bold">
                      {activeMembers.length} {activeMembers.length === 1 ? 'SQUAD MEMBER' : 'SQUAD MEMBERS'}
                    </Text>
                  </View>
                  {Boolean(captain?.displayName) && (
                    <Text className="text-[#888888] text-[10px]">
                      • Capt: <Text className="text-white font-semibold">{captain.displayName}</Text>
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Clear Close Button */}
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] items-center justify-center active:bg-[#252525]"
            >
              <Feather name="x" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Search Field */}
          <View className="mx-5 mt-3 mb-2 bg-[#181818] border border-[#262626] rounded-xl px-3 py-2 flex-row items-center">
            <Feather name="search" size={13} color="#888888" style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-white text-xs p-0"
              placeholder="Search squad by player name or cricket role..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {Boolean(searchQuery) && (
              <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                <Feather name="x" size={13} color="#888888" />
              </TouchableOpacity>
            )}
          </View>

          {/* Independent Scrollable Content Container */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 36 }}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
          >
            {/* SIGNATURE INTERACTION: EXPANDING PLAYER PROFILE PANEL */}
            {effectivePlayer && (
              <View className="mb-4 bg-[#161816] border border-[#23c55e]/50 rounded-2xl p-4 shadow-xl">
                {/* Panel Top Indicator Bar */}
                <View className="flex-row items-center justify-between mb-3 border-b border-[#222222] pb-2">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-[#23c55e] mr-2" />
                    <Text className="text-[#23c55e] text-[10px] font-black tracking-widest uppercase">
                      ATHLETE PROFILE
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCollapseProfile}
                    className="flex-row items-center bg-[#222222] px-2.5 py-1 rounded-full active:bg-[#2a2a2a]"
                  >
                    <Text className="text-[#888888] text-[10px] font-semibold mr-1">Collapse</Text>
                    <Feather name="chevron-up" size={12} color="#888888" />
                  </TouchableOpacity>
                </View>

                {/* Hero Athlete Row */}
                <View className="flex-row items-center">
                  {effectivePlayer.avatar ? (
                    <Image
                      source={{ uri: effectivePlayer.avatar }}
                      className="w-14 h-14 rounded-full mr-3.5 bg-[#222222] border-2 border-[#23c55e]"
                    />
                  ) : (
                    <View className="w-14 h-14 rounded-full mr-3.5 bg-[#1a2e1d] border-2 border-[#23c55e] items-center justify-center">
                      <Text className="text-[#23c55e] text-base font-bold">
                        {getInitials(effectivePlayer.displayName)}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-white text-base font-bold" numberOfLines={1}>
                        {effectivePlayer.displayName}
                      </Text>
                      {effectivePlayer.isVerified && (
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={15}
                          color="#38bdf8"
                          style={{ marginLeft: 4 }}
                        />
                      )}
                    </View>
                    <View className="flex-row items-center flex-wrap gap-1 mt-0.5">
                      {Boolean(effectivePlayer.username) && (
                        <Text className="text-[#888888] text-xs mr-1">
                          @{effectivePlayer.username}
                        </Text>
                      )}
                      {Boolean(effectivePlayer.playerUid) && (
                        <View className="bg-[#1b2b1d] border border-[#23c55e]/30 px-1.5 py-0.5 rounded">
                          <Text className="text-[#23c55e] text-[9px] font-mono font-bold">
                            UID: {effectivePlayer.playerUid}
                          </Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-row items-center mt-1.5 flex-wrap gap-1">
                      <View className="bg-[#1b2b1d] border border-[#23c55e]/40 px-2 py-0.5 rounded">
                        <Text className="text-[#23c55e] text-[10px] font-bold uppercase">
                          {effectivePlayer.role}
                        </Text>
                      </View>
                      {(effectivePlayer.isCaptain || effectivePlayer.id === teamDetails?.captainId) && (
                        <View className="bg-[#eab308]/15 border border-[#eab308]/40 px-2 py-0.5 rounded">
                          <Text className="text-[#eab308] text-[10px] font-bold">CAPTAIN</Text>
                        </View>
                      )}
                      {Boolean(effectivePlayer.experience) && (
                        <View className="bg-[#222222] border border-[#333333] px-2 py-0.5 rounded">
                          <Text className="text-[#aaaaaa] text-[10px] font-semibold">
                            {effectivePlayer.experience}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Athlete Details & Style Matrix */}
                <View className="mt-3 pt-2.5 border-t border-[#222222] flex-row justify-between flex-wrap gap-2">
                  <View className="min-w-[45%]">
                    <Text className="text-[#888888] text-[10px] uppercase font-semibold">Batting Style</Text>
                    <Text className="text-white text-xs font-semibold">
                      {effectivePlayer.battingStyle}
                    </Text>
                  </View>
                  <View className="min-w-[45%]">
                    <Text className="text-[#888888] text-[10px] uppercase font-semibold">Bowling Style</Text>
                    <Text className="text-white text-xs font-semibold">
                      {effectivePlayer.bowlingStyle}
                    </Text>
                  </View>
                  {Boolean(effectivePlayer.primaryTeam) && (
                    <View className="w-full mt-1">
                      <Text className="text-[#888888] text-[10px] uppercase font-semibold">Primary Team</Text>
                      <Text className="text-white text-xs font-semibold">
                        {effectivePlayer.primaryTeam}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Match Performance Record (Genuine platform data) */}
                <View className="mt-3 pt-2.5 border-t border-[#222222]">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-[#888888] text-[10px] font-bold tracking-wider uppercase">
                      MATCH PERFORMANCE RECORD
                    </Text>
                    <Text className="text-[#23c55e] text-[10px] font-semibold">
                      {playerStats?.batting?.matches || 0} Matches
                    </Text>
                  </View>
                  <View className="flex-row justify-between bg-[#111111] border border-[#222222] rounded-xl p-2.5">
                    <View className="items-center flex-1 border-r border-[#222222]">
                      <Text className="text-[#888888] text-[9px] uppercase font-medium">Runs</Text>
                      <Text className="text-white text-sm font-black">
                        {playerStats?.batting?.runs ?? 0}
                      </Text>
                    </View>
                    <View className="items-center flex-1 border-r border-[#222222]">
                      <Text className="text-[#888888] text-[9px] uppercase font-medium">HS</Text>
                      <Text className="text-white text-sm font-black">
                        {playerStats?.batting?.highestScore ?? '0'}
                      </Text>
                    </View>
                    <View className="items-center flex-1 border-r border-[#222222]">
                      <Text className="text-[#888888] text-[9px] uppercase font-medium">Wkts</Text>
                      <Text className="text-white text-sm font-black">
                        {playerStats?.bowling?.wickets ?? 0}
                      </Text>
                    </View>
                    <View className="items-center flex-1">
                      <Text className="text-[#888888] text-[9px] uppercase font-medium">Econ</Text>
                      <Text className="text-white text-sm font-black">
                        {playerStats?.bowling?.economy ?? '0.0'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* View Full Profile Action */}
                <TouchableOpacity
                  onPress={() => handleViewFullProfile(effectivePlayer)}
                  className="mt-3 bg-[#23c55e] py-2.5 rounded-xl flex-row items-center justify-center active:bg-[#1ea34d]"
                >
                  <Text className="text-black text-xs font-black tracking-wider">VIEW FULL ATHLETE PROFILE</Text>
                  <Feather name="arrow-up-right" size={14} color="#000000" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            )}

            {/* Squad List Section Title */}
            <View className="flex-row items-center justify-between mb-2.5">
              <Text className="text-[#888888] text-[11px] font-bold tracking-wider uppercase">
                SQUAD MEMBERS ({filteredMembers.length})
              </Text>
              {Boolean(selectedPlayer) && (
                <Text className="text-[#23c55e] text-[10px] font-semibold">
                  1 player selected • Tap to collapse
                </Text>
              )}
            </View>

            {/* Loading Indicator */}
            {loadingRoster && (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#23c55e" />
                <Text className="text-[#888888] text-xs mt-2">Loading squad roster...</Text>
              </View>
            )}

            {/* Empty Squad State */}
            {!loadingRoster && filteredMembers.length === 0 && (
              <View className="py-8 items-center bg-[#161616] rounded-2xl border border-[#222222] p-5">
                <View className="w-12 h-12 rounded-full bg-[#1e1e1e] items-center justify-center mb-3">
                  <Ionicons name="people-outline" size={24} color="#888888" />
                </View>
                <Text className="text-white text-sm font-bold mb-1">
                  {searchQuery ? 'No matching players found' : 'No Squad Members Enrolled'}
                </Text>
                <Text className="text-[#888888] text-xs text-center">
                  {searchQuery
                    ? `No players in ${teamName} match "${searchQuery}".`
                    : 'This team has not enrolled any players into its squad yet.'}
                </Text>
              </View>
            )}

            {/* Squad Members List */}
            {!loadingRoster &&
              filteredMembers.map((member) => {
                const memberId = member.stableId;
                const isSelected =
                  selectedPlayer &&
                  (selectedPlayer.stableId === memberId ||
                    (selectedPlayer.id && selectedPlayer.id === member.id) ||
                    (selectedPlayer.playerId && selectedPlayer.playerId === member.playerId) ||
                    (selectedPlayer.userId && selectedPlayer.userId === member.userId));

                const isCaptain = member.isCaptain || member.id === (teamDetails?.captainId || team.captainId);

                return (
                  <TouchableOpacity
                    key={memberId}
                    activeOpacity={0.7}
                    onPress={() => handleTogglePlayer(member)}
                    className={`p-3.5 rounded-xl border mb-2.5 flex-row items-center justify-between ${
                      isSelected
                        ? 'bg-[#182a1d] border-[#23c55e]'
                        : 'bg-[#161616] border-[#222222] active:bg-[#1f1f1f]'
                    }`}
                  >
                    <View className="flex-row items-center flex-1 mr-2">
                      {member.avatar || member.img ? (
                        <Image
                          source={{ uri: member.avatar || member.img }}
                          className={`w-10 h-10 rounded-full mr-3 bg-[#222222] border ${
                            isSelected ? 'border-[#23c55e]' : 'border-[#2a2a2a]'
                          }`}
                        />
                      ) : (
                        <View
                          className={`w-10 h-10 rounded-full mr-3 items-center justify-center border ${
                            isSelected
                              ? 'bg-[#23c55e]/20 border-[#23c55e]'
                              : 'bg-[#1e1e1e] border-[#2a2a2a]'
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              isSelected ? 'text-[#23c55e]' : 'text-[#888888]'
                            }`}
                          >
                            {getInitials(member.displayName)}
                          </Text>
                        </View>
                      )}
                      <View className="flex-1">
                        <View className="flex-row items-center">
                          <Text
                            className={`text-xs font-bold mr-1.5 ${
                              isSelected ? 'text-[#23c55e]' : 'text-white'
                            }`}
                            numberOfLines={1}
                          >
                            {member.displayName}
                          </Text>
                          {(member.isVerified || member.verified) && (
                            <MaterialCommunityIcons
                              name="check-decagram"
                              size={12}
                              color="#38bdf8"
                            />
                          )}
                        </View>
                        <Text className="text-[#888888] text-[10px] mt-0.5">
                          {member.role || 'Squad Member'}
                          {member.style ? ` • ${member.style}` : ''}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      {isCaptain && (
                        <View className="bg-[#eab308]/15 border border-[#eab308]/40 px-1.5 py-0.5 rounded mr-2">
                          <Text className="text-[#eab308] text-[9px] font-bold">CAPTAIN</Text>
                        </View>
                      )}
                      {isSelected ? (
                        <Feather name="check-circle" size={17} color="#23c55e" />
                      ) : (
                        <Feather name="chevron-right" size={16} color="#444444" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
