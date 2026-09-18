import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
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
    <View className="flex-row items-center mb-4">
      <Text className="text-sm font-semibold mr-[6px]" style={{ color: theme.text }}>{num}. {title}</Text>
      <Feather name="info" size={14} color={theme.subText} />
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      
      {/* Header */}
      <View className="px-6 pt-2 mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerClassName="px-6 pb-8" showsVerticalScrollIndicator={false}>
        
        {/* Title Area */}
        <View className="flex-row justify-between mb-6">
          <View className="flex-1">
            <Text className="text-xs font-semibold mb-1" style={{ color: theme.primary }}>Profile Setup</Text>
            <Text className="text-[26px] font-bold mb-1" style={{ color: theme.text }}>Cricket Profile</Text>
            <Text className="text-[13px]" style={{ color: theme.subText }}>Tell us about your cricket experience</Text>
          </View>
          <View className="w-20 h-20 justify-center items-center">
             <Ionicons name="baseball" size={60} color={theme.primary} className="opacity-50" />
          </View>
        </View>

        {/* Custom Progress Tracker */}
        <StepProgress steps={steps} currentStep={3} />

        {/* 1. Playing Role */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="1" title="Playing Role" />
          <View className="flex-row flex-wrap">
            <SelectionChip label="Batter" icon="bat" isSelected={role === 'Batter'} onPress={() => setRole('Batter')} />
            <SelectionChip label="Bowler" icon="baseball" isSelected={role === 'Bowler'} onPress={() => setRole('Bowler')} />
            <SelectionChip label="All Rounder" icon="star" isSelected={role === 'All Rounder'} onPress={() => setRole('All Rounder')} />
            <SelectionChip label="Wicket Keeper" icon="hand-back-right" isSelected={role === 'Wicket Keeper'} onPress={() => setRole('Wicket Keeper')} />
          </View>
        </View>

        {/* 2. Batting Style */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="2" title="Batting Style" />
          <View className="flex-row flex-wrap">
            <SelectionChip label="Right Hand" icon="pencil" isSelected={batting === 'Right Hand'} onPress={() => setBatting('Right Hand')} />
            <SelectionChip label="Left Hand" icon="pencil-off" isSelected={batting === 'Left Hand'} onPress={() => setBatting('Left Hand')} />
            <SelectionChip label="Switch Hitter" icon="swap-horizontal" isSelected={batting === 'Switch Hitter'} onPress={() => setBatting('Switch Hitter')} />
          </View>
        </View>

        {/* 3. Bowling Style */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="3" title="Bowling Style" />
          <View className="flex-row flex-wrap">
            <SelectionChip label="Right Arm Fast" icon="run" isSelected={bowling === 'Right Arm Fast'} onPress={() => setBowling('Right Arm Fast')} />
            <SelectionChip label="Left Arm Fast" icon="run" isSelected={bowling === 'Left Arm Fast'} onPress={() => setBowling('Left Arm Fast')} />
            <SelectionChip label="Right Arm Spin" icon="rotate-right" isSelected={bowling === 'Right Arm Spin'} onPress={() => setBowling('Right Arm Spin')} />
            <SelectionChip label="Left Arm Spin" icon="rotate-left" isSelected={bowling === 'Left Arm Spin'} onPress={() => setBowling('Left Arm Spin')} />
            <SelectionChip label="Off Spin" icon="sync" isSelected={bowling === 'Off Spin'} onPress={() => setBowling('Off Spin')} />
            <SelectionChip label="Leg Spin" icon="sync" isSelected={bowling === 'Leg Spin'} onPress={() => setBowling('Leg Spin')} />
          </View>
        </View>

        {/* 4. Experience Level */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="4" title="Experience Level" />
          <View className="rounded-md border p-[2px] flex-row" style={{ backgroundColor: theme.background, borderColor: theme.inputBorder }}>
            {['Beginner', 'Intermediate', 'Advanced', 'Professional'].map((level) => (
              <TouchableOpacity 
                key={level} 
                className="flex-1 py-2 items-center rounded"
                style={experience === level ? { backgroundColor: theme.isDark ? 'rgba(50, 215, 75, 0.1)' : 'rgba(50, 215, 75, 0.15)', borderColor: theme.primary, borderWidth: 1 } : undefined}
                onPress={() => setExperience(level)}
              >
                <Text className="text-[11px] font-medium" style={[{ color: theme.subText }, experience === level && { color: theme.primary }]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. Teams */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="5" title="Teams You Are Part Of" />
          
          {teams.map((team, index) => (
            <TeamCard key={index} name={team.name} location={team.location} />
          ))}

          {isSearchingTeam ? (
            <View className="flex-row items-center mt-2">
              <TextInput
                className="flex-1 h-11 border rounded-lg px-3 mr-2"
                style={{ backgroundColor: theme.background, borderColor: theme.inputBorder, color: theme.text }}
                placeholder="Search team name..."
                placeholderTextColor={theme.subText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
              <TouchableOpacity onPress={handleAddTeam} className="py-[10px] px-3">
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSearchingTeam(false)} className="py-[10px] px-2">
                <Text style={{ color: theme.subText }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity className="items-center py-3" onPress={() => setIsSearchingTeam(true)}>
              <Text className="text-[13px] font-semibold" style={{ color: theme.primary }}>
                + {teams.length > 0 ? 'Add Another Team' : 'Add Team'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 6. Cricket Interests */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <View className="flex-row items-center mb-4">
            <Text className="text-sm font-semibold mr-[6px]" style={{ color: theme.text }}>6. Cricket Interests <Text className="font-normal text-xs" style={{ color: theme.subText }}>(Select all that apply)</Text></Text>
            <Feather name="info" size={14} color={theme.subText} />
          </View>
          <View className="flex-row flex-wrap">
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
        <View className="mt-4 items-center">
          
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
          
          <TouchableOpacity className="mt-4 p-2">
            <Text className="text-[13px]" style={{ color: theme.subText }}>Skip for now</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}