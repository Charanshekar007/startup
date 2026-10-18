import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { tournamentService } from '../../services/tournamentService.js';
import { getTeams } from '../../store/teamRepository.js';
import { useAuthStore } from '../../store/authStore.js';
import { playerService } from '../../services/playerService.js';

export default function TournamentWizardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const existingDraft = route.params?.draft || route.params?.existingDraft || null;

  // Active Wizard Step: 1 to 6 (restores last saved step if opening existing draft)
  const [currentStep, setCurrentStep] = useState(existingDraft?.lastSavedStep || 1);
  const totalSteps = 6;

  // Stable Draft ID and save state
  const [draftId, setDraftId] = useState(existingDraft?.id || null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState(existingDraft ? 'Draft' : 'Save Draft');

  // Authenticated Organizer
  const authAccount = useAuthStore((state) => state.accountData);
  const [currentUserId, setCurrentUserId] = useState(authAccount?.id || 'usr_arjun123');
  const [organizerName, setOrganizerName] = useState(authAccount?.name || 'Arjun');

  useEffect(() => {
    (async () => {
      try {
        const u = await playerService.getCurrentUser();
        if (u) {
          setCurrentUserId(u.id || u.playerId || 'usr_arjun123');
          setOrganizerName(u.name || u.fullName || 'Organizer');
        }
      } catch (e) {}
    })();
  }, []);

  // Available Teams in platform
  const [allRegisteredTeams, setAllRegisteredTeams] = useState([]);
  const [teamSearchQuery, setTeamSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const teams = await getTeams();
        setAllRegisteredTeams(teams || []);
      } catch (e) {}
    })();
  }, []);

  // -------------------------------------------------------------
  // STEP 1: TOURNAMENT DETAILS STATE
  // -------------------------------------------------------------
  const [name, setName] = useState(existingDraft?.name || '');
  const [shortName, setShortName] = useState(existingDraft?.shortName || '');
  const [description, setDescription] = useState(existingDraft?.description || '');
  const [city, setCity] = useState(existingDraft?.city || 'Hyderabad');
  const [venue, setVenue] = useState(existingDraft?.venue || 'Rajiv Cricket Ground');
  const [startDate, setStartDate] = useState(existingDraft?.startDate || '2026-06-01');
  const [endDate, setEndDate] = useState(existingDraft?.endDate || '2026-06-15');
  const [registrationDeadline, setRegistrationDeadline] = useState(existingDraft?.registrationDeadline || '2026-05-25');
  const [visibility, setVisibility] = useState(existingDraft?.visibility || 'public'); // 'public' | 'private'

  // -------------------------------------------------------------
  // STEP 2: RULES CONFIGURATION STATE
  // -------------------------------------------------------------
  const [ballType, setBallType] = useState(existingDraft?.rules?.ballType || 'Leather'); // 'Leather' | 'Tennis' | 'Tape'
  const [matchFormat, setMatchFormat] = useState(existingDraft?.rules?.matchFormat || 'T20'); // 'T10' | 'T20' | 'ODI' | 'Custom'
  const [oversPerInnings, setOversPerInnings] = useState(existingDraft?.rules?.oversPerInnings || 20);
  const [playersPerSide, setPlayersPerSide] = useState(existingDraft?.rules?.playersPerSide || 11);
  const [maxSquadSize, setMaxSquadSize] = useState(existingDraft?.rules?.maxSquadSize || 20);
  const [pointsWin, setPointsWin] = useState(existingDraft?.rules?.pointsWin !== undefined ? existingDraft.rules.pointsWin : 2);
  const [pointsTie, setPointsTie] = useState(existingDraft?.rules?.pointsTie !== undefined ? existingDraft.rules.pointsTie : 1);
  const [pointsNoResult, setPointsNoResult] = useState(existingDraft?.rules?.pointsNoResult !== undefined ? existingDraft.rules.pointsNoResult : 1);
  const [pointsLoss, setPointsLoss] = useState(existingDraft?.rules?.pointsLoss !== undefined ? existingDraft.rules.pointsLoss : 0);

  // -------------------------------------------------------------
  // STEP 3: TEAMS & REGISTRATION STATE
  // -------------------------------------------------------------
  const [registrationMode, setRegistrationMode] = useState(existingDraft?.registration?.mode || 'open'); // 'open' | 'invite_only'
  const [maxTeams, setMaxTeams] = useState(existingDraft?.registration?.maxTeams || 4); // 4 | 8 | 16
  const [selectedTeams, setSelectedTeams] = useState(existingDraft?.registration?.teams || []);

  // -------------------------------------------------------------
  // STEP 4: COMPETITION FORMAT STATE
  // -------------------------------------------------------------
  const [formatType, setFormatType] = useState(existingDraft?.format?.type || 'LEAGUE'); // 'LEAGUE' | 'GROUPS_PLAYOFFS' | 'KNOCKOUT'
  const [roundRobinType, setRoundRobinType] = useState(existingDraft?.format?.roundRobinType || 'single'); // 'single' | 'double'
  const [groupCount, setGroupCount] = useState(existingDraft?.format?.groupCount || 2); // 2 | 4
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState(existingDraft?.format?.qualifiersPerGroup || 2);
  const [hasThirdPlace, setHasThirdPlace] = useState(existingDraft?.format?.hasThirdPlace || false);

  // -------------------------------------------------------------
  // STEP 5: FIXTURES STATE
  // -------------------------------------------------------------
  const [fixtures, setFixtures] = useState(existingDraft?.fixtures || []);
  const [isGeneratingFixtures, setIsGeneratingFixtures] = useState(false);
  const [selectedStageTab, setSelectedStageTab] = useState('ALL');

  // Manual fixture editing modal
  const [editingFixture, setEditingFixture] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editVenue, setEditVenue] = useState('');

  // -------------------------------------------------------------
  // HELPERS & VALIDATION
  // -------------------------------------------------------------
  const handleToggleTeamSelection = (team) => {
    const exists = selectedTeams.find((t) => t.teamId === team.id);
    if (exists) {
      setSelectedTeams((prev) => prev.filter((t) => t.teamId !== team.id));
    } else {
      if (selectedTeams.length >= maxTeams) {
        Alert.alert('Capacity Reached', `Maximum allowed teams for this tournament is ${maxTeams}.`);
        return;
      }
      setSelectedTeams((prev) => [
        ...prev,
        {
          teamId: team.id,
          teamName: team.name,
          shortName: team.shortName || team.name.slice(0, 3).toUpperCase(),
          logo: team.logo,
          location: team.location || 'Local Ground',
          status: 'accepted',
          type: 'invitation',
        },
      ]);
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!name.trim()) {
        Alert.alert('Validation Error', 'Please enter a tournament name.');
        return false;
      }
      if (!city.trim() || !venue.trim()) {
        Alert.alert('Validation Error', 'Please provide a city and primary venue.');
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (oversPerInnings <= 0 || oversPerInnings > 50) {
        Alert.alert('Validation Error', 'Overs per innings must be between 1 and 50.');
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (selectedTeams.length < 2) {
        Alert.alert('Validation Error', 'Please invite or add at least 2 teams to the tournament.');
        return false;
      }
      return true;
    }

    if (step === 4) {
      if (formatType === 'GROUPS_PLAYOFFS') {
        if (selectedTeams.length < groupCount * 2) {
          Alert.alert('Validation Error', `With ${groupCount} groups, at least ${groupCount * 2} teams are required (minimum 2 per group).`);
          return false;
        }
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    // When advancing to step 5, auto-generate fixtures if not already generated
    if (currentStep === 4 && fixtures.length === 0) {
      handleAutoGenerateFixtures();
    }

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const exitWizard = useCallback(() => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MyTournaments');
    }
  }, [navigation]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      const hasContent = Boolean(name.trim() || description.trim() || selectedTeams.length > 0);
      if (hasContent) {
        Alert.alert(
          'Unsaved Tournament',
          'Would you like to save your tournament draft before leaving?',
          [
            { text: 'Continue Editing', style: 'cancel' },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: exitWizard,
            },
            {
              text: 'Save Draft & Exit',
              onPress: async () => {
                try {
                  const tournamentObj = buildTournamentObject('draft');
                  await tournamentService.saveTournament(tournamentObj);
                  exitWizard();
                } catch (e) {
                  exitWizard();
                }
              },
            },
          ]
        );
      } else {
        exitWizard();
      }
    }
  }, [currentStep, name, description, selectedTeams, exitWizard, buildTournamentObject]);

  // Intercept Android hardware back button: step back in wizard or confirm exit
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [handleBack])
  );

  const handleAutoGenerateFixtures = () => {
    setIsGeneratingFixtures(true);
    try {
      const draftObj = buildTournamentObject('draft');
      const generated = tournamentService.generateFixtures(draftObj);
      setFixtures(generated);
      setSelectedStageTab('ALL');
    } catch (err) {
      Alert.alert('Fixture Generation Error', err.message || 'Failed to generate fixtures.');
    } finally {
      setIsGeneratingFixtures(false);
    }
  };

  const buildTournamentObject = (targetStatus = 'draft') => {
    const finalId = draftId || existingDraft?.id || `tourn_${Date.now()}`;
    if (!draftId) setDraftId(finalId);

    return {
      id: finalId,
      name: name.trim() || 'Untitled Tournament Draft',
      shortName: shortName.trim() || (name.trim() ? name.trim().slice(0, 4).toUpperCase() : 'TOURN'),
      description: description.trim(),
      logo: existingDraft?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(shortName || name || 'EZ')}&background=23c55e&color=000&bold=true`,
      banner: existingDraft?.banner || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      organizerId: currentUserId,
      organizerName,
      city: city.trim(),
      venue: venue.trim(),
      grounds: [venue.trim()],
      startDate,
      endDate,
      registrationDeadline,
      visibility,
      status: targetStatus,
      lastSavedStep: currentStep,
      rules: {
        ballType,
        matchFormat,
        oversPerInnings: Number(oversPerInnings),
        playersPerSide: Number(playersPerSide),
        maxSquadSize: Number(maxSquadSize),
        pointsWin: Number(pointsWin),
        pointsTie: Number(pointsTie),
        pointsNoResult: Number(pointsNoResult),
        pointsLoss: Number(pointsLoss),
        tieBreakRules: ['Points', 'NRR', 'Wins', 'Head-to-head'],
      },
      registration: {
        mode: registrationMode,
        maxTeams: Number(maxTeams),
        teams: selectedTeams,
      },
      format: {
        type: formatType,
        roundRobinType,
        groupCount: Number(groupCount),
        qualifiersPerGroup: Number(qualifiersPerGroup),
        hasThirdPlace,
      },
      fixtures,
      createdAt: existingDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSaveDraft = async () => {
    if (isSavingDraft) return;
    setIsSavingDraft(true);
    setSaveStatusText('Saving...');
    try {
      const tournamentObj = buildTournamentObject('draft');
      await tournamentService.saveTournament(tournamentObj);
      setSaveStatusText('Saved');
      Alert.alert(
        'Draft Saved! 💾',
        `"${tournamentObj.name}" saved at Step ${currentStep} of ${totalSteps}. You can pick up where you left off anytime from My Tournaments.`,
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'View My Tournaments', onPress: () => navigation.navigate('MyTournaments') },
        ]
      );
    } catch (err) {
      setSaveStatusText('Save Failed');
      Alert.alert('Save Failed', err.message || 'Unable to save tournament draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handlePublishTournament = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      return;
    }

    if (fixtures.length === 0) {
      Alert.alert('Fixtures Required', 'Please generate or add fixtures before publishing the tournament.');
      return;
    }

    const tournamentObj = buildTournamentObject('published');
    await tournamentService.saveTournament(tournamentObj);

    Alert.alert('Tournament Published! 🏆', `"${tournamentObj.name}" is now live and published!`, [
      {
        text: 'View Tournament',
        onPress: () => {
          navigation.replace('TournamentDetail', { tournamentId: tournamentObj.id, returnDestination: 'MyTournaments' });
        },
      },
    ]);
  };

  // -------------------------------------------------------------
  // RENDER STEP 1: TOURNAMENT DETAILS
  // -------------------------------------------------------------
  const renderStep1 = () => (
    <View className="mb-6">
      <Text className="text-white text-lg font-bold mb-1">Tournament Overview</Text>
      <Text className="text-[#888888] text-xs mb-4">Set up the core identity and schedule for your tournament.</Text>

      {/* Tournament Name */}
      <View className="mb-4">
        <Text className="text-white text-xs font-semibold mb-1.5">Tournament Name *</Text>
        <TextInput
          className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm"
          placeholder="e.g. Hyderabad Champions League 2026"
          placeholderTextColor="#666666"
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Short Name */}
      <View className="mb-4">
        <Text className="text-white text-xs font-semibold mb-1.5">Short Code (Acronym)</Text>
        <TextInput
          className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm"
          placeholder="e.g. HCL 2026"
          placeholderTextColor="#666666"
          value={shortName}
          onChangeText={setShortName}
          autoCapitalize="characters"
        />
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-white text-xs font-semibold mb-1.5">Description</Text>
        <TextInput
          className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm h-20"
          placeholder="Describe the tournament rules, prize pool, or eligibility..."
          placeholderTextColor="#666666"
          value={description}
          onChangeText={setDescription}
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* City & Venue */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-white text-xs font-semibold mb-1.5">City *</Text>
          <TextInput
            className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm"
            placeholder="City"
            placeholderTextColor="#666666"
            value={city}
            onChangeText={setCity}
          />
        </View>
        <View className="flex-1">
          <Text className="text-white text-xs font-semibold mb-1.5">Primary Venue *</Text>
          <TextInput
            className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm"
            placeholder="Ground Name"
            placeholderTextColor="#666666"
            value={venue}
            onChangeText={setVenue}
          />
        </View>
      </View>

      {/* Dates */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-white text-xs font-semibold mb-1.5">Start Date</Text>
          <TextInput
            className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#666666"
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>
        <View className="flex-1">
          <Text className="text-white text-xs font-semibold mb-1.5">End Date</Text>
          <TextInput
            className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm"
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#666666"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>
      </View>

      {/* Registration Deadline */}
      <View className="mb-4">
        <Text className="text-white text-xs font-semibold mb-1.5">Registration Deadline</Text>
        <TextInput
          className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm"
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#666666"
          value={registrationDeadline}
          onChangeText={setRegistrationDeadline}
        />
      </View>

      {/* Visibility */}
      <View className="mb-2">
        <Text className="text-white text-xs font-semibold mb-2">Tournament Visibility</Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 p-3.5 rounded-xl border flex-row items-center ${visibility === 'public' ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
            onPress={() => setVisibility('public')}
          >
            <Feather name="globe" size={18} color={visibility === 'public' ? '#23c55e' : '#888888'} className="mr-2.5" />
            <View>
              <Text className={`text-xs font-bold ${visibility === 'public' ? 'text-[#23c55e]' : 'text-white'}`}>Public</Text>
              <Text className="text-[#888888] text-[10px]">Open to discovery</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-3.5 rounded-xl border flex-row items-center ${visibility === 'private' ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
            onPress={() => setVisibility('private')}
          >
            <Feather name="lock" size={18} color={visibility === 'private' ? '#23c55e' : '#888888'} className="mr-2.5" />
            <View>
              <Text className={`text-xs font-bold ${visibility === 'private' ? 'text-[#23c55e]' : 'text-white'}`}>Private</Text>
              <Text className="text-[#888888] text-[10px]">Invite only</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // -------------------------------------------------------------
  // RENDER STEP 2: RULES CONFIGURATION
  // -------------------------------------------------------------
  const renderStep2 = () => (
    <View className="mb-6">
      <Text className="text-white text-lg font-bold mb-1">Playing Conditions & Rules</Text>
      <Text className="text-[#888888] text-xs mb-4">Define standard cricket settings and points allocation.</Text>

      {/* Ball Type */}
      <View className="mb-4">
        <Text className="text-white text-xs font-semibold mb-2">Ball Type</Text>
        <View className="flex-row gap-2">
          {['Leather', 'Tennis', 'Tape'].map((b) => (
            <TouchableOpacity
              key={b}
              className={`flex-1 py-2.5 rounded-xl border items-center ${ballType === b ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
              onPress={() => setBallType(b)}
            >
              <Text className={`text-xs font-bold ${ballType === b ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Match Format */}
      <View className="mb-4">
        <Text className="text-white text-xs font-semibold mb-2">Match Format</Text>
        <View className="flex-row gap-2">
          {['T10', 'T20', 'ODI', 'Custom'].map((f) => (
            <TouchableOpacity
              key={f}
              className={`flex-1 py-2.5 rounded-xl border items-center ${matchFormat === f ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
              onPress={() => {
                setMatchFormat(f);
                if (f === 'T10') setOversPerInnings(10);
                if (f === 'T20') setOversPerInnings(20);
                if (f === 'ODI') setOversPerInnings(50);
              }}
            >
              <Text className={`text-xs font-bold ${matchFormat === f ? 'text-[#23c55e]' : 'text-[#888888]'}`}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Overs per innings */}
      <View className="mb-4">
        <Text className="text-white text-xs font-semibold mb-1.5">Overs Per Innings</Text>
        <TextInput
          className="bg-[#161616] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm"
          value={String(oversPerInnings)}
          onChangeText={(val) => setOversPerInnings(Number(val) || 0)}
          keyboardType="numeric"
        />
      </View>

      {/* Points System */}
      <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222] mb-4">
        <Text className="text-white text-xs font-bold mb-3 flex-row items-center">
          <Ionicons name="stats-chart" size={14} color="#23c55e" /> Standings Points System
        </Text>
        <View className="flex-row justify-between gap-2">
          <View className="flex-1 items-center bg-[#1a1a1a] p-2.5 rounded-xl border border-[#262626]">
            <Text className="text-[#888888] text-[10px] mb-1">Win</Text>
            <TextInput
              className="text-white text-sm font-bold text-center w-12"
              value={String(pointsWin)}
              onChangeText={(v) => setPointsWin(Number(v) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1 items-center bg-[#1a1a1a] p-2.5 rounded-xl border border-[#262626]">
            <Text className="text-[#888888] text-[10px] mb-1">Tie</Text>
            <TextInput
              className="text-white text-sm font-bold text-center w-12"
              value={String(pointsTie)}
              onChangeText={(v) => setPointsTie(Number(v) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1 items-center bg-[#1a1a1a] p-2.5 rounded-xl border border-[#262626]">
            <Text className="text-[#888888] text-[10px] mb-1">No Result</Text>
            <TextInput
              className="text-white text-sm font-bold text-center w-12"
              value={String(pointsNoResult)}
              onChangeText={(v) => setPointsNoResult(Number(v) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1 items-center bg-[#1a1a1a] p-2.5 rounded-xl border border-[#262626]">
            <Text className="text-[#888888] text-[10px] mb-1">Loss</Text>
            <TextInput
              className="text-white text-sm font-bold text-center w-12"
              value={String(pointsLoss)}
              onChangeText={(v) => setPointsLoss(Number(v) || 0)}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>
    </View>
  );

  // -------------------------------------------------------------
  // RENDER STEP 3: TEAMS & REGISTRATION
  // -------------------------------------------------------------
  const renderStep3 = () => {
    const filteredTeams = allRegisteredTeams.filter(
      (t) =>
        t.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
        (t.shortName && t.shortName.toLowerCase().includes(teamSearchQuery.toLowerCase()))
    );

    return (
      <View className="mb-6">
        <Text className="text-white text-lg font-bold mb-1">Participating Teams</Text>
        <Text className="text-[#888888] text-xs mb-4">
          Select teams to invite now. Eligible teams can also apply later.
        </Text>

        {/* Capacity & Mode */}
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-white text-xs font-semibold mb-1.5">Team Capacity</Text>
            <View className="flex-row gap-1 bg-[#121212] p-1 rounded-xl border border-[#222222]">
              {[4, 8, 16].map((cap) => (
                <TouchableOpacity
                  key={cap}
                  className={`flex-1 py-1.5 rounded-lg items-center ${maxTeams === cap ? 'bg-[#23c55e]' : 'bg-transparent'}`}
                  onPress={() => setMaxTeams(cap)}
                >
                  <Text className={`text-xs font-bold ${maxTeams === cap ? 'text-black' : 'text-[#888888]'}`}>{cap}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-white text-xs font-semibold mb-1.5">Registration Mode</Text>
            <View className="flex-row gap-1 bg-[#121212] p-1 rounded-xl border border-[#222222]">
              <TouchableOpacity
                className={`flex-1 py-1.5 rounded-lg items-center ${registrationMode === 'open' ? 'bg-[#23c55e]' : 'bg-transparent'}`}
                onPress={() => setRegistrationMode('open')}
              >
                <Text className={`text-[11px] font-bold ${registrationMode === 'open' ? 'text-black' : 'text-[#888888]'}`}>Open</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-1.5 rounded-lg items-center ${registrationMode === 'invite_only' ? 'bg-[#23c55e]' : 'bg-transparent'}`}
                onPress={() => setRegistrationMode('invite_only')}
              >
                <Text className={`text-[11px] font-bold ${registrationMode === 'invite_only' ? 'text-black' : 'text-[#888888]'}`}>Invite Only</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Selected Teams Pill Count */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-white text-xs font-bold">Selected Teams ({selectedTeams.length}/{maxTeams})</Text>
          {selectedTeams.length > 0 && (
            <TouchableOpacity onPress={() => setSelectedTeams([])}>
              <Text className="text-[#888888] text-[11px]">Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Selected Chips */}
        {selectedTeams.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 py-1">
            {selectedTeams.map((t) => (
              <View key={t.teamId} className="flex-row items-center bg-[#23c55e]/15 border border-[#23c55e] px-3 py-1.5 rounded-full mr-2">
                <Text className="text-[#23c55e] text-xs font-bold mr-1.5">{t.teamName}</Text>
                <TouchableOpacity onPress={() => handleToggleTeamSelection({ id: t.teamId })}>
                  <Feather name="x" size={14} color="#23c55e" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text className="text-[#666666] text-xs mb-3 italic">No teams selected yet. Tap teams below to invite.</Text>
        )}

        {/* Search Input */}
        <View className="flex-row items-center bg-[#161616] border border-[#262626] rounded-xl px-3 py-2.5 mb-3">
          <Feather name="search" size={16} color="#888888" className="mr-2" />
          <TextInput
            className="flex-1 text-white text-xs"
            placeholder="Search teams by name..."
            placeholderTextColor="#666666"
            value={teamSearchQuery}
            onChangeText={setTeamSearchQuery}
          />
        </View>

        {/* Teams List */}
        <View className="bg-[#121212] rounded-2xl border border-[#222222] overflow-hidden max-h-60">
          <ScrollView nestedScrollEnabled>
            {filteredTeams.map((team, idx) => {
              const isSelected = selectedTeams.some((t) => t.teamId === team.id);
              return (
                <TouchableOpacity
                  key={team.id}
                  className={`flex-row items-center justify-between p-3 ${idx < filteredTeams.length - 1 ? 'border-b border-[#222222]' : ''} ${isSelected ? 'bg-[#23c55e]/10' : ''}`}
                  onPress={() => handleToggleTeamSelection(team)}
                >
                  <View className="flex-row items-center flex-1 mr-2">
                    <Image source={{ uri: team.logo }} className="w-8 h-8 rounded-full bg-[#1a1a1a] mr-2.5" />
                    <View className="flex-1">
                      <Text className="text-white text-xs font-bold">{team.name}</Text>
                      <Text className="text-[#888888] text-[10px]">{team.location}</Text>
                    </View>
                  </View>
                  <View className={`w-5 h-5 rounded-full border items-center justify-center ${isSelected ? 'bg-[#23c55e] border-[#23c55e]' : 'border-[#444444]'}`}>
                    {isSelected && <Feather name="check" size={12} color="#000" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------
  // RENDER STEP 4: COMPETITION FORMAT
  // -------------------------------------------------------------
  const renderStep4 = () => (
    <View className="mb-6">
      <Text className="text-white text-lg font-bold mb-1">Competition Format</Text>
      <Text className="text-[#888888] text-xs mb-4">Choose how fixtures and progression will be structured.</Text>

      {/* Format Selection Cards */}
      <View className="gap-3 mb-4">
        {/* League Card */}
        <TouchableOpacity
          className={`p-4 rounded-2xl border ${formatType === 'LEAGUE' ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
          onPress={() => setFormatType('LEAGUE')}
        >
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="trophy-variant-outline" size={20} color={formatType === 'LEAGUE' ? '#23c55e' : '#fff'} className="mr-2" />
              <Text className="text-white text-sm font-bold">Round Robin League</Text>
            </View>
            {formatType === 'LEAGUE' && <Feather name="check-circle" size={16} color="#23c55e" />}
          </View>
          <Text className="text-[#888888] text-xs leading-4">
            Every team plays against every other team. Ranked by points and Net Run Rate (NRR).
          </Text>
        </TouchableOpacity>

        {/* Groups + Playoffs Card */}
        <TouchableOpacity
          className={`p-4 rounded-2xl border ${formatType === 'GROUPS_PLAYOFFS' ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
          onPress={() => setFormatType('GROUPS_PLAYOFFS')}
        >
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="tournament" size={20} color={formatType === 'GROUPS_PLAYOFFS' ? '#23c55e' : '#fff'} className="mr-2" />
              <Text className="text-white text-sm font-bold">Groups + Playoffs</Text>
            </View>
            {formatType === 'GROUPS_PLAYOFFS' && <Feather name="check-circle" size={16} color="#23c55e" />}
          </View>
          <Text className="text-[#888888] text-xs leading-4">
            Teams split into groups (A & B). Top teams qualify for Semi-Finals and the Grand Final.
          </Text>
        </TouchableOpacity>

        {/* Direct Knockout Card */}
        <TouchableOpacity
          className={`p-4 rounded-2xl border ${formatType === 'KNOCKOUT' ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#121212] border-[#222222]'}`}
          onPress={() => setFormatType('KNOCKOUT')}
        >
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="podium-gold" size={20} color={formatType === 'KNOCKOUT' ? '#23c55e' : '#fff'} className="mr-2" />
              <Text className="text-white text-sm font-bold">Direct Knockout</Text>
            </View>
            {formatType === 'KNOCKOUT' && <Feather name="check-circle" size={16} color="#23c55e" />}
          </View>
          <Text className="text-[#888888] text-xs leading-4">
            Single elimination bracket. Winner advances to next round. Automatic byes for odd team counts.
          </Text>
        </TouchableOpacity>
      </View>

      {/* Format Conditional Settings */}
      {formatType === 'LEAGUE' && (
        <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
          <Text className="text-white text-xs font-bold mb-2">Round Robin Legs</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={`flex-1 py-2 rounded-xl border items-center ${roundRobinType === 'single' ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#161616] border-[#262626]'}`}
              onPress={() => setRoundRobinType('single')}
            >
              <Text className={`text-xs font-bold ${roundRobinType === 'single' ? 'text-[#23c55e]' : 'text-white'}`}>Single Leg</Text>
              <Text className="text-[#888888] text-[10px]">Play once</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-2 rounded-xl border items-center ${roundRobinType === 'double' ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#161616] border-[#262626]'}`}
              onPress={() => setRoundRobinType('double')}
            >
              <Text className={`text-xs font-bold ${roundRobinType === 'double' ? 'text-[#23c55e]' : 'text-white'}`}>Double Leg</Text>
              <Text className="text-[#888888] text-[10px]">Home & Away</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {formatType === 'GROUPS_PLAYOFFS' && (
        <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
          <Text className="text-white text-xs font-bold mb-2">Group Configuration</Text>
          <View className="flex-row gap-2 mb-3">
            {[2, 4].map((g) => (
              <TouchableOpacity
                key={g}
                className={`flex-1 py-2 rounded-xl border items-center ${groupCount === g ? 'bg-[#23c55e]/15 border-[#23c55e]' : 'bg-[#161616] border-[#262626]'}`}
                onPress={() => setGroupCount(g)}
              >
                <Text className={`text-xs font-bold ${groupCount === g ? 'text-[#23c55e]' : 'text-white'}`}>{g} Groups</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-[#888888] text-[11px]">
            {selectedTeams.length} teams will be split across {groupCount} groups (~{Math.ceil(selectedTeams.length / groupCount)} teams each).
          </Text>
        </View>
      )}

      {formatType === 'KNOCKOUT' && (
        <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222]">
          <Text className="text-white text-xs font-bold mb-1">Bracket Structure Preview</Text>
          <Text className="text-[#888888] text-xs mb-2">
            {selectedTeams.length} teams registered.
            {selectedTeams.length % 2 !== 0 && ' Odd team count detected: Byes will be granted automatically in Round 1.'}
          </Text>
          <View className="bg-[#161616] p-2.5 rounded-xl border border-[#262626]">
            <Text className="text-[#23c55e] text-xs font-semibold">
              Rounds: {selectedTeams.length <= 4 ? 'Semi-Finals → Final' : selectedTeams.length <= 8 ? 'Quarter-Finals → Semi-Finals → Final' : 'Round of 16 → Quarters → Semis → Final'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  // -------------------------------------------------------------
  // RENDER STEP 5: FIXTURES & SCHEDULE
  // -------------------------------------------------------------
  const renderStep5 = () => {
    const stages = ['ALL', ...new Set(fixtures.map((f) => f.stage))];
    const filteredFixtures =
      selectedStageTab === 'ALL'
        ? fixtures
        : fixtures.filter((f) => f.stage === selectedStageTab);

    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-white text-lg font-bold">Fixtures Schedule</Text>
          <TouchableOpacity
            className="flex-row items-center bg-[#23c55e]/20 border border-[#23c55e] px-3 py-1.5 rounded-xl"
            onPress={handleAutoGenerateFixtures}
            disabled={isGeneratingFixtures}
          >
            <Feather name="refresh-cw" size={13} color="#23c55e" className="mr-1.5" />
            <Text className="text-[#23c55e] text-xs font-bold">
              {isGeneratingFixtures ? 'Generating...' : 'Auto Generate'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-[#888888] text-xs mb-3">
          {fixtures.length} matches scheduled for this tournament.
        </Text>

        {/* Stage Filter Tabs */}
        {stages.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3 py-1">
            {stages.map((st) => (
              <TouchableOpacity
                key={st}
                className={`px-3 py-1.5 rounded-full mr-2 border ${selectedStageTab === st ? 'bg-[#23c55e] border-[#23c55e]' : 'bg-[#161616] border-[#262626]'}`}
                onPress={() => setSelectedStageTab(st)}
              >
                <Text className={`text-xs font-bold ${selectedStageTab === st ? 'text-black' : 'text-[#888888]'}`}>
                  {st === 'ALL' ? 'All Matches' : st.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Fixtures List */}
        {filteredFixtures.length > 0 ? (
          <View className="gap-2.5">
            {filteredFixtures.map((fix) => (
              <View key={fix.id} className="bg-[#121212] p-3.5 rounded-2xl border border-[#222222]">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[#888888] text-[10px] uppercase font-bold">{fix.stageName}</Text>
                  <View className="flex-row items-center">
                    <Feather name="calendar" size={11} color="#666666" className="mr-1" />
                    <Text className="text-[#888888] text-[10px] mr-2">{fix.date}</Text>
                    <Feather name="clock" size={11} color="#666666" className="mr-1" />
                    <Text className="text-[#888888] text-[10px]">{fix.time}</Text>
                  </View>
                </View>

                {/* Matchup */}
                <View className="flex-row items-center justify-between py-1">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-white text-xs font-bold" numberOfLines={1}>{fix.teamA.name}</Text>
                  </View>
                  <Text className="text-[#23c55e] text-xs font-bold px-3">VS</Text>
                  <View className="flex-row items-center flex-1 justify-end">
                    <Text className="text-white text-xs font-bold" numberOfLines={1}>{fix.teamB.name}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-[#1a1a1a]">
                  <Text className="text-[#666666] text-[10px]" numberOfLines={1}>
                    <Feather name="map-pin" size={10} /> {fix.venue}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setEditingFixture(fix);
                      setEditDate(fix.date);
                      setEditTime(fix.time);
                      setEditVenue(fix.venue);
                    }}
                  >
                    <Text className="text-[#23c55e] text-[11px] font-semibold">Edit Schedule</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="bg-[#121212] p-8 rounded-2xl border border-[#222222] items-center justify-center">
            <Feather name="calendar" size={32} color="#666666" className="mb-2" />
            <Text className="text-white text-sm font-bold mb-1">No Fixtures Generated Yet</Text>
            <Text className="text-[#888888] text-xs text-center mb-3">
              Tap "Auto Generate" above to create tournament pairings automatically.
            </Text>
          </View>
        )}
      </View>
    );
  };

  // -------------------------------------------------------------
  // RENDER STEP 6: REVIEW & PUBLISH
  // -------------------------------------------------------------
  const renderStep6 = () => (
    <View className="mb-6">
      <Text className="text-white text-lg font-bold mb-1">Review & Publish</Text>
      <Text className="text-[#888888] text-xs mb-4">Confirm all tournament details before publishing to EZKORA.</Text>

      {/* Summary Card */}
      <View className="bg-[#121212] p-4 rounded-2xl border border-[#222222] mb-4">
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 rounded-xl bg-[#23c55e]/20 border border-[#23c55e] items-center justify-center mr-3">
            <MaterialCommunityIcons name="trophy" size={24} color="#23c55e" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-base font-bold">{name || 'Tournament'}</Text>
            <Text className="text-[#888888] text-xs">{city} • {formatType.replace('_', ' ')}</Text>
          </View>
        </View>

        <View className="border-t border-[#1a1a1a] pt-3 gap-2">
          <View className="flex-row justify-between">
            <Text className="text-[#888888] text-xs">Format:</Text>
            <Text className="text-white text-xs font-semibold">{formatType.replace('_', ' ')}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[#888888] text-xs">Ball & Overs:</Text>
            <Text className="text-white text-xs font-semibold">{ballType} • {oversPerInnings} Overs</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[#888888] text-xs">Dates:</Text>
            <Text className="text-white text-xs font-semibold">{startDate} to {endDate}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[#888888] text-xs">Venue:</Text>
            <Text className="text-white text-xs font-semibold">{venue}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[#888888] text-xs">Invited Teams:</Text>
            <Text className="text-[#23c55e] text-xs font-bold">{selectedTeams.length} Teams</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[#888888] text-xs">Total Fixtures:</Text>
            <Text className="text-[#23c55e] text-xs font-bold">{fixtures.length} Matches</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="gap-3">
        <TouchableOpacity
          className="bg-[#23c55e] py-4 rounded-xl items-center justify-center"
          onPress={handlePublishTournament}
        >
          <Text className="text-black text-sm font-bold">Publish Tournament</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#161616] border border-[#262626] py-3.5 rounded-xl items-center justify-center"
          onPress={handleSaveDraft}
        >
          <Text className="text-white text-sm font-semibold">Save Draft</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-[#222222]">
        <TouchableOpacity onPress={handleBack} className="p-1">
          <Feather name="arrow-left" size={22} color="#ffffff" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white text-sm font-bold">Create Tournament</Text>
          <Text className="text-[#888888] text-[10px]">Step {currentStep} of {totalSteps}</Text>
        </View>
        <TouchableOpacity
          onPress={handleSaveDraft}
          disabled={isSavingDraft}
          className="bg-[#181818] border border-[#23c55e]/40 px-2.5 py-1 rounded-lg flex-row items-center"
        >
          <Feather name="save" size={11} color="#23c55e" className="mr-1" />
          <Text className="text-[#23c55e] text-[11px] font-bold">
            {isSavingDraft ? 'Saving...' : saveStatusText || 'Save Draft'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Step Progress Bar */}
      <View className="w-full h-1 bg-[#1a1a1a]">
        <View
          className="h-full bg-[#23c55e]"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </View>

      {/* Scrollable Step Content */}
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </ScrollView>

      {/* Bottom Sticky Navigation */}
      {currentStep < 6 && (
        <View className="flex-row p-4 border-t border-[#222222] bg-[#0a0a0a] gap-3">
          <TouchableOpacity
            className="flex-1 bg-[#161616] border border-[#262626] py-3.5 rounded-xl items-center justify-center"
            onPress={handleBack}
          >
            <Text className="text-white text-xs font-bold">{currentStep === 1 ? 'Cancel' : 'Back'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-[#23c55e] py-3.5 rounded-xl items-center justify-center"
            onPress={handleNext}
          >
            <Text className="text-black text-xs font-bold">Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Fixture Modal */}
      {editingFixture && (
        <Modal transparent animationType="fade">
          <View className="flex-1 bg-black/80 items-center justify-center px-4">
            <View className="bg-[#121212] w-full max-w-sm p-5 rounded-2xl border border-[#262626]">
              <Text className="text-white text-sm font-bold mb-3">Edit Fixture Schedule</Text>

              <Text className="text-[#888888] text-xs mb-1">Date</Text>
              <TextInput
                className="bg-[#161616] border border-[#262626] rounded-xl px-3 py-2 text-white text-xs mb-3"
                value={editDate}
                onChangeText={setEditDate}
              />

              <Text className="text-[#888888] text-xs mb-1">Time</Text>
              <TextInput
                className="bg-[#161616] border border-[#262626] rounded-xl px-3 py-2 text-white text-xs mb-3"
                value={editTime}
                onChangeText={setEditTime}
              />

              <Text className="text-[#888888] text-xs mb-1">Venue</Text>
              <TextInput
                className="bg-[#161616] border border-[#262626] rounded-xl px-3 py-2 text-white text-xs mb-4"
                value={editVenue}
                onChangeText={setEditVenue}
              />

              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-[#161616] py-2.5 rounded-xl items-center"
                  onPress={() => setEditingFixture(null)}
                >
                  <Text className="text-[#888888] text-xs font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-[#23c55e] py-2.5 rounded-xl items-center"
                  onPress={() => {
                    setFixtures((prev) =>
                      prev.map((f) =>
                        f.id === editingFixture.id
                          ? { ...f, date: editDate, time: editTime, venue: editVenue }
                          : f
                      )
                    );
                    setEditingFixture(null);
                  }}
                >
                  <Text className="text-black text-xs font-bold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
