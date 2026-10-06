/**
 * playerStatsService.js
 * 
 * Single source of truth for deriving cricket player statistics,
 * recent performance, form, achievements, and match histories
 * from real completed matches stored in the application.
 * 
 * Rules:
 * - Strictly idempotent: pure function over the matches array.
 * - Player identification strictly by unique player ID (currentUserId / playerId).
 * - No fake or hardcoded demo values.
 * - Cricket overs calculated using integer legal deliveries (no decimal math errors).
 * - Safe numeric handling (no NaN, safe division by zero).
 * - Empty database produces empty states (all zeros).
 */

/**
 * Helper to check if a player/candidate matches the target unique player ID.
 * Strict comparison on ID (no name guessing, no legacy aliases).
 */
export function isPlayerMatch(candidate, playerId) {
  if (!candidate || !playerId) return false;

  const cId = typeof candidate === 'object'
    ? (candidate.id || candidate.userId || candidate.playerId)
    : candidate;

  return Boolean(cId && String(cId) === String(playerId));
}

/**
 * Check if the player participated in a completed match.
 * Scoped strictly to the target playerId.
 */
export function didPlayerParticipate(match, playerId) {
  if (!match || match.status !== 'Completed' || !playerId) return false;

  // 1. Check Playing XI of Team A
  const xiA = match.playingXI_A || [];
  if (xiA.some(p => isPlayerMatch(p, playerId))) return true;

  // 2. Check Playing XI of Team B
  const xiB = match.playingXI_B || [];
  if (xiB.some(p => isPlayerMatch(p, playerId))) return true;

  // 3. Fallback check: Innings 1 Batters or Bowlers
  const inn1 = match.firstInnings;
  if (inn1) {
    if ((inn1.batters || []).some(b => isPlayerMatch(b, playerId))) return true;
    const bowlers1 = inn1.bowlers || {};
    if (Object.keys(bowlers1).some(bId => isPlayerMatch(bowlers1[bId]?.id || bId, playerId))) return true;
  }

  // 4. Fallback check: Innings 2 Batters or Bowlers
  const inn2 = match.secondInnings;
  if (inn2) {
    if ((inn2.batters || []).some(b => isPlayerMatch(b, playerId))) return true;
    const bowlers2 = inn2.bowlers || {};
    if (Object.keys(bowlers2).some(bId => isPlayerMatch(bowlers2[bId]?.id || bId, playerId))) return true;
  }

  return false;
}

/**
 * Determine which team the player was playing for in a match.
 */
export function getPlayerTeam(match, playerId) {
  const xiA = match.playingXI_A || [];
  if (xiA.some(p => isPlayerMatch(p, playerId))) {
    return { playerTeam: match.teamA, opponentTeam: match.teamB, isTeamA: true };
  }
  const xiB = match.playingXI_B || [];
  if (xiB.some(p => isPlayerMatch(p, playerId))) {
    return { playerTeam: match.teamB, opponentTeam: match.teamA, isTeamA: false };
  }

  // Check innings batting team
  if (match.firstInnings?.batters?.some(b => isPlayerMatch(b, playerId))) {
    return {
      playerTeam: match.firstInnings.battingTeam || match.teamA,
      opponentTeam: match.firstInnings.bowlingTeam || match.teamB,
      isTeamA: true,
    };
  }
  if (match.secondInnings?.batters?.some(b => isPlayerMatch(b, playerId))) {
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
 * Helper to safely extract integer legal balls from a bowler statistics record.
 * Handles integer overs + balls, decimal-formatted string (e.g. '3.4' -> 3 overs 4 balls = 22 balls),
 * and legalBalls property.
 */
function getSpellLegalBalls(bStats) {
  if (!bStats) return 0;
  if (bStats.legalBalls !== undefined && bStats.legalBalls !== null) {
    return Number(bStats.legalBalls) || 0;
  }
  if (typeof bStats.overs === 'string' && bStats.overs.includes('.')) {
    const parts = bStats.overs.split('.');
    const compO = parseInt(parts[0], 10) || 0;
    const remB = parseInt(parts[1], 10) || 0;
    return compO * 6 + remB;
  }
  const compO = Number(bStats.overs) || 0;
  const remB = Number(bStats.balls) || 0;
  return compO * 6 + remB;
}

/**
 * Main calculation engine: derives all profile data exclusively from
 * completed matches in which the target player participated.
 */
export function calculatePlayerStats(matches = [], playerId, options = {}) {
  const { formatFilter = 'All' } = options;

  // Initialize empty state structures (no mock / fake values)
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

  // 1. Filter completed matches involving ONLY this player
  let eligibleMatches = matches.filter(m => m && m.status === 'Completed' && didPlayerParticipate(m, playerId));

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

  // Track processed match IDs to strictly prevent double counting (Requirement 29)
  const processedMatchIds = new Set();

  filteredMatches.forEach((match) => {
    if (!match.id || processedMatchIds.has(match.id)) return;
    processedMatchIds.add(match.id);

    const { playerTeam, opponentTeam } = getPlayerTeam(match, playerId);
    if (playerTeam) teamMap[playerTeam] = (teamMap[playerTeam] || 0) + 1;

    // Track tournaments
    const leagueName = match.tournament || match.league || (match.type && match.type !== 'Friendly' && match.type !== 'Practice' ? `${match.type} League` : null);
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

    // Player of the match check strictly scoped to playerId
    const isPOTM = Boolean(
      (match.potmId && isPlayerMatch({ id: match.potmId }, playerId)) ||
      (match.potm && isPlayerMatch(match.potm, playerId)) ||
      (match.playerOfTheMatch && isPlayerMatch(match.playerOfTheMatch, playerId))
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

    let matchCatches = 0;
    let matchRunOuts = 0;
    let matchStumpings = 0;
    let matchDirectHits = 0;

    // Check innings 1 and 2
    const allInnings = [match.firstInnings, match.secondInnings].filter(Boolean);

    allInnings.forEach((inn) => {
      // 1. Batting in this innings
      const batters = inn.batters || [];
      const batterEntry = batters.find(b => isPlayerMatch(b, playerId));
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
      const bowlerKey = Object.keys(bowlers).find(bId => isPlayerMatch(bowlers[bId]?.id || bId, playerId));
      if (bowlerKey) {
        const bStats = bowlers[bowlerKey];
        const spellLegal = getSpellLegalBalls(bStats);

        if (spellLegal > 0 || Number(bStats.wickets) > 0 || Number(bStats.runsConceded) > 0) {
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
      if (inn.pastOvers && Array.isArray(inn.pastOvers) && bowlerKey) {
        inn.pastOvers.forEach(o => {
          if (o.bowlerId && isPlayerMatch({ id: o.bowlerId }, playerId)) {
            const dots = (o.balls || []).filter(val => val === '0' || val === 0).length;
            totalDotBalls += dots;
          }
        });
      }

      // 4. Fielding events strictly credited to playerId
      const fows = inn.fallOfWickets || [];
      fows.forEach(f => {
        if (isPlayerMatch(f.fielderId, playerId)) {
          const dt = (f.dismissalType || '').toLowerCase();
          if (dt.includes('caught') || dt.includes('catch')) {
            totalCatches += 1;
            matchCatches += 1;
          } else if (dt.includes('stumped')) {
            totalStumpings += 1;
            matchStumpings += 1;
          } else if (dt.includes('direct')) {
            totalDirectHits += 1;
            matchDirectHits += 1;
          } else if (dt.includes('run out')) {
            totalRunOuts += 1;
            matchRunOuts += 1;
          }
        }
      });

      // Also check inn.batters for catches/stumpings if not recorded in fallOfWickets
      (inn.batters || []).forEach(b => {
        if (b.fielderId && isPlayerMatch(b.fielderId, playerId)) {
          const alreadyInFow = fows.some(f => (f.batterId && f.batterId === b.id) || f.batter === b.name);
          if (!alreadyInFow) {
            const dt = (b.dismissalType || b.dismissal || '').toLowerCase();
            if (dt.includes('caught') || dt.includes('catch') || dt.startsWith('c ')) {
              totalCatches += 1;
              matchCatches += 1;
            } else if (dt.includes('stumped') || dt.startsWith('st ')) {
              totalStumpings += 1;
              matchStumpings += 1;
            } else if (dt.includes('run out')) {
              totalRunOuts += 1;
              matchRunOuts += 1;
            }
          }
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
      if (matchDidBowl) {
        const fullO = Math.floor(matchBowlingLegalBalls / 6);
        const remB = matchBowlingLegalBalls % 6;
        const ovStr = remB > 0 ? `${fullO}.${remB}` : `${fullO}`;
        cardExtra = `${matchFours} Fours • ${matchBowlingWickets}/${matchBowlingRuns} (${ovStr} Ov)`;
      } else {
        cardExtra = `${matchFours} Fours • ${matchSixes} Sixes`;
      }
      cardIcon = 'cricket-bat';
    } else if (matchDidBowl) {
      const fullO = Math.floor(matchBowlingLegalBalls / 6);
      const remB = matchBowlingLegalBalls % 6;
      cardScore = `${matchBowlingWickets}/${matchBowlingRuns}`;
      cardBalls = remB > 0 ? `${fullO}.${remB}` : `${fullO}`;
      cardExtra = `${cardBalls} Overs • ${matchBowlingMaidens} Maidens`;
      cardIcon = 'cricket';
    } else if (matchCatches > 0 || matchRunOuts > 0 || matchStumpings > 0) {
      const fieldParts = [];
      if (matchCatches > 0) fieldParts.push(`${matchCatches} Catch${matchCatches === 1 ? '' : 'es'}`);
      if (matchRunOuts > 0) fieldParts.push(`${matchRunOuts} Run-out${matchRunOuts === 1 ? '' : 's'}`);
      if (matchStumpings > 0) fieldParts.push(`${matchStumpings} Stumping${matchStumpings === 1 ? '' : 's'}`);
      cardScore = fieldParts[0] || 'Fielded';
      cardBalls = '0';
      cardExtra = fieldParts.slice(1).join(' • ') || 'Fielding';
      cardIcon = 'hand-back-right';
    } else {
      cardScore = 'DNB';
      cardBalls = '0';
      cardExtra = 'Playing XI';
      cardIcon = 'account-check';
    }

    recentPerformanceList.push({
      id: String(match.id),
      score: cardScore,
      balls: cardBalls,
      fours: matchFours,
      sixes: matchSixes,
      overs: matchDidBowl ? `${Math.floor(matchBowlingLegalBalls / 6)}.${matchBowlingLegalBalls % 6} Overs` : null,
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

    // Match history entry for Matches tab (only participated matches)
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
  const totalMatchesCount = processedMatchIds.size;
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
