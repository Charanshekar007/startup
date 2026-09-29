import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMatches } from '../context/MatchContext';
import { SQUAD_A, SQUAD_B } from '../data/cricketSquads';

// Strike rate calculation helper
const getSR = (runs, balls) => {
  if (!balls || balls === 0) return '0.0';
  return ((runs / balls) * 100).toFixed(1);
};

// Economy calculation helper
const getEconomy = (runs, overs) => {
  const parts = String(overs || '0.0').split('.');
  const completedOvers = parseInt(parts[0], 10) || 0;
  const balls = parseInt(parts[1], 10) || 0;
  const totalOvers = completedOvers + balls / 6;
  if (totalOvers === 0) return '0.00';
  return (runs / totalOvers).toFixed(2);
};

export default function LiveScoringScreen({ navigation: navProp, route: routeProp } = {}) {
  let navHook = null;
  let routeHook = null;
  try {
    navHook = useNavigation();
  } catch (e) {}
  try {
    routeHook = useRoute();
  } catch (e) {}
  const navigation = navProp || navHook;
  const route = routeProp || routeHook;
  const insets = useSafeAreaInsets();
  const bottomInset = insets?.bottom || 0;

  const { activeMatch, updateMatch } = useMatches() || {};
  const matchParam = route?.params?.matchData || route?.params?.match || activeMatch;
  const isFresh = !!matchParam?.isFreshMatch;

  // Match details state
  const teamA = matchParam?.teamA || 'Falcons CC';
  const teamB = matchParam?.teamB || 'Warriors XI';
  const totalOversMax = matchParam?.oversPerInnings || 20;

  const firstInningsBattingTeam = matchParam?.firstInningsBattingTeam || teamA;
  const firstInningsBowlingTeam = matchParam?.firstInningsBowlingTeam || teamB;

  const playingXI_A = matchParam?.playingXI_A || SQUAD_A.slice(0, 11);
  const playingXI_B = matchParam?.playingXI_B || SQUAD_B.slice(0, 11);

  // Innings tracking
  const [currentInnings, setCurrentInnings] = useState(isFresh ? 1 : 2);
  const [totalRuns, setTotalRuns] = useState(isFresh ? 0 : 152);
  const [totalWickets, setTotalWickets] = useState(isFresh ? 0 : 4);
  const [legalBalls, setLegalBalls] = useState(isFresh ? 0 : 3);
  const [currentOverNumber, setCurrentOverNumber] = useState(isFresh ? 0 : 18);
  const [extrasTotal, setExtrasTotal] = useState(isFresh ? 0 : 14);
  const [extrasBreakdown, setExtrasBreakdown] = useState(
    isFresh
      ? { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 }
      : { wides: 5, noBalls: 2, byes: 4, legByes: 3, penalty: 0 }
  );

  // Target runs (null for 1st innings; set when 2nd innings begins)
  const [targetRuns, setTargetRuns] = useState(isFresh ? null : 186);

  // Super Over State
  const [isSuperOver, setIsSuperOver] = useState(false);
  const [superOverNumber, setSuperOverNumber] = useState(1);
  const [superOverInnings, setSuperOverInnings] = useState(1);
  const [superOverBattingTeam, setSuperOverBattingTeam] = useState(firstInningsBowlingTeam);
  const [superOverBowlingTeam, setSuperOverBowlingTeam] = useState(firstInningsBattingTeam);
  const [superOverTarget, setSuperOverTarget] = useState(null);
  const [superOverInnings1Summary, setSuperOverInnings1Summary] = useState(null);
  const [superOvers, setSuperOvers] = useState([]);
  const [tiedSuperOverData, setTiedSuperOverData] = useState(null);
  const [secondInningsSummary, setSecondInningsSummary] = useState(null);
  const [matchTiedData, setMatchTiedData] = useState(null);

  // ICC Restrictions Tracking for Super Overs
  const [dismissedSuperOverBatters, setDismissedSuperOverBatters] = useState({});
  const [previousSuperOverBowlers, setPreviousSuperOverBowlers] = useState({});

  // First Innings Record & Match Completion State
  const [firstInningsSummary, setFirstInningsSummary] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [scorecardInningsTab, setScorecardInningsTab] = useState(1); // 1 | 2 | 3 for final scorecard

  // Active Batting and Bowling Squads for the active innings
  const currentBattingTeam = isSuperOver
    ? superOverBattingTeam
    : (currentInnings === 1 ? firstInningsBattingTeam : firstInningsBowlingTeam);
  const currentBowlingTeam = isSuperOver
    ? superOverBowlingTeam
    : (currentInnings === 1 ? firstInningsBowlingTeam : firstInningsBattingTeam);

  const currentBattingSquad = currentBattingTeam === teamA ? playingXI_A : playingXI_B;
  const currentBowlingSquad = currentBowlingTeam === teamA ? playingXI_A : playingXI_B;

  // Initial Players Setup
  const initialStriker = isFresh && matchParam?.firstInningsSetup?.striker
    ? { ...matchParam.firstInningsSetup.striker, runs: 0, balls: 0, fours: 0, sixes: 0 }
    : { id: currentBattingSquad[0].id, name: currentBattingSquad[0].name, img: currentBattingSquad[0].img, runs: isFresh ? 0 : 72, balls: isFresh ? 0 : 45, fours: isFresh ? 0 : 8, sixes: isFresh ? 0 : 3 };

  const initialNonStriker = isFresh && matchParam?.firstInningsSetup?.nonStriker
    ? { ...matchParam.firstInningsSetup.nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0 }
    : { id: currentBattingSquad[1].id, name: currentBattingSquad[1].name, img: currentBattingSquad[1].img, runs: isFresh ? 0 : 28, balls: isFresh ? 0 : 22, fours: isFresh ? 0 : 2, sixes: isFresh ? 0 : 1 };

  const initialBowler = isFresh && matchParam?.firstInningsSetup?.bowler
    ? { ...matchParam.firstInningsSetup.bowler, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0 }
    : { id: currentBowlingSquad[0].id, name: currentBowlingSquad[0].name, img: currentBowlingSquad[0].img, overs: isFresh ? '0.0' : '3.3', maidens: 0, runsConceded: isFresh ? 0 : 28, wickets: isFresh ? 0 : 1 };

  const initialWicketkeeper = isFresh && matchParam?.firstInningsSetup?.wicketkeeper
    ? matchParam.firstInningsSetup.wicketkeeper
    : (currentBowlingSquad.find((p) => p.role?.includes('WK')) || currentBowlingSquad[0]);

  // Current Batters & Keeper state
  const [striker, setStriker] = useState(initialStriker);
  const [nonStriker, setNonStriker] = useState(initialNonStriker);
  const [bowler, setBowler] = useState(initialBowler);
  const [wicketkeeper, setWicketkeeper] = useState(initialWicketkeeper);

  // Batters scorecard tracking across the innings
  const [battersScorecard, setBattersScorecard] = useState(() => {
    return currentBattingSquad.map((p) => {
      if (p.id === initialStriker.id) {
        return { ...p, runs: initialStriker.runs, balls: initialStriker.balls, fours: initialStriker.fours, sixes: initialStriker.sixes, status: 'not out', dismissal: 'batting' };
      }
      if (p.id === initialNonStriker.id) {
        return { ...p, runs: initialNonStriker.runs, balls: initialNonStriker.balls, fours: initialNonStriker.fours, sixes: initialNonStriker.sixes, status: 'not out', dismissal: 'batting' };
      }
      return { ...p, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'yet to bat', dismissal: '' };
    });
  });

  // Bowler match statistics map
  const [bowlerStatsMap, setBowlerStatsMap] = useState(() => {
    const map = {};
    currentBowlingSquad.forEach((b) => {
      map[b.id] = {
        name: b.name,
        overs: b.id === initialBowler.id && !isFresh ? 3 : 0,
        balls: b.id === initialBowler.id && !isFresh ? 3 : 0,
        maidens: 0,
        runsConceded: b.id === initialBowler.id && !isFresh ? 28 : 0,
        wickets: b.id === initialBowler.id && !isFresh ? 1 : 0,
      };
    });
    return map;
  });

  // Track bowler who bowled previous over
  const [previousBowlerId, setPreviousBowlerId] = useState(null);

  // Bottom drawer state for automatic next-over bowler selection
  const [showBowlerSelectDrawer, setShowBowlerSelectDrawer] = useState(false);
  const [selectedNextBowler, setSelectedNextBowler] = useState(null);

  // Current over balls & Past overs history
  const [currentOverBalls, setCurrentOverBalls] = useState(
    isFresh
      ? []
      : [
          { type: 'run', value: '1', runs: 1, isLegal: true },
          { type: 'run', value: '4', runs: 4, isLegal: true },
          { type: 'run', value: '0', runs: 0, isLegal: true },
        ]
  );

  const [pastOvers, setPastOvers] = useState(
    isFresh
      ? []
      : [
          { overNum: 15, balls: ['1', '4', '0', '6', '1'], runs: 12 },
          { overNum: 16, balls: ['0', '1', '1', 'W', '0'], runs: 7 },
          { overNum: 17, balls: ['2', '1', '0', '4', 'W'], runs: 7 },
          { overNum: 18, balls: ['1', '4', '0', 'W', '1', '6'], runs: 12 },
        ]
  );

  // Fall of wickets list
  const [fallOfWickets, setFallOfWickets] = useState(
    isFresh
      ? []
      : [
          { wicket: 1, score: 24, batter: 'Rohit Sharma' },
          { wicket: 2, score: 68, batter: 'Charan Teja' },
          { wicket: 3, score: 98, batter: 'Karthik Nair' },
          { wicket: 4, score: 128, batter: 'Deepak Chahar' },
          { wicket: 5, score: 140, batter: 'Surya Varma' },
        ]
  );

  // Live commentary feed state
  const [commentaryList, setCommentaryList] = useState(() => {
    if (isFresh) {
      return [
        {
          id: 'c0',
          over: '0.0',
          text: `${matchParam?.tossWinner || firstInningsBattingTeam} won the toss and elected to ${matchParam?.decision || 'Bat'}. ${initialStriker.name} and ${initialNonStriker.name} are opening the batting for ${firstInningsBattingTeam}. ${initialBowler.name} opens the bowling for ${firstInningsBowlingTeam}.`,
        },
      ];
    }
    return [
      { id: 'c3', over: '18.3', text: 'Vikram Rao to Rahul Kumar, no run, solidly defended to mid-off.' },
      { id: 'c2', over: '18.2', text: 'Vikram Rao to Rahul Kumar, FOUR runs, beautifully driven through the covers!' },
      { id: 'c1', over: '18.1', text: 'Vikram Rao to Rahul Kumar, 1 run, pushed to long-on for a single.' },
    ];
  });

  // Extras bottom drawer states
  const [showNoBallDrawer, setShowNoBallDrawer] = useState(false);
  const [noBallSubStep, setNoBallSubStep] = useState('MAIN');
  const [noBallRunOutBatter, setNoBallRunOutBatter] = useState('striker');
  const [noBallRunOutRuns, setNoBallRunOutRuns] = useState(0);
  const [showWideDrawer, setShowWideDrawer] = useState(false);
  const [showByeDrawer, setShowByeDrawer] = useState(false);
  const [showLegByeDrawer, setShowLegByeDrawer] = useState(false);
  const [showExtrasDrawer, setShowExtrasDrawer] = useState(false);

  // History stack for Undo
  const [historyStack, setHistoryStack] = useState([]);

  // Active sub-screen/modal state
  const [currentScreen, setCurrentScreen] = useState('MAIN');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditLastBallModal, setShowEditLastBallModal] = useState(false);

  // Search filter for fielders
  const [fielderSearch, setFielderSearch] = useState('');

  // Temporary staging state for wicket workflow
  const [selectedDismissal, setSelectedDismissal] = useState('Caught');
  const [selectedFielder, setSelectedFielder] = useState(currentBowlingSquad[2] || currentBowlingSquad[0]);
  const [selectedRunoutBatter, setSelectedRunoutBatter] = useState(initialStriker);
  const [runsOnWicketBall, setRunsOnWicketBall] = useState(0);
  const [selectedNextBatter, setSelectedNextBatter] = useState(currentBattingSquad[2] || currentBattingSquad[0]);

  // Innings end state
  const [endInningsReason, setEndInningsReason] = useState('Manual End');

  // Second Innings Setup State
  const secondInningsBattingSquad = firstInningsBowlingTeam === teamA ? playingXI_A : playingXI_B;
  const secondInningsBowlingSquad = firstInningsBattingTeam === teamA ? playingXI_A : playingXI_B;

  const [setupStriker2, setSetupStriker2] = useState(secondInningsBattingSquad[0]);
  const [setupNonStriker2, setSetupNonStriker2] = useState(secondInningsBattingSquad[1]);
  const [setupBowler2, setSetupBowler2] = useState(secondInningsBowlingSquad[secondInningsBowlingSquad.length - 1] || secondInningsBowlingSquad[0]);
  const [setupKeeper2, setSetupKeeper2] = useState(secondInningsBowlingSquad.find((p) => p.role?.includes('WK')) || secondInningsBowlingSquad[0]);

  // Super Over Setup State
  const [setupStrikerSO, setSetupStrikerSO] = useState(null);
  const [setupNonStrikerSO, setSetupNonStrikerSO] = useState(null);
  const [setupBowlerSO, setSetupBowlerSO] = useState(null);
  const [setupKeeperSO, setSetupKeeperSO] = useState(null);

  // Generic Player Picker Modal Config: { title, role, team, players, currentId, restrictedIds, onSelect }
  const [pickerConfig, setPickerConfig] = useState(null);

  // Equation
  const activeTotalOvers = isSuperOver ? 1 : totalOversMax;
  const activeMaxWickets = isSuperOver
    ? 2
    : (currentBattingSquad?.length >= 2 ? Math.min(10, currentBattingSquad.length - 1) : 10);
  const oversDecimal = `${currentOverNumber}.${legalBalls}`;
  const totalBallsRemaining = isSuperOver
    ? Math.max(0, 6 - legalBalls)
    : Math.max(0, totalOversMax * 6 - (currentOverNumber * 6 + legalBalls));
  const runsNeeded = isSuperOver
    ? (superOverTarget ? Math.max(0, superOverTarget - totalRuns) : 0)
    : (targetRuns ? Math.max(0, targetRuns - totalRuns) : 0);

  const isInnings1Completed = currentInnings === 1 && (
    firstInningsSummary !== null ||
    currentOverNumber >= totalOversMax ||
    totalWickets >= activeMaxWickets
  );

  const isSecondInningsCompleted = currentInnings === 2 && (
    matchResult !== null ||
    matchTiedData !== null ||
    (targetRuns && totalRuns >= targetRuns) ||
    currentOverNumber >= totalOversMax ||
    totalWickets >= activeMaxWickets
  );

  const isSuperOverCompleted = isSuperOver && (
    (superOverInnings === 1 && superOverInnings1Summary !== null) ||
    (superOverInnings === 2 && matchResult !== null) ||
    currentOverNumber >= 1 ||
    totalWickets >= 2 ||
    (superOverInnings === 2 && superOverTarget && totalRuns >= superOverTarget)
  );

  const isScoringLocked = isInnings1Completed || isSecondInningsCompleted || isSuperOverCompleted;

  // ==========================================
  // SCORING HISTORY (UNDO ENGINE)
  // ==========================================
  const saveCurrentStateToHistory = () => {
    setHistoryStack((prev) => [
      ...prev,
      {
        totalRuns,
        totalWickets,
        legalBalls,
        currentOverNumber,
        extrasTotal,
        extrasBreakdown: { ...extrasBreakdown },
        striker: { ...striker },
        nonStriker: { ...nonStriker },
        bowler: { ...bowler },
        wicketkeeper: { ...wicketkeeper },
        isSuperOver,
        superOverNumber,
        superOverInnings,
        superOverTarget,
        superOverBattingTeam,
        superOverBowlingTeam,
        battersScorecard: JSON.parse(JSON.stringify(battersScorecard)),
        currentOverBalls: [...currentOverBalls],
        pastOvers: JSON.parse(JSON.stringify(pastOvers)),
        fallOfWickets: [...fallOfWickets],
        bowlerStatsMap: JSON.parse(JSON.stringify(bowlerStatsMap)),
        previousBowlerId,
        commentaryList: [...commentaryList],
        showBowlerSelectDrawer,
        firstInningsSummary: firstInningsSummary ? JSON.parse(JSON.stringify(firstInningsSummary)) : null,
        matchResult: matchResult ? JSON.parse(JSON.stringify(matchResult)) : null,
        matchTiedData: matchTiedData ? JSON.parse(JSON.stringify(matchTiedData)) : null,
        secondInningsSummary: secondInningsSummary ? JSON.parse(JSON.stringify(secondInningsSummary)) : null,
        targetRuns,
        currentInnings,
      },
    ]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) {
      Alert.alert('No Undo History', 'You have reached the beginning of this scoring session.');
      return;
    }
    const previousState = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));

    setTotalRuns(previousState.totalRuns);
    setTotalWickets(previousState.totalWickets);
    setLegalBalls(previousState.legalBalls);
    setCurrentOverNumber(previousState.currentOverNumber);
    setExtrasTotal(previousState.extrasTotal);
    setExtrasBreakdown(previousState.extrasBreakdown);
    setStriker(previousState.striker);
    setNonStriker(previousState.nonStriker);
    setBowler(previousState.bowler);
    if (previousState.wicketkeeper) setWicketkeeper(previousState.wicketkeeper);
    if (previousState.isSuperOver !== undefined) setIsSuperOver(previousState.isSuperOver);
    if (previousState.superOverNumber !== undefined) setSuperOverNumber(previousState.superOverNumber);
    if (previousState.superOverInnings !== undefined) setSuperOverInnings(previousState.superOverInnings);
    if (previousState.superOverTarget !== undefined) setSuperOverTarget(previousState.superOverTarget);
    if (previousState.superOverBattingTeam !== undefined) setSuperOverBattingTeam(previousState.superOverBattingTeam);
    if (previousState.superOverBowlingTeam !== undefined) setSuperOverBowlingTeam(previousState.superOverBowlingTeam);
    if (previousState.battersScorecard) {
      setBattersScorecard(previousState.battersScorecard);
    }
    setCurrentOverBalls(previousState.currentOverBalls);
    setPastOvers(previousState.pastOvers);
    setFallOfWickets(previousState.fallOfWickets);
    setBowlerStatsMap(previousState.bowlerStatsMap);
    setPreviousBowlerId(previousState.previousBowlerId);
    setCommentaryList(previousState.commentaryList);
    setShowBowlerSelectDrawer(previousState.showBowlerSelectDrawer);

    setFirstInningsSummary(previousState.firstInningsSummary || null);
    setMatchResult(previousState.matchResult || null);
    setMatchTiedData(previousState.matchTiedData || null);
    setSecondInningsSummary(previousState.secondInningsSummary || null);
    if (previousState.targetRuns !== undefined) setTargetRuns(previousState.targetRuns);
    if (previousState.currentInnings !== undefined) setCurrentInnings(previousState.currentInnings);

    if (updateMatch && matchParam?.id) {
      updateMatch(matchParam.id, {
        status: 'Live',
        winner: null,
        margin: null,
      });
    }

    setCurrentScreen('MAIN');
  };

  // Helper to update current striker's stats in scorecard
  const updateStrikerInScorecard = (updated) => {
    setBattersScorecard((prev) =>
      prev.map((b) => (b.id === updated.id ? { ...b, runs: updated.runs, balls: updated.balls, fours: updated.fours, sixes: updated.sixes, status: 'not out' } : b))
    );
  };

  // ==========================================
  // INNINGS & MATCH COMPLETION ENGINE
  // ==========================================
  const handleEndFirstInnings = (
    finalRuns,
    finalWickets,
    finalOversDecimal,
    customBatters,
    customBowlers,
    customPastOvers
  ) => {
    const summary = {
      battingTeam: firstInningsBattingTeam,
      bowlingTeam: firstInningsBowlingTeam,
      totalRuns: finalRuns !== undefined ? finalRuns : totalRuns,
      totalWickets: finalWickets !== undefined ? finalWickets : totalWickets,
      overs: finalOversDecimal || `${currentOverNumber}.${legalBalls}`,
      extrasTotal,
      extrasBreakdown: { ...extrasBreakdown },
      batters: customBatters || [...battersScorecard],
      bowlers: customBowlers || JSON.parse(JSON.stringify(bowlerStatsMap)),
      fallOfWickets: [...fallOfWickets],
      pastOvers: customPastOvers || JSON.parse(JSON.stringify(pastOvers)),
      target: (finalRuns !== undefined ? finalRuns : totalRuns) + 1,
      wicketkeeper,
    };

    setFirstInningsSummary(summary);
    setTargetRuns(summary.target);

    if (updateMatch && matchParam?.id) {
      updateMatch(matchParam.id, {
        scoreA: `${summary.totalRuns}/${summary.totalWickets}`,
        oversA: `${summary.overs} Ov`,
        status: `Innings 1 Complete: ${firstInningsBattingTeam} scored ${summary.totalRuns}/${summary.totalWickets}`,
      });
    }

    setCurrentScreen('INNINGS_SUMMARY');
  };

  const handleMatchTied = (finalRuns, finalWickets, finalOversDecimal) => {
    const inn1 = firstInningsSummary || {
      battingTeam: firstInningsBattingTeam,
      bowlingTeam: firstInningsBowlingTeam,
      totalRuns: 150,
      totalWickets: 8,
      overs: `${totalOversMax}.0`,
      extrasTotal: 0,
      extrasBreakdown: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 },
      batters: [],
      bowlers: {},
      fallOfWickets: [],
      target: 151,
      wicketkeeper,
    };

    const inn2 = {
      battingTeam: firstInningsBowlingTeam,
      bowlingTeam: firstInningsBattingTeam,
      totalRuns: finalRuns !== undefined ? finalRuns : totalRuns,
      totalWickets: finalWickets !== undefined ? finalWickets : totalWickets,
      overs: finalOversDecimal || `${currentOverNumber}.${legalBalls}`,
      extrasTotal,
      extrasBreakdown: { ...extrasBreakdown },
      batters: [...battersScorecard],
      bowlers: JSON.parse(JSON.stringify(bowlerStatsMap)),
      fallOfWickets: [...fallOfWickets],
      pastOvers: JSON.parse(JSON.stringify(pastOvers)),
      wicketkeeper,
    };

    setSecondInningsSummary(inn2);

    if (updateMatch && matchParam?.id) {
      updateMatch(matchParam.id, {
        status: 'Match Tied - Super Over Required',
        scoreB: `${inn2.totalRuns}/${inn2.totalWickets}`,
        oversB: `${inn2.overs} Ov`,
      });
    }

    setCurrentScreen('MATCH_TIED');
  };

  const handleSuperOverInnings1End = (finalRuns, finalWickets, finalOversDecimal) => {
    const summary = {
      battingTeam: superOverBattingTeam,
      bowlingTeam: superOverBowlingTeam,
      totalRuns: finalRuns,
      totalWickets: finalWickets,
      overs: finalOversDecimal,
      legalBalls: Math.min(6, finalOversDecimal === '1.0' ? 6 : legalBalls),
      extrasTotal,
      extrasBreakdown: { ...extrasBreakdown },
      batters: [...battersScorecard],
      bowler: { ...bowler },
      bowlers: JSON.parse(JSON.stringify(bowlerStatsMap)),
      wicketkeeper,
      fallOfWickets: [...fallOfWickets],
      pastOvers: JSON.parse(JSON.stringify(pastOvers)),
    };

    setSuperOverInnings1Summary(summary);
    const target = finalRuns + 1;
    setSuperOverTarget(target);

    // Automatically switch teams for Super Over 2nd Innings:
    const nextBattingTeam = superOverBowlingTeam;
    const nextBowlingTeam = superOverBattingTeam;
    setSuperOverBattingTeam(nextBattingTeam);
    setSuperOverBowlingTeam(nextBowlingTeam);
    setSuperOverInnings(2);

    // Prepare default selections for SO Innings 2 from fresh squads:
    const nextBattingSquad = nextBattingTeam === teamA ? playingXI_A : playingXI_B;
    const nextBowlingSquad = nextBowlingTeam === teamA ? playingXI_A : playingXI_B;

    const dismissedBatters = dismissedSuperOverBatters[nextBattingTeam] || [];
    const prevBowlerId = previousSuperOverBowlers[nextBowlingTeam];

    const eligibleBatters = nextBattingSquad.filter((p) => !dismissedBatters.includes(p.id));
    const eligibleBowlers = nextBowlingSquad.filter((p) => p.id !== prevBowlerId);

    setSetupStrikerSO(eligibleBatters[0] || nextBattingSquad[0]);
    setSetupNonStrikerSO(eligibleBatters[1] || nextBattingSquad[1]);
    setSetupBowlerSO(eligibleBowlers[eligibleBowlers.length - 1] || eligibleBowlers[0] || nextBowlingSquad[0]);
    setSetupKeeperSO(nextBowlingSquad.find((p) => p.role?.includes('WK')) || nextBowlingSquad[0]);

    setCurrentScreen('SUPER_OVER_SETUP');
  };

  const handleSuperOverInnings2End = (finalRuns, finalWickets, finalOversDecimal, isTargetReached) => {
    const inn1 = superOverInnings1Summary;
    const inn2 = {
      battingTeam: superOverBattingTeam,
      bowlingTeam: superOverBowlingTeam,
      totalRuns: finalRuns,
      totalWickets: finalWickets,
      overs: finalOversDecimal,
      legalBalls: Math.min(6, finalOversDecimal === '1.0' ? 6 : legalBalls),
      target: superOverTarget,
      extrasTotal,
      extrasBreakdown: { ...extrasBreakdown },
      batters: [...battersScorecard],
      bowler: { ...bowler },
      bowlers: JSON.parse(JSON.stringify(bowlerStatsMap)),
      wicketkeeper,
      fallOfWickets: [...fallOfWickets],
      pastOvers: JSON.parse(JSON.stringify(pastOvers)),
    };

    let winner = null;
    let isTied = false;

    if (isTargetReached || finalRuns > inn1.totalRuns) {
      winner = superOverBattingTeam;
    } else if (finalRuns < inn1.totalRuns) {
      winner = inn1.battingTeam;
    } else {
      isTied = true;
    }

    const currentCompletedSO = {
      superOverNumber,
      innings1: inn1,
      innings2: inn2,
      winner: isTied ? null : winner,
      isTied,
    };

    const updatedSuperOvers = [...superOvers, currentCompletedSO];
    setSuperOvers(updatedSuperOvers);

    // Track dismissed batters and bowlers across Super Overs for ICC rules
    const newDismissedBatters = { ...dismissedSuperOverBatters };
    const inn1DismissedIds = inn1.batters.filter((b) => b.status === 'out').map((b) => b.id);
    newDismissedBatters[inn1.battingTeam] = [
      ...(newDismissedBatters[inn1.battingTeam] || []),
      ...inn1DismissedIds,
    ];
    const inn2DismissedIds = inn2.batters.filter((b) => b.status === 'out').map((b) => b.id);
    newDismissedBatters[inn2.battingTeam] = [
      ...(newDismissedBatters[inn2.battingTeam] || []),
      ...inn2DismissedIds,
    ];
    setDismissedSuperOverBatters(newDismissedBatters);

    const newPrevBowlers = { ...previousSuperOverBowlers };
    if (inn1.bowler?.id) newPrevBowlers[inn1.bowlingTeam] = inn1.bowler.id;
    if (inn2.bowler?.id) newPrevBowlers[inn2.bowlingTeam] = inn2.bowler.id;
    setPreviousSuperOverBowlers(newPrevBowlers);

    if (isTied) {
      setTiedSuperOverData({
        soNumber: superOverNumber,
        team1: inn1.battingTeam,
        team1Runs: inn1.totalRuns,
        team1Wickets: inn1.totalWickets,
        team2: inn2.battingTeam,
        team2Runs: inn2.totalRuns,
        team2Wickets: inn2.totalWickets,
      });
      setCurrentScreen('SUPER_OVER_TIED');
    } else {
      handleMatchComplete({
        winner,
        margin: 'Super Over',
        resultText: `${winner} won via Super Over.`,
        superOversList: updatedSuperOvers,
      });
    }
  };

  const startSuperOverFlow = (soNumber = 1) => {
    // Batting Order:
    // Super Over 1: Team that batted SECOND in original match bats FIRST.
    // Super Over 2+: Team that batted second in previous Super Over bats first.
    let team1Batting = firstInningsBowlingTeam;
    let team1Bowling = firstInningsBattingTeam;

    if (soNumber > 1 && superOvers.length > 0) {
      const prevSO = superOvers[superOvers.length - 1];
      team1Batting = prevSO.innings2.battingTeam;
      team1Bowling = prevSO.innings1.battingTeam;
    }

    setIsSuperOver(true);
    setSuperOverNumber(soNumber);
    setSuperOverInnings(1);
    setSuperOverBattingTeam(team1Batting);
    setSuperOverBowlingTeam(team1Bowling);
    setSuperOverTarget(null);
    setSuperOverInnings1Summary(null);

    const battingSquad = team1Batting === teamA ? playingXI_A : playingXI_B;
    const bowlingSquad = team1Bowling === teamA ? playingXI_A : playingXI_B;

    const dismissedBatters = dismissedSuperOverBatters[team1Batting] || [];
    const prevBowlerId = previousSuperOverBowlers[team1Bowling];

    const eligibleBatters = battingSquad.filter((p) => !dismissedBatters.includes(p.id));
    const eligibleBowlers = bowlingSquad.filter((p) => p.id !== prevBowlerId);

    setSetupStrikerSO(eligibleBatters[0] || battingSquad[0]);
    setSetupNonStrikerSO(eligibleBatters[1] || battingSquad[1]);
    setSetupBowlerSO(eligibleBowlers[eligibleBowlers.length - 1] || eligibleBowlers[0] || bowlingSquad[0]);
    setSetupKeeperSO(bowlingSquad.find((p) => p.role?.includes('WK')) || bowlingSquad[0]);

    setCurrentScreen('SUPER_OVER_SETUP');
  };

  const handleMatchComplete = ({
    winner,
    margin,
    resultText,
    finalRuns,
    finalWickets,
    finalOversDecimal,
    superOversList,
    customBatters,
    customBowlers,
    customPastOvers,
  }) => {
    const inn1 = firstInningsSummary || {
      battingTeam: firstInningsBattingTeam,
      bowlingTeam: firstInningsBowlingTeam,
      totalRuns: 186,
      totalWickets: 7,
      overs: '20.0',
      extrasTotal: 12,
      extrasBreakdown: { wides: 4, noBalls: 1, byes: 4, legByes: 3, penalty: 0 },
      batters: [],
      bowlers: {},
      fallOfWickets: [],
      target: 187,
      wicketkeeper,
    };

    const inn2 = secondInningsSummary || {
      battingTeam: firstInningsBowlingTeam,
      bowlingTeam: firstInningsBattingTeam,
      totalRuns: finalRuns !== undefined ? finalRuns : totalRuns,
      totalWickets: finalWickets !== undefined ? finalWickets : totalWickets,
      overs: finalOversDecimal || `${currentOverNumber}.${legalBalls}`,
      extrasTotal,
      extrasBreakdown: { ...extrasBreakdown },
      batters: customBatters || [...battersScorecard],
      bowlers: customBowlers || JSON.parse(JSON.stringify(bowlerStatsMap)),
      fallOfWickets: [...fallOfWickets],
      pastOvers: customPastOvers || JSON.parse(JSON.stringify(pastOvers)),
      wicketkeeper,
    };

    const finalResult = {
      winner,
      margin,
      resultText: resultText || (winner ? `${winner} won by ${margin}` : 'Match Tied!'),
      firstInnings: inn1,
      secondInnings: inn2,
      superOvers: superOversList || superOvers,
    };

    setMatchResult(finalResult);

    if (updateMatch && matchParam?.id) {
      updateMatch(matchParam.id, {
        status: 'Completed',
        winner: finalResult.winner,
        margin: finalResult.margin,
        scoreB: `${inn2.totalRuns}/${inn2.totalWickets}`,
        oversB: `${inn2.overs} Ov`,
        superOvers: finalResult.superOvers,
      });
    }

    setCurrentScreen('MATCH_RESULT');
  };

  const checkDeliveryProgress = (newTotalRuns, newTotalWickets, nextBallsInOver, nextOverNum, isOverEnd, customBatters, customBowlers, customPastOvers) => {
    // Super Over Progress Check
    if (isSuperOver) {
      if (superOverInnings === 1) {
        if (newTotalWickets >= 2 || isOverEnd || nextBallsInOver >= 6) {
          handleSuperOverInnings1End(newTotalRuns, newTotalWickets, isOverEnd ? '1.0' : `0.${nextBallsInOver}`);
          return true;
        }
      } else if (superOverInnings === 2) {
        if (superOverTarget && newTotalRuns >= superOverTarget) {
          handleSuperOverInnings2End(newTotalRuns, newTotalWickets, isOverEnd ? '1.0' : `0.${nextBallsInOver}`, true);
          return true;
        }
        if (newTotalWickets >= 2 || isOverEnd || nextBallsInOver >= 6) {
          handleSuperOverInnings2End(newTotalRuns, newTotalWickets, isOverEnd ? '1.0' : `0.${nextBallsInOver}`, false);
          return true;
        }
      }
      return false;
    }

    // 2nd Innings Target Chase check
    if (currentInnings === 2) {
      if (targetRuns && newTotalRuns >= targetRuns) {
        const marginWickets = activeMaxWickets - newTotalWickets;
        handleMatchComplete({
          winner: firstInningsBowlingTeam,
          margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
          resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
          finalRuns: newTotalRuns,
          finalWickets: newTotalWickets,
          finalOversDecimal: isOverEnd ? `${nextOverNum}.0` : `${currentOverNumber}.${nextBallsInOver}`,
          customBatters,
          customBowlers,
          customPastOvers,
        });
        return true;
      }

      if (newTotalWickets >= activeMaxWickets || (isOverEnd && nextOverNum >= totalOversMax)) {
        const finalOvers = isOverEnd ? `${nextOverNum}.0` : `${currentOverNumber}.${nextBallsInOver}`;
        if (targetRuns && newTotalRuns < targetRuns - 1) {
          const marginRuns = targetRuns - 1 - newTotalRuns;
          handleMatchComplete({
            winner: firstInningsBattingTeam,
            margin: `${marginRuns} run${marginRuns === 1 ? '' : 's'}`,
            resultText: `${firstInningsBattingTeam} won by ${marginRuns} run${marginRuns === 1 ? '' : 's'}!`,
            finalRuns: newTotalRuns,
            finalWickets: newTotalWickets,
            finalOversDecimal: finalOvers,
            customBatters,
            customBowlers,
            customPastOvers,
          });
        } else if (targetRuns && newTotalRuns === targetRuns - 1) {
          handleMatchTied(newTotalRuns, newTotalWickets, finalOvers);
        }
        return true;
      }
    }

    // 1st Innings Completion check
    if (currentInnings === 1) {
      if (newTotalWickets >= activeMaxWickets || (isOverEnd && nextOverNum >= totalOversMax)) {
        const finalOvers = isOverEnd ? `${nextOverNum}.0` : `${currentOverNumber}.${nextBallsInOver}`;
        handleEndFirstInnings(newTotalRuns, newTotalWickets, finalOvers, customBatters, customBowlers, customPastOvers);
        return true;
      }
    }

    return false;
  };

  // Centralized over completion
  const completeOverAndPromptNextBowler = (
    finishedBalls,
    finishedBowler,
    currentRuns = totalRuns,
    currentWickets = totalWickets,
    currentBatters = battersScorecard,
  ) => {
    const finishedOverNumber = currentOverNumber + 1;
    const overRuns = finishedBalls.reduce((acc, b) => acc + (b.runs || 0), 0);

    const newPastOvers = [
      ...pastOvers,
      { overNum: finishedOverNumber, balls: finishedBalls.map((b) => b.value), runs: overRuns },
    ];
    setPastOvers(newPastOvers);

    const currentCompletedOvers = Math.floor(parseFloat(finishedBowler.overs || '0')) + 1;
    const isMaiden = overRuns === 0;

    const newBowlerStatsMap = {
      ...bowlerStatsMap,
      [finishedBowler.id]: {
        overs: currentCompletedOvers,
        maidens: isMaiden ? (bowlerStatsMap[finishedBowler.id]?.maidens || 0) + 1 : bowlerStatsMap[finishedBowler.id]?.maidens || 0,
        runsConceded: finishedBowler.runsConceded,
        wickets: finishedBowler.wickets,
      },
    };
    setBowlerStatsMap(newBowlerStatsMap);

    setPreviousBowlerId(finishedBowler.id);
    setCurrentOverBalls([]);
    setLegalBalls(0);
    setCurrentOverNumber(finishedOverNumber);

    setBowler({
      ...finishedBowler,
      overs: `${currentCompletedOvers}.0`,
      maidens: isMaiden ? finishedBowler.maidens + 1 : finishedBowler.maidens,
    });

    // Check if match / innings ends right on this over completion
    if (isSuperOver) {
      checkDeliveryProgress(currentRuns, currentWickets, 6, 1, true, currentBatters, newBowlerStatsMap, newPastOvers);
      return;
    }

    if (finishedOverNumber >= totalOversMax) {
      if (currentInnings === 1) {
        handleEndFirstInnings(
          currentRuns,
          currentWickets,
          `${finishedOverNumber}.0`,
          currentBatters,
          newBowlerStatsMap,
          newPastOvers
        );
        return;
      } else if (currentInnings === 2) {
        if (targetRuns && currentRuns >= targetRuns) {
          const marginWickets = activeMaxWickets - currentWickets;
          handleMatchComplete({
            winner: firstInningsBowlingTeam,
            margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
            resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
            finalRuns: currentRuns,
            finalWickets: currentWickets,
            finalOversDecimal: `${finishedOverNumber}.0`,
            customBatters: currentBatters,
            customBowlers: newBowlerStatsMap,
            customPastOvers: newPastOvers,
          });
        } else if (targetRuns && currentRuns < targetRuns - 1) {
          const marginRuns = targetRuns - 1 - currentRuns;
          handleMatchComplete({
            winner: firstInningsBattingTeam,
            margin: `${marginRuns} run${marginRuns === 1 ? '' : 's'}`,
            resultText: `${firstInningsBattingTeam} won by ${marginRuns} run${marginRuns === 1 ? '' : 's'}!`,
            finalRuns: currentRuns,
            finalWickets: currentWickets,
            finalOversDecimal: `${finishedOverNumber}.0`,
            customBatters: currentBatters,
            customBowlers: newBowlerStatsMap,
            customPastOvers: newPastOvers,
          });
        } else if (targetRuns && currentRuns === targetRuns - 1) {
          handleMatchTied(currentRuns, currentWickets, `${finishedOverNumber}.0`);
        }
        return;
      }
    }

    // Otherwise prompt next bowler
    setSelectedNextBowler(null);
    setShowBowlerSelectDrawer(true);
  };

  const handleConfirmNextBowler = () => {
    if (!selectedNextBowler) return;

    if (selectedNextBowler.id === previousBowlerId) {
      Alert.alert('Cricket Rule Violation', 'The bowler who bowled the previous over cannot bowl consecutive overs.');
      return;
    }

    const existingStats = bowlerStatsMap[selectedNextBowler.id] || {
      overs: 0,
      maidens: 0,
      runsConceded: 0,
      wickets: 0,
    };

    setBowler({
      id: selectedNextBowler.id,
      name: selectedNextBowler.name,
      img: selectedNextBowler.img,
      overs: `${existingStats.overs}.0`,
      maidens: existingStats.maidens,
      runsConceded: existingStats.runsConceded,
      wickets: existingStats.wickets,
    });

    setShowBowlerSelectDrawer(false);
    setSelectedNextBowler(null);
  };

  // -----------------------------------------------------------------------
  // NORMAL DELIVERY (0, 1, 2, 3, 4, 6)
  // -----------------------------------------------------------------------
  const handleScoreRuns = (runs) => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const newRuns = totalRuns + runs;
    setTotalRuns(newRuns);

    const updatedStriker = {
      ...striker,
      runs: striker.runs + runs,
      balls: striker.balls + 1,
      fours: runs === 4 ? striker.fours + 1 : striker.fours,
      sixes: runs === 6 ? striker.sixes + 1 : striker.sixes,
    };
    updateStrikerInScorecard(updatedStriker);

    const updatedBattersScorecard = battersScorecard.map((b) =>
      b.id === updatedStriker.id
        ? {
            ...b,
            runs: updatedStriker.runs,
            balls: updatedStriker.balls,
            fours: updatedStriker.fours,
            sixes: updatedStriker.sixes,
            status: 'not out',
          }
        : b
    );

    const updatedBowler = {
      ...bowler,
      runsConceded: bowler.runsConceded + runs,
    };

    const newBallObj = { type: 'run', value: `${runs}`, runs, isLegal: true };
    const updatedBalls = [...currentOverBalls, newBallObj];
    setCurrentOverBalls(updatedBalls);

    const overDisplay = `${currentOverNumber}.${legalBalls + 1}`;
    let commDesc = `${bowler.name} to ${striker.name}, ${runs} run${runs === 1 ? '' : 's'}.`;
    if (runs === 0) commDesc = `${bowler.name} to ${striker.name}, no run, defended solidly.`;
    else if (runs === 4) commDesc = `${bowler.name} to ${striker.name}, FOUR! Glorious stroke piercing the boundary!`;
    else if (runs === 6) commDesc = `${bowler.name} to ${striker.name}, SIX! Massive blow straight over the ropes!`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    let nextLegalBalls = legalBalls + 1;
    const isOverEnd = nextLegalBalls >= 6;

    if (isOverEnd) {
      if (runs % 2 === 0) {
        setStriker(nonStriker);
        setNonStriker(updatedStriker);
      } else {
        setStriker(updatedStriker);
        setNonStriker(nonStriker);
      }
    } else {
      if (runs % 2 !== 0) {
        setStriker(nonStriker);
        setNonStriker(updatedStriker);
      } else {
        setStriker(updatedStriker);
      }
    }

    // Check target chase in 2nd innings or Super Over chasing innings
    if ((isSuperOver && superOverInnings === 2 && superOverTarget && newRuns >= superOverTarget) ||
        (!isSuperOver && currentInnings === 2 && targetRuns && newRuns >= targetRuns)) {
      if (isOverEnd) {
        completeOverAndPromptNextBowler(updatedBalls, updatedBowler, newRuns, totalWickets, updatedBattersScorecard);
      } else {
        setLegalBalls(nextLegalBalls);
        updatedBowler.overs = `${currentOverNumber}.${nextLegalBalls}`;
        setBowler(updatedBowler);
        const marginWickets = activeMaxWickets - totalWickets;
        handleMatchComplete({
          winner: firstInningsBowlingTeam,
          margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
          resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
          finalRuns: newRuns,
          finalWickets: totalWickets,
          finalOversDecimal: `${currentOverNumber}.${nextLegalBalls}`,
          customBatters: updatedBattersScorecard,
        });
      }
      return;
    }

    if (isOverEnd) {
      completeOverAndPromptNextBowler(updatedBalls, updatedBowler, newRuns, totalWickets, updatedBattersScorecard);
    } else {
      setLegalBalls(nextLegalBalls);
      updatedBowler.overs = `${currentOverNumber}.${nextLegalBalls}`;
      setBowler(updatedBowler);
    }
  };

  // -----------------------------------------------------------------------
  // NO BALL HANDLERS
  // -----------------------------------------------------------------------
  const handleScoreNoBallRuns = (offBatRuns) => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const teamRunsToAdd = 1 + offBatRuns;
    const newTotal = totalRuns + teamRunsToAdd;
    setTotalRuns(newTotal);

    setExtrasTotal((prev) => prev + 1);
    setExtrasBreakdown((prev) => ({
      ...prev,
      noBalls: prev.noBalls + 1,
    }));

    const updatedStriker = {
      ...striker,
      runs: striker.runs + offBatRuns,
      balls: striker.balls + 1,
      fours: offBatRuns === 4 ? striker.fours + 1 : striker.fours,
      sixes: offBatRuns === 6 ? striker.sixes + 1 : striker.sixes,
    };
    updateStrikerInScorecard(updatedStriker);

    const updatedBattersScorecard = battersScorecard.map((b) =>
      b.id === updatedStriker.id
        ? {
            ...b,
            runs: updatedStriker.runs,
            balls: updatedStriker.balls,
            fours: updatedStriker.fours,
            sixes: updatedStriker.sixes,
            status: 'not out',
          }
        : b
    );

    const updatedBowler = {
      ...bowler,
      runsConceded: bowler.runsConceded + teamRunsToAdd,
    };
    setBowler(updatedBowler);

    if (offBatRuns % 2 !== 0) {
      setStriker(nonStriker);
      setNonStriker(updatedStriker);
    } else {
      setStriker(updatedStriker);
    }

    const ballLabel = offBatRuns > 0 ? `${offBatRuns}Nb` : 'Nb';
    const newBallObj = {
      type: 'no-ball',
      value: ballLabel,
      runs: teamRunsToAdd,
      isLegal: false,
      offBatRuns,
    };
    setCurrentOverBalls((prev) => [...prev, newBallObj]);

    const overDisplay = `${currentOverNumber}.${legalBalls}`;
    let commDesc = `${bowler.name} to ${striker.name}, NO BALL! (+1 run penalty)`;
    if (offBatRuns > 0) commDesc += ` and batter scores ${offBatRuns} run${offBatRuns === 1 ? '' : 's'}. Total +${teamRunsToAdd}.`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    setShowNoBallDrawer(false);

    if ((isSuperOver && superOverInnings === 2 && superOverTarget && newTotal >= superOverTarget) ||
        (!isSuperOver && currentInnings === 2 && targetRuns && newTotal >= targetRuns)) {
      const marginWickets = activeMaxWickets - totalWickets;
      handleMatchComplete({
        winner: firstInningsBowlingTeam,
        margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
        resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
        finalRuns: newTotal,
        finalWickets: totalWickets,
        finalOversDecimal: `${currentOverNumber}.${legalBalls}`,
        customBatters: updatedBattersScorecard,
      });
      return;
    }
  };

  const handleScoreNoBallByes = (byeRuns) => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const teamRunsToAdd = 1 + byeRuns;
    const newTotal = totalRuns + teamRunsToAdd;
    setTotalRuns(newTotal);

    setExtrasTotal((prev) => prev + teamRunsToAdd);
    setExtrasBreakdown((prev) => ({
      ...prev,
      noBalls: prev.noBalls + 1,
      byes: prev.byes + byeRuns,
    }));

    const updatedStriker = { ...striker, balls: striker.balls + 1 };
    updateStrikerInScorecard(updatedStriker);

    const updatedBattersScorecard = battersScorecard.map((b) =>
      b.id === updatedStriker.id
        ? { ...b, balls: updatedStriker.balls, status: 'not out' }
        : b
    );

    const updatedBowler = { ...bowler, runsConceded: bowler.runsConceded + 1 };
    setBowler(updatedBowler);

    if (byeRuns % 2 !== 0) {
      setStriker(nonStriker);
      setNonStriker(updatedStriker);
    } else {
      setStriker(updatedStriker);
    }

    const newBallObj = {
      type: 'no-ball',
      value: `Nb+${byeRuns}b`,
      runs: teamRunsToAdd,
      isLegal: false,
    };
    setCurrentOverBalls((prev) => [...prev, newBallObj]);

    const overDisplay = `${currentOverNumber}.${legalBalls}`;
    const commDesc = `${bowler.name} to ${striker.name}, NO BALL (+1 penalty) with ${byeRuns} Bye run${byeRuns === 1 ? '' : 's'} taken! Total +${teamRunsToAdd}.`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    setShowNoBallDrawer(false);
    setNoBallSubStep('MAIN');

    if ((isSuperOver && superOverInnings === 2 && superOverTarget && newTotal >= superOverTarget) ||
        (!isSuperOver && currentInnings === 2 && targetRuns && newTotal >= targetRuns)) {
      const marginWickets = activeMaxWickets - totalWickets;
      handleMatchComplete({
        winner: firstInningsBowlingTeam,
        margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
        resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
        finalRuns: newTotal,
        finalWickets: totalWickets,
        finalOversDecimal: `${currentOverNumber}.${legalBalls}`,
        customBatters: updatedBattersScorecard,
      });
      return;
    }
  };

  const handleScoreNoBallLegByes = (legByeRuns) => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const teamRunsToAdd = 1 + legByeRuns;
    const newTotal = totalRuns + teamRunsToAdd;
    setTotalRuns(newTotal);

    setExtrasTotal((prev) => prev + teamRunsToAdd);
    setExtrasBreakdown((prev) => ({
      ...prev,
      noBalls: prev.noBalls + 1,
      legByes: prev.legByes + legByeRuns,
    }));

    const updatedStriker = { ...striker, balls: striker.balls + 1 };
    updateStrikerInScorecard(updatedStriker);

    const updatedBattersScorecard = battersScorecard.map((b) =>
      b.id === updatedStriker.id
        ? { ...b, balls: updatedStriker.balls, status: 'not out' }
        : b
    );

    const updatedBowler = { ...bowler, runsConceded: bowler.runsConceded + 1 };
    setBowler(updatedBowler);

    if (legByeRuns % 2 !== 0) {
      setStriker(nonStriker);
      setNonStriker(updatedStriker);
    } else {
      setStriker(updatedStriker);
    }

    const newBallObj = {
      type: 'no-ball',
      value: `Nb+${legByeRuns}lb`,
      runs: teamRunsToAdd,
      isLegal: false,
    };
    setCurrentOverBalls((prev) => [...prev, newBallObj]);

    const overDisplay = `${currentOverNumber}.${legalBalls}`;
    const commDesc = `${bowler.name} to ${striker.name}, NO BALL (+1 penalty) with ${legByeRuns} Leg Bye${legByeRuns === 1 ? '' : 's'} taken! Total +${teamRunsToAdd}.`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    setShowNoBallDrawer(false);
    setNoBallSubStep('MAIN');

    if ((isSuperOver && superOverInnings === 2 && superOverTarget && newTotal >= superOverTarget) ||
        (!isSuperOver && currentInnings === 2 && targetRuns && newTotal >= targetRuns)) {
      const marginWickets = activeMaxWickets - totalWickets;
      handleMatchComplete({
        winner: firstInningsBowlingTeam,
        margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
        resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
        finalRuns: newTotal,
        finalWickets: totalWickets,
        finalOversDecimal: `${currentOverNumber}.${legalBalls}`,
        customBatters: updatedBattersScorecard,
      });
      return;
    }
  };

  const handleScoreNoBallWicket = () => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const teamRunsToAdd = 1 + noBallRunOutRuns;
    const newTotal = totalRuns + teamRunsToAdd;
    const newWickets = totalWickets + 1;
    setTotalRuns(newTotal);
    setTotalWickets(newWickets);

    setExtrasTotal((prev) => prev + 1);
    setExtrasBreakdown((prev) => ({ ...prev, noBalls: prev.noBalls + 1 }));

    const updatedBowler = { ...bowler, runsConceded: bowler.runsConceded + teamRunsToAdd };
    setBowler(updatedBowler);

    const dismissedBatter = noBallRunOutBatter === 'striker' ? striker : nonStriker;
    const newFallOfWickets = [
      ...fallOfWickets,
      { wicket: newWickets, score: newTotal, batter: dismissedBatter.name },
    ];
    setFallOfWickets(newFallOfWickets);

    let updatedBattersScorecard = battersScorecard.map((b) =>
      b.id === dismissedBatter.id ? { ...b, status: 'out', dismissal: 'run out' } : b
    );

    const newBallObj = { type: 'wicket', value: 'Nb+W', runs: teamRunsToAdd, isLegal: false };
    setCurrentOverBalls((prev) => [...prev, newBallObj]);

    const overDisplay = `${currentOverNumber}.${legalBalls}`;
    const commDesc = `${bowler.name} to ${striker.name}, NO BALL! OUT! ${dismissedBatter.name} RUN OUT! Team +${teamRunsToAdd}, Wicket falls.`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    setShowNoBallDrawer(false);
    setNoBallSubStep('MAIN');

    // Check target chase in 2nd innings
    if (!isSuperOver && currentInnings === 2 && targetRuns && newTotal >= targetRuns) {
      const marginWickets = activeMaxWickets - newWickets;
      handleMatchComplete({
        winner: firstInningsBowlingTeam,
        margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
        resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
        finalRuns: newTotal,
        finalWickets: newWickets,
        finalOversDecimal: `${currentOverNumber}.${legalBalls}`,
        customBatters: updatedBattersScorecard,
      });
      return;
    }

    const dismissedNames = newFallOfWickets.map((f) => f.batter);
    const otherActiveBatterName = noBallRunOutBatter === 'striker' ? nonStriker.name : striker.name;
    const remainingBatters = currentBattingSquad.filter(
      (p) => !dismissedNames.includes(p.name) && p.name !== otherActiveBatterName
    );

    const isAllOut = newWickets >= activeMaxWickets || remainingBatters.length === 0;

    if (isAllOut) {
      if (currentInnings === 1) {
        handleEndFirstInnings(newTotal, newWickets, `${currentOverNumber}.${legalBalls}`, updatedBattersScorecard);
      } else {
        if (targetRuns && newTotal < targetRuns - 1) {
          const marginRuns = targetRuns - 1 - newTotal;
          handleMatchComplete({
            winner: firstInningsBattingTeam,
            margin: `${marginRuns} run${marginRuns === 1 ? '' : 's'}`,
            resultText: `${firstInningsBattingTeam} won by ${marginRuns} run${marginRuns === 1 ? '' : 's'}!`,
            finalRuns: newTotal,
            finalWickets: newWickets,
            finalOversDecimal: `${currentOverNumber}.${legalBalls}`,
            customBatters: updatedBattersScorecard,
          });
        } else if (targetRuns && newTotal === targetRuns - 1) {
          handleMatchTied(newTotal, newWickets, `${currentOverNumber}.${legalBalls}`);
        }
      }
      return;
    }

    const nextBatter = remainingBatters[0] || { id: `nb_${Date.now()}`, name: 'Next Batter', img: 'https://ui-avatars.com/api/?name=NB' };
    const newBatterObj = { ...nextBatter, runs: 0, balls: 0, fours: 0, sixes: 0 };
    updatedBattersScorecard = updatedBattersScorecard.map((b) =>
      b.id === nextBatter.id ? { ...b, status: 'not out', dismissal: 'batting' } : b
    );
    setBattersScorecard(updatedBattersScorecard);

    if (noBallRunOutBatter === 'striker') {
      setStriker(newBatterObj);
    } else {
      setNonStriker(newBatterObj);
    }
  };

  // -----------------------------------------------------------------------
  // WIDE HANDLER
  // -----------------------------------------------------------------------
  const handleScoreWide = (extraRuns = 0) => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const wideRuns = 1 + extraRuns;
    const newTotal = totalRuns + wideRuns;
    setTotalRuns(newTotal);

    setExtrasTotal((prev) => prev + wideRuns);
    setExtrasBreakdown((prev) => ({
      ...prev,
      wides: prev.wides + wideRuns,
    }));

    const updatedBowler = {
      ...bowler,
      runsConceded: bowler.runsConceded + wideRuns,
    };
    setBowler(updatedBowler);

    if (extraRuns % 2 !== 0) {
      const temp = striker;
      setStriker(nonStriker);
      setNonStriker(temp);
    }

    const ballLabel = extraRuns > 0 ? `${wideRuns}Wd` : 'Wd';
    const newBallObj = { type: 'wide', value: ballLabel, runs: wideRuns, isLegal: false, extraRuns };
    setCurrentOverBalls((prev) => [...prev, newBallObj]);

    const overDisplay = `${currentOverNumber}.${legalBalls}`;
    const commDesc = `${bowler.name} to ${striker.name}, WIDE! (+1 run penalty${extraRuns > 0 ? ` and ${extraRuns} additional wide runs completed` : ''}). Total +${wideRuns}.`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    setShowWideDrawer(false);

    if ((isSuperOver && superOverInnings === 2 && superOverTarget && newTotal >= superOverTarget) ||
        (!isSuperOver && currentInnings === 2 && targetRuns && newTotal >= targetRuns)) {
      const marginWickets = activeMaxWickets - totalWickets;
      handleMatchComplete({
        winner: firstInningsBowlingTeam,
        margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
        resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
        finalRuns: newTotal,
        finalWickets: totalWickets,
        finalOversDecimal: `${currentOverNumber}.${legalBalls}`,
      });
      return;
    }
  };

  // -----------------------------------------------------------------------
  // BYE HANDLER
  // -----------------------------------------------------------------------
  const handleScoreBye = (byeRuns) => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const newTotal = totalRuns + byeRuns;
    setTotalRuns(newTotal);

    setExtrasTotal((prev) => prev + byeRuns);
    setExtrasBreakdown((prev) => ({
      ...prev,
      byes: prev.byes + byeRuns,
    }));

    const updatedStriker = {
      ...striker,
      balls: striker.balls + 1,
    };
    updateStrikerInScorecard(updatedStriker);

    const updatedBattersScorecard = battersScorecard.map((b) =>
      b.id === updatedStriker.id
        ? { ...b, balls: updatedStriker.balls, status: 'not out' }
        : b
    );

    const ballLabel = `${byeRuns}b`;
    const newBallObj = { type: 'bye', value: ballLabel, runs: byeRuns, isLegal: true, byeRuns };
    const updatedBalls = [...currentOverBalls, newBallObj];
    setCurrentOverBalls(updatedBalls);

    const overDisplay = `${currentOverNumber}.${legalBalls + 1}`;
    const commDesc = `${bowler.name} to ${striker.name}, ${byeRuns} Bye${byeRuns === 1 ? '' : 's'} taken! Legal ball counted.`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    setShowByeDrawer(false);

    let nextLegalBalls = legalBalls + 1;
    const isOverEnd = nextLegalBalls >= 6;

    let nextStriker = striker;
    let nextNonStriker = nonStriker;
    if (isOverEnd) {
      if (byeRuns % 2 === 0) {
        nextStriker = nonStriker;
        nextNonStriker = updatedStriker;
      } else {
        nextStriker = updatedStriker;
        nextNonStriker = nonStriker;
      }
    } else {
      if (byeRuns % 2 !== 0) {
        nextStriker = nonStriker;
        nextNonStriker = updatedStriker;
      } else {
        nextStriker = updatedStriker;
      }
    }
    setStriker(nextStriker);
    setNonStriker(nextNonStriker);

    if ((isSuperOver && superOverInnings === 2 && superOverTarget && newTotal >= superOverTarget) ||
        (!isSuperOver && currentInnings === 2 && targetRuns && newTotal >= targetRuns)) {
      if (isOverEnd) {
        completeOverAndPromptNextBowler(updatedBalls, bowler, newTotal, totalWickets, updatedBattersScorecard);
      } else {
        setLegalBalls(nextLegalBalls);
        const updatedBowler = { ...bowler, overs: `${currentOverNumber}.${nextLegalBalls}` };
        setBowler(updatedBowler);
        const marginWickets = activeMaxWickets - totalWickets;
        handleMatchComplete({
          winner: firstInningsBowlingTeam,
          margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
          resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
          finalRuns: newTotal,
          finalWickets: totalWickets,
          finalOversDecimal: `${currentOverNumber}.${nextLegalBalls}`,
          customBatters: updatedBattersScorecard,
        });
      }
      return;
    }

    if (isOverEnd) {
      completeOverAndPromptNextBowler(updatedBalls, bowler, newTotal, totalWickets, updatedBattersScorecard);
    } else {
      setLegalBalls(nextLegalBalls);
      const updatedBowler = { ...bowler, overs: `${currentOverNumber}.${nextLegalBalls}` };
      setBowler(updatedBowler);
    }
  };

  // -----------------------------------------------------------------------
  // LEG BYE HANDLER
  // -----------------------------------------------------------------------
  const handleScoreLegBye = (legByeRuns) => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const newTotal = totalRuns + legByeRuns;
    setTotalRuns(newTotal);

    setExtrasTotal((prev) => prev + legByeRuns);
    setExtrasBreakdown((prev) => ({
      ...prev,
      legByes: prev.legByes + legByeRuns,
    }));

    const updatedStriker = {
      ...striker,
      balls: striker.balls + 1,
    };
    updateStrikerInScorecard(updatedStriker);

    const updatedBattersScorecard = battersScorecard.map((b) =>
      b.id === updatedStriker.id
        ? { ...b, balls: updatedStriker.balls, status: 'not out' }
        : b
    );

    const ballLabel = `${legByeRuns}lb`;
    const newBallObj = { type: 'leg-bye', value: ballLabel, runs: legByeRuns, isLegal: true, legByeRuns };
    const updatedBalls = [...currentOverBalls, newBallObj];
    setCurrentOverBalls(updatedBalls);

    const overDisplay = `${currentOverNumber}.${legalBalls + 1}`;
    const commDesc = `${bowler.name} to ${striker.name}, ${legByeRuns} Leg Bye${legByeRuns === 1 ? '' : 's'} taken! Legal ball counted.`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    setShowLegByeDrawer(false);

    let nextLegalBalls = legalBalls + 1;
    const isOverEnd = nextLegalBalls >= 6;

    let nextStriker = striker;
    let nextNonStriker = nonStriker;
    if (isOverEnd) {
      if (legByeRuns % 2 === 0) {
        nextStriker = nonStriker;
        nextNonStriker = updatedStriker;
      } else {
        nextStriker = updatedStriker;
        nextNonStriker = nonStriker;
      }
    } else {
      if (legByeRuns % 2 !== 0) {
        nextStriker = nonStriker;
        nextNonStriker = updatedStriker;
      } else {
        nextStriker = updatedStriker;
      }
    }
    setStriker(nextStriker);
    setNonStriker(nextNonStriker);

    if ((isSuperOver && superOverInnings === 2 && superOverTarget && newTotal >= superOverTarget) ||
        (!isSuperOver && currentInnings === 2 && targetRuns && newTotal >= targetRuns)) {
      if (isOverEnd) {
        completeOverAndPromptNextBowler(updatedBalls, bowler, newTotal, totalWickets, updatedBattersScorecard);
      } else {
        setLegalBalls(nextLegalBalls);
        const updatedBowler = { ...bowler, overs: `${currentOverNumber}.${nextLegalBalls}` };
        setBowler(updatedBowler);
        const marginWickets = activeMaxWickets - totalWickets;
        handleMatchComplete({
          winner: firstInningsBowlingTeam,
          margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
          resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
          finalRuns: newTotal,
          finalWickets: totalWickets,
          finalOversDecimal: `${currentOverNumber}.${nextLegalBalls}`,
          customBatters: updatedBattersScorecard,
        });
      }
      return;
    }

    if (isOverEnd) {
      completeOverAndPromptNextBowler(updatedBalls, bowler, newTotal, totalWickets, updatedBattersScorecard);
    } else {
      setLegalBalls(nextLegalBalls);
      const updatedBowler = { ...bowler, overs: `${currentOverNumber}.${nextLegalBalls}` };
      setBowler(updatedBowler);
    }
  };

  // -----------------------------------------------------------------------
  // WICKET WORKFLOW
  // -----------------------------------------------------------------------
  const handleConfirmWicket = () => {
    if (isScoringLocked) {
      Alert.alert('Innings Completed', 'The innings has concluded. Use Undo to modify previous deliveries.');
      return;
    }

    saveCurrentStateToHistory();

    const newWickets = totalWickets + 1;
    const newRuns = totalRuns + runsOnWicketBall;
    setTotalWickets(newWickets);
    setTotalRuns(newRuns);

    const dismissedBatter =
      selectedDismissal === 'Run Out' && selectedRunoutBatter?.name === nonStriker.name
        ? nonStriker
        : striker;

    const newFallOfWickets = [
      ...fallOfWickets,
      {
        wicket: newWickets,
        score: newRuns,
        batter: dismissedBatter.name,
      },
    ];
    setFallOfWickets(newFallOfWickets);

    // Track dismissed batters in Super Over for ICC repeat restrictions
    if (isSuperOver) {
      setDismissedSuperOverBatters((prev) => [...prev, dismissedBatter.name]);
    }

    // Mark dismissed in scorecard
    const dismissalText =
      selectedDismissal === 'Bowled'
        ? `b ${bowler.name}`
        : selectedDismissal === 'LBW'
        ? `lbw b ${bowler.name}`
        : selectedDismissal === 'Caught'
        ? `c ${selectedFielder?.name || 'Fielder'} b ${bowler.name}`
        : selectedDismissal === 'Stumped'
        ? `st ${selectedFielder?.name || wicketkeeper?.name || 'Keeper'} b ${bowler.name}`
        : `${selectedDismissal}`;

    let updatedBattersScorecard = battersScorecard.map((b) =>
      b.id === dismissedBatter.id ? { ...b, status: 'out', dismissal: dismissalText } : b
    );

    const isBowlerWicket = !['Run Out', 'Obstructing the Field', 'Timed Out', 'Retired Hurt', 'Retired Out'].includes(selectedDismissal);
    const updatedBowler = {
      ...bowler,
      wickets: isBowlerWicket ? bowler.wickets + 1 : bowler.wickets,
      runsConceded: bowler.runsConceded + runsOnWicketBall,
    };

    const newBallObj = { type: 'wicket', value: 'W', runs: runsOnWicketBall, isLegal: true };
    const updatedBalls = [...currentOverBalls, newBallObj];
    setCurrentOverBalls(updatedBalls);

    const overDisplay = `${currentOverNumber}.${legalBalls + 1}`;
    const commDesc = `${bowler.name} to ${striker.name}, OUT! ${dismissedBatter.name} dismissed (${selectedDismissal})! Score is now ${newRuns}/${newWickets}.`;
    setCommentaryList((prev) => [
      { id: `c_${Date.now()}_${Math.random()}`, over: overDisplay, text: commDesc },
      ...prev,
    ]);

    let nextLegalBalls = legalBalls + 1;
    const isOverEnd = nextLegalBalls >= 6;
    const nextOverNum = isOverEnd ? currentOverNumber + 1 : currentOverNumber;

    // Filter available batters who haven't batted or been dismissed
    const dismissedNames = newFallOfWickets.map((f) => f.batter);
    const otherActiveBatterName = dismissedBatter.name === striker.name ? nonStriker.name : striker.name;
    const availableBatters = currentBattingSquad.filter((p) => {
      if (dismissedNames.includes(p.name)) return false;
      if (p.name === dismissedBatter.name) return false;
      if (p.name === otherActiveBatterName) return false;
      if (isSuperOver && (dismissedSuperOverBatters || []).includes(p.name)) return false;
      return true;
    });

    const isAllOut = newWickets >= activeMaxWickets || availableBatters.length === 0;

    // Check target chase in 2nd innings
    if (!isSuperOver && currentInnings === 2 && targetRuns && newRuns >= targetRuns) {
      const marginWickets = activeMaxWickets - newWickets;
      const finalOvers = isOverEnd ? `${nextOverNum}.0` : `${currentOverNumber}.${nextLegalBalls}`;
      handleMatchComplete({
        winner: firstInningsBowlingTeam,
        margin: `${marginWickets} wicket${marginWickets === 1 ? '' : 's'}`,
        resultText: `${firstInningsBowlingTeam} won by ${marginWickets} wicket${marginWickets === 1 ? '' : 's'}!`,
        finalRuns: newRuns,
        finalWickets: newWickets,
        finalOversDecimal: finalOvers,
        customBatters: updatedBattersScorecard,
      });
      setCurrentScreen('MATCH_RESULT');
      return;
    }

    if (isAllOut) {
      setCurrentScreen('MAIN');
      if (isSuperOver) {
        if (superOverInnings === 1) {
          handleSuperOverInnings1End(newRuns, newWickets, isOverEnd ? `${nextOverNum}.0` : `${currentOverNumber}.${nextLegalBalls}`);
        } else {
          handleSuperOverInnings2End(newRuns, newWickets, isOverEnd ? `${nextOverNum}.0` : `${currentOverNumber}.${nextLegalBalls}`, superOverTarget && newRuns >= superOverTarget);
        }
        return;
      }

      if (currentInnings === 1) {
        handleEndFirstInnings(newRuns, newWickets, isOverEnd ? `${nextOverNum}.0` : `${currentOverNumber}.${nextLegalBalls}`, updatedBattersScorecard);
        return;
      } else {
        const finalOvers = isOverEnd ? `${nextOverNum}.0` : `${currentOverNumber}.${nextLegalBalls}`;
        if (targetRuns && newRuns < targetRuns - 1) {
          const marginRuns = targetRuns - 1 - newRuns;
          handleMatchComplete({
            winner: firstInningsBattingTeam,
            margin: `${marginRuns} run${marginRuns === 1 ? '' : 's'}`,
            resultText: `${firstInningsBattingTeam} won by ${marginRuns} run${marginRuns === 1 ? '' : 's'}!`,
            finalRuns: newRuns,
            finalWickets: newWickets,
            finalOversDecimal: finalOvers,
            customBatters: updatedBattersScorecard,
          });
        } else if (targetRuns && newRuns === targetRuns - 1) {
          handleMatchTied(newRuns, newWickets, finalOvers);
        }
        return;
      }
    }

    // Team NOT all out: select next batter safely
    const incomingBatter = availableBatters.find((b) => b.id === selectedNextBatter?.id) || availableBatters[0];
    const newBatterObj = {
      id: incomingBatter.id,
      name: incomingBatter.name,
      img: incomingBatter.img,
      role: incomingBatter.role || 'Batter',
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0,
    };

    updatedBattersScorecard = updatedBattersScorecard.map((b) =>
      b.id === incomingBatter.id ? { ...b, status: 'not out', dismissal: 'batting' } : b
    );
    setBattersScorecard(updatedBattersScorecard);

    let activeStriker = striker;
    let activeNonStriker = nonStriker;
    if (dismissedBatter.name === striker.name) {
      activeStriker = newBatterObj;
      setStriker(newBatterObj);
    } else {
      activeNonStriker = newBatterObj;
      setNonStriker(newBatterObj);
    }

    if (isOverEnd) {
      setStriker(activeNonStriker);
      setNonStriker(activeStriker);
      completeOverAndPromptNextBowler(updatedBalls, updatedBowler, newRuns, newWickets, updatedBattersScorecard);
    } else {
      setLegalBalls(nextLegalBalls);
      updatedBowler.overs = `${currentOverNumber}.${nextLegalBalls}`;
      setBowler(updatedBowler);
    }

    setCurrentScreen('MAIN');
  };

  // ==========================================
  // SCREEN 1: MAIN LIVE SCORING SCREEN
  // ==========================================
  const renderMainScreen = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <TouchableOpacity
          onPress={() => {
            if (isScoringLocked && historyStack.length > 0) {
              handleUndo();
            } else {
              navigation.goBack();
            }
          }}
          className="p-1"
        >
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white text-base font-bold">
            {isSuperOver ? `SUPER OVER ${superOverNumber > 1 ? `#${superOverNumber}` : ''}` : 'Live Scoring'}
          </Text>
          <Text className="text-[#23c55e] text-[10px] font-bold">
            {isSuperOver
              ? `Innings ${superOverInnings} of 2`
              : currentInnings === 1
              ? '1st Innings'
              : '2nd Innings (Chase)'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowSettingsModal(true)} className="p-1">
          <Feather name="settings" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 390 + bottomInset }}>
        {/* Match Header / Scoreboard Card */}
        <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4 mb-3">
          <View className="flex-row items-center justify-between">
            {/* Batting Team */}
            <View className="items-center w-[85px]">
              <View className="w-11 h-11 rounded-full bg-[#1b2b1d] border border-[#23c55e] items-center justify-center mb-1">
                <Ionicons name="flash" size={20} color="#23c55e" />
              </View>
              <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>
                {currentBattingTeam}
              </Text>
              <Text className="text-[#23c55e] text-[9px] font-bold">BATTING</Text>
            </View>

            {/* Center Live Scoreboard */}
            <View className="items-center flex-1">
              <View className="bg-[#16a34a] px-2.5 py-0.5 rounded-full mb-1">
                <Text className="text-white text-[10px] font-extrabold tracking-widest">LIVE</Text>
              </View>
              <Text className="text-[#888888] text-[10px] font-semibold mb-0.5">VS</Text>
              <Text className="text-white text-[32px] font-black tracking-tight">
                {totalRuns}/{totalWickets}
              </Text>
              <Text className="text-[#888888] text-xs font-medium mt-0.5">{oversDecimal} Overs</Text>

              {isSuperOver ? (
                superOverInnings === 1 ? (
                  <>
                    <Text className="text-[#eab308] text-xs font-bold mt-1">Super Over (1 Over)</Text>
                    <Text className="text-[#888888] text-[11px] mt-0.5">
                      Max 2 Wickets • {totalBallsRemaining} legal balls left
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-[#23c55e] text-xs font-bold mt-1">Target {superOverTarget}</Text>
                    <Text className="text-[#888888] text-[11px] mt-0.5">
                      Need {runsNeeded} runs from {totalBallsRemaining} balls
                    </Text>
                  </>
                )
              ) : currentInnings === 1 ? (
                <>
                  <Text className="text-[#23c55e] text-xs font-bold mt-1">
                    Max {totalOversMax} Overs
                  </Text>
                  <Text className="text-[#888888] text-[11px] mt-0.5">
                    CRR: {(totalRuns / Math.max(0.1, currentOverNumber + legalBalls / 6)).toFixed(2)} • {totalBallsRemaining} balls left
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-[#23c55e] text-xs font-bold mt-1">Target {targetRuns}</Text>
                  <Text className="text-[#888888] text-[11px] mt-0.5">
                    Need {runsNeeded} runs from {totalBallsRemaining} balls
                  </Text>
                </>
              )}

              {/* Extras Breakdown Chip */}
              <View className="mt-2 bg-[#181818] px-2.5 py-1 rounded-full border border-[#262626]">
                <Text className="text-[#888888] text-[10px] font-medium text-center">
                  Extras: <Text className="text-white font-bold">{extrasTotal}</Text> (wd {extrasBreakdown.wides}, nb {extrasBreakdown.noBalls}, b {extrasBreakdown.byes}, lb {extrasBreakdown.legByes})
                </Text>
              </View>
            </View>

            {/* Bowling Team */}
            <View className="items-center w-[85px]">
              <View className="w-11 h-11 rounded-full bg-[#2a1b1b] border border-[#ef4444] items-center justify-center mb-1">
                <FontAwesome5 name="shield-alt" size={18} color="#ef4444" />
              </View>
              <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>
                {currentBowlingTeam}
              </Text>
              <Text className="text-[#ef4444] text-[9px] font-bold">BOWLING</Text>
            </View>
          </View>
        </View>

        {/* Current Batters Table */}
        <View className="bg-[#121212] rounded-2xl border border-[#222222] p-3.5 mb-3">
          <View className="flex-row items-center justify-between mb-2.5 border-b border-[#222222] pb-2">
            <Text className="text-[#888888] text-[10px] font-bold tracking-wider">CURRENT BATTERS</Text>
            <View className="flex-row w-[120px] justify-between">
              <Text className="text-[#888888] text-[10px] font-bold w-9 text-right">R</Text>
              <Text className="text-[#888888] text-[10px] font-bold w-9 text-right">B</Text>
              <Text className="text-[#888888] text-[10px] font-bold w-12 text-right">SR</Text>
            </View>
          </View>

          {/* Striker Row */}
          <View className="flex-row items-center justify-between py-1.5">
            <View className="flex-row items-center flex-1 pr-2">
              <Image source={{ uri: striker.img }} className="w-6 h-6 rounded-full mr-2.5 bg-[#222222]" />
              <Text className="text-white text-[13px] font-bold flex-1" numberOfLines={1}>
                {striker.name} <Text className="text-[#23c55e] font-extrabold">*</Text>
              </Text>
            </View>
            <View className="flex-row w-[120px] justify-between items-center">
              <Text className="text-white text-[13px] font-bold w-9 text-right">{striker.runs}</Text>
              <Text className="text-[#888888] text-[13px] w-9 text-right">{striker.balls}</Text>
              <Text className="text-[#888888] text-[13px] w-12 text-right">
                {getSR(striker.runs, striker.balls)}
              </Text>
            </View>
          </View>

          {/* Non-Striker Row */}
          <View className="flex-row items-center justify-between py-1.5 border-t border-[#1a1a1a]">
            <View className="flex-row items-center flex-1 pr-2">
              <Image source={{ uri: nonStriker.img }} className="w-6 h-6 rounded-full mr-2.5 bg-[#222222]" />
              <Text className="text-[#cccccc] text-[13px] font-medium flex-1" numberOfLines={1}>
                {nonStriker.name}
              </Text>
            </View>
            <View className="flex-row w-[120px] justify-between items-center">
              <Text className="text-white text-[13px] font-bold w-9 text-right">{nonStriker.runs}</Text>
              <Text className="text-[#888888] text-[13px] w-9 text-right">{nonStriker.balls}</Text>
              <Text className="text-[#888888] text-[13px] w-12 text-right">
                {getSR(nonStriker.runs, nonStriker.balls)}
              </Text>
            </View>
          </View>
        </View>

        {/* Current Bowler Card */}
        <View className="bg-[#121212] rounded-2xl border border-[#222222] p-3.5 mb-3">
          <Text className="text-[#888888] text-[10px] font-bold tracking-wider mb-2">CURRENT BOWLER</Text>
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1">
              <Image source={{ uri: bowler.img }} className="w-6 h-6 rounded-full mr-2.5 bg-[#222222]" />
              <Text className="text-white text-[13px] font-bold">{bowler.name}</Text>
            </View>
            <Text className="text-white text-[13px] font-bold">
              {bowler.overs || oversDecimal} - {bowler.maidens} - {bowler.runsConceded} - {bowler.wickets}
            </Text>
          </View>
          <View className="flex-row justify-between border-t border-[#1a1a1a] pt-2">
            <Text className="text-[#888888] text-[11px]">
              Econ: {getEconomy(bowler.runsConceded, bowler.overs || oversDecimal)}
            </Text>
            <Text className="text-[#888888] text-[11px]">
              Max: {isSuperOver ? '1 over limit' : `${Math.ceil(totalOversMax / 5)} overs limit`}
            </Text>
          </View>
          {wicketkeeper?.name && (
            <View className="flex-row items-center justify-between border-t border-[#1a1a1a] pt-2 mt-2">
              <View className="flex-row items-center">
                <Ionicons name="hand-left-outline" size={13} color="#888888" style={{ marginRight: 6 }} />
                <Text className="text-[#888888] text-[11px]">Wicketkeeper:</Text>
              </View>
              <Text className="text-white text-[11px] font-semibold">{wicketkeeper.name}</Text>
            </View>
          )}
        </View>

        {/* This Over Deliveries Bar */}
        <View className="bg-[#121212] rounded-2xl border border-[#222222] p-3 mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <TouchableOpacity
              onPress={() => setCurrentScreen('BALL_FEED')}
              className="flex-row items-center"
            >
              <Text className="text-[#888888] text-[11px] font-bold tracking-wider mr-1">
                THIS OVER
              </Text>
              <Feather name="chevron-right" size={13} color="#888888" />
            </TouchableOpacity>
            <Text className="text-[#888888] text-xs font-bold">
              {currentOverNumber}
            </Text>
          </View>
          <View className="flex-row items-center">
            {currentOverBalls.length === 0 ? (
              <Text className="text-[#666666] text-xs italic py-1">New over ready to begin</Text>
            ) : (
              currentOverBalls.map((b, i) => {
                let badgeBg = 'bg-[#181818]';
                let badgeBorder = 'border-[#2a2a2a]';
                let textColor = 'text-white';
                if (b.type === 'wicket') {
                  badgeBg = 'bg-[#2a1315]';
                  badgeBorder = 'border-[#ef4444]';
                  textColor = 'text-[#ef4444]';
                } else if (b.type === 'no-ball') {
                  badgeBg = 'bg-[#2a1d0f]';
                  badgeBorder = 'border-[#f59e0b]';
                  textColor = 'text-[#fbbf24]';
                } else if (b.type === 'wide') {
                  badgeBg = 'bg-[#101c33]';
                  badgeBorder = 'border-[#3b82f6]';
                  textColor = 'text-[#60a5fa]';
                } else if (b.type === 'bye' || b.type === 'leg-bye') {
                  badgeBg = 'bg-[#1f1633]';
                  badgeBorder = 'border-[#8b5cf6]';
                  textColor = 'text-[#c084fc]';
                } else if (b.value === '4' || b.value === '6') {
                  badgeBg = 'bg-[#0f2316]';
                  badgeBorder = 'border-[#22c55e]';
                  textColor = 'text-[#22c55e]';
                }
                return (
                  <View
                    key={i}
                    className={`w-8 h-8 rounded-full ${badgeBg} items-center justify-center mr-2 border ${badgeBorder}`}
                  >
                    <Text className={`text-xs font-bold ${textColor}`}>{b.value}</Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Scoring Keypad */}
      {isScoringLocked ? (
        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#1f1f1f] px-4 pt-3"
        >
          <View className="bg-[#141414] border border-[#222222] rounded-xl p-3 mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="w-8 h-8 rounded-full bg-[#1e293b] items-center justify-center mr-2.5">
                <Ionicons name="lock-closed" size={16} color="#38bdf8" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-xs font-bold">
                  {isSecondInningsCompleted || (isSuperOver && superOverInnings === 2)
                    ? 'Match Concluded'
                    : 'Innings Concluded'}
                </Text>
                <Text className="text-[#888888] text-[10px]">
                  Scoring locked. Undo last ball to edit previous deliveries.
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row mb-1">
            <TouchableOpacity
              onPress={handleUndo}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#1e1e1e] border border-[#333333] flex-row items-center justify-center active:bg-[#2a2a2a]"
            >
              <Ionicons name="arrow-undo-outline" size={16} color="#ffffff" />
              <Text className="text-white text-xs font-bold tracking-wider ml-2">UNDO LAST BALL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (isSuperOver) {
                  if (superOverInnings === 1) setCurrentScreen('SUPER_OVER_SETUP');
                  else setCurrentScreen(matchTiedData ? 'SUPER_OVER_TIED' : 'MATCH_RESULT');
                } else if (currentInnings === 1) {
                  setCurrentScreen('INNINGS_SUMMARY');
                } else {
                  setCurrentScreen(matchTiedData ? 'MATCH_TIED' : 'MATCH_RESULT');
                }
              }}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#22c55e] flex-row items-center justify-center active:bg-[#1ea34d]"
            >
              <Text className="text-black text-xs font-black tracking-wider">
                {currentInnings === 1 && !isSuperOver ? 'VIEW SUMMARY' : 'VIEW RESULT'}
              </Text>
              <Feather name="arrow-right" size={15} color="#000000" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-[#1f1f1f] px-3 pt-2.5"
        >
          {/* Row 1: Runs 0, 1, 2 */}
          <View className="flex-row mb-2">
            <TouchableOpacity
              onPress={() => handleScoreRuns(0)}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#141414] border border-[#222222] items-center justify-center active:bg-[#202020]"
            >
              <Text className="text-white text-lg font-bold">0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleScoreRuns(1)}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#141414] border border-[#222222] items-center justify-center active:bg-[#202020]"
            >
              <Text className="text-white text-lg font-bold">1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleScoreRuns(2)}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#141414] border border-[#222222] items-center justify-center active:bg-[#202020]"
            >
              <Text className="text-white text-lg font-bold">2</Text>
            </TouchableOpacity>
          </View>

          {/* Row 2: Runs 3, 4, 6 */}
          <View className="flex-row mb-2">
            <TouchableOpacity
              onPress={() => handleScoreRuns(3)}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#141414] border border-[#222222] items-center justify-center active:bg-[#202020]"
            >
              <Text className="text-white text-lg font-bold">3</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleScoreRuns(4)}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#141414] border border-[#222222] items-center justify-center active:bg-[#202020]"
            >
              <Text className="text-white text-lg font-bold">4</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleScoreRuns(6)}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#141414] border border-[#222222] items-center justify-center active:bg-[#202020]"
            >
              <Text className="text-white text-lg font-bold">6</Text>
            </TouchableOpacity>
          </View>

          {/* Row 3: Extras (WIDE, NO BALL, BYE, LEG BYE) */}
          <View className="flex-row mb-2">
            <TouchableOpacity
              onPress={() => setShowWideDrawer(true)}
              className="flex-1 py-3 mx-1 rounded-xl bg-[#131d31] border border-[#1e3a5f] items-center justify-center active:bg-[#1a2942]"
            >
              <Text className="text-[#3b82f6] text-xs font-bold tracking-wider">WIDE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowNoBallDrawer(true)}
              className="flex-1 py-3 mx-1 rounded-xl bg-[#2a1315] border border-[#4c1d24] items-center justify-center active:bg-[#38181c]"
            >
              <Text className="text-[#f87171] text-xs font-bold tracking-wider">NO BALL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowByeDrawer(true)}
              className="flex-1 py-3 mx-1 rounded-xl bg-[#241c10] border border-[#453011] items-center justify-center active:bg-[#332615]"
            >
              <Text className="text-[#eab308] text-xs font-bold tracking-wider">BYE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowLegByeDrawer(true)}
              className="flex-1 py-3 mx-1 rounded-xl bg-[#0c2317] border border-[#144226] items-center justify-center active:bg-[#11311f]"
            >
              <Text className="text-[#22c55e] text-xs font-bold tracking-wider">LEG BYE</Text>
            </TouchableOpacity>
          </View>

          {/* Row 4: EXTRAS & WICKET */}
          <View className="flex-row mb-2">
            <TouchableOpacity
              onPress={() => setShowExtrasDrawer(true)}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#141414] border border-[#222222] flex-row items-center justify-center active:bg-[#202020]"
            >
              <Ionicons name="ellipsis-horizontal" size={16} color="#ffffff" />
              <Text className="text-white text-xs font-bold tracking-wider ml-1.5">EXTRAS</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setCurrentScreen('WICKET_DISMISSAL')}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#1f0e10] border-2 border-[#ef4444] flex-row items-center justify-center active:bg-[#2b1316]"
            >
              <MaterialCommunityIcons name="cricket" size={16} color="#ef4444" />
              <Text className="text-[#ef4444] text-xs font-bold tracking-wider ml-2">WICKET</Text>
            </TouchableOpacity>
          </View>

          {/* Row 5: UNDO & EDIT LAST BALL */}
          <View className="flex-row mb-2">
            <TouchableOpacity
              onPress={handleUndo}
              className="flex-1 py-3 mx-1 rounded-xl bg-[#141414] border border-[#222222] flex-row items-center justify-center active:bg-[#202020]"
            >
              <Ionicons name="arrow-undo-outline" size={15} color="#d4d4d8" />
              <Text className="text-white text-xs font-bold tracking-wider ml-2">UNDO</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowEditLastBallModal(true)}
              className="flex-1 py-3 mx-1 rounded-xl bg-[#141414] border border-[#222222] flex-row items-center justify-center active:bg-[#202020]"
            >
              <Feather name="edit-2" size={14} color="#d4d4d8" />
              <Text className="text-white text-xs font-bold tracking-wider ml-2">EDIT LAST BALL</Text>
            </TouchableOpacity>
          </View>

          {/* Row 6: END OVER & END INNINGS */}
          <View className="flex-row mb-1">
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'End Over',
                  'Are you sure you want to end this over now?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'End Over',
                      onPress: () => completeOverAndPromptNextBowler(currentOverBalls, bowler),
                    },
                  ]
                );
              }}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#22c55e] items-center justify-center active:bg-[#1ea34d]"
            >
              <Text className="text-black text-xs font-black tracking-wider">END OVER</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'End Innings',
                  'Are you sure you want to end this innings now?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'End Innings',
                      style: 'destructive',
                      onPress: () => {
                        if (currentInnings === 1) {
                          handleEndFirstInnings(totalRuns, totalWickets, `${currentOverNumber}.${legalBalls}`);
                        } else {
                          checkDeliveryProgress(totalRuns, totalWickets, legalBalls, currentOverNumber, true);
                        }
                      },
                    },
                  ]
                );
              }}
              className="flex-1 py-3.5 mx-1 rounded-xl bg-[#141414] border border-[#222222] items-center justify-center active:bg-[#202020]"
            >
              <Text className="text-white text-xs font-bold tracking-wider">END INNINGS</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  // =========================================================================
  // SCREEN 2: BALL FEED
  // =========================================================================
  const renderBallFeedScreen = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-base font-bold">Ball-by-Ball Feed</Text>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 + bottomInset }}>
        {/* Extras Summary Card */}
        <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4 mb-4">
          <Text className="text-[#888888] text-xs font-bold uppercase tracking-wider mb-2">
            Extras Breakdown
          </Text>
          <View className="flex-row justify-between items-center">
            <View className="items-center">
              <Text className="text-[#888888] text-[10px]">Wides</Text>
              <Text className="text-[#3b82f6] text-sm font-bold">{extrasBreakdown.wides}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#888888] text-[10px]">No Balls</Text>
              <Text className="text-[#f59e0b] text-sm font-bold">{extrasBreakdown.noBalls}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#888888] text-[10px]">Byes</Text>
              <Text className="text-[#8b5cf6] text-sm font-bold">{extrasBreakdown.byes}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#888888] text-[10px]">Leg Byes</Text>
              <Text className="text-[#a855f7] text-sm font-bold">{extrasBreakdown.legByes}</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#888888] text-[10px]">Total</Text>
              <Text className="text-white text-sm font-bold">{extrasTotal}</Text>
            </View>
          </View>
        </View>

        <Text className="text-white text-sm font-bold mb-3">COMMENTARY</Text>
        {commentaryList.map((c) => (
          <View key={c.id} className="bg-[#121212] rounded-xl border border-[#222222] p-3 mb-2.5">
            <Text className="text-[#23c55e] text-xs font-bold mb-1">Over {c.over}</Text>
            <Text className="text-[#cccccc] text-xs leading-5">{c.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View
        style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
      >
        <TouchableOpacity
          onPress={() => setCurrentScreen('MAIN')}
          className="bg-[#23c55e] py-3.5 rounded-xl items-center"
        >
          <Text className="text-black text-sm font-bold">BACK TO SCORING</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // =========================================================================
  // SCREEN 3: EXTRAS FULL SCREEN
  // =========================================================================
  const renderExtrasScreen = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-base font-bold ml-4">Extras</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity
          onPress={() => {
            setCurrentScreen('MAIN');
            setShowWideDrawer(true);
          }}
          className="bg-[#121212] p-4 rounded-xl border border-[#222222] mb-3 flex-row justify-between items-center"
        >
          <Text className="text-white text-sm font-bold">Wide</Text>
          <Feather name="chevron-right" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCurrentScreen('MAIN');
            setShowNoBallDrawer(true);
          }}
          className="bg-[#121212] p-4 rounded-xl border border-[#222222] mb-3 flex-row justify-between items-center"
        >
          <Text className="text-white text-sm font-bold">No Ball</Text>
          <Feather name="chevron-right" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCurrentScreen('MAIN');
            setShowByeDrawer(true);
          }}
          className="bg-[#121212] p-4 rounded-xl border border-[#222222] mb-3 flex-row justify-between items-center"
        >
          <Text className="text-white text-sm font-bold">Bye</Text>
          <Feather name="chevron-right" size={16} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setCurrentScreen('MAIN');
            setShowLegByeDrawer(true);
          }}
          className="bg-[#121212] p-4 rounded-xl border border-[#222222] mb-3 flex-row justify-between items-center"
        >
          <Text className="text-white text-sm font-bold">Leg Bye</Text>
          <Feather name="chevron-right" size={16} color="#888" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // =========================================================================
  // SCREEN 4: WICKET DISMISSAL
  // =========================================================================
  const renderWicketDismissalScreen = () => {
    const dismissals = [
      { id: 'Bowled', icon: 'cricket', iconType: 'material', nextScreen: 'WICKET_CONFIRM' },
      { id: 'Caught', icon: 'hand-left-outline', iconType: 'ionicons', nextScreen: 'CAUGHT_FIELDER' },
      { id: 'Caught Behind', icon: 'shield-outline', iconType: 'ionicons', nextScreen: 'STUMPED_KEEPER' },
      { id: 'LBW', icon: 'walk-outline', iconType: 'ionicons', nextScreen: 'WICKET_CONFIRM' },
      { id: 'Run Out', icon: 'run-fast', iconType: 'material', nextScreen: 'RUNOUT_BATTER' },
      { id: 'Stumped', icon: 'hammer-outline', iconType: 'ionicons', nextScreen: 'STUMPED_KEEPER' },
      { id: 'Hit Wicket', icon: 'flash-outline', iconType: 'ionicons', nextScreen: 'WICKET_CONFIRM' },
      { id: 'Retired Hurt', icon: 'medkit-outline', iconType: 'ionicons', nextScreen: 'WICKET_CONFIRM' },
      { id: 'Retired Out', icon: 'exit-outline', iconType: 'ionicons', nextScreen: 'WICKET_CONFIRM' },
      { id: 'Obstructing the Field', icon: 'alert-circle-outline', iconType: 'ionicons', nextScreen: 'WICKET_CONFIRM' },
      { id: 'Timed Out', icon: 'time-outline', iconType: 'ionicons', nextScreen: 'WICKET_CONFIRM' },
    ];

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold ml-4">Select Dismissal</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 + bottomInset }}>
          {dismissals.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedDismissal(item.id);
                setCurrentScreen(item.nextScreen);
              }}
              className="bg-[#121212] rounded-2xl border border-[#222222] p-4 mb-2.5 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                {item.iconType === 'material' ? (
                  <MaterialCommunityIcons name={item.icon} size={20} color="#cccccc" style={{ marginRight: 12 }} />
                ) : (
                  <Ionicons name={item.icon} size={20} color="#cccccc" style={{ marginRight: 12 }} />
                )}
                <Text className="text-white text-sm font-semibold">{item.id}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#666666" />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={() => setCurrentScreen('MAIN')}
            className="bg-[#181818] border border-[#2c2c2c] py-4 rounded-xl items-center"
          >
            <Text className="text-white text-sm font-bold">CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN 5: CAUGHT FIELDER
  // =========================================================================
  const renderCaughtFielderScreen = () => {
    const filteredFielders = currentBowlingSquad.filter((p) =>
      p.name.toLowerCase().includes(fielderSearch.toLowerCase())
    );

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('WICKET_DISMISSAL')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold ml-4">Caught by</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 + bottomInset }}>
          <View className="bg-[#141414] border border-[#262626] rounded-xl flex-row items-center px-3.5 py-3 mb-4">
            <Feather name="search" size={16} color="#888888" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Search fielders..."
              placeholderTextColor="#666666"
              value={fielderSearch}
              onChangeText={setFielderSearch}
              className="flex-1 text-white text-sm"
            />
          </View>

          {filteredFielders.map((p) => {
            const isSelected = selectedFielder?.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedFielder(p)}
                className={`p-3.5 rounded-2xl border mb-2 flex-row items-center justify-between ${
                  isSelected ? 'bg-[#122216] border-[#23c55e]' : 'bg-[#121212] border-[#222222]'
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <Image source={{ uri: p.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                  <Text className="text-white text-sm font-semibold">{p.name}</Text>
                </View>
                {isSelected && <Feather name="check" size={18} color="#23c55e" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={() => setCurrentScreen('WICKET_CONFIRM')}
            className="bg-[#23c55e] py-4 rounded-xl items-center"
          >
            <Text className="text-black text-sm font-bold">CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN 6: RUN OUT BATTER
  // =========================================================================
  const renderRunOutBatterScreen = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
        <TouchableOpacity onPress={() => setCurrentScreen('WICKET_DISMISSAL')} className="p-1">
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-base font-bold ml-4">Who was Run Out?</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 + bottomInset }}>
        <TouchableOpacity
          onPress={() => setSelectedRunoutBatter(striker)}
          className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${
            selectedRunoutBatter.name === striker.name ? 'bg-[#122216] border-[#23c55e]' : 'bg-[#121212] border-[#222222]'
          }`}
        >
          <View className="flex-row items-center">
            <Image source={{ uri: striker.img }} className="w-8 h-8 rounded-full mr-3" />
            <Text className="text-white text-sm font-bold">Striker: {striker.name}</Text>
          </View>
          {selectedRunoutBatter.name === striker.name && <Feather name="check" size={18} color="#23c55e" />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedRunoutBatter(nonStriker)}
          className={`p-4 rounded-xl border mb-3 flex-row items-center justify-between ${
            selectedRunoutBatter.name === nonStriker.name ? 'bg-[#122216] border-[#23c55e]' : 'bg-[#121212] border-[#222222]'
          }`}
        >
          <View className="flex-row items-center">
            <Image source={{ uri: nonStriker.img }} className="w-8 h-8 rounded-full mr-3" />
            <Text className="text-white text-sm font-bold">Non-Striker: {nonStriker.name}</Text>
          </View>
          {selectedRunoutBatter.name === nonStriker.name && <Feather name="check" size={18} color="#23c55e" />}
        </TouchableOpacity>
      </ScrollView>
      <View
        style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
      >
        <TouchableOpacity
          onPress={() => setCurrentScreen('RUNOUT_FIELDER')}
          className="bg-[#23c55e] py-4 rounded-xl items-center"
        >
          <Text className="text-black text-sm font-bold">SELECT FIELDER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // =========================================================================
  // SCREEN 7: RUN OUT FIELDER
  // =========================================================================
  const renderRunOutFielderScreen = () => {
    const filteredFielders = currentBowlingSquad.filter((p) =>
      p.name.toLowerCase().includes(fielderSearch.toLowerCase())
    );

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('RUNOUT_BATTER')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold ml-4">Run Out by</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 + bottomInset }}>
          {filteredFielders.map((p) => {
            const isSelected = selectedFielder?.id === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedFielder(p)}
                className={`p-3.5 rounded-2xl border mb-2 flex-row items-center justify-between ${
                  isSelected ? 'bg-[#122216] border-[#23c55e]' : 'bg-[#121212] border-[#222222]'
                }`}
              >
                <View className="flex-row items-center flex-1">
                  <Image source={{ uri: p.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                  <Text className="text-white text-sm font-semibold">{p.name}</Text>
                </View>
                {isSelected && <Feather name="check" size={18} color="#23c55e" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={() => setCurrentScreen('WICKET_CONFIRM')}
            className="bg-[#23c55e] py-4 rounded-xl items-center"
          >
            <Text className="text-black text-sm font-bold">CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN 8: STUMPED KEEPER
  // =========================================================================
  const renderStumpedKeeperScreen = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
        <TouchableOpacity onPress={() => setCurrentScreen('WICKET_DISMISSAL')} className="p-1">
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-base font-bold ml-4">Wicketkeeper</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 + bottomInset }}>
        {currentBowlingSquad.map((p) => {
          const isSelected = selectedFielder?.id === p.id;
          return (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelectedFielder(p)}
              className={`p-3.5 rounded-2xl border mb-2 flex-row items-center justify-between ${
                isSelected ? 'bg-[#122216] border-[#23c55e]' : 'bg-[#121212] border-[#222222]'
              }`}
            >
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: p.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View>
                  <Text className="text-white text-sm font-semibold">{p.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{p.role}</Text>
                </View>
              </View>
              {isSelected && <Feather name="check" size={18} color="#23c55e" />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View
        style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
        className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
      >
        <TouchableOpacity
          onPress={() => setCurrentScreen('WICKET_CONFIRM')}
          className="bg-[#23c55e] py-4 rounded-xl items-center"
        >
          <Text className="text-black text-sm font-bold">CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // =========================================================================
  // SCREEN 9: WICKET CONFIRMATION
  // =========================================================================
  const renderWicketConfirmScreen = () => {
    const dismissedBatter =
      selectedDismissal === 'Run Out' && selectedRunoutBatter?.name === nonStriker.name
        ? nonStriker
        : striker;

    // Filter available batters who haven't batted or been dismissed
    const dismissedNames = fallOfWickets.map((f) => f.batter);
    const otherActiveBatterName = dismissedBatter.name === striker.name ? nonStriker.name : striker.name;
    const availableBatters = currentBattingSquad.filter((p) => {
      if (dismissedNames.includes(p.name)) return false;
      if (p.name === dismissedBatter.name) return false;
      if (p.name === otherActiveBatterName) return false;
      // In Super Over: ICC rule - batter dismissed in any previous Super Over cannot bat
      if (isSuperOver && (dismissedSuperOverBatters || []).includes(p.name)) return false;
      return true;
    });

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('WICKET_DISMISSAL')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold ml-4">Wicket Confirmation</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 140 + bottomInset }}>
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4 mb-4">
            <View className="flex-row justify-between py-2.5 border-b border-[#222222]">
              <Text className="text-[#888888] text-xs">Batter Out</Text>
              <Text className="text-white text-xs font-bold">
                {dismissedBatter.name} ({dismissedBatter.runs})
              </Text>
            </View>
            <View className="flex-row justify-between py-2.5 border-b border-[#222222]">
              <Text className="text-[#888888] text-xs">Dismissal</Text>
              <Text className="text-white text-xs font-bold">{selectedDismissal}</Text>
            </View>
            {['Caught', 'Run Out', 'Stumped', 'Caught Behind'].includes(selectedDismissal) && (
              <View className="flex-row justify-between py-2.5 border-b border-[#222222]">
                <Text className="text-[#888888] text-xs">Fielder</Text>
                <Text className="text-white text-xs font-bold">{selectedFielder?.name}</Text>
              </View>
            )}
            <View className="flex-row justify-between py-2.5 border-b border-[#222222]">
              <Text className="text-[#888888] text-xs">Bowler</Text>
              <Text className="text-white text-xs font-bold">{bowler.name}</Text>
            </View>
            <View className="flex-row justify-between py-2.5">
              <Text className="text-[#888888] text-xs">Runs on Ball</Text>
              <Text className="text-white text-xs font-bold">{runsOnWicketBall}</Text>
            </View>
          </View>

          <Text className="text-white text-sm font-bold mb-2.5">Select Next Batter</Text>
          {availableBatters.length === 0 ? (
            <Text className="text-[#888888] text-xs italic">No more batters remaining. Innings will conclude.</Text>
          ) : (
            availableBatters.map((p) => {
              const isSelected = selectedNextBatter?.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedNextBatter(p)}
                  className={`rounded-2xl border p-3.5 mb-2 flex-row items-center justify-between ${
                    isSelected ? 'bg-[#122216] border-[#23c55e]' : 'bg-[#121212] border-[#222222]'
                  }`}
                >
                  <View className="flex-row items-center flex-1">
                    <Image source={{ uri: p.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                    <View>
                      <Text className="text-white text-xs font-bold">{p.name}</Text>
                      <Text className="text-[#888888] text-[10px] mt-0.5">{p.role}</Text>
                    </View>
                  </View>
                  <View
                    className={`w-4 h-4 rounded-full items-center justify-center border ${
                      isSelected ? 'bg-[#23c55e] border-[#23c55e]' : 'border-[#444444]'
                    }`}
                  >
                    {isSelected && <Feather name="check" size={10} color="#000000" />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={handleConfirmWicket}
            className="bg-[#23c55e] py-4 rounded-xl items-center mb-2.5"
          >
            <Text className="text-black text-sm font-bold">CONFIRM WICKET</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN 10: INNINGS SETUP (MENU)
  // =========================================================================
  const renderInningsSetupScreen = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-base font-bold ml-4">Innings Configuration</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity
          onPress={() => setCurrentScreen('END_INNINGS_REASON')}
          className="bg-[#121212] border border-[#222222] p-4 rounded-xl mb-3 flex-row justify-between items-center"
        >
          <View>
            <Text className="text-white text-sm font-bold">Declare / End Current Innings</Text>
            <Text className="text-[#888888] text-xs mt-1">Conclude current innings and proceed</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#888" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // =========================================================================
  // SCREEN 11: END INNINGS REASON
  // =========================================================================
  const renderEndInningsReasonScreen = () => (
    <View className="flex-1 bg-[#0a0a0a]">
      <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
        <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-base font-bold ml-4">End Innings</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {['Overs Completed', 'All Out', 'Declared', 'Weather Interruption'].map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => {
              setEndInningsReason(r);
              if (isSuperOver) {
                if (superOverInnings === 1) {
                  handleSuperOverInnings1End(totalRuns, totalWickets, oversDecimal);
                } else {
                  handleSuperOverInnings2End(totalRuns, totalWickets, oversDecimal, totalRuns >= (superOverTarget || 0));
                }
              } else if (currentInnings === 1) {
                handleEndFirstInnings(totalRuns, totalWickets, oversDecimal);
              } else {
                // Second innings: check for tie or winner
                if (targetRuns && totalRuns === targetRuns - 1) {
                  handleMatchTied(totalRuns, totalWickets, oversDecimal);
                } else {
                  const winner = totalRuns >= targetRuns ? currentBattingTeam : currentBowlingTeam;
                  const margin = totalRuns >= targetRuns
                    ? `${10 - totalWickets} wickets`
                    : `${targetRuns - 1 - totalRuns} runs`;
                  const resultText = `${winner} won by ${margin}!`;
                  handleMatchComplete({
                    winner,
                    margin,
                    resultText,
                    finalRuns: totalRuns,
                    finalWickets: totalWickets,
                    finalOversDecimal: oversDecimal,
                  });
                }
              }
            }}
            className="bg-[#121212] p-4 rounded-xl border border-[#222222] mb-3"
          >
            <Text className="text-white text-sm font-bold">{r}</Text>
          </TouchableOpacity>
        ))}

        {/* Shortcut to test Super Over flow */}
        {!isSuperOver && (
          <TouchableOpacity
            onPress={() => {
              const tiedRuns = firstInningsSummary?.totalRuns || 150;
              handleMatchTied(tiedRuns, totalWickets, `${totalOversMax}.0`);
            }}
            className="bg-[#1a180e] p-4 rounded-xl border border-[#eab308]/40 mb-3"
          >
            <Text className="text-[#eab308] text-sm font-bold">Simulate Match Tied (Test Super Over)</Text>
            <Text className="text-[#888888] text-xs mt-1">Forces both teams level to trigger Super Over flow</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  // =========================================================================
  // SCREEN 12: INNINGS SUMMARY
  // =========================================================================
  const renderInningsSummaryScreen = () => {
    const summary = firstInningsSummary || {
      battingTeam: firstInningsBattingTeam,
      bowlingTeam: firstInningsBowlingTeam,
      totalRuns,
      totalWickets,
      overs: oversDecimal,
      target: totalRuns + 1,
    };

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold">1st Innings Complete</Text>
          <View className="w-6" />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 + bottomInset }}>
          {/* Big Summary Card */}
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-5 mb-4">
            <Text className="text-[#23c55e] text-xs font-bold uppercase mb-1">
              {summary.battingTeam} Innings
            </Text>
            <Text className="text-white text-[32px] font-black tracking-tight mb-1">
              {summary.totalRuns}/{summary.totalWickets}
            </Text>
            <Text className="text-[#888888] text-xs font-medium mb-4">{summary.overs} Overs</Text>

            <View className="flex-row justify-between border-t border-[#222222] pt-4">
              <View className="items-center flex-1">
                <Text className="text-[#888888] text-[10px] font-bold">Extras</Text>
                <Text className="text-white text-base font-bold mt-0.5">{extrasTotal}</Text>
                <Text className="text-[#888888] text-[9px] mt-0.5 text-center">
                  wd {extrasBreakdown.wides} • nb {extrasBreakdown.noBalls} • b {extrasBreakdown.byes} • lb {extrasBreakdown.legByes}
                </Text>
              </View>
              <View className="items-center flex-1 border-x border-[#222222]">
                <Text className="text-[#888888] text-[10px] font-bold">Target</Text>
                <Text className="text-[#23c55e] text-base font-bold mt-0.5">{summary.target}</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-[#888888] text-[10px] font-bold">RRR</Text>
                <Text className="text-white text-base font-bold mt-0.5">
                  {(summary.target / totalOversMax).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Top Performers */}
          <Text className="text-white text-sm font-bold mb-3">Top Performers</Text>
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4 mb-4">
            <View className="flex-row items-center justify-between pb-3 border-b border-[#222222]">
              <View className="flex-row items-center">
                <Image source={{ uri: striker.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View>
                  <Text className="text-[#888888] text-[10px]">Top Batter</Text>
                  <Text className="text-white text-xs font-bold">{striker.name}</Text>
                </View>
              </View>
              <Text className="text-white text-sm font-bold">
                {striker.runs} ({striker.balls})
              </Text>
            </View>

            <View className="flex-row items-center justify-between pt-3">
              <View className="flex-row items-center">
                <Image source={{ uri: bowler.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View>
                  <Text className="text-[#888888] text-[10px]">Top Bowler</Text>
                  <Text className="text-white text-xs font-bold">{bowler.name}</Text>
                </View>
              </View>
              <Text className="text-white text-sm font-bold">
                {bowler.overs} - {bowler.maidens} - {bowler.runsConceded} - {bowler.wickets}
              </Text>
            </View>
          </View>

          {/* Fall of Wickets */}
          <Text className="text-white text-sm font-bold mb-2.5">Fall of Wickets</Text>
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4 flex-row flex-wrap">
            {fallOfWickets.length === 0 ? (
              <Text className="text-[#888888] text-xs">No wickets fell.</Text>
            ) : (
              fallOfWickets.map((f, i) => (
                <Text key={i} className="text-[#cccccc] text-xs font-semibold mr-3 mb-1">
                  {f.wicket}-{f.score} ({f.batter})
                </Text>
              ))
            )}
          </View>
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={() => {
              // Ensure defaults are populated fresh from the switched squads
              const defStriker = secondInningsBattingSquad[0];
              const defNonStriker = secondInningsBattingSquad[1] || secondInningsBattingSquad[0];
              const defBowler = secondInningsBowlingSquad[secondInningsBowlingSquad.length - 1] || secondInningsBowlingSquad[0];
              const defKeeper = secondInningsBowlingSquad.find((p) => p.role?.includes('WK')) || secondInningsBowlingSquad[0];
              setSetupStriker2(defStriker);
              setSetupNonStriker2(defNonStriker);
              setSetupBowler2(defBowler);
              setSetupKeeper2(defKeeper);
              setCurrentScreen('SECOND_INNINGS_START');
            }}
            className="bg-[#23c55e] py-4 rounded-xl items-center"
          >
            <Text className="text-black text-sm font-bold">SET UP SECOND INNINGS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN 13: SECOND INNINGS START (SETUP)
  // =========================================================================
  const renderSecondInningsStartScreen = () => {
    const target = firstInningsSummary?.target || totalRuns + 1;

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('INNINGS_SUMMARY')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold ml-4">Start Second Innings</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}>
          {/* Matchup Banner */}
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-5 mb-5 items-center">
            <View className="flex-row items-center justify-between w-full mb-4 px-4">
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#1b2b1d] border border-[#23c55e] items-center justify-center mb-1">
                  <Ionicons name="flash" size={20} color="#23c55e" />
                </View>
                <Text className="text-white text-xs font-bold">{firstInningsBowlingTeam}</Text>
                <Text className="text-[#23c55e] text-[9px] font-bold">CHASING</Text>
              </View>
              <Text className="text-[#888888] text-xs font-bold">VS</Text>
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#2a1b1b] border border-[#ef4444] items-center justify-center mb-1">
                  <FontAwesome5 name="shield-alt" size={18} color="#ef4444" />
                </View>
                <Text className="text-white text-xs font-bold">{firstInningsBattingTeam}</Text>
                <Text className="text-[#ef4444] text-[9px] font-bold">DEFENDING</Text>
              </View>
            </View>
            <View className="border-t border-[#222222] pt-3 w-full flex-row justify-around">
              <View className="items-center">
                <Text className="text-[#888888] text-[10px]">Target</Text>
                <Text className="text-[#23c55e] text-base font-bold">{target} Runs</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#888888] text-[10px]">Overs</Text>
                <Text className="text-white text-base font-bold">{totalOversMax} Overs</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#888888] text-[10px]">Required RR</Text>
                <Text className="text-white text-base font-bold">{(target / totalOversMax).toFixed(2)}</Text>
              </View>
            </View>
          </View>

          {/* Section: Opening Batters */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[#23c55e] text-sm font-bold">
              SELECT OPENING BATTERS ({firstInningsBowlingTeam})
            </Text>
            <View className="bg-[#1b2b1d] px-2 py-0.5 rounded">
              <Text className="text-[#23c55e] text-[10px] font-bold">BATTING</Text>
            </View>
          </View>

          <Text className="text-[#888888] text-xs mb-1.5 font-medium">Striker</Text>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Striker',
                role: 'Opening Batter',
                team: firstInningsBowlingTeam,
                players: secondInningsBattingSquad,
                currentId: setupStriker2?.id,
                restrictedIds: [setupNonStriker2?.id].filter(Boolean),
                onSelect: (id) => {
                  const p = secondInningsBattingSquad.find((x) => x.id === id);
                  if (p) setSetupStriker2(p);
                },
              });
            }}
            className="bg-[#121212] rounded-xl border border-[#222222] p-3.5 mb-3 flex-row items-center justify-between"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">1.</Text>
            {setupStriker2 ? (
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: setupStriker2.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{setupStriker2.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{setupStriker2.role || 'Batter'} • {setupStriker2.style || 'Right Hand'}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-[#666666] text-sm flex-1">Tap to select striker</Text>
            )}
            <Feather name="chevron-down" size={18} color="#888888" />
          </TouchableOpacity>

          <Text className="text-[#888888] text-xs mb-1.5 font-medium">Non-Striker</Text>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Non-Striker',
                role: 'Opening Batter',
                team: firstInningsBowlingTeam,
                players: secondInningsBattingSquad,
                currentId: setupNonStriker2?.id,
                restrictedIds: [setupStriker2?.id].filter(Boolean),
                onSelect: (id) => {
                  const p = secondInningsBattingSquad.find((x) => x.id === id);
                  if (p) setSetupNonStriker2(p);
                },
              });
            }}
            className="bg-[#121212] rounded-xl border border-[#222222] p-3.5 mb-5 flex-row items-center justify-between"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">2.</Text>
            {setupNonStriker2 ? (
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: setupNonStriker2.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{setupNonStriker2.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{setupNonStriker2.role || 'Batter'} • {setupNonStriker2.style || 'Right Hand'}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-[#666666] text-sm flex-1">Tap to select non-striker</Text>
            )}
            <Feather name="chevron-down" size={18} color="#888888" />
          </TouchableOpacity>

          {/* Section: Opening Bowler */}
          <View className="flex-row items-center justify-between mb-3 mt-1">
            <Text className="text-[#23c55e] text-sm font-bold">
              SELECT OPENING BOWLER ({firstInningsBattingTeam})
            </Text>
            <View className="bg-[#2a1b1b] px-2 py-0.5 rounded">
              <Text className="text-[#ef4444] text-[10px] font-bold">BOWLING</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Opening Bowler',
                role: 'Opening Bowler',
                team: firstInningsBattingTeam,
                players: secondInningsBowlingSquad,
                currentId: setupBowler2?.id,
                onSelect: (id) => {
                  const p = secondInningsBowlingSquad.find((x) => x.id === id);
                  if (p) setSetupBowler2(p);
                },
              });
            }}
            className="bg-[#121212] rounded-xl border border-[#222222] p-3.5 mb-5 flex-row items-center justify-between"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">1.</Text>
            {setupBowler2 ? (
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: setupBowler2.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{setupBowler2.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{setupBowler2.role || 'Bowler'} • {setupBowler2.style || 'Right Arm'}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-[#666666] text-sm flex-1">Tap to select bowler</Text>
            )}
            <Feather name="chevron-down" size={18} color="#888888" />
          </TouchableOpacity>

          {/* Section: Wicketkeeper (Fielding Team) */}
          <View className="flex-row items-center justify-between mb-3 mt-1">
            <Text className="text-[#23c55e] text-sm font-bold">
              SELECT WICKETKEEPER ({firstInningsBattingTeam})
            </Text>
            <View className="bg-[#1f2937] px-2 py-0.5 rounded">
              <Text className="text-[#60a5fa] text-[10px] font-bold">FIELDING</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Wicketkeeper',
                role: 'Wicketkeeper',
                team: firstInningsBattingTeam,
                players: secondInningsBowlingSquad,
                currentId: setupKeeper2?.id,
                onSelect: (id) => {
                  const p = secondInningsBowlingSquad.find((x) => x.id === id);
                  if (p) setSetupKeeper2(p);
                },
              });
            }}
            className="bg-[#121212] rounded-xl border border-[#222222] p-3.5 mb-4 flex-row items-center justify-between"
          >
            <MaterialCommunityIcons name="hand-back-left" size={18} color="#888888" style={{ width: 24 }} />
            {setupKeeper2 ? (
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: setupKeeper2.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{setupKeeper2.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{setupKeeper2.role || 'Wicketkeeper'} • {setupKeeper2.style || ''}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-[#666666] text-sm flex-1">Tap to select wicketkeeper</Text>
            )}
            <Feather name="chevron-down" size={18} color="#888888" />
          </TouchableOpacity>
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={() => {
              // Validations
              if (!setupStriker2 || !setupNonStriker2) {
                Alert.alert('Select Batters', 'Please select both opening batters.');
                return;
              }
              if (setupStriker2.id === setupNonStriker2.id) {
                Alert.alert('Duplicate Batter', 'Striker and Non-Striker must be different players.');
                return;
              }
              // Batting players validation: MUST be from batting team's Playing XI
              const isStrikerValid = secondInningsBattingSquad.some((p) => p.id === setupStriker2.id);
              const isNonStrikerValid = secondInningsBattingSquad.some((p) => p.id === setupNonStriker2.id);
              if (!isStrikerValid || !isNonStrikerValid) {
                Alert.alert('Invalid Batter', `Opening batters must belong to ${firstInningsBowlingTeam}'s Playing XI.`);
                return;
              }

              if (!setupBowler2) {
                Alert.alert('Select Bowler', 'Please select the opening bowler.');
                return;
              }
              // Bowler validation: MUST be from bowling team's Playing XI
              const isBowlerValid = secondInningsBowlingSquad.some((p) => p.id === setupBowler2.id);
              if (!isBowlerValid) {
                Alert.alert('Invalid Bowler', `Opening bowler must belong to ${firstInningsBattingTeam}'s Playing XI.`);
                return;
              }

              if (!setupKeeper2) {
                Alert.alert('Select Wicketkeeper', 'Please select the wicketkeeper from the fielding team.');
                return;
              }
              // Wicketkeeper validation: MUST be from fielding team's Playing XI
              const isKeeperValid = secondInningsBowlingSquad.some((p) => p.id === setupKeeper2.id);
              if (!isKeeperValid) {
                Alert.alert('Invalid Wicketkeeper', `Wicketkeeper must belong to ${firstInningsBattingTeam}'s Playing XI.`);
                return;
              }

              // Complete fresh reset for 2nd innings live scoring
              setCurrentInnings(2);
              setIsSuperOver(false);
              setTotalRuns(0);
              setTotalWickets(0);
              setLegalBalls(0);
              setCurrentOverNumber(0);
              setExtrasTotal(0);
              setExtrasBreakdown({ wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 });
              setTargetRuns(target);
              setCurrentOverBalls([]);
              setPastOvers([]);
              setFallOfWickets([]);
              setHistoryStack([]);

              const s2 = { ...setupStriker2, runs: 0, balls: 0, fours: 0, sixes: 0 };
              const ns2 = { ...setupNonStriker2, runs: 0, balls: 0, fours: 0, sixes: 0 };
              const b2 = { ...setupBowler2, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0 };

              setStriker(s2);
              setNonStriker(ns2);
              setBowler(b2);
              setWicketkeeper(setupKeeper2);
              setPreviousBowlerId(null);
              setShowBowlerSelectDrawer(false);

              // Initialize 2nd innings batters scorecard
              setBattersScorecard(
                secondInningsBattingSquad.map((p) => {
                  if (p.id === s2.id || p.id === ns2.id) {
                    return { ...p, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out', dismissal: 'batting' };
                  }
                  return { ...p, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'yet to bat', dismissal: '' };
                })
              );

              // Initialize 2nd innings bowlers map
              const bMap = {};
              secondInningsBowlingSquad.forEach((b) => {
                bMap[b.id] = { name: b.name, overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0 };
              });
              setBowlerStatsMap(bMap);

              setCommentaryList([
                {
                  id: 'c2_start',
                  over: '0.0',
                  text: `Second Innings begins! ${firstInningsBowlingTeam} need ${target} runs from ${totalOversMax} overs to win. ${s2.name} and ${ns2.name} are opening. ${b2.name} is bowling with ${setupKeeper2.name} keeping wickets.`,
                },
              ]);

              setCurrentScreen('MAIN');
            }}
            className="bg-[#23c55e] py-4 rounded-xl items-center"
          >
            <Text className="text-black text-sm font-bold">START 2ND INNINGS & BEGIN SCORING</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN: MATCH TIED (PROMPT SUPER OVER)
  // =========================================================================
  const renderMatchTiedScreen = () => {
    const inn1 = firstInningsSummary || { battingTeam: firstInningsBattingTeam, totalRuns };
    const inn2 = secondInningsSummary || { battingTeam: firstInningsBowlingTeam, totalRuns };

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold ml-4">Match Tied</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 + bottomInset, alignItems: 'center' }}>
          {/* Badge */}
          <View className="w-20 h-20 rounded-full bg-[#eab308]/15 border-2 border-[#eab308] items-center justify-center mb-4">
            <Ionicons name="git-compare" size={36} color="#eab308" />
          </View>

          <Text className="text-white text-2xl font-black mb-1 text-center">MATCH TIED</Text>
          <Text className="text-[#888888] text-xs font-medium text-center mb-6">
            Both teams finished with identical scores after {totalOversMax} overs!
          </Text>

          {/* Scores Display */}
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-5 w-full mb-6">
            <View className="flex-row items-center justify-between pb-4 border-b border-[#222222]">
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>{inn1.battingTeam}</Text>
                <Text className="text-[#888888] text-xs">1st Innings</Text>
              </View>
              <Text className="text-white text-2xl font-black">{inn1.totalRuns}</Text>
            </View>

            <View className="items-center py-2">
              <Text className="text-[#eab308] text-xs font-bold tracking-widest">TIED</Text>
            </View>

            <View className="flex-row items-center justify-between pt-4 border-t border-[#222222]">
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>{inn2.battingTeam}</Text>
                <Text className="text-[#888888] text-xs">2nd Innings</Text>
              </View>
              <Text className="text-white text-2xl font-black">{inn2.totalRuns}</Text>
            </View>
          </View>

          {/* ICC Rule Explainer */}
          <View className="bg-[#141414] rounded-xl border border-[#262626] p-4 w-full mb-6">
            <Text className="text-[#eab308] text-xs font-bold mb-1.5">ICC Super Over Procedure</Text>
            <Text className="text-[#aaaaaa] text-xs leading-5">
              • Each team faces 1 over (6 legal deliveries) or 2 wickets maximum.{'\n'}
              • The team that batted second in the main match ({firstInningsBowlingTeam}) bats FIRST in the Super Over.{'\n'}
              • Team scoring the most runs in its Super Over wins the match.
            </Text>
          </View>
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={() => startSuperOverFlow(1)}
            className="bg-[#23c55e] py-4 rounded-xl items-center"
          >
            <Text className="text-black text-sm font-black tracking-wider">SUPER OVER</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN: SUPER OVER SETUP
  // =========================================================================
  const renderSuperOverSetupScreen = () => {
    const battingSquad = superOverBattingTeam === teamA ? playingXI_A : playingXI_B;
    const bowlingSquad = superOverBowlingTeam === teamA ? playingXI_A : playingXI_B;

    const dismissedBatters = dismissedSuperOverBatters[superOverBattingTeam] || [];
    const prevBowlerId = previousSuperOverBowlers[superOverBowlingTeam];

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity
            onPress={() => {
              if (superOverInnings === 1 && superOverNumber === 1) setCurrentScreen('MATCH_TIED');
              else setCurrentScreen('MAIN');
            }}
            className="p-1"
          >
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold ml-4">
            Super Over {superOverNumber > 1 ? `#${superOverNumber}` : ''} Setup
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 }}>
          {/* Matchup Header */}
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-5 mb-5 items-center">
            <View className="bg-[#eab308]/15 px-3 py-1 rounded-full mb-3 border border-[#eab308]/30">
              <Text className="text-[#eab308] text-[10px] font-black tracking-widest">
                SUPER OVER {superOverNumber > 1 ? `#${superOverNumber}` : ''} • INNINGS {superOverInnings} OF 2
              </Text>
            </View>

            <View className="flex-row items-center justify-between w-full mb-4 px-4">
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#1b2b1d] border border-[#23c55e] items-center justify-center mb-1">
                  <Ionicons name="flash" size={20} color="#23c55e" />
                </View>
                <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>{superOverBattingTeam}</Text>
                <Text className="text-[#23c55e] text-[9px] font-bold">BATTING</Text>
              </View>
              <Text className="text-[#888888] text-xs font-bold">VS</Text>
              <View className="items-center">
                <View className="w-12 h-12 rounded-full bg-[#2a1b1b] border border-[#ef4444] items-center justify-center mb-1">
                  <FontAwesome5 name="shield-alt" size={18} color="#ef4444" />
                </View>
                <Text className="text-white text-xs font-bold text-center" numberOfLines={1}>{superOverBowlingTeam}</Text>
                <Text className="text-[#ef4444] text-[9px] font-bold">BOWLING</Text>
              </View>
            </View>

            <View className="border-t border-[#222222] pt-3 w-full flex-row justify-around">
              <View className="items-center">
                <Text className="text-[#888888] text-[10px]">Overs</Text>
                <Text className="text-white text-sm font-bold">1 Over (6 balls)</Text>
              </View>
              <View className="items-center">
                <Text className="text-[#888888] text-[10px]">Wickets</Text>
                <Text className="text-[#ef4444] text-sm font-bold">Max 2 Wickets</Text>
              </View>
              {superOverInnings === 2 && (
                <View className="items-center">
                  <Text className="text-[#888888] text-[10px]">Target</Text>
                  <Text className="text-[#23c55e] text-sm font-bold">{superOverTarget} Runs</Text>
                </View>
              )}
            </View>
          </View>

          {/* Batters Selection */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[#23c55e] text-sm font-bold">
              SELECT OPENING BATTERS ({superOverBattingTeam})
            </Text>
            <View className="bg-[#1b2b1d] px-2 py-0.5 rounded">
              <Text className="text-[#23c55e] text-[10px] font-bold">BATTING</Text>
            </View>
          </View>

          <Text className="text-[#888888] text-xs mb-1.5 font-medium">Opening Batter 1 (Striker)</Text>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Opening Batter 1',
                role: 'Opening Batter',
                team: superOverBattingTeam,
                players: battingSquad,
                currentId: setupStrikerSO?.id,
                restrictedIds: [...dismissedBatters, setupNonStrikerSO?.id].filter(Boolean),
                restrictionReason: 'Ineligible (dismissed in previous Super Over)',
                onSelect: (id) => {
                  const p = battingSquad.find((x) => x.id === id);
                  if (p) setSetupStrikerSO(p);
                },
              });
            }}
            className="bg-[#121212] rounded-xl border border-[#222222] p-3.5 mb-3 flex-row items-center justify-between"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">1.</Text>
            {setupStrikerSO ? (
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: setupStrikerSO.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{setupStrikerSO.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{setupStrikerSO.role || 'Batter'} • {setupStrikerSO.style || ''}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-[#666666] text-sm flex-1">Tap to select batter 1</Text>
            )}
            <Feather name="chevron-down" size={18} color="#888888" />
          </TouchableOpacity>

          <Text className="text-[#888888] text-xs mb-1.5 font-medium">Opening Batter 2 (Non-Striker)</Text>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Opening Batter 2',
                role: 'Opening Batter',
                team: superOverBattingTeam,
                players: battingSquad,
                currentId: setupNonStrikerSO?.id,
                restrictedIds: [...dismissedBatters, setupStrikerSO?.id].filter(Boolean),
                restrictionReason: 'Ineligible (dismissed in previous Super Over)',
                onSelect: (id) => {
                  const p = battingSquad.find((x) => x.id === id);
                  if (p) setSetupNonStrikerSO(p);
                },
              });
            }}
            className="bg-[#121212] rounded-xl border border-[#222222] p-3.5 mb-5 flex-row items-center justify-between"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">2.</Text>
            {setupNonStrikerSO ? (
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: setupNonStrikerSO.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{setupNonStrikerSO.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{setupNonStrikerSO.role || 'Batter'} • {setupNonStrikerSO.style || ''}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-[#666666] text-sm flex-1">Tap to select batter 2</Text>
            )}
            <Feather name="chevron-down" size={18} color="#888888" />
          </TouchableOpacity>

          {/* Bowler Selection */}
          <View className="flex-row items-center justify-between mb-3 mt-1">
            <Text className="text-[#23c55e] text-sm font-bold">
              SELECT BOWLER ({superOverBowlingTeam})
            </Text>
            <View className="bg-[#2a1b1b] px-2 py-0.5 rounded">
              <Text className="text-[#ef4444] text-[10px] font-bold">BOWLING</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Bowler',
                role: 'Bowler',
                team: superOverBowlingTeam,
                players: bowlingSquad,
                currentId: setupBowlerSO?.id,
                restrictedIds: prevBowlerId ? [prevBowlerId] : [],
                restrictionReason: 'Ineligible (bowled in previous Super Over)',
                onSelect: (id) => {
                  const p = bowlingSquad.find((x) => x.id === id);
                  if (p) setSetupBowlerSO(p);
                },
              });
            }}
            className="bg-[#121212] rounded-xl border border-[#222222] p-3.5 mb-5 flex-row items-center justify-between"
          >
            <Text className="text-[#888888] text-sm font-bold w-6">1.</Text>
            {setupBowlerSO ? (
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: setupBowlerSO.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{setupBowlerSO.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{setupBowlerSO.role || 'Bowler'} • {setupBowlerSO.style || ''}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-[#666666] text-sm flex-1">Tap to select bowler</Text>
            )}
            <Feather name="chevron-down" size={18} color="#888888" />
          </TouchableOpacity>

          {/* Wicketkeeper Selection */}
          <View className="flex-row items-center justify-between mb-3 mt-1">
            <Text className="text-[#23c55e] text-sm font-bold">
              SELECT WICKETKEEPER ({superOverBowlingTeam})
            </Text>
            <View className="bg-[#1f2937] px-2 py-0.5 rounded">
              <Text className="text-[#60a5fa] text-[10px] font-bold">FIELDING</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              setPickerConfig({
                title: 'Select Wicketkeeper',
                role: 'Wicketkeeper',
                team: superOverBowlingTeam,
                players: bowlingSquad,
                currentId: setupKeeperSO?.id,
                onSelect: (id) => {
                  const p = bowlingSquad.find((x) => x.id === id);
                  if (p) setSetupKeeperSO(p);
                },
              });
            }}
            className="bg-[#121212] rounded-xl border border-[#222222] p-3.5 mb-4 flex-row items-center justify-between"
          >
            <MaterialCommunityIcons name="hand-back-left" size={18} color="#888888" style={{ width: 24 }} />
            {setupKeeperSO ? (
              <View className="flex-row items-center flex-1">
                <Image source={{ uri: setupKeeperSO.img }} className="w-8 h-8 rounded-full mr-3 bg-[#222222]" />
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">{setupKeeperSO.name}</Text>
                  <Text className="text-[#888888] text-[10px]">{setupKeeperSO.role || 'Wicketkeeper'}</Text>
                </View>
              </View>
            ) : (
              <Text className="text-[#666666] text-sm flex-1">Tap to select wicketkeeper</Text>
            )}
            <Feather name="chevron-down" size={18} color="#888888" />
          </TouchableOpacity>
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={() => {
              if (!setupStrikerSO || !setupNonStrikerSO) {
                Alert.alert('Select Batters', 'Please select both opening batters.');
                return;
              }
              if (setupStrikerSO.id === setupNonStrikerSO.id) {
                Alert.alert('Duplicate Batter', 'Batter 1 and Batter 2 must be different players.');
                return;
              }
              if (dismissedBatters.includes(setupStrikerSO.id) || dismissedBatters.includes(setupNonStrikerSO.id)) {
                Alert.alert('Ineligible Batter', 'Batters dismissed in a previous Super Over cannot bat in subsequent Super Overs.');
                return;
              }
              if (!setupBowlerSO) {
                Alert.alert('Select Bowler', 'Please select the bowler.');
                return;
              }
              if (prevBowlerId && setupBowlerSO.id === prevBowlerId) {
                Alert.alert('Ineligible Bowler', 'The bowler who bowled the previous Super Over cannot bowl the next Super Over.');
                return;
              }
              if (!setupKeeperSO) {
                Alert.alert('Select Wicketkeeper', 'Please select the wicketkeeper from the fielding team.');
                return;
              }

              // Batting squad check
              const isStrikerValid = battingSquad.some((p) => p.id === setupStrikerSO.id);
              const isNonStrikerValid = battingSquad.some((p) => p.id === setupNonStrikerSO.id);
              if (!isStrikerValid || !isNonStrikerValid) {
                Alert.alert('Invalid Batter', `Batters must belong to ${superOverBattingTeam}'s Playing XI.`);
                return;
              }
              // Bowling squad check
              const isBowlerValid = bowlingSquad.some((p) => p.id === setupBowlerSO.id);
              if (!isBowlerValid) {
                Alert.alert('Invalid Bowler', `Bowler must belong to ${superOverBowlingTeam}'s Playing XI.`);
                return;
              }
              const isKeeperValid = bowlingSquad.some((p) => p.id === setupKeeperSO.id);
              if (!isKeeperValid) {
                Alert.alert('Invalid Wicketkeeper', `Wicketkeeper must belong to ${superOverBowlingTeam}'s Playing XI.`);
                return;
              }

              // Initialize live scoring engine for Super Over
              setIsSuperOver(true);
              setTotalRuns(0);
              setTotalWickets(0);
              setLegalBalls(0);
              setCurrentOverNumber(0);
              setExtrasTotal(0);
              setExtrasBreakdown({ wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0 });
              setCurrentOverBalls([]);
              setPastOvers([]);
              setFallOfWickets([]);
              setHistoryStack([]);

              const s = { ...setupStrikerSO, runs: 0, balls: 0, fours: 0, sixes: 0 };
              const ns = { ...setupNonStrikerSO, runs: 0, balls: 0, fours: 0, sixes: 0 };
              const b = { ...setupBowlerSO, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0 };

              setStriker(s);
              setNonStriker(ns);
              setBowler(b);
              setWicketkeeper(setupKeeperSO);
              setPreviousBowlerId(null);
              setShowBowlerSelectDrawer(false);

              // Initialize scorecard with eligible batters
              const remainingBatters = battingSquad.filter((p) => !dismissedBatters.includes(p.id));
              setBattersScorecard(
                remainingBatters.map((p) => {
                  if (p.id === s.id || p.id === ns.id) {
                    return { ...p, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'not out', dismissal: 'batting' };
                  }
                  return { ...p, runs: 0, balls: 0, fours: 0, sixes: 0, status: 'yet to bat', dismissal: '' };
                })
              );

              const bMap = {};
              bowlingSquad.forEach((p) => {
                bMap[p.id] = { name: p.name, overs: 0, balls: 0, maidens: 0, runsConceded: 0, wickets: 0 };
              });
              setBowlerStatsMap(bMap);

              setCommentaryList([
                {
                  id: `so_c_${Date.now()}`,
                  over: '0.0',
                  text: `Super Over ${superOverNumber > 1 ? `#${superOverNumber} ` : ''}Innings ${superOverInnings} begins! ${superOverBattingTeam} batting vs ${superOverBowlingTeam}. ${s.name} & ${ns.name} at the crease. ${b.name} bowling, ${setupKeeperSO.name} keeping.`,
                },
              ]);

              setCurrentScreen('MAIN');
            }}
            className="bg-[#23c55e] py-4 rounded-xl items-center"
          >
            <Text className="text-black text-sm font-black tracking-wider">START SUPER OVER</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN: SUPER OVER TIED
  // =========================================================================
  const renderSuperOverTiedScreen = () => {
    const tiedData = tiedSuperOverData;
    const soNum = tiedData?.superOverNumber || superOverNumber;
    const nextSO = soNum + 1;

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold ml-4">Super Over Tied</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 120 + bottomInset, alignItems: 'center' }}>
          <View className="w-20 h-20 rounded-full bg-[#ef4444]/15 border-2 border-[#ef4444] items-center justify-center mb-4">
            <Ionicons name="repeat" size={36} color="#ef4444" />
          </View>

          <Text className="text-white text-2xl font-black mb-1 text-center">
            SUPER OVER {soNum > 1 ? `#${soNum} ` : ''}TIED!
          </Text>
          <Text className="text-[#888888] text-xs font-medium text-center mb-6">
            Both teams scored equal runs in the Super Over. Under ICC rules, another Super Over must be played!
          </Text>

          {/* Scores Display */}
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-5 w-full mb-5">
            <View className="flex-row items-center justify-between pb-3 border-b border-[#222222]">
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>{tiedData?.innings1?.battingTeam}</Text>
                <Text className="text-[#888888] text-xs">Super Over Innings 1</Text>
              </View>
              <Text className="text-white text-xl font-black">
                {tiedData?.innings1?.totalRuns}/{tiedData?.innings1?.totalWickets}
              </Text>
            </View>

            <View className="items-center py-2">
              <Text className="text-[#ef4444] text-xs font-bold tracking-widest">SCORES TIED</Text>
            </View>

            <View className="flex-row items-center justify-between pt-3 border-t border-[#222222]">
              <View className="flex-1">
                <Text className="text-white text-base font-bold" numberOfLines={1}>{tiedData?.innings2?.battingTeam}</Text>
                <Text className="text-[#888888] text-xs">Super Over Innings 2</Text>
              </View>
              <Text className="text-white text-xl font-black">
                {tiedData?.innings2?.totalRuns}/{tiedData?.innings2?.totalWickets}
              </Text>
            </View>
          </View>

          {/* ICC Rules for Repeat Super Over */}
          <View className="bg-[#141414] rounded-xl border border-[#262626] p-4 w-full mb-6">
            <Text className="text-[#eab308] text-xs font-bold mb-2">ICC Repeated Super Over Rules</Text>
            <Text className="text-[#aaaaaa] text-xs leading-5">
              1. The team that batted second in this Super Over ({tiedData?.innings2?.battingTeam}) will bat FIRST in Super Over #{nextSO}.{'\n'}
              2. Batters dismissed in previous Super Overs cannot bat again.{'\n'}
              3. The bowler who bowled this Super Over cannot bowl the next Super Over.
            </Text>
          </View>
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f]"
        >
          <TouchableOpacity
            onPress={() => startSuperOverFlow(nextSO)}
            className="bg-[#23c55e] py-4 rounded-xl items-center"
          >
            <Text className="text-black text-sm font-black tracking-wider">
              START SUPER OVER #{nextSO}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // SCREEN 14: MATCH COMPLETE / RESULT / SCORECARD
  // =========================================================================
  const renderMatchResultScreen = () => {
    const res = matchResult || {
      winner: firstInningsBowlingTeam,
      margin: '6 wickets',
      resultText: `${firstInningsBowlingTeam} won by 6 wickets!`,
      firstInnings: firstInningsSummary || {
        battingTeam: firstInningsBattingTeam,
        totalRuns: 165,
        totalWickets: 7,
        overs: `${totalOversMax}.0`,
        extrasTotal: 12,
        extrasBreakdown: { wides: 4, noBalls: 1, byes: 4, legByes: 3, penalty: 0 },
        batters: battersScorecard,
        bowlers: bowlerStatsMap,
        fallOfWickets: fallOfWickets,
      },
      secondInnings: {
        battingTeam: firstInningsBowlingTeam,
        totalRuns: totalRuns,
        totalWickets: totalWickets,
        overs: oversDecimal,
        extrasTotal: extrasTotal,
        extrasBreakdown: extrasBreakdown,
        batters: battersScorecard,
        bowlers: bowlerStatsMap,
        fallOfWickets: fallOfWickets,
      },
    };

    const activeScorecardInnings = scorecardInningsTab === 1 ? res.firstInnings : res.secondInnings;

    return (
      <View className="flex-1 bg-[#0a0a0a]">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
          <TouchableOpacity onPress={() => setCurrentScreen('MAIN')} className="p-1">
            <Feather name="arrow-left" size={22} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-base font-bold">Match Result</Text>
          <View className="w-6" />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 + bottomInset }}>
          {/* Winner Banner Card */}
          <View className="bg-[#121212] rounded-2xl border border-[#23c55e]/50 p-6 items-center mb-5">
            <View className="w-16 h-16 rounded-full bg-[#23c55e]/15 border-2 border-[#23c55e] items-center justify-center mb-3">
              <Ionicons name="trophy" size={32} color="#23c55e" />
            </View>
            <Text className="text-white text-xl font-black text-center mb-1">
              {res.resultText}
            </Text>
            <Text className="text-[#888888] text-xs font-semibold">
              {matchParam?.venue || 'Rajiv Cricket Ground, Hyderabad'} • {matchParam?.format || 'T20'}
            </Text>
          </View>

          {/* Quick Innings Comparison Cards */}
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4 mb-5">
            <View className="flex-row justify-between items-center py-2.5 border-b border-[#222222]">
              <Text className="text-white text-sm font-bold">{res.firstInnings?.battingTeam}</Text>
              <Text className="text-white text-sm font-black">
                {res.firstInnings?.totalRuns}/{res.firstInnings?.totalWickets}{' '}
                <Text className="text-[#888888] text-xs font-normal">({res.firstInnings?.overs} Ov)</Text>
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2.5">
              <Text className="text-white text-sm font-bold">{res.secondInnings?.battingTeam}</Text>
              <Text className="text-white text-sm font-black">
                {res.secondInnings?.totalRuns}/{res.secondInnings?.totalWickets}{' '}
                <Text className="text-[#888888] text-xs font-normal">({res.secondInnings?.overs} Ov)</Text>
              </Text>
            </View>
          </View>

          {/* Super Over summary cards if any */}
          {res.superOvers && res.superOvers.length > 0 && (
            <View className="bg-[#121212] rounded-2xl border border-[#eab308]/40 p-4 mb-5">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[#eab308] text-xs font-bold uppercase tracking-wider">
                  SUPER OVER SCORECARD
                </Text>
                <View className="bg-[#eab308]/15 px-2 py-0.5 rounded">
                  <Text className="text-[#eab308] text-[10px] font-bold">MATCH DECIDER</Text>
                </View>
              </View>
              {res.superOvers.map((so, idx) => (
                <View key={idx} className="border-t border-[#222222] pt-2.5 mt-2">
                  <Text className="text-[#888888] text-[11px] font-bold mb-1.5">
                    Super Over {so.superOverNumber > 1 ? `#${so.superOverNumber}` : '1'} {so.winner ? `• Winner: ${so.winner}` : '• TIED'}
                  </Text>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-white text-xs font-semibold">{so.innings1?.battingTeam}</Text>
                    <Text className="text-white text-xs font-bold">
                      {so.innings1?.totalRuns}/{so.innings1?.totalWickets} ({so.innings1?.overs} Ov)
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white text-xs font-semibold">{so.innings2?.battingTeam}</Text>
                    <Text className="text-white text-xs font-bold">
                      {so.innings2?.totalRuns}/{so.innings2?.totalWickets} ({so.innings2?.overs} Ov)
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Scorecard Tab Selector */}
          <View className="flex-row bg-[#181818] rounded-xl p-1 mb-4 border border-[#222222]">
            <TouchableOpacity
              onPress={() => setScorecardInningsTab(1)}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                scorecardInningsTab === 1 ? 'bg-[#23c55e]' : ''
              }`}
            >
              <Text className={`text-xs font-bold ${scorecardInningsTab === 1 ? 'text-black' : 'text-[#888888]'}`}>
                1st Innings: {res.firstInnings?.battingTeam}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setScorecardInningsTab(2)}
              className={`flex-1 py-2.5 rounded-lg items-center ${
                scorecardInningsTab === 2 ? 'bg-[#23c55e]' : ''
              }`}
            >
              <Text className={`text-xs font-bold ${scorecardInningsTab === 2 ? 'text-black' : 'text-[#888888]'}`}>
                2nd Innings: {res.secondInnings?.battingTeam}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Batting Scorecard Table */}
          <View className="bg-[#121212] rounded-2xl border border-[#222222] p-4 mb-4">
            <Text className="text-[#23c55e] text-xs font-bold uppercase tracking-wider mb-3">
              BATTING SCORECARD
            </Text>
            <View className="flex-row justify-between pb-2 border-b border-[#222222]">
              <Text className="text-[#888888] text-[10px] font-bold flex-1">Batter</Text>
              <View className="flex-row w-[140px] justify-between">
                <Text className="text-[#888888] text-[10px] font-bold w-8 text-right">R</Text>
                <Text className="text-[#888888] text-[10px] font-bold w-8 text-right">B</Text>
                <Text className="text-[#888888] text-[10px] font-bold w-8 text-right">4s</Text>
                <Text className="text-[#888888] text-[10px] font-bold w-8 text-right">6s</Text>
                <Text className="text-[#888888] text-[10px] font-bold w-10 text-right">SR</Text>
              </View>
            </View>

            {activeScorecardInnings?.batters && activeScorecardInnings.batters.length > 0 ? (
              activeScorecardInnings.batters.map((b) => (
                <View key={b.id} className="flex-row justify-between py-2 border-b border-[#181818] items-center">
                  <View className="flex-1 pr-2">
                    <Text className="text-white text-xs font-bold" numberOfLines={1}>{b.name}</Text>
                    <Text className="text-[#888888] text-[9px]">{b.dismissal || b.status}</Text>
                  </View>
                  <View className="flex-row w-[140px] justify-between items-center">
                    <Text className="text-white text-xs font-bold w-8 text-right">{b.runs}</Text>
                    <Text className="text-[#888888] text-xs w-8 text-right">{b.balls}</Text>
                    <Text className="text-[#888888] text-xs w-8 text-right">{b.fours || 0}</Text>
                    <Text className="text-[#888888] text-xs w-8 text-right">{b.sixes || 0}</Text>
                    <Text className="text-[#888888] text-xs w-10 text-right">{getSR(b.runs, b.balls)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text className="text-[#888888] text-xs py-2">Scorecard details recorded.</Text>
            )}

            {/* Extras Row */}
            <View className="flex-row justify-between py-2.5 border-b border-[#222222]">
              <Text className="text-[#888888] text-xs font-semibold">Extras</Text>
              <Text className="text-white text-xs font-bold">
                {activeScorecardInnings?.extrasTotal || 0}{' '}
                <Text className="text-[#888888] text-[10px]">
                  (wd {activeScorecardInnings?.extrasBreakdown?.wides || 0}, nb {activeScorecardInnings?.extrasBreakdown?.noBalls || 0}, b {activeScorecardInnings?.extrasBreakdown?.byes || 0}, lb {activeScorecardInnings?.extrasBreakdown?.legByes || 0})
                </Text>
              </Text>
            </View>

            {/* Total Row */}
            <View className="flex-row justify-between pt-2.5">
              <Text className="text-white text-xs font-black">Total</Text>
              <Text className="text-[#23c55e] text-xs font-black">
                {activeScorecardInnings?.totalRuns}/{activeScorecardInnings?.totalWickets} ({activeScorecardInnings?.overs} Ov)
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={{ paddingBottom: Math.max(16, bottomInset + 8) }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-[#1f1f1f] flex-row justify-between"
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Matches' })}
            className="w-[48%] py-3.5 rounded-xl bg-[#181818] border border-[#2a2a2a] items-center"
          >
            <Text className="text-white text-xs font-bold">BACK TO MATCHES</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('MainTabs', { screen: 'Create' })}
            className="w-[48%] py-3.5 rounded-xl bg-[#23c55e] items-center"
          >
            <Text className="text-black text-xs font-bold">NEW MATCH</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // =========================================================================
  // MODALS & DRAWERS
  // =========================================================================
  const renderSettingsModal = () => (
    <Modal visible={showSettingsModal} transparent animationType="slide">
      <View className="flex-1 bg-black/75 justify-end">
        <View style={{ paddingBottom: Math.max(20, bottomInset + 12) }} className="bg-[#121212] border-t border-[#222222] rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#222222] mb-3">
            <Text className="text-white text-base font-bold">Match Settings</Text>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              setShowSettingsModal(false);
              setCurrentScreen('END_INNINGS_REASON');
            }}
            className="p-4 bg-[#181818] rounded-xl mb-3 flex-row justify-between items-center"
          >
            <Text className="text-white text-sm font-bold">Declare / Conclude Innings</Text>
            <Feather name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>
          {!isSuperOver && (
            <TouchableOpacity
              onPress={() => {
                setShowSettingsModal(false);
                const tiedRuns = firstInningsSummary?.totalRuns || 150;
                handleMatchTied(tiedRuns, totalWickets, `${totalOversMax}.0`);
              }}
              className="p-4 bg-[#1a180e] border border-[#eab308]/40 rounded-xl mb-3 flex-row justify-between items-center"
            >
              <View className="flex-1 mr-2">
                <Text className="text-[#eab308] text-sm font-bold">Simulate Match Tied (Super Over)</Text>
                <Text className="text-[#888888] text-xs mt-0.5">Quickly jump to Super Over flow</Text>
              </View>
              <Ionicons name="flash" size={16} color="#eab308" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => {
              setShowSettingsModal(false);
              navigation.navigate('MainTabs', { screen: 'Matches' });
            }}
            className="p-4 bg-[#181818] rounded-xl flex-row justify-between items-center"
          >
            <Text className="text-[#ef4444] text-sm font-bold">Exit to Matches</Text>
            <Feather name="log-out" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderEditLastBallModal = () => (
    <Modal visible={showEditLastBallModal} transparent animationType="fade">
      <View className="flex-1 bg-black/75 justify-center items-center px-4">
        <View className="bg-[#121212] border border-[#222222] rounded-2xl p-5 w-full max-w-sm">
          <Text className="text-white text-base font-bold mb-1">Edit Last Delivery</Text>
          <Text className="text-[#888888] text-xs mb-4">Select replacement value for last delivery</Text>
          <View className="flex-row flex-wrap justify-between mb-4">
            {['0', '1', '2', '3', '4', '6', 'Wd', 'Nb', 'b', 'lb', 'W'].map((val) => (
              <TouchableOpacity
                key={val}
                onPress={() => {
                  setShowEditLastBallModal(false);
                  if (val === 'Wd') handleScoreWide(0);
                  else if (val === 'Nb') handleScoreNoBallRuns(0);
                  else if (val === 'b') handleScoreBye(1);
                  else if (val === 'lb') handleScoreLegBye(1);
                  else if (val === 'W') setCurrentScreen('WICKET_DISMISSAL');
                  else handleScoreRuns(parseInt(val, 10));
                }}
                className="w-[18%] py-2.5 bg-[#181818] rounded-lg items-center border border-[#282828] mb-2"
              >
                <Text className="text-white text-xs font-bold">{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setShowEditLastBallModal(false)}
            className="py-3 bg-[#181818] rounded-xl items-center"
          >
            <Text className="text-[#888888] text-xs font-bold">CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Next Bowler Selection Drawer
  const renderBowlerSelectDrawer = () => (
    <Modal visible={showBowlerSelectDrawer} transparent animationType="slide">
      <View className="flex-1 bg-black/75 justify-end">
        <View style={{ paddingBottom: Math.max(20, bottomInset + 12) }} className="bg-[#121212] border-t border-[#222222] rounded-t-3xl p-5 max-h-[75%]">
          <Text className="text-white text-base font-bold mb-1">Over Completed</Text>
          <Text className="text-[#888888] text-xs mb-4">
            Select the next bowler ({currentBowlingTeam}). Note: Bowler cannot bowl consecutive overs.
          </Text>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {currentBowlingSquad.map((b) => {
              const isPrevious = b.id === previousBowlerId;
              const isSelected = selectedNextBowler?.id === b.id;
              const stats = bowlerStatsMap[b.id] || { overs: 0, maidens: 0, runsConceded: 0, wickets: 0 };

              return (
                <TouchableOpacity
                  key={b.id}
                  disabled={isPrevious}
                  onPress={() => setSelectedNextBowler(b)}
                  className={`flex-row items-center p-3 rounded-xl mb-2.5 border ${
                    isPrevious
                      ? 'bg-[#181818]/40 border-[#222222] opacity-40'
                      : isSelected
                      ? 'bg-[#122216] border-[#23c55e]'
                      : 'bg-[#181818] border-[#262626]'
                  }`}
                >
                  <Image source={{ uri: b.img }} className="w-9 h-9 rounded-full mr-3 bg-[#222222]" />
                  <View className="flex-1">
                    <Text className="text-white text-xs font-bold">{b.name}</Text>
                    <Text className="text-[#888888] text-[10px]">
                      {stats.overs}.0 ov • {stats.runsConceded} r • {stats.wickets} w
                    </Text>
                  </View>
                  {isPrevious ? (
                    <Text className="text-[#ef4444] text-[10px] font-bold">LAST OVER</Text>
                  ) : isSelected ? (
                    <Feather name="check" size={18} color="#23c55e" />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            disabled={!selectedNextBowler}
            onPress={handleConfirmNextBowler}
            className={`py-4 rounded-xl items-center ${selectedNextBowler ? 'bg-[#23c55e]' : 'bg-[#23c55e]/30'}`}
          >
            <Text className={`text-xs font-bold ${selectedNextBowler ? 'text-black' : 'text-[#888888]'}`}>
              CONFIRM NEXT BOWLER
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // No Ball Drawer
  const renderNoBallDrawer = () => (
    <Modal visible={showNoBallDrawer} transparent animationType="slide">
      <View className="flex-1 bg-black/75 justify-end">
        <View style={{ paddingBottom: Math.max(20, bottomInset + 12) }} className="bg-[#121212] border-t border-[#222222] rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#222222] mb-3">
            <View>
              <Text className="text-[#f59e0b] text-base font-bold">NO BALL DELIVERY</Text>
              <Text className="text-[#888888] text-xs">+1 Penalty Run applied (0 legal balls)</Text>
            </View>
            <TouchableOpacity onPress={() => setShowNoBallDrawer(false)}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {noBallSubStep === 'MAIN' ? (
            <>
              <Text className="text-white text-xs font-bold mb-2">Off the Bat Runs</Text>
              <View className="flex-row justify-between mb-4">
                {[0, 1, 2, 3, 4, 6].map((runs) => (
                  <TouchableOpacity
                    key={runs}
                    onPress={() => handleScoreNoBallRuns(runs)}
                    className="w-[15%] py-3 bg-[#181818] border border-[#2a2a2a] rounded-xl items-center"
                  >
                    <Text className="text-white text-sm font-bold">+{runs}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-white text-xs font-bold mb-2">Extras / Wicket on No Ball</Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => setNoBallSubStep('BYE')}
                  className="w-[30%] py-3 bg-[#261e35] border border-[#8b5cf6]/40 rounded-xl items-center"
                >
                  <Text className="text-[#c084fc] text-xs font-bold">BYE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNoBallSubStep('LEG_BYE')}
                  className="w-[30%] py-3 bg-[#261e35] border border-[#a855f7]/40 rounded-xl items-center"
                >
                  <Text className="text-[#d8b4fe] text-xs font-bold">LEG BYE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNoBallSubStep('WICKET')}
                  className="w-[30%] py-3 bg-[#2a1414] border border-[#ef4444]/40 rounded-xl items-center"
                >
                  <Text className="text-[#f87171] text-xs font-bold">RUN OUT</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : noBallSubStep === 'BYE' ? (
            <>
              <Text className="text-white text-xs font-bold mb-3">Select Bye Runs off No Ball</Text>
              <View className="flex-row justify-between mb-4">
                {[1, 2, 3, 4].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => handleScoreNoBallByes(r)}
                    className="w-[22%] py-3 bg-[#181818] border border-[#2a2a2a] rounded-xl items-center"
                  >
                    <Text className="text-white text-sm font-bold">{r} Bye</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setNoBallSubStep('MAIN')} className="py-2.5 items-center">
                <Text className="text-[#888888] text-xs font-bold">Back</Text>
              </TouchableOpacity>
            </>
          ) : noBallSubStep === 'LEG_BYE' ? (
            <>
              <Text className="text-white text-xs font-bold mb-3">Select Leg Bye Runs off No Ball</Text>
              <View className="flex-row justify-between mb-4">
                {[1, 2, 3, 4].map((r) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => handleScoreNoBallLegByes(r)}
                    className="w-[22%] py-3 bg-[#181818] border border-[#2a2a2a] rounded-xl items-center"
                  >
                    <Text className="text-white text-sm font-bold">{r} Leg Bye</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity onPress={() => setNoBallSubStep('MAIN')} className="py-2.5 items-center">
                <Text className="text-[#888888] text-xs font-bold">Back</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-white text-xs font-bold mb-3">Run Out on No Ball</Text>
              <View className="flex-row justify-between mb-4">
                <TouchableOpacity
                  onPress={() => setNoBallRunOutBatter('striker')}
                  className={`w-[48%] py-3 rounded-xl border items-center ${
                    noBallRunOutBatter === 'striker' ? 'bg-[#122216] border-[#23c55e]' : 'bg-[#181818] border-[#2a2a2a]'
                  }`}
                >
                  <Text className="text-white text-xs font-bold">Striker: {striker.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setNoBallRunOutBatter('nonStriker')}
                  className={`w-[48%] py-3 rounded-xl border items-center ${
                    noBallRunOutBatter === 'nonStriker' ? 'bg-[#122216] border-[#23c55e]' : 'bg-[#181818] border-[#2a2a2a]'
                  }`}
                >
                  <Text className="text-white text-xs font-bold">Non-Striker: {nonStriker.name}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={handleScoreNoBallWicket}
                className="py-3 bg-[#ef4444] rounded-xl items-center mb-2"
              >
                <Text className="text-white text-xs font-bold">CONFIRM RUN OUT</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setNoBallSubStep('MAIN')} className="py-2.5 items-center">
                <Text className="text-[#888888] text-xs font-bold">Back</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  // Wide Drawer
  const renderWideDrawer = () => (
    <Modal visible={showWideDrawer} transparent animationType="slide">
      <View className="flex-1 bg-black/75 justify-end">
        <View style={{ paddingBottom: Math.max(20, bottomInset + 12) }} className="bg-[#121212] border-t border-[#222222] rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#222222] mb-3">
            <View>
              <Text className="text-[#3b82f6] text-base font-bold">WIDE DELIVERY</Text>
              <Text className="text-[#888888] text-xs">+1 Penalty Run applied (0 legal balls)</Text>
            </View>
            <TouchableOpacity onPress={() => setShowWideDrawer(false)}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-xs font-bold mb-3">Additional Runs Completed</Text>
          <View className="flex-row justify-between mb-4">
            {[0, 1, 2, 3, 4].map((extra) => (
              <TouchableOpacity
                key={extra}
                onPress={() => handleScoreWide(extra)}
                className="w-[18%] py-3 bg-[#181818] border border-[#2a2a2a] rounded-xl items-center"
              >
                <Text className="text-white text-sm font-bold">+{extra}</Text>
                <Text className="text-[#888888] text-[9px] mt-0.5">{1 + extra} tot</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  // Bye Drawer
  const renderByeDrawer = () => (
    <Modal visible={showByeDrawer} transparent animationType="slide">
      <View className="flex-1 bg-black/75 justify-end">
        <View style={{ paddingBottom: Math.max(20, bottomInset + 12) }} className="bg-[#121212] border-t border-[#222222] rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#222222] mb-3">
            <View>
              <Text className="text-[#8b5cf6] text-base font-bold">BYE RUNS</Text>
              <Text className="text-[#888888] text-xs">Counts as 1 legal ball. Not charged to bowler.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowByeDrawer(false)}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-4">
            {[1, 2, 3, 4].map((runs) => (
              <TouchableOpacity
                key={runs}
                onPress={() => handleScoreBye(runs)}
                className="w-[22%] py-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl items-center"
              >
                <Text className="text-white text-base font-bold">{runs}</Text>
                <Text className="text-[#888888] text-[10px] mt-0.5">Bye{runs === 1 ? '' : 's'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  // Leg Bye Drawer
  const renderLegByeDrawer = () => (
    <Modal visible={showLegByeDrawer} transparent animationType="slide">
      <View className="flex-1 bg-black/75 justify-end">
        <View style={{ paddingBottom: Math.max(20, bottomInset + 12) }} className="bg-[#121212] border-t border-[#222222] rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#222222] mb-3">
            <View>
              <Text className="text-[#a855f7] text-base font-bold">LEG BYE RUNS</Text>
              <Text className="text-[#888888] text-xs">Counts as 1 legal ball. Not charged to bowler.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowLegByeDrawer(false)}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-4">
            {[1, 2, 3, 4].map((runs) => (
              <TouchableOpacity
                key={runs}
                onPress={() => handleScoreLegBye(runs)}
                className="w-[22%] py-3.5 bg-[#181818] border border-[#2a2a2a] rounded-xl items-center"
              >
                <Text className="text-white text-base font-bold">{runs}</Text>
                <Text className="text-[#888888] text-[10px] mt-0.5">Leg Bye{runs === 1 ? '' : 's'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  // Extras Drawer
  const renderExtrasDrawer = () => (
    <Modal visible={showExtrasDrawer} transparent animationType="slide">
      <View className="flex-1 bg-black/75 justify-end">
        <View style={{ paddingBottom: Math.max(20, bottomInset + 12) }} className="bg-[#121212] border-t border-[#222222] rounded-t-3xl p-5">
          <View className="flex-row justify-between items-center pb-3 border-b border-[#222222] mb-3">
            <Text className="text-white text-base font-bold">Select Extras</Text>
            <TouchableOpacity onPress={() => setShowExtrasDrawer(false)}>
              <Feather name="x" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              setShowExtrasDrawer(false);
              setShowWideDrawer(true);
            }}
            className="p-3.5 bg-[#181818] rounded-xl mb-2.5 flex-row justify-between items-center"
          >
            <Text className="text-white text-xs font-bold">Wide (Wd)</Text>
            <Feather name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowExtrasDrawer(false);
              setShowNoBallDrawer(true);
            }}
            className="p-3.5 bg-[#181818] rounded-xl mb-2.5 flex-row justify-between items-center"
          >
            <Text className="text-white text-xs font-bold">No Ball (Nb)</Text>
            <Feather name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowExtrasDrawer(false);
              setShowByeDrawer(true);
            }}
            className="p-3.5 bg-[#181818] rounded-xl mb-2.5 flex-row justify-between items-center"
          >
            <Text className="text-white text-xs font-bold">Bye (B)</Text>
            <Feather name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setShowExtrasDrawer(false);
              setShowLegByeDrawer(true);
            }}
            className="p-3.5 bg-[#181818] rounded-xl flex-row justify-between items-center"
          >
            <Text className="text-white text-xs font-bold">Leg Bye (Lb)</Text>
            <Feather name="chevron-right" size={16} color="#888" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Universal Player Picker Modal
  const renderPlayerPickerModal = () => {
    if (!pickerConfig) return null;
    return (
      <Modal visible={!!pickerConfig} transparent animationType="slide">
        <View className="flex-1 bg-black/75 justify-end">
          <View style={{ paddingBottom: Math.max(20, bottomInset + 12) }} className="bg-[#121212] border-t border-[#222222] rounded-t-3xl max-h-[75%] p-5">
            <View className="flex-row justify-between items-center mb-4 pb-3 border-b border-[#222222]">
              <View>
                <Text className="text-white text-lg font-bold">{pickerConfig.title}</Text>
                <Text className="text-[#888888] text-xs">
                  {pickerConfig.team} Playing XI
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPickerConfig(null)} className="p-1">
                <Feather name="x" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {pickerConfig.players.map((p) => {
                const isSelected = p.id === pickerConfig.currentId;
                const isRestricted = pickerConfig.restrictedIds?.includes(p.id) || pickerConfig.restrictedIds?.includes(p.name);

                return (
                  <TouchableOpacity
                    key={p.id}
                    disabled={isRestricted}
                    onPress={() => {
                      pickerConfig.onSelect(p.id);
                      setPickerConfig(null);
                    }}
                    className={`flex-row items-center p-3 rounded-xl mb-2 ${
                      isRestricted
                        ? 'bg-[#181818] border border-[#2a2a2a] opacity-40'
                        : isSelected
                        ? 'bg-[#1a2e1d] border border-[#23c55e]'
                        : 'bg-[#181818] border border-[#222222]'
                    }`}
                  >
                    <Image source={{ uri: p.img }} className="w-9 h-9 rounded-full mr-3 bg-[#222222]" />
                    <View className="flex-1">
                      <Text className={`text-sm font-bold ${isRestricted ? 'text-[#777777]' : 'text-white'}`}>
                        {p.name}
                      </Text>
                      <Text className="text-[#888888] text-xs">
                        {p.role || 'Player'} {p.style ? `• ${p.style}` : ''}
                      </Text>
                      {isRestricted && (
                        <Text className="text-[#ef4444] text-[10px] mt-0.5">
                          {pickerConfig.restrictionReason || 'Unavailable for selection'}
                        </Text>
                      )}
                    </View>
                    {isSelected && !isRestricted && (
                      <Feather name="check" size={18} color="#23c55e" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // =========================================================================
  // MAIN ROUTING
  // =========================================================================
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-[#0a0a0a]">
      {currentScreen === 'MAIN' && renderMainScreen()}
      {currentScreen === 'BALL_FEED' && renderBallFeedScreen()}
      {currentScreen === 'EXTRAS' && renderExtrasScreen()}
      {currentScreen === 'WICKET_DISMISSAL' && renderWicketDismissalScreen()}
      {currentScreen === 'CAUGHT_FIELDER' && renderCaughtFielderScreen()}
      {currentScreen === 'RUNOUT_BATTER' && renderRunOutBatterScreen()}
      {currentScreen === 'RUNOUT_FIELDER' && renderRunOutFielderScreen()}
      {currentScreen === 'STUMPED_KEEPER' && renderStumpedKeeperScreen()}
      {currentScreen === 'WICKET_CONFIRM' && renderWicketConfirmScreen()}
      {currentScreen === 'INNINGS_SETUP' && renderInningsSetupScreen()}
      {currentScreen === 'END_INNINGS_REASON' && renderEndInningsReasonScreen()}
      {currentScreen === 'INNINGS_SUMMARY' && renderInningsSummaryScreen()}
      {currentScreen === 'SECOND_INNINGS_START' && renderSecondInningsStartScreen()}
      {currentScreen === 'MATCH_TIED' && renderMatchTiedScreen()}
      {currentScreen === 'SUPER_OVER_SETUP' && renderSuperOverSetupScreen()}
      {currentScreen === 'SUPER_OVER_TIED' && renderSuperOverTiedScreen()}
      {currentScreen === 'MATCH_RESULT' && renderMatchResultScreen()}

      {renderSettingsModal()}
      {renderEditLastBallModal()}
      {renderBowlerSelectDrawer()}
      {renderNoBallDrawer()}
      {renderWideDrawer()}
      {renderByeDrawer()}
      {renderLegByeDrawer()}
      {renderExtrasDrawer()}
      {renderPlayerPickerModal()}
    </SafeAreaView>
  );
}
