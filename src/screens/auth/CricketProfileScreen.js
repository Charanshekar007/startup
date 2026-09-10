import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

// Reusable Components
import StepProgress from '../../components/StepProgress';
import SelectionChip from '../../components/SelectionChip';
import TeamCard from '../../components/TeamCard';
import PrimaryButton from '../../components/PrimaryButton';

export default function CricketProfileScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);

  // --- Form State ---
  const [role, setRole] = useState('Batter');
  const [batting, setBatting] = useState('Right Hand');
  const [bowling, setBowling] = useState(null); 
  const [experience, setExperience] = useState('Advanced');
  const [interests, setInterests] = useState(['Matches', 'Tournaments', 'Stats & Analytics', 'Player Rankings']);

  // --- Team Search State ---
  const [teams, setTeams] = useState([]); 
  const [isSearchingTeam, setIsSearchingTeam] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleInterest = (val) => {
    setInterests(prev => 
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
    );
  };

  const handleAddTeam = () => {
    if (searchQuery.trim().length > 0) {
      setTeams([...teams, { name: searchQuery, location: 'Added via search' }]);
      setSearchQuery('');
      setIsSearchingTeam(false);
    }
  };

  const steps = [
    { id: 1, label: 'Core Profile' },
    { id: 2, label: 'Choose Sport' },
    { id: 3, label: 'Sport Profile' },
    { id: 4, label: 'Complete' },
  ];

  const SectionHeader = ({ num, title }) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{num}. {title}</Text>
      <Feather name="info" size={14} color={theme.subText} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Title Area */}
        <View style={styles.titleArea}>
          <View style={styles.titleContent}>
            <Text style={[styles.badge, { color: theme.primary }]}>Profile Setup</Text>
            <Text style={[styles.title, { color: theme.text }]}>Cricket Profile</Text>
            <Text style={[styles.subtitle, { color: theme.subText }]}>Tell us about your cricket experience</Text>
          </View>
          <View style={styles.visualPlaceholder}>
             <Ionicons name="baseball" size={60} color={theme.primary} style={{ opacity: 0.5 }} />
          </View>
        </View>

        {/* Custom Progress Tracker */}
        <StepProgress steps={steps} currentStep={3} />

        {/* 1. Playing Role */}
        <View style={[styles.section, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <SectionHeader num="1" title="Playing Role" />
          <View style={styles.chipRow}>
            <SelectionChip label="Batter" icon="bat" isSelected={role === 'Batter'} onPress={() => setRole('Batter')} />
            <SelectionChip label="Bowler" icon="baseball" isSelected={role === 'Bowler'} onPress={() => setRole('Bowler')} />
            <SelectionChip label="All Rounder" icon="star" isSelected={role === 'All Rounder'} onPress={() => setRole('All Rounder')} />
            <SelectionChip label="Wicket Keeper" icon="hand-back-right" isSelected={role === 'Wicket Keeper'} onPress={() => setRole('Wicket Keeper')} />
          </View>
        </View>

        {/* 2. Batting Style */}
        <View style={[styles.section, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <SectionHeader num="2" title="Batting Style" />
          <View style={styles.chipRow}>
            <SelectionChip label="Right Hand" icon="pencil" isSelected={batting === 'Right Hand'} onPress={() => setBatting('Right Hand')} />
            <SelectionChip label="Left Hand" icon="pencil-off" isSelected={batting === 'Left Hand'} onPress={() => setBatting('Left Hand')} />
            <SelectionChip label="Switch Hitter" icon="swap-horizontal" isSelected={batting === 'Switch Hitter'} onPress={() => setBatting('Switch Hitter')} />
          </View>
        </View>

        {/* 3. Bowling Style */}
        <View style={[styles.section, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <SectionHeader num="3" title="Bowling Style" />
          <View style={styles.chipRow}>
            <SelectionChip label="Right Arm Fast" icon="run" isSelected={bowling === 'Right Arm Fast'} onPress={() => setBowling('Right Arm Fast')} />
            <SelectionChip label="Left Arm Fast" icon="run" isSelected={bowling === 'Left Arm Fast'} onPress={() => setBowling('Left Arm Fast')} />
            <SelectionChip label="Right Arm Spin" icon="rotate-right" isSelected={bowling === 'Right Arm Spin'} onPress={() => setBowling('Right Arm Spin')} />
            <SelectionChip label="Left Arm Spin" icon="rotate-left" isSelected={bowling === 'Left Arm Spin'} onPress={() => setBowling('Left Arm Spin')} />
            <SelectionChip label="Off Spin" icon="sync" isSelected={bowling === 'Off Spin'} onPress={() => setBowling('Off Spin')} />
            <SelectionChip label="Leg Spin" icon="sync" isSelected={bowling === 'Leg Spin'} onPress={() => setBowling('Leg Spin')} />
          </View>
        </View>

        {/* 4. Experience Level */}
        <View style={[styles.section, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <SectionHeader num="4" title="Experience Level" />
          <View style={[styles.segmentedControl, { backgroundColor: theme.background, borderColor: theme.inputBorder }]}>
            {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
              <TouchableOpacity 
                key={level} 
                style={[
                  styles.segmentBtn, 
                  experience === level && { backgroundColor: theme.isDark ? 'rgba(50, 215, 75, 0.1)' : 'rgba(50, 215, 75, 0.15)', borderColor: theme.primary, borderWidth: 1 }
                ]}
                onPress={() => setExperience(level)}
              >
                <Text style={[styles.segmentText, { color: theme.subText }, experience === level && { color: theme.primary }]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. Teams */}
        <View style={[styles.section, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <SectionHeader num="5" title="Teams You Are Part Of" />
          
          {teams.map((team, index) => (
            <TeamCard key={index} name={team.name} location={team.location} />
          ))}

          {isSearchingTeam ? (
            <View style={styles.searchContainer}>
              <TextInput
                style={[styles.searchInput, { backgroundColor: theme.background, borderColor: theme.inputBorder, color: theme.text }]}
                placeholder="Search team name..."
                placeholderTextColor={theme.subText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              <TouchableOpacity onPress={handleAddTeam} style={styles.addBtn}>
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSearchingTeam(false)} style={styles.cancelBtn}>
                <Text style={{ color: theme.subText }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addTeamBtn} onPress={() => setIsSearchingTeam(true)}>
              <Text style={[styles.addTeamText, { color: theme.primary }]}>
                + {teams.length > 0 ? 'Add Another Team' : 'Add Team'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 6. Cricket Interests */}
        <View style={[styles.section, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>6. Cricket Interests <Text style={{ color: theme.subText, fontWeight: '400', fontSize: 12 }}>(Select all that apply)</Text></Text>
            <Feather name="info" size={14} color={theme.subText} />
          </View>
          <View style={styles.chipRow}>
            {['Matches', 'Tournaments', 'Stats & Analytics', 'Player Rankings', 'Coaching', 'Fantasy'].map((interest) => (
              <SelectionChip 
                key={interest} 
                label={interest} 
                isSelected={interests.includes(interest)} 
                isMultiSelect={true}
                onPress={() => toggleInterest(interest)} 
              />
            ))}
          </View>
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          
          {/* UPDATED BUTTON HERE - NOW MATCHES YOUR ARCHITECTURE */}
          <PrimaryButton 
            title="Continue" 
            onPress={() => {
              // SCENARIO 1: NEW USER
              // We structure the data to match your Account vs Profile architecture!
              const newAccountData = {
                email: 'newuser@email.com',
                username: 'new_player'
              };

              const newCricketProfile = {
                id: 'prof_' + Math.random().toString(36).substr(2, 9),
                sport: 'Cricket',
                role: role,
                battingStyle: batting,
                bowlingStyle: bowling,
                experience: experience,
                teams: teams,
                interests: interests,
              };

              // login(accountData, sportProfilesArray, activeSport)
              login(newAccountData, [newCricketProfile], 'Cricket'); 
            }} 
          />
          
          <TouchableOpacity style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: theme.subText }]}>Skip for now</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, marginBottom: 16 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 32 },
  titleArea: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  titleContent: { flex: 1 },
  badge: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 13 },
  visualPlaceholder: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  section: { marginBottom: 24, padding: 16, borderRadius: 12, borderWidth: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginRight: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  segmentedControl: { borderRadius: 6, borderWidth: 1, padding: 2, flexDirection: 'row' },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 4 },
  segmentText: { fontSize: 11, fontWeight: '500' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  searchInput: { flex: 1, height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginRight: 8 },
  addBtn: { paddingVertical: 10, paddingHorizontal: 12 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 8 },
  addTeamBtn: { alignItems: 'center', paddingVertical: 12 },
  addTeamText: { fontSize: 13, fontWeight: '600' },
  footer: { marginTop: 16, alignItems: 'center' },
  skipBtn: { marginTop: 16, padding: 8 },
  skipText: { fontSize: 13 }
});