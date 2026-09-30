import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';
// Added MaterialIcons here to fix the crash!
import { Feather, MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'; 
import { useMatches } from '../context/MatchContext';

const { width } = Dimensions.get('window');

const theme = {
  bg: '#0a0a0a',
  card: '#121212',
  cardLight: '#1a1a1a',
  primary: '#23c55e',
  primaryDark: 'rgba(35, 197, 94, 0.15)',
  text: '#ffffff',
  subText: '#888888',
  border: '#222222',
};

// ==========================================
// MOCK DATA
// ==========================================
const TEAM_A = { name: 'Falcons CC', logo: 'https://ui-avatars.com/api/?name=FC&background=1e3a29&color=fff' };
const TEAM_B = { name: 'Warriors XI', logo: 'https://ui-avatars.com/api/?name=WX&background=b9770e&color=fff' };

const PLAYERS_A = [
  { id: '1', name: 'Rohit Sharma (C)', role: 'Batter', img: 'https://ui-avatars.com/api/?name=RS&background=222&color=fff' },
  { id: '2', name: 'Arjun Reddy', role: 'All Rounder', img: 'https://ui-avatars.com/api/?name=AR&background=222&color=fff' },
  { id: '3', name: 'Vikram Singh', role: 'Batter', img: 'https://ui-avatars.com/api/?name=VS&background=222&color=fff' },
  { id: '4', name: 'Karthik Nair', role: 'WK Batter', img: 'https://ui-avatars.com/api/?name=KN&background=222&color=fff' },
];

// Added { navigation } prop to switch tabs at the end
export default function CreateScreen({ navigation }) {
  // State Machine: 0 = Hub, 1-7 = Flow Steps
  const [activeStep, setActiveStep] = useState(0);

  // Form State
  const [matchFormat, setMatchFormat] = useState('T20');
  const [matchType, setMatchType] = useState('Competitive');
  const [tossWinner, setTossWinner] = useState('A'); // Defaulted to avoid null errors
  const [tossDecision, setTossDecision] = useState('Bat');

  // Pull in our Global Store function
  const { addMatch } = useMatches();

  // Function to save the match and move to the live screen
  const handleStartMatch = () => {
    const newMatchData = {
      teamA: TEAM_A.name,
      teamB: TEAM_B.name,
      format: matchFormat,
      type: matchType,
      tossWinner: tossWinner === 'A' ? TEAM_A.name : TEAM_B.name,
      decision: tossDecision,
      status: 'Live',
      date: new Date().toLocaleDateString(),
    };

    // Fire it into the global store!
    addMatch(newMatchData);

    // Transition to the final "Match Started" screen
    setActiveStep(7);
  };

  // ==========================================
  // SHARED COMPONENTS
  // ==========================================
  const FlowHeader = ({ title, step, totalSteps }) => (
    <View style={styles.flowHeader}>
      <TouchableOpacity onPress={() => setActiveStep(activeStep > 0 ? activeStep - 1 : 0)} style={styles.headerIcon}>
        <Feather name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.flowTitle}>{title}</Text>
        {step > 0 && <Text style={styles.flowSubtitle}>Step {step} of {totalSteps}</Text>}
        {step > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.headerIcon}>
        <Feather name="arrow-right" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  const PrimaryButton = ({ title, onPress }) => (
    <View style={styles.btnContainer}>
      <TouchableOpacity style={styles.primaryBtn} onPress={onPress}>
        <Text style={styles.primaryBtnText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );

  // ==========================================
  // STEP 0: CREATE HUB
  // ==========================================
  const renderHub = () => (
    <View style={styles.container}>
      <View style={styles.hubHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <MaterialCommunityIcons name="alpha-p-box" size={32} color={theme.primary} style={{ marginRight: 8 }} />
          <Text style={styles.hubTitle}>Create</Text>
        </View>
        <Text style={styles.hubSubtitle}>Build, organize, and play</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        <TouchableOpacity style={styles.featuredCard} onPress={() => setActiveStep(1)} activeOpacity={0.9}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }} style={styles.featuredBg} />
          <View style={styles.featuredOverlay}>
            <View>
              <Text style={styles.featuredTitle}>Create Match</Text>
              <Text style={styles.featuredSub}>Set up a cricket match</Text>
            </View>
            <View style={styles.featuredArrowBtn}>
              <Feather name="arrow-right" size={20} color="#000" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridItem}>
            <MaterialCommunityIcons name="account-group" size={28} color={theme.primary} style={styles.gridIcon} />
            <Text style={styles.gridTitle}>Create Team</Text>
            <Text style={styles.gridSub}>Build your team and invite players</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Ionicons name="trophy" size={28} color="#f1c40f" style={styles.gridIcon} />
            <Text style={styles.gridTitle}>Create Tournament</Text>
            <Text style={styles.gridSub}>Organize a tournament or league</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.gridRow}>
          <TouchableOpacity style={styles.gridItem}>
            <Feather name="edit" size={28} color={theme.text} style={styles.gridIcon} />
            <Text style={styles.gridTitle}>Create Post</Text>
            <Text style={styles.gridSub}>Share moments with the community</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Feather name="calendar" size={28} color={theme.primary} style={styles.gridIcon} />
            <Text style={styles.gridTitle}>Create Event</Text>
            <Text style={styles.gridSub}>Plan an event or sports meetup</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.playNowBanner}>
          <View style={styles.playNowLeft}>
            <Ionicons name="flash" size={24} color="#f1c40f" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.playNowTitle}>Play Now</Text>
              <Text style={styles.playNowSub}>Find or start a game quickly</Text>
            </View>
          </View>
          <View style={styles.featuredArrowBtn}>
            <Feather name="arrow-right" size={20} color="#000" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  // ==========================================
  // STEP 1: MATCH DETAILS
  // ==========================================
  const renderStep1 = () => (
    <View style={styles.container}>
      <FlowHeader title="Create Match" step={1} totalSteps={5} />
      <ScrollView contentContainerStyle={styles.flowScroll}>
        <Text style={styles.stepTitle}>Match Details</Text>
        <Text style={styles.stepSubtitle}>Fill in the basic information</Text>

        <TouchableOpacity style={styles.dropdownInput}>
          <View><Text style={styles.dropdownLabel}>Team A</Text><Text style={styles.dropdownValue}>Select or create team</Text></View>
          <Feather name="chevron-down" size={20} color={theme.subText} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.dropdownInput}>
          <View><Text style={styles.dropdownLabel}>Team B</Text><Text style={styles.dropdownValue}>Select or create team</Text></View>
          <Feather name="chevron-down" size={20} color={theme.subText} />
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Match Format</Text>
        <View style={styles.pillRow}>
          {['T10', 'T20', 'ODI', 'Custom'].map(fmt => (
            <TouchableOpacity key={fmt} onPress={() => setMatchFormat(fmt)} style={[styles.pill, matchFormat === fmt && styles.pillActive]}>
              <Text style={[styles.pillText, matchFormat === fmt && styles.pillTextActive]}>{fmt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Match Type</Text>
        <View style={styles.pillRow}>
          {['Competitive', 'Friendly', 'Practice'].map(type => (
            <TouchableOpacity key={type} onPress={() => setMatchType(type)} style={[styles.pill, matchType === type && styles.pillActive]}>
              <Text style={[styles.pillText, matchType === type && styles.pillTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listSettings}>
          <TouchableOpacity style={styles.listItem}><Text style={styles.listItemLabel}>Venue</Text><View style={styles.listItemRight}><Text style={styles.listItemValue}>Select venue</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity style={styles.listItem}><Text style={styles.listItemLabel}>Date</Text><View style={styles.listItemRight}><Text style={styles.listItemValue}>Select date</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity style={styles.listItem}><Text style={styles.listItemLabel}>Time</Text><View style={styles.listItemRight}><Text style={styles.listItemValue}>Select time</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity style={styles.listItem}><Text style={styles.listItemLabel}>Overs</Text><View style={styles.listItemRight}><Text style={styles.listItemValue}>20 Overs</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity style={styles.listItem}><Text style={styles.listItemLabel}>Players / Squads</Text><View style={styles.listItemRight}><Text style={styles.listItemValue}>Select players</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
          <TouchableOpacity style={[styles.listItem, { borderBottomWidth: 0 }]}><Text style={styles.listItemLabel}>Match Rules</Text><View style={styles.listItemRight}><Text style={styles.listItemValue}>Set match rules</Text><Feather name="chevron-right" size={16} color={theme.subText}/></View></TouchableOpacity>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue" onPress={() => setActiveStep(2)} />
    </View>
  );

  // ==========================================
  // STEP 2: MATCH SETUP (Review)
  // ==========================================
  const renderStep2 = () => (
    <View style={styles.container}>
      <FlowHeader title="Create Match" step={2} totalSteps={5} />
      <ScrollView contentContainerStyle={styles.flowScroll}>
        <Text style={styles.stepTitle}>Match Setup</Text>
        <Text style={styles.stepSubtitle}>Review and confirm match details</Text>

        <View style={styles.vsContainer}>
          <View style={styles.vsTeam}>
            <Image source={{uri: TEAM_A.logo}} style={styles.vsLogo} />
            <Text style={styles.vsName}>{TEAM_A.name}</Text>
          </View>
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.vsTeam}>
            <Image source={{uri: TEAM_B.logo}} style={styles.vsLogo} />
            <Text style={styles.vsName}>{TEAM_B.name}</Text>
          </View>
        </View>

        <View style={styles.reviewList}>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Format</Text><Text style={styles.reviewValue}>{matchFormat}</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Match Type</Text><Text style={styles.reviewValue}>{matchType}</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Venue</Text><Text style={[styles.reviewValue, { textAlign: 'right', flex: 1, paddingLeft: 20 }]}>Rajiv Cricket Ground, Hyderabad</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Date</Text><Text style={styles.reviewValue}>18 May 2026</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Time</Text><Text style={styles.reviewValue}>04:00 PM</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Overs</Text><Text style={styles.reviewValue}>20 Overs</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Players</Text><Text style={styles.reviewValue}>11 vs 11</Text></View>
          <View style={[styles.reviewItem, { borderBottomWidth: 0 }]}><Text style={styles.reviewLabel}>Match Rules</Text><Text style={styles.reviewValue}>Standard Cricket Rules</Text></View>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue to Toss" onPress={() => setActiveStep(3)} />
    </View>
  );

  // ==========================================
  // STEP 3: TOSS (Fixed duplicates and Icons)
  // ==========================================
  const renderStep3 = () => (
    <View style={styles.container}>
      <FlowHeader title="Create Match" step={3} totalSteps={5} />
      <ScrollView contentContainerStyle={styles.flowScroll}>
        <Text style={styles.stepTitle}>Toss</Text>
        <Text style={styles.stepSubtitle}>Select the team that won the toss</Text>

        <View style={styles.tossTeamRow}>
          <TouchableOpacity style={[styles.tossTeamCard, tossWinner === 'A' && styles.tossTeamActive]} onPress={() => setTossWinner('A')}>
            <Image source={{uri: TEAM_A.logo}} style={styles.tossLogo} />
            <Text style={styles.tossName}>{TEAM_A.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tossTeamCard, tossWinner === 'B' && styles.tossTeamActive]} onPress={() => setTossWinner('B')}>
            <Image source={{uri: TEAM_B.logo}} style={styles.tossLogo} />
            <Text style={styles.tossName}>{TEAM_B.name}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.stepTitle, { marginTop: 24 }]}>Decision</Text>
        <Text style={styles.stepSubtitle}>What would you like to do?</Text>

        <View style={styles.tossTeamRow}>
          <TouchableOpacity style={[styles.decisionCard, tossDecision === 'Bat' && styles.decisionActive]} onPress={() => setTossDecision('Bat')}>
            <MaterialIcons name="sports-cricket" size={24} color={tossDecision === 'Bat' ? theme.primary : theme.text} style={{ marginBottom: 8 }} />
            <Text style={[styles.decisionText, tossDecision === 'Bat' && { color: theme.primary }]}>Bat First</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.decisionCard, tossDecision === 'Bowl' && styles.decisionActive]} onPress={() => setTossDecision('Bowl')}>
            <Ionicons name="tennisball-outline" size={24} color={tossDecision === 'Bowl' ? theme.primary : theme.text} style={{ marginBottom: 8 }} />
            <Text style={[styles.decisionText, tossDecision === 'Bowl' && { color: theme.primary }]}>Bowl First</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue" onPress={() => setActiveStep(4)} />
    </View>
  );

  // ==========================================
  // STEP 4: PLAYING XI
  // ==========================================
  const renderStep4 = () => (
    <View style={styles.container}>
      <FlowHeader title="Create Match" step={4} totalSteps={5} />
      <ScrollView contentContainerStyle={styles.flowScroll}>
        <Text style={styles.stepTitle}>Playing XI</Text>
        <Text style={styles.stepSubtitle}>Select playing eleven for both teams</Text>

        <View style={[styles.rosterCard, { borderColor: theme.primary }]}>
          <View style={styles.rosterHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{uri: TEAM_A.logo}} style={styles.rosterLogo} />
              <Text style={styles.rosterTeamName}>{TEAM_A.name}</Text>
            </View>
            <Text style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>8 / 11 selected</Text>
          </View>
          {PLAYERS_A.map(p => (
            <View key={p.id} style={styles.playerRow}>
              <Image source={{uri: p.img}} style={styles.playerAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.playerName}>{p.name}</Text>
                <Text style={styles.playerRole}>{p.role}</Text>
              </View>
              <Feather name="check-circle" size={20} color={theme.primary} />
            </View>
          ))}
          <TouchableOpacity style={styles.addMoreRow}>
            <Feather name="plus" size={16} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={styles.addMoreText}>Add more players</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rosterCard}>
          <View style={styles.rosterHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{uri: TEAM_B.logo}} style={styles.rosterLogo} />
              <Text style={styles.rosterTeamName}>{TEAM_B.name}</Text>
            </View>
            <Text style={{ color: '#f1c40f', fontSize: 12, fontWeight: 'bold' }}>7 / 11 selected</Text>
          </View>
          {PLAYERS_A.slice(0,2).map(p => (
            <View key={p.id} style={styles.playerRow}>
              <Image source={{uri: p.img}} style={styles.playerAvatar} />
              <View style={{ flex: 1 }}><Text style={styles.playerName}>Manoj Kumar (C)</Text><Text style={styles.playerRole}>All Rounder</Text></View>
              <Feather name="check-circle" size={20} color={theme.primary} />
            </View>
          ))}
          <TouchableOpacity style={styles.addMoreRow}>
            <Feather name="plus" size={16} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={styles.addMoreText}>Add more players</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <PrimaryButton title="Continue" onPress={() => setActiveStep(5)} />
    </View>
  );

  // ==========================================
  // STEP 5: OPENING PLAYERS
  // ==========================================
  const renderStep5 = () => (
    <View style={styles.container}>
      <FlowHeader title="Create Match" step={5} totalSteps={5} />
      <ScrollView contentContainerStyle={styles.flowScroll}>
        <Text style={styles.stepTitle}>Opening Players</Text>
        <Text style={styles.stepSubtitle}>Set the opening batter and bowler</Text>

        <Text style={[styles.sectionHeading, { color: theme.primary }]}>Select Opening Batters</Text>
        
        <View style={styles.playerSelectBox}>
          <Text style={styles.playerSelectNum}>1.</Text>
          <Image source={{uri: PLAYERS_A[1].img}} style={styles.playerSelectAvatar} />
          <Text style={styles.playerSelectName}>{PLAYERS_A[1].name}</Text>
          <View style={styles.playerSelectRight}>
            <Text style={styles.playerSelectHand}>RHB</Text>
            <Feather name="chevron-down" size={16} color={theme.subText} />
          </View>
        </View>
        <View style={styles.playerSelectBox}>
          <Text style={styles.playerSelectNum}>2.</Text>
          <Image source={{uri: PLAYERS_A[2].img}} style={styles.playerSelectAvatar} />
          <Text style={styles.playerSelectName}>{PLAYERS_A[2].name}</Text>
          <View style={styles.playerSelectRight}>
            <Text style={styles.playerSelectHand}>LHB</Text>
            <Feather name="chevron-down" size={16} color={theme.subText} />
          </View>
        </View>

        <Text style={[styles.sectionHeading, { color: theme.primary, marginTop: 24 }]}>Select Opening Bowler</Text>
        <View style={styles.playerSelectBox}>
          <Text style={styles.playerSelectNum}>1.</Text>
          <Image source={{uri: PLAYERS_A[0].img}} style={styles.playerSelectAvatar} />
          <Text style={styles.playerSelectName}>Manoj Kumar</Text>
          <View style={styles.playerSelectRight}>
            <Text style={styles.playerSelectHand}>RFM</Text>
            <Feather name="chevron-down" size={16} color={theme.subText} />
          </View>
        </View>
      </ScrollView>
      <PrimaryButton title="Start Scoring" onPress={() => setActiveStep(6)} />
    </View>
  );

  // ==========================================
  // STEP 6: MATCH CONFIRMATION
  // ==========================================
  const renderStep6 = () => (
    <View style={styles.container}>
      <FlowHeader title="Start Match" step={0} />
      <ScrollView contentContainerStyle={[styles.flowScroll, { alignItems: 'center' }]}>
        
        <View style={styles.readyCircle}>
          <Feather name="check" size={40} color={theme.primary} />
        </View>
        <Text style={styles.readyTitle}>Match is Ready!</Text>
        <Text style={styles.readySub}>Everything looks good.</Text>

        <View style={[styles.vsContainer, { marginTop: 32, marginBottom: 32, paddingHorizontal: 32 }]}>
          <View style={styles.vsTeam}>
            <Image source={{uri: TEAM_A.logo}} style={styles.vsLogoSmall} />
            <Text style={styles.vsNameSmall}>{TEAM_A.name}</Text>
          </View>
          <Text style={styles.vsTextSmall}>VS</Text>
          <View style={styles.vsTeam}>
            <Image source={{uri: TEAM_B.logo}} style={styles.vsLogoSmall} />
            <Text style={styles.vsNameSmall}>{TEAM_B.name}</Text>
          </View>
        </View>

        <View style={[styles.reviewList, { width: '100%' }]}>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Format</Text><Text style={styles.reviewValue}>{matchFormat}</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Venue</Text><Text style={[styles.reviewValue, { textAlign: 'right', flex: 1, paddingLeft: 20 }]}>Rajiv Cricket Ground, Hyderabad</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Date & Time</Text><Text style={styles.reviewValue}>18 May 2026, 04:00 PM</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Overs</Text><Text style={styles.reviewValue}>20 Overs</Text></View>
          <View style={styles.reviewItem}><Text style={styles.reviewLabel}>Toss</Text><Text style={styles.reviewValue}>{tossWinner === 'A' ? TEAM_A.name : TEAM_B.name} won the toss</Text></View>
          <View style={[styles.reviewItem, { borderBottomWidth: 0 }]}><Text style={styles.reviewLabel}>Decision</Text><Text style={styles.reviewValue}>{tossDecision} First</Text></View>
        </View>
      </ScrollView>
      {/* WIRED UP THE START BUTTON */}
      <PrimaryButton title="Start Match & Begin Scoring" onPress={handleStartMatch} />
    </View>
  );

  // ==========================================
  // STEP 7: LIVE MATCH STARTED
  // ==========================================
  const renderStep7 = () => (
    <View style={styles.container}>
      <FlowHeader title="Match Started" step={0} />
      <ScrollView contentContainerStyle={styles.flowScroll}>
        
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Text style={styles.readyTitle}>Let's begin the game!</Text>
          <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
        </View>

        <View style={styles.scoreboardCard}>
          <View style={styles.scoreTopRow}>
            <View style={{ alignItems: 'center' }}>
              <Image source={{uri: TEAM_A.logo}} style={styles.vsLogo} />
              <Text style={styles.scoreMain}>0/0</Text>
              <Text style={styles.scoreSub}>0.0 Overs</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={{ alignItems: 'center' }}>
              <Image source={{uri: TEAM_B.logo}} style={styles.vsLogo} />
              <Text style={[styles.vsName, { marginTop: 12 }]}>{TEAM_B.name}</Text>
            </View>
          </View>
          <View style={styles.scoreFooter}>
            <Text style={styles.scoreFooterText}>{tossWinner === 'A' ? TEAM_A.name : TEAM_B.name} won the toss and elected to {tossDecision}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Next Up</Text>
        <View style={styles.nextUpCard}>
          <View style={styles.nextUpRow}>
            <Text style={styles.nextUpRole}>On Strike</Text>
            <Image source={{uri: PLAYERS_A[1].img}} style={styles.nextUpAvatar} />
            <Text style={styles.nextUpName}>{PLAYERS_A[1].name}</Text>
            <Text style={styles.nextUpStats}>0 (0)</Text>
          </View>
          <View style={[styles.nextUpRow, { borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 16 }]}>
            <Text style={[styles.nextUpRole, { color: 'transparent' }]}>On Strike</Text>
            <Image source={{uri: PLAYERS_A[2].img}} style={styles.nextUpAvatar} />
            <Text style={styles.nextUpName}>{PLAYERS_A[2].name}</Text>
            <Text style={styles.nextUpStats}>0 (0)</Text>
          </View>
          <View style={[styles.nextUpRow, { paddingTop: 16 }]}>
            <Text style={styles.nextUpRole}>Bowler</Text>
            <Image source={{uri: PLAYERS_A[0].img}} style={styles.nextUpAvatar} />
            <Text style={styles.nextUpName}>Manoj Kumar</Text>
            <Text style={styles.nextUpStats}>0-0 (0.0)</Text>
          </View>
        </View>
      </ScrollView>
      {/* WIRED UP THE NAVIGATION BUTTON */}
      <PrimaryButton 
        title="Go to Live Scoring" 
        onPress={() => {
          setActiveStep(0);
          navigation.navigate('Matches');
        }} 
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      {activeStep === 0 && renderHub()}
      {activeStep === 1 && renderStep1()}
      {activeStep === 2 && renderStep2()}
      {activeStep === 3 && renderStep3()}
      {activeStep === 4 && renderStep4()}
      {activeStep === 5 && renderStep5()}
      {activeStep === 6 && renderStep6()}
      {activeStep === 7 && renderStep7()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  flowScroll: { paddingHorizontal: 16, paddingBottom: 120, paddingTop: 8 },
  flowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerIcon: { padding: 4 },
  flowTitle: { color: theme.text, fontSize: 16, fontWeight: 'bold' },
  flowSubtitle: { color: theme.subText, fontSize: 11, marginTop: 2, marginBottom: 8 },
  progressContainer: { width: 100, height: 4, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: theme.primary },
  stepTitle: { color: theme.text, fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  stepSubtitle: { color: theme.subText, fontSize: 13, marginBottom: 24 },
  btnContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: theme.bg, borderTopWidth: 1, borderTopColor: theme.border },
  primaryBtn: { backgroundColor: theme.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
  hubHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  hubTitle: { color: theme.text, fontSize: 32, fontWeight: 'bold' },
  hubSubtitle: { color: theme.subText, fontSize: 14 },
  featuredCard: { width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  featuredBg: { width: '100%', height: '100%', opacity: 0.7 },
  featuredOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 20, justifyContent: 'space-between' },
  featuredTitle: { color: theme.text, fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  featuredSub: { color: '#e0e0e0', fontSize: 13 },
  featuredArrowBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  gridItem: { width: (width - 48) / 2, backgroundColor: theme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border },
  gridIcon: { marginBottom: 12 },
  gridTitle: { color: theme.text, fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  gridSub: { color: theme.subText, fontSize: 11, lineHeight: 16 },
  playNowBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.cardLight, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.border },
  playNowLeft: { flexDirection: 'row', alignItems: 'center' },
  playNowTitle: { color: theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  playNowSub: { color: theme.subText, fontSize: 12 },
  dropdownInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 16, marginBottom: 16 },
  dropdownLabel: { color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  dropdownValue: { color: theme.subText, fontSize: 12 },
  inputLabel: { color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 12, marginTop: 8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  pill: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, marginBottom: 10 },
  pillActive: { backgroundColor: theme.primaryDark, borderColor: theme.primary },
  pillText: { color: theme.text, fontSize: 13, fontWeight: '600' },
  pillTextActive: { color: theme.primary },
  listSettings: { backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border, marginTop: 12 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  listItemLabel: { color: theme.text, fontSize: 14 },
  listItemRight: { flexDirection: 'row', alignItems: 'center' },
  listItemValue: { color: theme.subText, fontSize: 13, marginRight: 8 },
  vsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.card, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: theme.border, marginBottom: 24 },
  vsTeam: { alignItems: 'center', flex: 1 },
  vsLogo: { width: 70, height: 70, borderRadius: 35, backgroundColor: theme.cardLight, marginBottom: 12 },
  vsName: { color: theme.text, fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  vsText: { color: theme.subText, fontSize: 16, fontWeight: 'bold', marginHorizontal: 16 },
  reviewList: { width: '100%' },
  reviewItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border },
  reviewLabel: { color: theme.subText, fontSize: 13 },
  reviewValue: { color: theme.text, fontSize: 13, fontWeight: 'bold' },
  tossTeamRow: { flexDirection: 'row', justifyContent: 'space-between' },
  tossTeamCard: { width: '48%', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 24, alignItems: 'center' },
  tossTeamActive: { borderColor: theme.primary, backgroundColor: theme.primaryDark },
  tossLogo: { width: 60, height: 60, borderRadius: 30, marginBottom: 12 },
  tossName: { color: theme.text, fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  decisionCard: { width: '48%', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 16, alignItems: 'center' },
  decisionActive: { borderColor: theme.primary, backgroundColor: theme.primaryDark },
  decisionText: { color: theme.text, fontSize: 14, fontWeight: 'bold' },
  rosterCard: { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 16, marginBottom: 16 },
  rosterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 12 },
  rosterLogo: { width: 28, height: 28, borderRadius: 14, marginRight: 10 },
  rosterTeamName: { color: theme.text, fontSize: 15, fontWeight: 'bold' },
  playerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  playerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  playerName: { color: theme.text, fontSize: 14, fontWeight: '600' },
  playerRole: { color: theme.subText, fontSize: 11, marginTop: 2 },
  addMoreRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  addMoreText: { color: theme.primary, fontSize: 13, fontWeight: 'bold' },
  sectionHeading: { color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  playerSelectBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 12, padding: 12, marginBottom: 12 },
  playerSelectNum: { color: theme.subText, fontSize: 14, fontWeight: 'bold', width: 20 },
  playerSelectAvatar: { width: 32, height: 32, borderRadius: 16, marginHorizontal: 12 },
  playerSelectName: { color: theme.text, fontSize: 14, fontWeight: '600', flex: 1 },
  playerSelectRight: { flexDirection: 'row', alignItems: 'center' },
  playerSelectHand: { color: theme.subText, fontSize: 11, marginRight: 8 },
  readyCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.primaryDark, borderWidth: 2, borderColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 16 },
  readyTitle: { color: theme.text, fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  readySub: { color: theme.subText, fontSize: 14 },
  vsLogoSmall: { width: 48, height: 48, borderRadius: 24, marginBottom: 8 },
  vsNameSmall: { color: theme.text, fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  vsTextSmall: { color: theme.subText, fontSize: 12, fontWeight: 'bold', marginHorizontal: 24 },
  liveBadge: { backgroundColor: '#e74c3c', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  scoreboardCard: { backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 24, marginBottom: 24 },
  scoreTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  scoreMain: { color: theme.text, fontSize: 32, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  scoreSub: { color: theme.subText, fontSize: 13 },
  scoreFooter: { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16, alignItems: 'center' },
  scoreFooterText: { color: theme.text, fontSize: 12, fontWeight: '500' },
  nextUpCard: { backgroundColor: theme.card, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16 },
  nextUpRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  nextUpRole: { color: theme.subText, fontSize: 11, width: 60 },
  nextUpAvatar: { width: 28, height: 28, borderRadius: 14, marginHorizontal: 12 },
  nextUpName: { color: theme.text, fontSize: 13, fontWeight: '600', flex: 1 },
  nextUpStats: { color: theme.text, fontSize: 13, fontWeight: 'bold' },
});