import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorageRaw from '@react-native-async-storage/async-storage';

const AsyncStorage = AsyncStorageRaw?.default || AsyncStorageRaw;
const MATCHES_STORAGE_KEY = '@sports_app_matches_v2';

// 1. Create the Context
const MatchContext = createContext();

// Clean initial state: no hardcoded fake/mock completed matches
const DEFAULT_MATCHES = [];

// In-memory Pub/Sub registry for real-time match event distribution
const matchSubscribers = new Map(); // matchId -> Set of callbacks

export const subscribeToMatch = (matchId, callback) => {
  if (!matchId || typeof callback !== 'function') return () => {};
  if (!matchSubscribers.has(matchId)) {
    matchSubscribers.set(matchId, new Set());
  }
  const set = matchSubscribers.get(matchId);
  set.add(callback);
  return () => {
    set.delete(callback);
    if (set.size === 0) {
      matchSubscribers.delete(matchId);
    }
  };
};

const notifyMatchSubscribers = (matchId, matchData) => {
  if (!matchId || !matchSubscribers.has(matchId)) return;
  const set = matchSubscribers.get(matchId);
  set.forEach((cb) => {
    try {
      cb(matchData);
    } catch (err) {
      console.warn('[MatchContext] Error in subscriber callback:', err);
    }
  });
};

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
  const addMatch = async (newMatchDetails) => {
    const matchWithId = {
      id: newMatchDetails.id || `match_${Date.now()}`,
      ...newMatchDetails,
    };
    try {
      let currentStored = [];
      try {
        const raw = await AsyncStorage.getItem(MATCHES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) currentStored = parsed;
        }
      } catch (e) {}

      const sourceList = currentStored.length > 0 ? currentStored : matches;
      const existsIndex = sourceList.findIndex((m) => m && m.id === matchWithId.id);
      let updated;
      if (existsIndex >= 0) {
        updated = [...sourceList];
        updated[existsIndex] = { ...updated[existsIndex], ...matchWithId };
      } else {
        updated = [matchWithId, ...sourceList];
      }
      await AsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(updated));
      setMatches(updated);
      setActiveMatch(matchWithId);
      notifyMatchSubscribers(matchWithId.id, matchWithId);
      return matchWithId;
    } catch (err) {
      console.warn('Error saving match in addMatch:', err);
      setMatches((prev) => [matchWithId, ...prev.filter((m) => m.id !== matchWithId.id)]);
      setActiveMatch(matchWithId);
      return matchWithId;
    }
  };

  // Function to update an existing match in the list and persist to storage
  const updateMatch = async (matchId, updatedFields) => {
    if (!matchId) return null;
    try {
      let updatedMatchObj = null;
      let newMatchesList = [];

      let currentStored = [];
      try {
        const raw = await AsyncStorage.getItem(MATCHES_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) currentStored = parsed;
        }
      } catch (e) {}

      const listToUpdate = currentStored.length > 0 ? currentStored : matches;
      const existsIndex = listToUpdate.findIndex((m) => m && m.id === matchId);

      if (existsIndex >= 0) {
        updatedMatchObj = {
          ...listToUpdate[existsIndex],
          ...updatedFields,
          updatedAt: Date.now(),
        };
        newMatchesList = [...listToUpdate];
        newMatchesList[existsIndex] = updatedMatchObj;
      } else {
        const base = (activeMatch && activeMatch.id === matchId) ? activeMatch : { id: matchId };
        updatedMatchObj = {
          ...base,
          ...updatedFields,
          updatedAt: Date.now(),
        };
        newMatchesList = [updatedMatchObj, ...listToUpdate];
      }

      // Persist to AsyncStorage BEFORE treating as saved
      await AsyncStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(newMatchesList));

      // Update state
      setMatches(newMatchesList);
      setActiveMatch((prev) => (prev && prev.id === matchId ? updatedMatchObj : prev));

      // Immediately notify real-time subscribers
      notifyMatchSubscribers(matchId, updatedMatchObj);

      // If this match belongs to a tournament, sync result and recalculate standings/progression
      if (updatedMatchObj && updatedMatchObj.tournamentId && updatedMatchObj.fixtureId) {
        try {
          const { tournamentService } = require('../services/tournamentService');
          tournamentService.syncMatchResultToFixture(
            updatedMatchObj.tournamentId,
            updatedMatchObj.fixtureId,
            updatedMatchObj
          ).catch((err) => console.warn('[MatchContext] Error syncing tournament match result:', err));
        } catch (syncErr) {
          console.warn('[MatchContext] Could not sync match result with tournamentService:', syncErr);
        }
      }

      return updatedMatchObj;
    } catch (err) {
      console.error('[MatchContext] Failed to persist match update:', err);
      throw err;
    }
  };

  // Function to force-refresh a match directly from AsyncStorage
  const refreshMatchFromStorage = async (matchId) => {
    if (!matchId) return null;
    try {
      const saved = await AsyncStorage.getItem(MATCHES_STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return null;
      const found = parsed.find((m) => m && m.id === matchId);
      if (found) {
        setMatches((prev) => {
          const idx = prev.findIndex((m) => m && m.id === matchId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...found };
            return next;
          }
          return [found, ...prev];
        });
        setActiveMatch((prev) => (prev && prev.id === matchId ? { ...prev, ...found } : prev));
      }
      return found || null;
    } catch (err) {
      console.warn('[MatchContext] Error refreshing match from storage:', err);
      return null;
    }
  };

  // Synchronous lookup from memory
  const getMatch = (matchId) => {
    if (!matchId) return null;
    const found = matches.find((m) => m && m.id === matchId);
    if (found) return found;
    if (activeMatch && activeMatch.id === matchId) return activeMatch;
    return null;
  };

  // Function to clear all matches (useful for test resets)
  const clearMatches = async () => {
    setMatches([]);
    setActiveMatch(null);
    await AsyncStorage.removeItem(MATCHES_STORAGE_KEY);
  };

  // Provide state and functions to the rest of the app
  return (
    <MatchContext.Provider
      value={{
        matches,
        activeMatch,
        setActiveMatch,
        addMatch,
        updateMatch,
        refreshMatchFromStorage,
        getMatch,
        subscribeToMatch,
        clearMatches,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};

// 3. Create a custom hook for easy access in other files
export const useMatches = () => useContext(MatchContext);