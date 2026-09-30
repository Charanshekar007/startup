import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorageRaw from '@react-native-async-storage/async-storage';

const AsyncStorage = AsyncStorageRaw?.default || AsyncStorageRaw;
const MATCHES_STORAGE_KEY = '@sports_app_matches_v1';

// 1. Create the Context
const MatchContext = createContext();

const DEFAULT_MATCHES = [
  {
    id: 'match_123',
    teamA: 'Falcons CC',
    teamB: 'Warriors XI',
    format: 'T20',
    status: 'Live',
    tossWinner: 'Falcons CC',
    decision: 'Bat',
    date: new Date().toLocaleDateString(),
  },
  {
    id: 'match_c1',
    teamA: 'Falcons CC',
    teamB: 'Royal Strikers',
    teamAObj: { id: 'team_a', name: 'Falcons CC', logo: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff' },
    teamBObj: { id: 'team_rs', name: 'Royal Strikers', logo: 'https://ui-avatars.com/api/?name=RS&background=b9770e&color=fff' },
    format: 'T20',
    type: 'Tournament',
    league: 'Kurukshetra T20 • Semi-Final',
    tournament: 'Kurukshetra T20',
    venue: 'Rajiv Cricket Ground, Hyderabad',
    date: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'Completed',
    winner: 'Falcons CC',
    margin: '6 wickets',
    result: 'WIN',
    resultText: 'Falcons CC won by 6 wickets',
    potm: { id: 'usr_arjun123', name: 'Arjun Reddy' },
    potmId: 'usr_arjun123',
    playingXI_A: [
      { id: 'usr_arjun123', name: 'Arjun Reddy', role: 'All Rounder' },
      { id: 'a1', name: 'Rohit Sharma (C)', role: 'Batter' },
      { id: 'a4', name: 'Karthik Nair (WK)', role: 'WK Batter' },
    ],
    playingXI_B: [
      { id: 'rs1', name: 'Suresh Raina', role: 'Batter' },
      { id: 'rs2', name: 'Deepak Chahar', role: 'Bowler' },
    ],
    firstInnings: {
      battingTeam: 'Royal Strikers',
      bowlingTeam: 'Falcons CC',
      totalRuns: 168,
      totalWickets: 8,
      overs: '20.0',
      extrasTotal: 10,
      batters: [
        { id: 'rs1', name: 'Suresh Raina', runs: 58, balls: 41, fours: 6, sixes: 2, status: 'out', dismissal: 'c Karthik b Bumrah' },
      ],
      bowlers: {
        'usr_arjun123': { name: 'Arjun Reddy', overs: 4, balls: 0, maidens: 0, runsConceded: 28, wickets: 1 },
      },
      fallOfWickets: [
        { wicket: 1, score: 32, batter: 'Suresh Raina', fielderId: 'usr_arjun123', fielder: 'Arjun Reddy', dismissalType: 'Caught' },
      ],
    },
    secondInnings: {
      battingTeam: 'Falcons CC',
      bowlingTeam: 'Royal Strikers',
      totalRuns: 172,
      totalWickets: 4,
      overs: '18.4',
      extrasTotal: 8,
      batters: [
        { id: 'usr_arjun123', name: 'Arjun Reddy', runs: 86, balls: 52, fours: 7, sixes: 3, status: 'not out', dismissal: 'not out' },
        { id: 'a1', name: 'Rohit Sharma (C)', runs: 34, balls: 24, fours: 4, sixes: 1, status: 'out', dismissal: 'b Chahar' },
      ],
      bowlers: {
        'rs2': { name: 'Deepak Chahar', overs: 3, balls: 4, maidens: 0, runsConceded: 35, wickets: 2 },
      },
      fallOfWickets: [],
    },
  },
  {
    id: 'match_c2',
    teamA: 'Warriors XI',
    teamB: 'Falcons CC',
    teamAObj: { id: 'team_b', name: 'Warriors XI', logo: 'https://ui-avatars.com/api/?name=WX&background=8e44ad&color=fff' },
    teamBObj: { id: 'team_a', name: 'Falcons CC', logo: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff' },
    format: 'T20',
    type: 'League',
    league: 'Hyderabad Turf League • League',
    tournament: 'Hyderabad Turf League',
    venue: 'Gymkhana Grounds, Secunderabad',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    status: 'Completed',
    winner: 'Warriors XI',
    margin: '3 runs',
    result: 'LOST',
    resultText: 'Warriors XI won by 3 runs',
    potm: { id: 'b1', name: 'Virat Kohli (C)' },
    potmId: 'b1',
    playingXI_A: [
      { id: 'b1', name: 'Virat Kohli (C)', role: 'Batter' },
    ],
    playingXI_B: [
      { id: 'usr_arjun123', name: 'Arjun Reddy', role: 'All Rounder' },
    ],
    firstInnings: {
      battingTeam: 'Warriors XI',
      bowlingTeam: 'Falcons CC',
      totalRuns: 165,
      totalWickets: 6,
      overs: '20.0',
      extrasTotal: 12,
      batters: [
        { id: 'b1', name: 'Virat Kohli (C)', runs: 72, balls: 48, fours: 8, sixes: 2, status: 'out', dismissal: 'b Arjun' },
      ],
      bowlers: {
        'usr_arjun123': { name: 'Arjun Reddy', overs: 3, balls: 0, maidens: 0, runsConceded: 22, wickets: 1 },
      },
      fallOfWickets: [],
    },
    secondInnings: {
      battingTeam: 'Falcons CC',
      bowlingTeam: 'Warriors XI',
      totalRuns: 162,
      totalWickets: 8,
      overs: '20.0',
      extrasTotal: 6,
      batters: [
        { id: 'usr_arjun123', name: 'Arjun Reddy', runs: 42, balls: 31, fours: 5, sixes: 1, status: 'out', dismissal: 'c Kohli b Axar' },
      ],
      bowlers: {},
      fallOfWickets: [],
    },
  },
  {
    id: 'match_c3',
    teamA: 'Falcons CC',
    teamB: 'Titans CC',
    teamAObj: { id: 'team_a', name: 'Falcons CC', logo: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff' },
    teamBObj: { id: 'team_tc', name: 'Titans CC', logo: 'https://ui-avatars.com/api/?name=TC&background=2c3e50&color=fff' },
    format: 'T20',
    type: 'League',
    league: 'Hyderabad Turf League • League',
    tournament: 'Hyderabad Turf League',
    venue: 'Rajiv Cricket Ground, Hyderabad',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    status: 'Completed',
    winner: 'Falcons CC',
    margin: '22 runs',
    result: 'WIN',
    resultText: 'Falcons CC won by 22 runs',
    potm: { id: 'usr_arjun123', name: 'Arjun Reddy' },
    potmId: 'usr_arjun123',
    playingXI_A: [
      { id: 'usr_arjun123', name: 'Arjun Reddy', role: 'All Rounder' },
    ],
    playingXI_B: [
      { id: 'tc1', name: 'Hardik Pandya', role: 'All Rounder' },
    ],
    firstInnings: {
      battingTeam: 'Falcons CC',
      bowlingTeam: 'Titans CC',
      totalRuns: 178,
      totalWickets: 5,
      overs: '20.0',
      extrasTotal: 8,
      batters: [
        { id: 'usr_arjun123', name: 'Arjun Reddy', runs: 31, balls: 22, fours: 3, sixes: 1, status: 'out', dismissal: 'c Pandya b Shami' },
      ],
      bowlers: {},
      fallOfWickets: [],
    },
    secondInnings: {
      battingTeam: 'Titans CC',
      bowlingTeam: 'Falcons CC',
      totalRuns: 156,
      totalWickets: 9,
      overs: '20.0',
      extrasTotal: 10,
      batters: [],
      bowlers: {
        'usr_arjun123': { name: 'Arjun Reddy', overs: 4, balls: 0, maidens: 2, runsConceded: 24, wickets: 3 },
      },
      fallOfWickets: [
        { wicket: 3, score: 54, batter: 'Hardik Pandya', fielderId: 'usr_arjun123', fielder: 'Arjun Reddy', dismissalType: 'Run Out' },
      ],
    },
  },
];

// 2. Create the Provider Component
export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState(DEFAULT_MATCHES);
  const [activeMatch, setActiveMatch] = useState(null);

  // Load matches from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(MATCHES_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge defaults if user hasn't seen completed matches yet
            const hasCompleted = parsed.some(m => m.status === 'Completed');
            if (!hasCompleted) {
              const merged = [...parsed, ...DEFAULT_MATCHES.filter(m => m.status === 'Completed')];
              setMatches(merged);
              AsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
            } else {
              setMatches(parsed);
            }
          }
        } else {
          AsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(DEFAULT_MATCHES)).catch(() => {});
        }
      } catch (err) {
        console.warn('Error loading matches from AsyncStorage:', err);
      }
    })();
  }, []);

  // Function to add a brand new match to the top of the list
  const addMatch = (newMatchDetails) => {
    const matchWithId = {
      id: newMatchDetails.id || `match_${Date.now()}`,
      ...newMatchDetails,
    };
    setMatches((prevMatches) => {
      const updated = [matchWithId, ...prevMatches];
      AsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    setActiveMatch(matchWithId);
    return matchWithId;
  };

  // Function to update an existing match in the list
  const updateMatch = (matchId, updatedFields) => {
    setMatches((prevMatches) => {
      const updated = prevMatches.map((m) =>
        m.id === matchId ? { ...m, ...updatedFields } : m
      );
      AsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    setActiveMatch((prev) => {
      if (prev && prev.id === matchId) {
        return { ...prev, ...updatedFields };
      }
      return prev;
    });
  };

  // Provide state and functions to the rest of the app
  return (
    <MatchContext.Provider value={{ matches, activeMatch, setActiveMatch, addMatch, updateMatch }}>
      {children}
    </MatchContext.Provider>
  );
};

// 3. Create a custom hook for easy access in other files
export const useMatches = () => useContext(MatchContext);