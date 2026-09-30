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
            setMatches(parsed);
          }
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