import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorageRaw from '@react-native-async-storage/async-storage';

const AsyncStorage = AsyncStorageRaw?.default || AsyncStorageRaw;
const MATCHES_STORAGE_KEY = '@sports_app_matches_v2';

// 1. Create the Context
const MatchContext = createContext();

// Clean initial state: no hardcoded fake/mock completed matches
const DEFAULT_MATCHES = [];

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
          if (Array.isArray(parsed)) {
            // Filter out any legacy mock demo matches if present
            const cleanMatches = parsed.filter(m => m && !['match_c1', 'match_c2', 'match_c3'].includes(m.id));
            setMatches(cleanMatches);
          }
        } else {
          // Check if older key had real user matches, otherwise start clean
          const legacy = await AsyncStorage.getItem('@sports_app_matches_v1');
          if (legacy) {
            try {
              const parsedLegacy = JSON.parse(legacy);
              if (Array.isArray(parsedLegacy)) {
                const userRealMatches = parsedLegacy.filter(m => m && !['match_c1', 'match_c2', 'match_c3', 'match_123'].includes(m.id));
                setMatches(userRealMatches);
                await AsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(userRealMatches));
              }
            } catch (e) {}
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
      // Prevent duplicate match_id
      const existsIndex = prevMatches.findIndex((m) => m.id === matchWithId.id);
      let updated;
      if (existsIndex >= 0) {
        updated = [...prevMatches];
        updated[existsIndex] = { ...updated[existsIndex], ...matchWithId };
      } else {
        updated = [matchWithId, ...prevMatches];
      }
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

  // Function to clear all matches (useful for test resets)
  const clearMatches = async () => {
    setMatches([]);
    setActiveMatch(null);
    await AsyncStorage.removeItem(MATCHES_STORAGE_KEY);
  };

  // Provide state and functions to the rest of the app
  return (
    <MatchContext.Provider value={{ matches, activeMatch, setActiveMatch, addMatch, updateMatch, clearMatches }}>
      {children}
    </MatchContext.Provider>
  );
};

// 3. Create a custom hook for easy access in other files
export const useMatches = () => useContext(MatchContext);