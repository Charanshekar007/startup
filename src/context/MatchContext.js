import React, { createContext, useState, useContext } from 'react';

// 1. Create the Context
const MatchContext = createContext();

// 2. Create the Provider Component
export const MatchProvider = ({ children }) => {
  // We will start with one active "mock" match so your UI isn't completely empty
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
    }
  ]);

  // Function to add a brand new match to the top of the list
  const addMatch = (newMatchDetails) => {
    setMatches((prevMatches) => [
      {
        id: `match_${Date.now()}`, // Generates a unique ID based on the timestamp
        ...newMatchDetails,
      },
      ...prevMatches,
    ]);
  };

  // Provide the state and the add function to the rest of the app
  return (
    <MatchContext.Provider value={{ matches, addMatch }}>
      {children}
    </MatchContext.Provider>
  );
};

// 3. Create a custom hook for easy access in other files
export const useMatches = () => useContext(MatchContext);