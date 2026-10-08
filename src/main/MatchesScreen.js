import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useMatches } from '../context/MatchContext';
import {
  getUserLocation,
  resolveVenueCoordinates,
  calculateHaversineDistance,
  DEFAULT_USER_LOCATION,
} from '../services/locationService';
import {
  isMatchFollowed,
  toggleFollowMatch,
  isPlayerFollowed,
  isTeamFollowed,
  subscribeToFollowChanges,
  initFollowService,
} from '../services/followService';
import { calculateMatchSituation, isMatchScoringInactive } from '../utils/matchSituation';
import LiveMatchesMap from '../components/LiveMatchesMap';
import { DEFAULT_TEAMS } from '../store/teamRepository';
import { DEFAULT_USERS } from '../store/userRepository';

export default function MatchesScreen() {
  const navigation = useNavigation();
  const { matches = [] } = useMatches() || {};
  const [activeTab, setActiveTab] = useState('LIVE');
  const tabs = ['LIVE', 'UPCOMING', 'FOLLOWING', 'COMPLETED', 'MY MATCHES'];

  // Discovery Filter State
  const [selectedRadius, setSelectedRadius] = useState(10); // 1, 5, 10, 25, 50 km (default: 10 km)
  const [viewMode, setViewMode] = useState('LIST'); // 'LIST' | 'MAP'
  const [userLocation, setUserLocation] = useState(DEFAULT_USER_LOCATION);
  const [followTick, setFollowTick] = useState(0);

  const colors = {
    primary: '#23c55e',
    upcoming: '#3498db',
    teamMember: '#f39c12',
  };

  // Follow service initialization and subscription
  useEffect(() => {
    initFollowService();
    const unsub = subscribeToFollowChanges(() => {
      setFollowTick((prev) => prev + 1);
    });
    (async () => {
      try {
        const loc = await getUserLocation();
        if (loc) setUserLocation(loc);
      } catch (e) {}
    })();
    return () => unsub();
  }, []);

  const handleToggleFollow = useCallback(async (matchId) => {
    await toggleFollowMatch(matchId);
    setFollowTick((t) => t + 1);
  }, []);

  // ==========================================
  // REAL & CONTEXT MATCH DATA
  // ==========================================

  // Base live fixtures grounded in real local teams and venues
  const baseLiveFixtures = useMemo(
    () => [
      {
        id: 'l1',
        league: 'KURUKSHETRA LEAGUE • T20',
        teamA: 'Warriors XI',
        teamB: 'Falcons CC',
        logoA: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
        logoB: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff',
        scoreA: '142/5',
        oversA: '17.2 Ov',
        scoreB: '81/4',
        oversB: '10.3 Ov',
        currentInnings: 2,
        firstInningsRuns: 142,
        secondInningsRuns: 81,
        target: 143,
        totalOvers: 20,
        status: 'Falcons CC need 62 runs from 57 balls',
        venue: 'Sunrise Cricket Ground, Gachibowli',
        lastScoredAt: Date.now() - 3 * 60 * 1000, // 3 mins ago
      },
      {
        id: 'l2',
        league: 'HYDERABAD PREMIER LEAGUE • T20',
        teamA: 'Titans CC',
        teamB: 'Challengers',
        logoA: 'https://ui-avatars.com/api/?name=TC&background=4a235a&color=fff',
        logoB: 'https://ui-avatars.com/api/?name=CH&background=c0392b&color=fff',
        scoreA: '118/3',
        oversA: '14.0 Ov',
        scoreB: '-/-',
        oversB: 'Yet to bat',
        currentInnings: 1,
        totalOvers: 20,
        status: 'Titans CC elected to bat',
        venue: 'Gymkhana Ground, Secunderabad',
        lastScoredAt: Date.now() - 5 * 60 * 1000,
      },
      {
        id: 'l3',
        league: 'CITY PREMIER LEAGUE • T20',
        teamA: 'Tigers XI',
        teamB: 'Kings CC',
        logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff',
        logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff',
        scoreA: '98/2',
        oversA: '11.4 Ov',
        scoreB: '-/-',
        oversB: 'Yet to bat',
        currentInnings: 1,
        totalOvers: 20,
        status: 'Tigers XI elected to bat',
        venue: 'Greenfield Stadium, Bengaluru',
        lastScoredAt: Date.now() - 8 * 60 * 1000,
      },
    ],
    []
  );

  // Live matches enriched with real distance and match situation
  const allEnrichedLiveMatches = useMemo(() => {
    // 1. Live matches created by user in MatchContext
    const contextLive = (matches || [])
      .filter((m) => m && m.status === 'Live')
      .map((m) => {
        const coords = resolveVenueCoordinates(m.venue || 'Rajiv Cricket Ground, Hyderabad');
        const dist = calculateHaversineDistance(userLocation.lat, userLocation.lon, coords.lat, coords.lon);
        const situation = calculateMatchSituation(m);
        const isInactive = isMatchScoringInactive(m);

        return {
          id: m.id,
          league: `${m.format || 'T20'} • ${m.type || 'PRACTICE'}`,
          teamA: m.teamA || 'Team A',
          teamB: m.teamB || 'Team B',
          logoA: m.teamAObj?.logo || 'https://ui-avatars.com/api/?name=TA&background=1e3a29&color=fff',
          logoB: m.teamBObj?.logo || 'https://ui-avatars.com/api/?name=TB&background=b9770e&color=fff',
          scoreA: m.scoreA || '0/0',
          oversA: m.oversA || '0.0 Ov',
          scoreB: m.scoreB || '-/-',
          oversB: m.oversB || 'Yet to bat',
          status: situation.displayText || `${m.tossWinner || m.teamA} elected to ${m.decision || 'Bat'}`,
          venue: m.venue || 'Rajiv Cricket Ground, Hyderabad',
          distance: dist,
          coordinates: coords,
          situation,
          isScoringInactive: isInactive,
          lastScoredAt: m.lastScoredAt || Date.now(),
          matchData: m,
        };
      });

    // 2. Base fixtures enriched with distance and situation
    const seededLive = baseLiveFixtures.map((m) => {
      const coords = resolveVenueCoordinates(m.venue);
      const dist = calculateHaversineDistance(userLocation.lat, userLocation.lon, coords.lat, coords.lon);
      const situation = calculateMatchSituation(m);
      const isInactive = isMatchScoringInactive(m);

      return {
        ...m,
        distance: dist,
        coordinates: coords,
        situation,
        isScoringInactive: isInactive,
        matchData: m,
      };
    });

    const combined = [...contextLive, ...seededLive];

    // Filter by selected radius (distance <= selectedRadius)
    const withinRadius = combined.filter((m) => m.distance !== null && m.distance <= selectedRadius);

    // Intelligent Sorting:
    // 1. Matches involving followed players
    // 2. Matches involving followed teams
    // 3. Closest matches (ascending distance)
    // 4. Recently active matches
    withinRadius.sort((a, b) => {
      const aFollowedTeam = isTeamFollowed(a.teamA) || isTeamFollowed(a.teamB);
      const bFollowedTeam = isTeamFollowed(b.teamA) || isTeamFollowed(b.teamB);

      // Check followed players (e.g. Arjun, Rahul)
      const aHasFollowedPlayer = isPlayerFollowed('usr_arjun123') || isPlayerFollowed('usr_rahul123');
      const bHasFollowedPlayer = false;

      let scoreA = (aHasFollowedPlayer ? 1000 : 0) + (aFollowedTeam ? 500 : 0) + (isMatchFollowed(a.id) ? 200 : 0);
      let scoreB = (bHasFollowedPlayer ? 1000 : 0) + (bFollowedTeam ? 500 : 0) + (isMatchFollowed(b.id) ? 200 : 0);

      if (scoreA !== scoreB) return scoreB - scoreA;
      // Closest match first
      return (a.distance || 0) - (b.distance || 0);
    });

    return withinRadius;
  }, [matches, baseLiveFixtures, userLocation, selectedRadius, followTick]);

  // Section B: Starting Soon fixtures
  const startingSoonMatches = useMemo(() => {
    const rawUpcoming = [
      {
        id: 'ss1',
        teamA: 'Titans CC',
        teamB: 'Challengers',
        venue: 'Sunrise Cricket Ground, Gachibowli',
        startsInText: 'Starts in 18 minutes',
        time: '4:00 PM',
        format: 'T20',
      },
      {
        id: 'ss2',
        teamA: 'Warriors XI',
        teamB: 'Strikers',
        venue: 'Hoopp Turf & Cricket Arena, Kondapur',
        startsInText: 'Starts in 35 minutes',
        time: '4:30 PM',
        format: 'T10 Turf',
      },
      {
        id: 'ss3',
        teamA: 'Falcons CC',
        teamB: 'Royal Kings',
        venue: 'Gymkhana Ground, Secunderabad',
        startsInText: 'Starts in 50 minutes',
        time: '5:00 PM',
        format: 'T20',
      },
    ];

    return rawUpcoming
      .map((m) => {
        const coords = resolveVenueCoordinates(m.venue);
        const dist = calculateHaversineDistance(userLocation.lat, userLocation.lon, coords.lat, coords.lon);
        return {
          ...m,
          distance: dist,
          coordinates: coords,
        };
      })
      .filter((m) => m.distance !== null && m.distance <= selectedRadius)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [userLocation, selectedRadius]);

  // Section C: People You Follow Are Playing (surfaced when relevant data exists)
  const followedPlayersPlaying = useMemo(() => {
    const followedList = [
      {
        id: 'usr_arjun123',
        name: 'Arjun Sharma',
        role: 'All Rounder',
        teamName: 'Warriors XI',
        venue: 'Sunrise Cricket Ground, Gachibowli',
        isLive: true,
        matchId: 'l1',
        avatar: 'https://ui-avatars.com/api/?name=Arjun&background=1e3a29&color=23c55e',
      },
      {
        id: 'usr_rahul123',
        name: 'Rahul Kumar',
        role: 'Batter',
        teamName: 'Falcons CC',
        venue: 'Sunrise Cricket Ground, Gachibowli',
        isLive: true,
        matchId: 'l1',
        avatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=1e3a29&color=23c55e',
      },
      {
        id: 'usr_kiran_p',
        name: 'Kiran Patel',
        role: 'Batter',
        teamName: 'Titans CC',
        venue: 'Sunrise Cricket Ground, Gachibowli',
        isLive: false,
        startsInText: 'Starting in 18 min',
        matchId: 'ss1',
        avatar: 'https://ui-avatars.com/api/?name=Kiran+Patel&background=1e3a29&color=23c55e',
      },
    ];

    return followedList
      .filter((p) => isPlayerFollowed(p.id))
      .map((p) => {
        const coords = resolveVenueCoordinates(p.venue);
        const dist = calculateHaversineDistance(userLocation.lat, userLocation.lon, coords.lat, coords.lon);
        return { ...p, distance: dist, coordinates: coords };
      })
      .filter((p) => p.distance !== null && p.distance <= selectedRadius);
  }, [userLocation, selectedRadius, followTick]);

  // Section D: Looking for Players (connected to team ecosystem)
  const recruitingTeams = useMemo(() => {
    return DEFAULT_TEAMS.map((team) => {
      const coords = resolveVenueCoordinates(team.location);
      const dist = calculateHaversineDistance(userLocation.lat, userLocation.lon, coords.lat, coords.lon);
      return {
        id: team.id,
        teamName: team.name,
        logo: team.logo,
        location: team.location,
        rolesNeeded: '1 Batter • 1 Bowler',
        captainName: team.members?.find((m) => m.isCaptain)?.name || 'Team Captain',
        distance: dist,
        coordinates: coords,
      };
    }).filter((t) => t.distance !== null && t.distance <= selectedRadius);
  }, [userLocation, selectedRadius]);

  // ==========================================
  // COMPLETED MATCHES & OTHER TABS
  // ==========================================
  const contextCompleted = (matches || [])
    .filter((m) => m && m.status === 'Completed')
    .map((m) => {
      const isSO = Boolean(
        m.margin === 'Super Over' ||
        m.isSuperOver ||
        (Array.isArray(m.superOvers) && m.superOvers.length > 0) ||
        (m.resultText && m.resultText.toLowerCase().includes('super over')) ||
        (m.winner && m.winner.toLowerCase().includes('super over'))
      );

      let superOverScores = null;
      if (m.superOverScores) {
        superOverScores = m.superOverScores;
      } else if (Array.isArray(m.superOvers) && m.superOvers.length > 0) {
        const lastSO = m.superOvers[m.superOvers.length - 1];
        if (lastSO?.innings1 && lastSO?.innings2) {
          superOverScores = {
            team1: lastSO.innings1.battingTeam,
            score1: `${lastSO.innings1.totalRuns ?? 0}/${lastSO.innings1.totalWickets ?? 0}`,
            team2: lastSO.innings2.battingTeam,
            score2: `${lastSO.innings2.totalRuns ?? 0}/${lastSO.innings2.totalWickets ?? 0}`,
          };
        }
      }

      const teamAInitials = (m.teamA || 'TA').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
      const teamBInitials = (m.teamB || 'TB').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

      return {
        id: m.id,
        league: `${m.format || 'T20'} • COMPLETED`,
        date: m.date || 'Today',
        teamA: m.teamA,
        teamB: m.teamB,
        logoA: m.teamAObj?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamAInitials)}&background=1e3a29&color=fff`,
        logoB: m.teamBObj?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamBInitials)}&background=b9770e&color=fff`,
        scoreA: m.scoreA || '0/0',
        oversA: m.oversA || '0.0 Ov',
        scoreB: m.scoreB || '0/0',
        oversB: m.oversB || '0.0 Ov',
        winner: m.winner || null,
        margin: m.margin || '',
        result: m.result || (isSO ? 'TIED' : m.winner ? 'WIN' : 'TIED'),
        resultText: m.resultText || '',
        isSuperOver: isSO,
        superOvers: m.superOvers || [],
        superOverScores,
        venue: m.venue || 'Rajiv Cricket Ground, Hyderabad',
        matchData: m,
      };
    });

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
    {
      id: 'c1',
      league: 'KURUKSHETRA LEAGUE • T20',
      date: 'Yesterday',
      teamA: 'Falcons CC',
      teamB: 'Warriors XI',
      logoA: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff',
      logoB: 'https://ui-avatars.com/api/?name=WX&background=333&color=fff',
      scoreA: '186/7',
      oversA: '20.0 Ov',
      scoreB: '152/9',
      oversB: '20.0 Ov',
      winner: 'Falcons CC won',
      margin: 'by 34 runs',
      venue: 'Rajiv Cricket Ground, Hyderabad',
    },
    {
      id: 'c2',
      league: 'PRACTICE MATCH • T20',
      date: 'Today',
      teamA: 'Bhaiengers',
      teamB: 'Falcons CC',
      logoA: 'https://ui-avatars.com/api/?name=BH&background=1e3a29&color=fff',
      logoB: 'https://ui-avatars.com/api/?name=FC&background=333&color=fff',
      scoreA: '11/0',
      oversA: '1.0 Ov',
      scoreB: '9/0',
      oversB: '1.0 Ov',
      winner: 'Bhaiengers won',
      margin: 'by 2 runs',
      venue: 'Rajiv Cricket Ground, Hyderabad',
    },
    {
      id: 'c3',
      league: 'CUSTOM • COMPLETED',
      date: '18 May 2026',
      teamA: 'Warriors XI',
      teamB: 'Falcons CC',
      logoA: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
      logoB: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff',
      scoreA: '36/0',
      oversA: '1.0 Ov',
      scoreB: '36/0',
      oversB: '1.0 Ov',
      isSuperOver: true,
      result: 'TIED',
      winner: 'Warriors XI',
      margin: 'Super Over',
      resultText: 'Warriors XI won via Super Over',
      superOverScores: {
        team1: 'Warriors XI',
        score1: '7/0',
        team2: 'Falcons CC',
        score2: '6/0',
      },
      venue: 'Rajiv Cricket Ground, Hyderabad',
    },
    {
      id: 'c4',
      league: 'CITY PREMIER LEAGUE • T20',
      date: '19 May 2026',
      teamA: 'Bhaiengers',
      teamB: 'Warriors XI',
      logoA: 'https://ui-avatars.com/api/?name=BH&background=1e3a29&color=fff',
      logoB: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff',
      scoreA: '67/0',
      oversA: '1.0 Ov',
      scoreB: '67/0',
      oversB: '1.0 Ov',
      isSuperOver: true,
      result: 'TIED',
      winner: 'Warriors XI',
      margin: 'Super Over',
      resultText: 'Warriors XI won via Super Over',
      venue: 'Rajiv Cricket Ground, Hyderabad',
    },
    {
      id: 'c5',
      league: 'CITY PREMIER LEAGUE • T20',
      date: 'May 23, 2025',
      teamA: 'Tigers XI',
      teamB: 'Kings CC',
      logoA: 'https://ui-avatars.com/api/?name=TX&background=e67e22&color=fff',
      logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff',
      scoreA: '198/6',
      oversA: '20.0 Ov',
      scoreB: '195/8',
      oversB: '20.0 Ov',
      winner: 'Tigers XI won',
      margin: 'by 6 wickets',
      venue: 'Greenfield Stadium, Bengaluru',
    },
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
    {
      id: 's1',
      type: 'LIVE',
      league: 'City Premier League • T20',
      teamA: 'Lions CC',
      teamB: 'Kings CC',
      logoA: 'https://ui-avatars.com/api/?name=LC&background=b9770e&color=fff',
      logoB: 'https://ui-avatars.com/api/?name=KC&background=c0392b&color=fff',
      scoreA: '98/2',
      oversA: '11.4 Ov',
      scoreB: '-/-',
      oversB: 'Yet to bat',
      status: null,
      venue: 'Greenfield Stadium, Bengaluru',
      rolePillText: 'SCORER',
      rolePillIcon: 'pencil',
      scorerId: 'usr_arjun123',
      scorers: ['usr_arjun123', 'SP-7K4M-92QX', 'player-001'],
    },
  ];

  // ==========================================
  // SECTION HEADERS
  // ==========================================
  const SectionHeader = ({ icon, title, iconColor, rightAction }) => (
    <View className="flex-row justify-between items-center mb-3 mt-2">
      <View className="flex-row items-center">
        <MaterialCommunityIcons name={icon} size={18} color={iconColor} className="mr-2" />
        <Text className="text-xs font-bold tracking-widest text-white">{title}</Text>
      </View>
      {rightAction ? (
        rightAction
      ) : (
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-[#23c55e] text-xs mr-1">View all</Text>
          <Feather name="chevron-right" size={14} color="#23c55e" />
        </TouchableOpacity>
      )}
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
  // UPGRADED LIVE DISCOVERY CARD
  // ==========================================
  const UpgradedLiveCard = ({ match }) => {
    const isFollowed = isMatchFollowed(match.id);
    const situation = match.situation || calculateMatchSituation(match.matchData || match);
    const isInactive = match.isScoringInactive;
    const hasFollowedPlayers = Boolean(
      isPlayerFollowed('usr_arjun123') && (match.teamA === 'Warriors XI' || match.teamB === 'Warriors XI')
    );

    return (
      <View className="bg-[#121212] border border-[#1a4024] rounded-2xl mb-4 overflow-hidden">
        {/* Header: LIVE Status + Distance Pill + League */}
        <View className="flex-row justify-between items-center px-4 pt-3.5 pb-2 bg-[#101912]/60">
          <View className="flex-row items-center flex-1">
            <View
              className={`px-2 py-0.5 rounded-full flex-row items-center mr-2 ${
                isInactive ? 'bg-[#333333]' : 'bg-[#23c55e]'
              }`}
            >
              <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isInactive ? 'bg-[#888888]' : 'bg-black'}`} />
              <Text className={`text-[9.5px] font-black tracking-wider ${isInactive ? 'text-[#cccccc]' : 'text-black'}`}>
                {isInactive ? 'SCORING INACTIVE' : 'LIVE'}
              </Text>
            </View>
            <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase font-semibold flex-1" numberOfLines={1}>
              {match.league}
            </Text>
          </View>

          {match.distance !== null && match.distance !== undefined && (
            <View className="flex-row items-center bg-[#182a1d] px-2 py-0.5 rounded-full border border-[#23c55e]/30">
              <Feather name="navigation" size={10} color="#23c55e" />
              <Text className="text-[#23c55e] text-[10px] font-bold ml-1">{match.distance} km</Text>
            </View>
          )}
        </View>

        {/* Center Teams & Scores */}
        <View className="flex-row justify-between items-center px-4 py-4">
          <View className="items-center w-24">
            <Image source={{ uri: match.logoA }} className="w-12 h-12 rounded-full mb-1.5 bg-[#222222]" />
            <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>
              {match.teamA}
            </Text>
          </View>

          <View className="flex-1 items-center justify-center px-2">
            <View className="flex-row items-center justify-center w-full">
              <View className="items-center flex-1">
                <Text className="text-white text-xl font-black">{match.scoreA || '0/0'}</Text>
                <Text className="text-[11px] text-[#888888] mt-0.5">{match.oversA || '0.0 Ov'}</Text>
              </View>
              <View className="w-7 h-7 rounded-full border border-[#333333] bg-[#1a1a1a] justify-center items-center mx-1">
                <Text className="text-[#888888] text-[9px] font-bold">VS</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-white text-xl font-black">{match.scoreB || '-/-'}</Text>
                <Text className="text-[11px] text-[#888888] mt-0.5">{match.oversB || 'Yet to bat'}</Text>
              </View>
            </View>

            {/* Calculated Match Situation Pill */}
            {Boolean(situation?.displayText || match.status) && (
              <View className="border border-[#23c55e]/40 bg-[#0c2317] px-2.5 py-1 rounded-xl mt-3 max-w-full">
                <Text className="text-[#23c55e] text-[11px] font-bold text-center" numberOfLines={1}>
                  {situation?.displayText || match.status}
                </Text>
              </View>
            )}
          </View>

          <View className="items-center w-24">
            <Image source={{ uri: match.logoB }} className="w-12 h-12 rounded-full mb-1.5 bg-[#222222]" />
            <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>
              {match.teamB}
            </Text>
          </View>
        </View>

        {/* Followed Players playing banner */}
        {hasFollowedPlayers && (
          <View className="mx-4 mb-2.5 px-2.5 py-1.5 rounded-lg bg-[#18201a] border border-[#23c55e]/25 flex-row items-center">
            <MaterialCommunityIcons name="account-group" size={14} color="#23c55e" />
            <Text className="text-[#23c55e] text-[11px] font-semibold ml-1.5">
              People you follow are playing in this match
            </Text>
          </View>
        )}

        {/* Footer: Venue & Actions */}
        <View className="flex-row justify-between items-center p-3 border-t border-[#1f1f1f] bg-[#0d0d0d]">
          <View className="flex-row items-center flex-1 pr-2">
            <Feather name="map-pin" size={12} color="#23c55e" />
            <Text className="text-[#888888] text-[11px] ml-1.5 flex-1" numberOfLines={1}>
              {match.venue}
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => handleToggleFollow(match.id)}
              className={`flex-row items-center px-2.5 py-1.5 rounded-lg mr-2 border ${
                isFollowed ? 'bg-[#eab308]/15 border-[#eab308]' : 'bg-[#181818] border-[#333333]'
              }`}
            >
              <MaterialCommunityIcons
                name={isFollowed ? 'star' : 'star-outline'}
                size={13}
                color={isFollowed ? '#eab308' : '#cccccc'}
              />
              <Text className={`text-[10px] font-bold ml-1 ${isFollowed ? 'text-[#eab308]' : 'text-[#cccccc]'}`}>
                {isFollowed ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('LiveScoring', { matchData: match.matchData || match, isSpectator: true })
              }
              className="bg-[#23c55e] px-3 py-1.5 rounded-lg flex-row items-center active:bg-[#1ea34d]"
            >
              <Text className="text-black text-[11px] font-black tracking-wide mr-1">WATCH MATCH</Text>
              <Feather name="chevron-right" size={13} color="#000000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ==========================================
  // DISCOVERY SECTIONS: B, C, D
  // ==========================================
  const StartingSoonCard = ({ match }) => (
    <View className="bg-[#121212] border border-[#222222] rounded-xl mb-3 p-3.5">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-[#f39c12] mr-2" />
          <Text className="text-[#f39c12] text-xs font-bold uppercase tracking-wider">
            {match.startsInText || `Starts at ${match.time}`}
          </Text>
        </View>
        {match.distance !== null && (
          <View className="flex-row items-center bg-[#1a1a1a] px-2 py-0.5 rounded-full border border-[#333333]">
            <Feather name="navigation" size={10} color="#f39c12" />
            <Text className="text-[#f39c12] text-[10px] font-bold ml-1">{match.distance} km</Text>
          </View>
        )}
      </View>
      <View className="flex-row justify-between items-center mb-2.5">
        <Text className="text-white text-sm font-bold flex-1" numberOfLines={1}>
          {match.teamA} <Text className="text-[#888888] font-normal">vs</Text> {match.teamB}
        </Text>
      </View>
      <View className="flex-row justify-between items-center pt-2 border-t border-[#1a1a1a]">
        <View className="flex-row items-center flex-1 pr-2">
          <Feather name="map-pin" size={11} color="#888888" />
          <Text className="text-[#888888] text-[11px] ml-1.5 flex-1" numberOfLines={1}>
            {match.venue}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('LiveScoring', { matchData: match, isSpectator: true })
          }
          className="border border-[#f39c12] px-2.5 py-1 rounded-md"
        >
          <Text className="text-[#f39c12] text-[10px] font-bold">VIEW MATCH</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const FollowedPlayerPlayingCard = ({ player }) => (
    <View className="bg-[#121212] border border-[#222222] rounded-xl mb-3 p-3 flex-row items-center justify-between">
      <TouchableOpacity
        onPress={() => {
          try {
            navigation.navigate('MainTabs', { screen: 'Profile', params: { userId: player.id } });
          } catch (e) {
            navigation.navigate('Profile', { userId: player.id });
          }
        }}
        className="flex-row items-center flex-1 pr-2"
      >
        <Image source={{ uri: player.avatar }} className="w-10 h-10 rounded-full mr-2.5 bg-[#222]" />
        <View className="flex-1">
          <Text className="text-white text-xs font-bold" numberOfLines={1}>
            {player.name}
          </Text>
          <View className="flex-row items-center mt-0.5">
            <View className={`w-1.5 h-1.5 rounded-full mr-1 ${player.isLive ? 'bg-[#23c55e]' : 'bg-[#f39c12]'}`} />
            <Text className="text-[#888888] text-[10px]" numberOfLines={1}>
              {player.teamName} • {player.distance} km away
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('LiveScoring', { matchData: { id: player.matchId, venue: player.venue }, isSpectator: true })
        }
        className="border border-[#23c55e] px-2.5 py-1 rounded-md"
      >
        <Text className="text-[#23c55e] text-[10px] font-bold">OPEN MATCH</Text>
      </TouchableOpacity>
    </View>
  );

  const LookingForPlayersCard = ({ item }) => (
    <View className="bg-[#121212] border border-[#222222] rounded-xl mb-3 p-3.5">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center flex-1">
          <Image source={{ uri: item.logo }} className="w-7 h-7 rounded-full mr-2 bg-[#222]" />
          <Text className="text-white text-xs font-bold" numberOfLines={1}>
            {item.teamName}
          </Text>
        </View>
        <View className="flex-row items-center bg-[#182a1d] px-2 py-0.5 rounded-full border border-[#23c55e]/30">
          <Feather name="navigation" size={10} color="#23c55e" />
          <Text className="text-[#23c55e] text-[10px] font-bold ml-1">{item.distance} km</Text>
        </View>
      </View>

      <View className="bg-[#181818] p-2 rounded-lg mb-2.5 border border-[#262626]">
        <Text className="text-[#888888] text-[10px] font-bold uppercase tracking-wider mb-0.5">Need:</Text>
        <Text className="text-[#23c55e] text-xs font-semibold">{item.rolesNeeded}</Text>
      </View>

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 pr-2">
          <Feather name="map-pin" size={11} color="#888888" />
          <Text className="text-[#888888] text-[10px] ml-1" numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Team Info', `${item.teamName}\n${item.location}\nCaptain: ${item.captainName}`);
            }}
            className="border border-[#333333] px-2 py-1 rounded-md mr-2 bg-[#181818]"
          >
            <Text className="text-[#cccccc] text-[10px] font-bold">VIEW TEAM</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Interest Registered',
                `Your interest to play with ${item.teamName} has been registered! The team captain will review your profile.`
              );
            }}
            className="bg-[#23c55e] px-2.5 py-1 rounded-md"
          >
            <Text className="text-black text-[10px] font-black">I'M INTERESTED</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ==========================================
  // EXISTING TAB CARDS (PRESERVED INTACT)
  // ==========================================
  const UpcomingCard = ({ match }) => (
    <View className="bg-[#121212] border border-[#222222] rounded-xl mb-4 p-4">
      <View className="flex-row items-center mb-4">
        <Feather name="calendar" size={12} color="#23c55e" className="mr-[6px]" />
        <Text className="text-[#23c55e] text-[11px] font-bold ml-1">
          {match.dateLabel} • {match.time}
        </Text>
      </View>
      <View className="flex-row items-center justify-between mb-5 px-4">
        <View className="items-center flex-1">
          <Image source={{ uri: match.logoA }} className="w-14 h-14 rounded-full mb-2 bg-[#222222]" />
          <Text className="text-white text-[13px] font-semibold text-center" numberOfLines={1}>
            {match.teamA}
          </Text>
        </View>
        <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-2">
          <Text className="text-[#888888] text-[10px]">VS</Text>
        </View>
        <View className="items-center flex-1">
          <Image source={{ uri: match.logoB }} className="w-14 h-14 rounded-full mb-2 bg-[#222222]" />
          <Text className="text-white text-[13px] font-semibold text-center" numberOfLines={1}>
            {match.teamB}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-end">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center mb-[6px]">
            <Feather name="map-pin" size={12} color="#23c55e" className="mr-[6px]" />
            <Text className="text-[#888888] text-[11px] ml-1" numberOfLines={1}>
              {match.venue}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Feather name="award" size={12} color="#888888" className="mr-[6px]" />
            <Text className="text-[#888888] text-[11px] ml-1" numberOfLines={1}>
              {match.league}
            </Text>
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
                {isCompleted && (
                  <Text className="text-[#23c55e] text-[11px] font-semibold text-center mb-3">{match.status}</Text>
                )}
                <View className="flex-row items-center justify-center w-full">
                  <View className="items-center w-[70px]">
                    <Text className="text-white text-[22px] font-bold">{match.scoreA}</Text>
                    <Text className={`text-[11px] mt-1 ${isLive ? 'text-[#23c55e]' : 'text-[#888888]'}`}>
                      {match.oversA}
                    </Text>
                  </View>
                  {isLive ? (
                    <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-2">
                      <Text className="text-[#888888] text-[10px]">VS</Text>
                    </View>
                  ) : (
                    <View className="w-8 mx-2" />
                  )}
                  <View className="items-center w-[70px]">
                    <Text className="text-white text-[22px] font-bold">{match.scoreB}</Text>
                    <Text className={`text-[11px] mt-1 ${isLive ? 'text-[#23c55e]' : 'text-[#888888]'}`}>
                      {match.oversB}
                    </Text>
                  </View>
                </View>
                {isLive && (
                  <Text className="text-[#23c55e] text-[11px] font-semibold text-center mt-3">{match.status}</Text>
                )}
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

  const CompletedCard = ({ match }) => {
    const isSuperOver = Boolean(
      match.isSuperOver ||
      match.margin === 'Super Over' ||
      (typeof match.margin === 'string' && match.margin.toLowerCase().includes('super over')) ||
      match.superOver?.played ||
      (Array.isArray(match.superOvers) && match.superOvers.length > 0) ||
      (typeof match.winner === 'string' && match.winner.toLowerCase().includes('super over')) ||
      (typeof match.resultText === 'string' && match.resultText.toLowerCase().includes('super over')) ||
      (match.matchData && (
        match.matchData.margin === 'Super Over' ||
        (Array.isArray(match.matchData.superOvers) && match.matchData.superOvers.length > 0) ||
        match.matchData.isSuperOver
      ))
    );

    const isDrawn = !isSuperOver && (
      match.result === 'DRAW' ||
      match.margin === 'Draw' ||
      (typeof match.winner === 'string' && match.winner.toLowerCase().includes('drawn'))
    );

    let cleanWinner = match.winner || match.matchData?.winner || '';
    if (cleanWinner) {
      cleanWinner = cleanWinner
        .replace(/\s+won\s+via\s+super\s+over.*$/i, '')
        .replace(/\s+won\s+by.*$/i, '')
        .replace(/\s+won$/i, '')
        .trim();
    }

    let superOverScores = null;
    if (match.superOverScores) {
      superOverScores = match.superOverScores;
    } else {
      const soList = match.superOvers || match.matchData?.superOvers;
      if (Array.isArray(soList) && soList.length > 0) {
        const lastSO = soList[soList.length - 1];
        if (lastSO?.innings1 && lastSO?.innings2) {
          superOverScores = {
            team1: lastSO.innings1.battingTeam,
            score1: `${lastSO.innings1.totalRuns ?? 0}/${lastSO.innings1.totalWickets ?? 0}`,
            team2: lastSO.innings2.battingTeam,
            score2: `${lastSO.innings2.totalRuns ?? 0}/${lastSO.innings2.totalWickets ?? 0}`,
          };
        }
      }
    }

    let displayMargin = match.margin;
    if (displayMargin === 'Super Over' || displayMargin === 'Draw') {
      displayMargin = '';
    }
    if (!displayMargin && !isSuperOver && !isDrawn && match.resultText) {
      const marginMatch = match.resultText.match(/by\s+([^.]+)/i);
      if (marginMatch) {
        displayMargin = `by ${marginMatch[1].trim()}`;
      }
    }

    return (
      <View className="bg-[#121212] border border-[#222222] rounded-xl mb-4 overflow-hidden">
        <View className="flex-row justify-between items-center px-4 pt-4 pb-1">
          <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase flex-1" numberOfLines={1}>
            {match.league}
          </Text>
          <Text className="text-[#888888] text-[11px] ml-2">
            {match.date}
          </Text>
        </View>

        <View className="flex-row items-center justify-between px-3 py-4">
          <View className="flex-1 items-center px-1">
            <Image source={{ uri: match.logoA }} className="w-12 h-12 rounded-full mb-1.5 bg-[#222222]" />
            <Text className="text-white text-xs font-semibold text-center mb-1 w-full" numberOfLines={1}>
              {match.teamA}
            </Text>
            <Text className="text-white text-lg font-bold text-center">
              {match.scoreA}
            </Text>
            <Text className="text-[#888888] text-[11px] text-center mt-0.5">
              {match.oversA}
            </Text>
          </View>

          <View className="w-[124px] px-1 items-center justify-center">
            {isSuperOver ? (
              <View className="items-center justify-center w-full">
                <View className="bg-[#eab308]/15 border border-[#eab308]/40 px-2 py-0.5 rounded-full mb-1.5">
                  <Text className="text-[#eab308] text-[9.5px] font-bold tracking-wider text-center">
                    MATCH TIED
                  </Text>
                </View>
                <Text className="text-[#888888] text-[10px] font-semibold uppercase tracking-wider text-center mb-0.5">
                  Super Over
                </Text>
                <Text className="text-[#23c55e] text-xs font-bold text-center leading-4" numberOfLines={2}>
                  {cleanWinner ? `${cleanWinner} won` : 'Match Won'}
                </Text>
              </View>
            ) : isDrawn ? (
              <View className="items-center justify-center w-full">
                <View className="bg-[#888888]/15 border border-[#888888]/40 px-2 py-0.5 rounded-full mb-1">
                  <Text className="text-[#888888] text-[9.5px] font-bold tracking-wider text-center">
                    MATCH DRAWN
                  </Text>
                </View>
                <Text className="text-[#888888] text-[10px] text-center mt-0.5">
                  Scores Level
                </Text>
              </View>
            ) : (
              <View className="items-center justify-center w-full">
                <Text className="text-[#23c55e] text-xs font-bold text-center leading-4" numberOfLines={2}>
                  {cleanWinner ? `${cleanWinner} won` : match.winner || 'Match Completed'}
                </Text>
                {Boolean(displayMargin) && (
                  <Text className="text-[#888888] text-[11px] font-medium text-center mt-1" numberOfLines={1}>
                    {displayMargin}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View className="flex-1 items-center px-1">
            <Image source={{ uri: match.logoB }} className="w-12 h-12 rounded-full mb-1.5 bg-[#222222]" />
            <Text className="text-white text-xs font-semibold text-center mb-1 w-full" numberOfLines={1}>
              {match.teamB}
            </Text>
            <Text className="text-white text-lg font-bold text-center">
              {match.scoreB}
            </Text>
            <Text className="text-[#888888] text-[11px] text-center mt-0.5">
              {match.oversB}
            </Text>
          </View>
        </View>

        {Boolean(isSuperOver && superOverScores) && (
          <View className="mx-3 mb-3 px-3 py-2 bg-[#181818] rounded-lg border border-[#262626]">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-1.5 h-1.5 rounded-full bg-[#eab308] mr-1.5" />
                <Text className="text-[#888888] text-[10px] font-bold uppercase tracking-wider">
                  Super Over
                </Text>
              </View>
              <View className="flex-row items-center flex-1 justify-end ml-2">
                <Text className="text-white text-[11px] font-semibold" numberOfLines={1}>
                  {superOverScores.team1 || match.teamA}
                  <Text className="text-[#23c55e] font-bold">
                    {` ${superOverScores.score1}`}
                  </Text>
                </Text>
                <Text className="text-[#555555] text-[10px] mx-1.5">•</Text>
                <Text className="text-white text-[11px] font-semibold" numberOfLines={1}>
                  {superOverScores.team2 || match.teamB}
                  <Text className="text-[#23c55e] font-bold">
                    {` ${superOverScores.score2}`}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="flex-row justify-between items-center p-3 border-t border-[#222222]">
          <View className="flex-row items-center flex-1 pr-2">
            <Feather name="map-pin" size={12} color="#23c55e" />
            <Text className="text-[#888888] text-[11px] ml-[6px]" numberOfLines={1}>
              {match.venue}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.navigate('LiveScoring', { matchData: match.matchData || match, isSpectator: true })}
              className="border border-[#1a4024] px-3 py-1 rounded-xl mr-2"
            >
              <Text className="text-[#23c55e] text-[11px] font-semibold">Scorecard</Text>
            </TouchableOpacity>
            <Feather name="chevron-right" size={16} color="#888888" />
          </View>
        </View>
      </View>
    );
  };

  const MyMatchesSidebarCard = ({ match }) => {
    const isLive = match.type === 'LIVE NOW';
    let borderColorClass = isLive ? 'border-[#1a4024]' : 'border-[#222222]';
    let pillBgClass = isLive ? 'bg-[#23c55e]' : 'bg-[#3498db]/15';
    let pillTextClass = isLive ? 'text-black' : 'text-[#3498db]';

    return (
      <View className={`bg-[#121212] border rounded-xl mb-4 flex-row overflow-hidden ${borderColorClass}`}>
        <View className="flex-1">
          <View className="flex-row justify-between items-center p-3 pb-0 pr-2">
            <View className={`px-[6px] py-[3px] rounded ${pillBgClass}`}>
              <Text className={`text-[9px] font-bold ${pillTextClass}`}>{match.type}</Text>
            </View>
            <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase flex-1 ml-2" numberOfLines={1}>
              {match.league}
            </Text>
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
                  <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-1">
                    <Text className="text-[#888888] text-[10px]">VS</Text>
                  </View>
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
          {Boolean(isLive && match.status) && (
            <View className="items-center mb-3">
              <View className="border border-[#23c55e] bg-[#0a1f10] px-[10px] py-1 rounded-xl">
                <Text className="text-[#23c55e] text-[11px] font-semibold text-center">{match.status}</Text>
              </View>
            </View>
          )}
          <View className="flex-row justify-between items-center px-3 pb-4">
            <View className="flex-row items-center flex-1 pr-2">
              <Feather name="map-pin" size={12} color="#23c55e" />
              <Text className="text-[#888888] text-[11px] ml-[6px]" numberOfLines={1}>
                {match.venue}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('LiveScoring', { matchData: match, isSpectator: true })}
              className="border border-[#1a4024] px-2.5 py-1 rounded-xl"
            >
              <Text className="text-[#23c55e] text-[10px] font-semibold">View Match</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="w-[90px] border-l border-[#222222] bg-[#111111] items-center py-4 px-1">
          <Text className="text-[#888888] text-[9px] font-bold uppercase mb-1">YOUR ROLE</Text>
          <Text className="text-xs font-bold mb-3 text-center" style={{ color: match.roleColor }}>
            {match.roleTitle}
          </Text>
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
            <View className={`px-[6px] py-[3px] rounded mr-2 ${pillBgClass}`}>
              <Text className={`text-[9px] font-bold ${pillTextClass}`}>{match.type}</Text>
            </View>
            <Text className="text-[#888888] text-[10px] tracking-[0.5px] uppercase flex-1" numberOfLines={1}>
              {match.league}
            </Text>
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
                <View className="w-8 h-8 rounded-full border border-[#333333] justify-center items-center mx-2">
                  <Text className="text-[#888888] text-[10px]">VS</Text>
                </View>
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
            <Text className="text-[#888888] text-[11px] ml-[6px]" numberOfLines={1}>
              {match.venue}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              const isScorer = match.rolePillText === 'SCORER';
              navigation.navigate('LiveScoring', {
                matchData: match,
                isScorer,
                isSpectator: !isScorer,
              });
            }}
            className="flex-row items-center"
          >
            <Text className="text-[#23c55e] text-[11px] font-bold mr-1">
              {match.rolePillText === 'SCORER' ? 'Score Match' : 'View Details'}
            </Text>
            <Feather name="chevron-right" size={14} color="#23c55e" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Radius Selector Chips
  const RADIUS_OPTIONS = [1, 5, 10, 25, 50];

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center">
          <Text className="text-2xl font-black italic mr-3 text-[#23c55e]">P</Text>
          <Text className="text-[22px] font-bold text-white">Live Matches</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="relative ml-5" onPress={() => navigation.navigate('Notifications')}>
            <Feather name="bell" size={22} color="#ffffff" />
            <View className="absolute -top-1 -right-[6px] rounded-full w-4 h-4 justify-center items-center bg-[#23c55e]">
              <Text className="text-black text-[9px] font-bold">3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity className="relative ml-5" onPress={() => navigation.navigate('Messages')}>
            <Feather name="message-square" size={22} color="#ffffff" />
            <View className="absolute -top-1 -right-[6px] rounded-full w-4 h-4 justify-center items-center bg-[#23c55e]">
              <Text className="text-black text-[9px] font-bold">2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tabs Horizontal Row */}
      <View className="border-b border-[#222222]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-2">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`py-[14px] px-4 mr-1 ${activeTab === tab ? 'border-b-2 border-[#23c55e]' : ''}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text className={`text-xs font-bold tracking-[0.5px] ${activeTab === tab ? 'text-[#23c55e]' : 'text-[#888888]'}`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Location Row & Radius Selector (Shown in LIVE Tab) */}
      {activeTab === 'LIVE' && (
        <View className="px-4 pt-3 pb-2 bg-[#0e0e0e] border-b border-[#1c1c1c]">
          <View className="flex-row justify-between items-center mb-2.5">
            <View className="flex-row items-center flex-1 pr-2">
              <Feather name="map-pin" size={13} color="#23c55e" />
              <Text className="text-white text-xs font-bold ml-1.5" numberOfLines={1}>
                📍 Near You • <Text className="text-[#888888] font-normal">{userLocation.city || 'Hyderabad'}</Text>
              </Text>
            </View>

            {/* List / Map Switch */}
            <View className="flex-row bg-[#181818] rounded-lg p-0.5 border border-[#2a2a2a]">
              <TouchableOpacity
                onPress={() => setViewMode('LIST')}
                className={`px-2.5 py-1 rounded-md flex-row items-center ${
                  viewMode === 'LIST' ? 'bg-[#23c55e]' : 'bg-transparent'
                }`}
              >
                <Feather name="list" size={11} color={viewMode === 'LIST' ? '#000000' : '#888888'} />
                <Text
                  className={`text-[10px] font-bold ml-1 ${
                    viewMode === 'LIST' ? 'text-black' : 'text-[#888888]'
                  }`}
                >
                  LIST
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setViewMode('MAP')}
                className={`px-2.5 py-1 rounded-md flex-row items-center ${
                  viewMode === 'MAP' ? 'bg-[#23c55e]' : 'bg-transparent'
                }`}
              >
                <Feather name="map" size={11} color={viewMode === 'MAP' ? '#000000' : '#888888'} />
                <Text
                  className={`text-[10px] font-bold ml-1 ${
                    viewMode === 'MAP' ? 'text-black' : 'text-[#888888]'
                  }`}
                >
                  MAP
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Radius Selector Chips */}
          <View className="flex-row items-center">
            <Text className="text-[#777777] text-[11px] font-semibold mr-2">Radius:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {RADIUS_OPTIONS.map((radius) => {
                const isSelected = selectedRadius === radius;
                return (
                  <TouchableOpacity
                    key={radius}
                    onPress={() => setSelectedRadius(radius)}
                    className={`px-3 py-1 rounded-full mr-2 border ${
                      isSelected
                        ? 'bg-[#23c55e] border-[#23c55e]'
                        : 'bg-[#181818] border-[#2a2a2a]'
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-bold ${
                        isSelected ? 'text-black' : 'text-[#aaaaaa]'
                      }`}
                    >
                      {radius} km
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Main Tab Content */}
      <ScrollView contentContainerClassName="pb-[100px] px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* --- LIVE TAB --- */}
        {activeTab === 'LIVE' && (
          <View>
            {/* View Mode: MAP */}
            {viewMode === 'MAP' ? (
              <View>
                <SectionHeader icon="radar" title="LOCAL CRICKET RADAR MAP" iconColor="#23c55e" />
                <LiveMatchesMap
                  userLocation={userLocation}
                  radiusKm={selectedRadius}
                  matches={allEnrichedLiveMatches}
                  startingSoonMatches={startingSoonMatches}
                  recruitingTeams={recruitingTeams}
                  onSelectMatch={(m) =>
                    navigation.navigate('LiveScoring', { matchData: m.matchData || m, isSpectator: true })
                  }
                  onSelectTeam={(t) =>
                    Alert.alert('Team Info', `${t.name}\n${t.location || 'Local Ground'}\nLooking for players!`)
                  }
                />
              </View>
            ) : (
              /* View Mode: LIST */
              <View>
                {/* SECTION A: 🔴 LIVE NEAR YOU */}
                <SectionHeader
                  icon="record-circle-outline"
                  title={`🔴 LIVE NEAR YOU (${allEnrichedLiveMatches.length})`}
                  iconColor="#ef4444"
                />

                {allEnrichedLiveMatches.length === 0 ? (
                  <View className="bg-[#121212] border border-[#222222] rounded-2xl p-5 mb-5 items-center">
                    <MaterialCommunityIcons name="broadcast-off" size={36} color="#555555" />
                    <Text className="text-white text-sm font-bold mt-2 text-center">
                      No live matches near you right now.
                    </Text>
                    <Text className="text-[#888888] text-xs text-center mt-1 mb-3">
                      There are no active matches within {selectedRadius} km of your location. Try expanding your discovery radius or check matches starting soon.
                    </Text>
                    <TouchableOpacity
                      onPress={() => setSelectedRadius(25)}
                      className="bg-[#1c2920] border border-[#23c55e] px-4 py-2 rounded-xl"
                    >
                      <Text className="text-[#23c55e] text-xs font-bold">Expand Radius to 25 km</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  allEnrichedLiveMatches.map((m) => (
                    <UpgradedLiveCard key={m.id} match={m} />
                  ))
                )}

                {/* SECTION B: 🟠 STARTING SOON */}
                {startingSoonMatches.length > 0 && (
                  <View className="mt-2 mb-2">
                    <SectionHeader
                      icon="clock-start"
                      title="🟠 STARTING SOON"
                      iconColor="#f39c12"
                    />
                    {startingSoonMatches.map((m) => (
                      <StartingSoonCard key={m.id} match={m} />
                    ))}
                  </View>
                )}

                {/* SECTION C: 👥 PEOPLE YOU FOLLOW ARE PLAYING */}
                {followedPlayersPlaying.length > 0 && (
                  <View className="mt-2 mb-2">
                    <SectionHeader
                      icon="account-heart"
                      title="👥 PEOPLE YOU FOLLOW ARE PLAYING"
                      iconColor="#23c55e"
                    />
                    {followedPlayersPlaying.map((p) => (
                      <FollowedPlayerPlayingCard key={p.id} player={p} />
                    ))}
                  </View>
                )}

                {/* SECTION D: 🏏 LOOKING FOR PLAYERS */}
                {recruitingTeams.length > 0 && (
                  <View className="mt-2 mb-2">
                    <SectionHeader
                      icon="account-multiple-plus-outline"
                      title="🏏 LOOKING FOR PLAYERS"
                      iconColor="#23c55e"
                    />
                    {recruitingTeams.map((item) => (
                      <LookingForPlayersCard key={item.id} item={item} />
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* --- UPCOMING TAB --- */}
        {activeTab === 'UPCOMING' && (
          <View>
            <SectionHeader icon="calendar-month-outline" title="UPCOMING MATCHES" iconColor="#23c55e" />
            {upcomingMatches.map((m) => (
              <UpcomingCard key={m.id} match={m} />
            ))}
          </View>
        )}

        {/* --- FOLLOWING TAB --- */}
        {activeTab === 'FOLLOWING' && (
          <View>
            <SubtitledHeader
              icon="star"
              title="FOLLOWING MATCHES"
              subtitle="Matches you follow across all categories"
            />
            {followingMatches.map((m) => (
              <FollowingCard key={m.id} match={m} />
            ))}
          </View>
        )}

        {/* --- COMPLETED TAB --- */}
        {activeTab === 'COMPLETED' && (
          <View>
            <SubtitledHeader
              icon="trophy-outline"
              title="COMPLETED MATCHES"
              subtitle="Past results and completed fixtures"
            />
            {[...contextCompleted, ...completedMatches].map((m) => (
              <CompletedCard key={m.id} match={m} />
            ))}
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

            {playingMatches.map((m) => (
              <MyMatchesSidebarCard key={m.id} match={m} />
            ))}

            <View className="mt-3 mb-4">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="shield-check" size={18} color="#23c55e" className="mr-2" />
                <Text className="text-xs font-bold tracking-widest text-white">
                  ORGANIZING ({organizingMatches.length})
                </Text>
              </View>
              <Text className="text-[#888888] text-[11px] mt-1">Matches you are organizing or managing</Text>
            </View>

            {organizingMatches.map((m) => (
              <MyMatchesRoleCard key={m.id} match={m} />
            ))}

            <View className="mt-3 mb-4">
              <View className="flex-row items-center">
                <MaterialCommunityIcons name="clipboard-check" size={18} color="#23c55e" className="mr-2" />
                <Text className="text-xs font-bold tracking-widest text-white">
                  SCORING ({scoringMatches.length})
                </Text>
              </View>
              <Text className="text-[#888888] text-[11px] mt-1">Matches where you are scoring</Text>
            </View>

            {scoringMatches.map((m) => (
              <MyMatchesRoleCard key={m.id} match={m} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}