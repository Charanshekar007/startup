/**
 * playerStatsService.js
 * 
 * Single source of truth for deriving cricket player statistics,
 * recent performance, form, achievements, and match histories
 * from real completed matches stored in the application.
 * 
 * Rules:
 * - Strictly idempotent: pure function over the matches array.
 * - Player identification by unique player ID (currentUserId).
 * - Cricket overs calculated using legal deliveries (never decimal math).
 * - Safe numeric handling (no NaN, no Infinity, safe division by zero).
 * - No fake/fallback data when no matches exist.
 */

/**
 * Helper to check if a player matches the target ID.
 * Supports primary ID check, userId check, and known aliases for seeded demo accounts.
 */
export function isPlayerMatch(candidate, playerId, playerName = '') {
  if (!candidate || !playerId) return false;

  const cId = typeof candidate === 'object' ? (candidate.id || candidate.userId || candidate.playerId) : candidate;
  if (cId && String(cId) === String(playerId)) return true;

  // Specific alias mapping for seeded default users if ID wasn't linked in legacy mock squads
  if (String(playerId) === 'usr_arjun123') {
    if (cId === 'a2') return true;
    const cName = typeof candidate === 'object' ? candidate.name : candidate;
    if (cName && (cName === 'Arjun Reddy' || cName === 'Arjun')) return true;
  }

  if (String(playerId) === 'usr_rahul123') {
    if (cId === 'a8' || cId === 'b2') return true;
    const cName = typeof candidate === 'object' ? candidate.name : candidate;
    if (cName && (cName === 'Rahul Verma' || cName === 'Rahul' || cName === 'KL Rahul (WK)')) return true;
  }

  // Fallback match on player's full display name if candidate has name
  if (playerName && typeof candidate === 'object' && candidate.name) {
    const pNorm = playerName.trim().toLowerCase();
    const cNorm = candidate.name.trim().toLowerCase();
    if (pNorm && cNorm && (cNorm === pNorm || cNorm.startsWith(pNorm + ' '))) {
      return true;
    }
  }

  return false;
}

/**
 * Check if the player participated in a completed match.
 */
export function didPlayerParticipate(match, playerId, playerName = '') {
  if (!match || match.status !== 'Completed') return false;

  // 1. Check Playing XI
  const xiA = match.playingXI_A || [];
  const xiB = match.playingXI_B || [];
  if (xiA.some(p => isPlayerMatch(p, playerId, playerName))) return true;
  if (xiB.some(p => isPlayerMatch(p, playerId, playerName))) return true;

  // 2. Check Innings 1 Batters & Bowlers
  const inn1 = match.firstInnings;
  if (inn1) {
    if ((inn1.batters || []).some(b => isPlayerMatch(b, playerId, playerName))) return true;
    const bowlers1 = inn1.bowlers || {};
    if (Object.keys(bowlers1).some(bId => isPlayerMatch({ id: bId, name: bowlers1[bId]?.name }, playerId, playerName))) return true;
  }

  // 3. Check Innings 2 Batters & Bowlers
  const inn2 = match.secondInnings;
  if (inn2) {
    if ((inn2.batters || []).some(b => isPlayerMatch(b, playerId, playerName))) return true;
    const bowlers2 = inn2.bowlers || {};
    if (Object.keys(bowlers2).some(bId => isPlayerMatch({ id: bId, name: bowlers2[bId]?.name }, playerId, playerName))) return true;
  }

  return false;
}

/**
 * Determine which team the player was playing for in a match.
 */
export function getPlayerTeam(match, playerId, playerName = '') {
  const xiA = match.playingXI_A || [];
  if (xiA.some(p => isPlayerMatch(p, playerId, playerName))) {
    return { playerTeam: match.teamA, opponentTeam: match.teamB, isTeamA: true };
  }
  const xiB = match.playingXI_B || [];
  if (xiB.some(p => isPlayerMatch(p, playerId, playerName))) {
    return { playerTeam: match.teamB, opponentTeam: match.teamA, isTeamA: false };
  }

  // Check which innings the player batted in
  if (match.firstInnings?.batters?.some(b => isPlayerMatch(b, playerId, playerName))) {
    return {
      playerTeam: match.firstInnings.battingTeam || match.teamA,
      opponentTeam: match.firstInnings.bowlingTeam || match.teamB,
      isTeamA: true,
    };
  }
  if (match.secondInnings?.batters?.some(b => isPlayerMatch(b, playerId, playerName))) {
    return {
      playerTeam: match.secondInnings.battingTeam || match.teamB,
      opponentTeam: match.secondInnings.bowlingTeam || match.teamA,
      isTeamA: false,
    };
  }

  return { playerTeam: match.teamA, opponentTeam: match.teamB, isTeamA: true };
}

/**
 * Format a match date or timestamp into readable text.
 */
export function formatMatchTime(dateVal) {
  if (!dateVal) return 'Recently';
  if (typeof dateVal === 'string' && (dateVal.includes('ago') || dateVal === 'Yesterday' || dateVal === 'Today')) {
    return dateVal;
  }

  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`;

  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

/**
 * Main calculation engine: derives all profile data from completed matches.
 */
export function calculatePlayerStats(matches = [], playerId, options = {}) {
  const { formatFilter = 'All', playerName = '' } = options;

  // Initialize empty state structures
  const emptyState = {
    batting: {
      matches: 0,
      innings: 0,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
      average: '0.0',
      strikeRate: '0.0',
      highestScore: '0',
      fifties: 0,
      hundreds: 0,
    },
    bowling: {
      matches: 0,
      legalBalls: 0,
      oversDisplay: '0.0',
      wickets: 0,
      runsConceded: 0,
      maidens: 0,
      dots: 0,
      economy: '0.0',
      average: '0.0',
      bestBowling: '-',
      fiveWickets: 0,
    },
    fielding: {
      catches: 0,
      runOuts: 0,
      stumpings: 0,
      directHits: 0,
    },
    matchSummary: {
      matches: 0,
      won: 0,
      lost: 0,
      tied: 0,
      winPercentage: '0.0%',
      potmCount: 0,
    },
    recentPerformance: [],
    formData: [],
    matchHistory: [],
    achievements: [],
    tournaments: [],
    teams: [],
  };

  if (!playerId || !Array.isArray(matches) || matches.length === 0) {
    return emptyState;
  }

  // 1. Filter completed matches involving this player
  let eligibleMatches = matches.filter(m => m && m.status === 'Completed' && didPlayerParticipate(m, playerId, playerName));

  // 2. Sort by date/timestamp descending (latest match first)
  eligibleMatches.sort((a, b) => {
    const timeA = a.completedAt || a.date ? new Date(a.completedAt || a.date).getTime() : 0;
    const timeB = b.completedAt || b.date ? new Date(b.completedAt || b.date).getTime() : 0;
    return timeB - timeA;
  });

  // Apply format filter if specified and not 'All'
  const filteredMatches = formatFilter && formatFilter !== 'All'
    ? eligibleMatches.filter(m => (m.format || '').toUpperCase() === formatFilter.toUpperCase())
    : eligibleMatches;

  if (filteredMatches.length === 0) {
    return emptyState;
  }

  // Counters
  let totalBattingMatches = 0;
  let totalBattingInnings = 0;
  let totalRuns = 0;
  let totalBalls = 0;
  let totalFours = 0;
  let totalSixes = 0;
  let totalDismissals = 0;
  let maxInningsRuns = -1;
  let maxInningsNotOut = false;
  let fiftiesCount = 0;
  let hundredsCount = 0;

  let totalBowlingMatches = 0;
  let totalLegalBalls = 0;
  let totalBowlingRuns = 0;
  let totalBowlingWickets = 0;
  let totalMaidens = 0;
  let totalDotBalls = 0;
  let bestWickets = -1;
  let bestRunsConceded = 9999;
  let fiveWicketsCount = 0;

  let totalCatches = 0;
  let totalRunOuts = 0;
  let totalStumpings = 0;
  let totalDirectHits = 0;

  let matchesWon = 0;
  let matchesLost = 0;
  let matchesTied = 0;
  let potmCount = 0;

  const recentPerformanceList = [];
  const formList = [];
  const matchHistoryList = [];
  const tournamentMap = {};
  const teamMap = {};

  // Iterate over each match once (prevents double counting)
  filteredMatches.forEach((match) => {
    const { playerTeam, opponentTeam } = getPlayerTeam(match, playerId, playerName);
    if (playerTeam) teamMap[playerTeam] = (teamMap[playerTeam] || 0) + 1;

    // Track tournaments
    const leagueName = match.tournament || match.league || (match.type && match.type !== 'Friendly' ? `${match.type} League` : null);
    if (leagueName) {
      if (!tournamentMap[leagueName]) {
        tournamentMap[leagueName] = {
          name: leagueName,
          matches: 0,
          team: playerTeam,
          year: match.date ? (new Date(match.date).getFullYear() || 2026) : 2026,
          isWinner: match.winner === playerTeam,
        };
      }
      tournamentMap[leagueName].matches += 1;
      if (match.winner === playerTeam) {
        tournamentMap[leagueName].isWinner = true;
      }
    }

    // Match outcome for player's team
    const isWin = match.winner === playerTeam;
    const isTie = match.result === 'DRAW' || match.result === 'TIED' || match.margin === 'Draw' || match.margin === 'Tied';
    if (isWin) matchesWon += 1;
    else if (isTie) matchesTied += 1;
    else matchesLost += 1;

    // Player of the match check
    const isPOTM = Boolean(
      (match.potmId && isPlayerMatch({ id: match.potmId }, playerId, playerName)) ||
      (match.potm && isPlayerMatch(match.potm, playerId, playerName)) ||
      (match.playerOfTheMatch && isPlayerMatch(match.playerOfTheMatch, playerId, playerName))
    );
    if (isPOTM) potmCount += 1;

    let matchRuns = 0;
    let matchBalls = 0;
    let matchFours = 0;
    let matchSixes = 0;
    let matchDidBat = false;
    let matchIsNotOut = false;

    let matchBowlingLegalBalls = 0;
    let matchBowlingRuns = 0;
    let matchBowlingWickets = 0;
    let matchDidBowl = false;
    let matchBowlingMaidens = 0;

    // Check innings 1 and 2
    const allInnings = [match.firstInnings, match.secondInnings].filter(Boolean);

    allInnings.forEach((inn) => {
      // 1. Batting in this innings
      const batters = inn.batters || [];
      const batterEntry = batters.find(b => isPlayerMatch(b, playerId, playerName));
      if (batterEntry && batterEntry.status !== 'yet to bat') {
        matchDidBat = true;
        totalBattingInnings += 1;

        const r = Number(batterEntry.runs) || 0;
        const b = Number(batterEntry.balls) || 0;
        const f4 = Number(batterEntry.fours) || 0;
        const s6 = Number(batterEntry.sixes) || 0;

        matchRuns += r;
        matchBalls += b;
        matchFours += f4;
        matchSixes += s6;

        totalRuns += r;
        totalBalls += b;
        totalFours += f4;
        totalSixes += s6;

        const isOut = batterEntry.status === 'out' || (batterEntry.dismissal && batterEntry.dismissal !== 'batting' && batterEntry.dismissal !== 'not out');
        if (isOut) {
          totalDismissals += 1;
        } else {
          matchIsNotOut = true;
        }

        // Highest score comparison
        if (r > maxInningsRuns) {
          maxInningsRuns = r;
          maxInningsNotOut = !isOut;
        } else if (r === maxInningsRuns && !isOut) {
          maxInningsNotOut = true;
        }

        if (r >= 100) hundredsCount += 1;
        else if (r >= 50) fiftiesCount += 1;
      }

      // 2. Bowling in this innings
      const bowlers = inn.bowlers || {};
      const bowlerKey = Object.keys(bowlers).find(bId => isPlayerMatch({ id: bId, name: bowlers[bId]?.name }, playerId, playerName));
      if (bowlerKey) {
        const bStats = bowlers[bowlerKey];
        const overs = Number(bStats.overs) || 0;
        const balls = Number(bStats.balls) || 0;
        const spellLegal = overs * 6 + balls;

        if (spellLegal > 0 || Number(bStats.wickets) > 0) {
          matchDidBowl = true;
          matchBowlingLegalBalls += spellLegal;
          const w = Number(bStats.wickets) || 0;
          const rc = Number(bStats.runsConceded) || 0;
          const m = Number(bStats.maidens) || 0;

          matchBowlingWickets += w;
          matchBowlingRuns += rc;
          matchBowlingMaidens += m;

          totalLegalBalls += spellLegal;
          totalBowlingWickets += w;
          totalBowlingRuns += rc;
          totalMaidens += m;

          if (w >= 5) fiveWicketsCount += 1;

          // Check best bowling spell
          if (w > bestWickets || (w === bestWickets && rc < bestRunsConceded)) {
            bestWickets = w;
            bestRunsConceded = rc;
          }
        }
      }

      // 3. Dot balls from pastOvers if recorded
      if (inn.pastOvers && Array.isArray(inn.pastOvers)) {
        inn.pastOvers.forEach(o => {
          if (bowlerKey && (o.bowlerId === bowlerKey || isPlayerMatch({ id: o.bowlerId, name: o.bowlerName }, playerId, playerName))) {
            const dots = (o.balls || []).filter(val => val === '0' || val === 0).length;
            totalDotBalls += dots;
          }
        });
      }

      // 4. Fielding events from fallOfWickets
      const fows = inn.fallOfWickets || [];
      fows.forEach(f => {
        const isFielder = isPlayerMatch({ id: f.fielderId, name: f.fielder }, playerId, playerName);
        if (isFielder) {
          const dt = (f.dismissalType || '').toLowerCase();
          if (dt.includes('caught') || dt.includes('catch')) totalCatches += 1;
          else if (dt.includes('stumped')) totalStumpings += 1;
          else if (dt.includes('direct')) totalDirectHits += 1;
          else if (dt.includes('run out')) totalRunOuts += 1;
        }
      });
    });

    if (matchDidBat) totalBattingMatches += 1;
    if (matchDidBowl) totalBowlingMatches += 1;

    // Build Recent Performance Card for this match
    const formattedDate = formatMatchTime(match.completedAt || match.date);
    let cardScore = '';
    let cardBalls = '';
    let cardExtra = '';
    let cardIcon = 'cricket-bat';

    if (matchDidBat) {
      cardScore = `${matchRuns}${matchIsNotOut ? '*' : ''}`;
      cardBalls = `${matchBalls}`;
      cardExtra = `${matchFours} Fours • ${matchSixes} Sixes`;
      cardIcon = 'cricket-bat';
    } else if (matchDidBowl) {
      const fullO = Math.floor(matchBowlingLegalBalls / 6);
      const remB = matchBowlingLegalBalls % 6;
      cardScore = `${matchBowlingWickets}/${matchBowlingRuns}`;
      cardBalls = remB > 0 ? `${fullO}.${remB}` : `${fullO}`;
      cardExtra = `${cardBalls} Overs • ${matchBowlingMaidens} Maidens`;
      cardIcon = 'cricket';
    } else {
      cardScore = 'DNB';
      cardBalls = '0';
      cardExtra = 'Fielded';
      cardIcon = 'hand-back-right';
    }

    recentPerformanceList.push({
      id: String(match.id),
      score: cardScore,
      balls: cardBalls,
      fours: matchFours,
      sixes: matchSixes,
      overs: matchDidBowl && !matchDidBat ? `${Math.floor(matchBowlingLegalBalls / 6)}.${matchBowlingLegalBalls % 6} Overs` : null,
      vs: opponentTeam,
      potm: isPOTM,
      time: formattedDate,
      icon: cardIcon,
    });

    // Form data for last 5 matches
    formList.push({
      id: `f_${match.id}`,
      score: matchRuns,
      result: isWin ? 'W' : (isTie ? 'T' : 'L'),
    });

    // Match history entry for Matches tab
    matchHistoryList.push({
      id: String(match.id),
      format: match.format || 'T20',
      league: match.league || match.tournament || `${match.format || 'T20'} League • Match`,
      teamA: match.teamA,
      logoA: match.teamAObj?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.teamA || 'TA')}&background=1e3a29&color=fff`,
      teamB: match.teamB,
      logoB: match.teamBObj?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.teamB || 'TB')}&background=b9770e&color=fff`,
      result: match.resultText || (isWin ? `Won by ${match.margin || 'runs'}` : (isTie ? 'Match Tied' : `Lost by ${match.margin || 'runs'}`)),
      myScore: cardScore,
      myBalls: cardBalls,
      myFours: matchFours,
      mySixes: matchSixes,
      extraInfo: cardExtra,
      potm: isPOTM,
      time: formattedDate,
    });
  });

  // Calculate Batting Aggregates
  const battingAvg = totalDismissals > 0
    ? (totalRuns / totalDismissals).toFixed(1)
    : (totalRuns > 0 ? totalRuns.toFixed(1) : '0.0');

  const battingSR = totalBalls > 0
    ? ((totalRuns / totalBalls) * 100).toFixed(1)
    : '0.0';

  const highestScoreDisplay = maxInningsRuns >= 0
    ? `${maxInningsRuns}${maxInningsNotOut ? '*' : ''}`
    : '0';

  // Calculate Bowling Aggregates
  const fullOvers = Math.floor(totalLegalBalls / 6);
  const remBalls = totalLegalBalls % 6;
  const oversDisplay = `${fullOvers}.${remBalls}`;

  const bowlingEcon = totalLegalBalls > 0
    ? ((totalBowlingRuns / (totalLegalBalls / 6))).toFixed(1)
    : '0.0';

  const bowlingAvg = totalBowlingWickets > 0
    ? (totalBowlingRuns / totalBowlingWickets).toFixed(1)
    : (totalBowlingRuns > 0 ? totalBowlingRuns.toFixed(1) : '0.0');

  const bestBowlingDisplay = bestWickets >= 0
    ? `${bestWickets}/${bestRunsConceded}`
    : '-';

  // Calculate Match Summary
  const totalMatchesCount = filteredMatches.length;
  const winPercent = totalMatchesCount > 0
    ? `${((matchesWon / totalMatchesCount) * 100).toFixed(1)}%`
    : '0.0%';

  // Dynamic Achievements
  const achievements = [];
  if (potmCount > 0) {
    achievements.push({
      id: 'ach_potm',
      title: 'POTM',
      value: `${potmCount} ${potmCount === 1 ? 'Time' : 'Times'}`,
      icon: 'star',
      iconSet: 'Ionicons',
      color: '#f39c12',
    });
  }
  if (totalRuns >= 500) {
    achievements.push({
      id: 'ach_500r',
      title: '500 Runs',
      value: 'Milestone',
      icon: 'target',
      iconSet: 'MaterialCommunityIcons',
      color: '#e67e22',
    });
  } else if (totalRuns >= 100) {
    achievements.push({
      id: 'ach_100r',
      title: '100 Runs',
      value: 'Milestone',
      icon: 'target',
      iconSet: 'MaterialCommunityIcons',
      color: '#e67e22',
    });
  }
  if (totalBowlingWickets >= 50) {
    achievements.push({
      id: 'ach_50w',
      title: '50 Wickets',
      value: 'Milestone',
      icon: 'cricket',
      iconSet: 'MaterialCommunityIcons',
      color: '#e67e22',
    });
  } else if (totalBowlingWickets >= 10) {
    achievements.push({
      id: 'ach_10w',
      title: '10 Wickets',
      value: 'Milestone',
      icon: 'cricket',
      iconSet: 'MaterialCommunityIcons',
      color: '#e67e22',
    });
  }
  if (fiveWicketsCount > 0) {
    achievements.push({
      id: 'ach_5wh',
      title: '5-Wkt Haul',
      value: `${fiveWicketsCount} ${fiveWicketsCount === 1 ? 'Time' : 'Times'}`,
      icon: 'trophy',
      iconSet: 'Ionicons',
      color: '#f1c40f',
    });
  }
  if (hundredsCount > 0) {
    achievements.push({
      id: 'ach_100s',
      title: 'Centurion',
      value: `${hundredsCount} 100s`,
      icon: 'medal',
      iconSet: 'Ionicons',
      color: '#23c55e',
    });
  }

  // Tournaments list
  const tournamentsList = Object.values(tournamentMap).map((t, idx) => ({
    id: `tourn_${idx}`,
    name: t.name,
    team: t.team,
    year: t.year,
    status: t.isWinner ? 'Winner' : 'Participant',
  }));

  // Teams list
  const teamsList = Object.keys(teamMap).map(tName => ({
    name: tName,
    matches: teamMap[tName],
  }));

  return {
    batting: {
      matches: totalBattingMatches,
      innings: totalBattingInnings,
      runs: totalRuns,
      balls: totalBalls,
      fours: totalFours,
      sixes: totalSixes,
      average: battingAvg,
      strikeRate: battingSR,
      highestScore: highestScoreDisplay,
      fifties: fiftiesCount,
      hundreds: hundredsCount,
    },
    bowling: {
      matches: totalBowlingMatches,
      legalBalls: totalLegalBalls,
      oversDisplay,
      wickets: totalBowlingWickets,
      runsConceded: totalBowlingRuns,
      maidens: totalMaidens,
      dots: totalDotBalls,
      economy: bowlingEcon,
      average: bowlingAvg,
      bestBowling: bestBowlingDisplay,
      fiveWickets: fiveWicketsCount,
    },
    fielding: {
      catches: totalCatches,
      runOuts: totalRunOuts,
      stumpings: totalStumpings,
      directHits: totalDirectHits,
    },
    matchSummary: {
      matches: totalMatchesCount,
      won: matchesWon,
      lost: matchesLost,
      tied: matchesTied,
      winPercentage: winPercent,
      potmCount,
    },
    recentPerformance: recentPerformanceList.slice(0, 5),
    formData: formList.slice(0, 5),
    matchHistory: matchHistoryList,
    achievements,
    tournaments: tournamentsList,
    teams: teamsList,
  };
}
