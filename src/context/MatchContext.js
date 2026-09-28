import React, { createContext, useState, useContext } from 'react';

// 1. Create the Context
const MatchContext = createContext();

// 2. Create the Provider Component
export const MatchProvider = ({ children }) => {
  const [matches, setMatches] = useState([
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
  ]);

  const [activeMatch, setActiveMatch] = useState(null);

  // Function to add a brand new match to the top of the list
  const addMatch = (newMatchDetails) => {
    const matchWithId = {
      id: newMatchDetails.id || `match_${Date.now()}`,
      ...newMatchDetails,
    };
    setMatches((prevMatches) => [matchWithId, ...prevMatches]);
    setActiveMatch(matchWithId);
    return matchWithId;
  };

  // Function to update an existing match in the list
  const updateMatch = (matchId, updatedFields) => {
    setMatches((prevMatches) =>
      prevMatches.map((m) => (m.id === matchId ? { ...m, ...updatedFields } : m))
    );
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