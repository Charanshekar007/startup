import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { saveUser } from '../../store/userRepository';

// Reusable Components
import StepProgress from '../../components/StepProgress';
import SelectionChip from '../../components/SelectionChip';
import TeamCard from '../../components/TeamCard';
import PrimaryButton from '../../components/PrimaryButton';

export default function CricketProfileScreen({ route }) {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);

  // Grab route credentials passed from signup steps
  const { fullName, username, email, password, sport } = route?.params || {};

  // --- Form State ---
  const [location, setLocation] = useState(route?.params?.location || 'Hyderabad, India');
  const [role, setRole] = useState('Batter');
  const [batting, setBatting] = useState('Right Hand');
  const [bowling, setBowling] = useState('None'); 
  const [experience, setExperience] = useState('Club');
  const [interests, setInterests] = useState(['Matches', 'Tournaments', 'Stats & Analytics', 'Player Rankings']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Team Search State ---
  const [teams, setTeams] = useState([{ name: 'Warriors XI', location: 'Hyderabad' }]); 
  const [isSearchingTeam, setIsSearchingTeam] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleInterest = (val) => {
    setInterests(prev => 
      prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val]
    );
  };

  const handleAddTeam = () => {
    if (searchQuery.trim().length > 0) {
      setTeams([...teams, { name: searchQuery.trim(), location: location || 'Local Club' }]);
      setSearchQuery('');
      setIsSearchingTeam(false);
    }
  };

  const handleQuickAddTeam = (teamName) => {
    if (!teams.some(t => t.name === teamName)) {
      setTeams([...teams, { name: teamName, location: location || 'City' }]);
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

  const handleContinue = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const userId = 'usr_' + Date.now();
      const cleanUsername = username ? username.replace(/^@/, '') : 'player_' + Math.random().toString(36).substr(2, 5);
      const cleanName = fullName || 'Player';
      const primaryTeamName = teams.length > 0 ? teams[0].name : '';

      const newAccount = {
        id: userId,
        name: cleanName,
        username: cleanUsername,
        email: email || `${cleanUsername}@example.com`,
        password: password || 'password123',
        location: location.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=1e3a29&color=23c55e`,
        followers: 0,
        following: 0,
        posts: 0,
      };

      const newCricketProfile = {
        id: 'prof_' + Math.random().toString(36).substr(2, 9),
        sport: sport || 'Cricket',
        role: role === 'Batter' ? 'Batsman' : role,
        battingStyle: batting === 'Right Hand' ? 'Right-Handed' : batting === 'Left Hand' ? 'Left-Handed' : batting,
        bowlingStyle: bowling || 'None',
        experience: experience || 'Club',
        primaryTeam: primaryTeamName,
        teams: teams,
        interests: interests,
      };

      const fullUserData = {
        id: userId,
        account: newAccount,
        sportProfiles: [newCricketProfile],
        activeSport: sport || 'Cricket',
      };

      // 1. Save to persistent user database
      await saveUser(fullUserData);

      // 2. Log in active session
      login(newAccount, [newCricketProfile], sport || 'Cricket');
    } catch (err) {
      console.error('Error during profile completion:', err);
      setIsSubmitting(false);
    }
  };

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

        {/* 1. Location */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="1" title="Location / City" />
          <View className="flex-row items-center border rounded-lg px-3 h-12" style={{ backgroundColor: theme.background, borderColor: theme.inputBorder }}>
            <Feather name="map-pin" size={16} color={theme.subText} style={{ marginRight: 8 }} />
            <TextInput
              className="flex-1 text-sm h-full"
              style={{ color: theme.text }}
              placeholder="e.g. Hyderabad, India"
              placeholderTextColor={theme.subText}
              value={location}
              onChangeText={setLocation}
            />
          </View>
        </View>

        {/* 2. Playing Role */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="2" title="Playing Role" />
          <View className="flex-row flex-wrap">
            <SelectionChip label="Batsman" icon="bat" isSelected={role === 'Batsman' || role === 'Batter'} onPress={() => setRole('Batsman')} />
            <SelectionChip label="Bowler" icon="baseball" isSelected={role === 'Bowler'} onPress={() => setRole('Bowler')} />
            <SelectionChip label="All-Rounder" icon="star" isSelected={role === 'All-Rounder' || role === 'All Rounder'} onPress={() => setRole('All-Rounder')} />
            <SelectionChip label="Wicketkeeper" icon="hand-back-right" isSelected={role === 'Wicketkeeper' || role === 'Wicket Keeper'} onPress={() => setRole('Wicketkeeper')} />
          </View>
        </View>

        {/* 3. Batting Style */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="3" title="Batting Style" />
          <View className="flex-row flex-wrap">
            <SelectionChip label="Right-Handed" icon="pencil" isSelected={batting === 'Right Hand' || batting === 'Right-Handed'} onPress={() => setBatting('Right-Handed')} />
            <SelectionChip label="Left-Handed" icon="pencil-off" isSelected={batting === 'Left Hand' || batting === 'Left-Handed'} onPress={() => setBatting('Left-Handed')} />
            <SelectionChip label="Switch Hitter" icon="swap-horizontal" isSelected={batting === 'Switch Hitter'} onPress={() => setBatting('Switch Hitter')} />
          </View>
        </View>

        {/* 4. Bowling Style */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="4" title="Bowling Style" />
          <View className="flex-row flex-wrap">
            <SelectionChip label="None" icon="minus-circle" isSelected={bowling === 'None' || bowling === null} onPress={() => setBowling('None')} />
            <SelectionChip label="Right-Arm Medium" icon="run" isSelected={bowling === 'Right-Arm Medium' || bowling === 'Right Arm Medium'} onPress={() => setBowling('Right-Arm Medium')} />
            <SelectionChip label="Right-Arm Fast" icon="run" isSelected={bowling === 'Right-Arm Fast' || bowling === 'Right Arm Fast'} onPress={() => setBowling('Right-Arm Fast')} />
            <SelectionChip label="Left-Arm Fast" icon="run" isSelected={bowling === 'Left-Arm Fast' || bowling === 'Left Arm Fast'} onPress={() => setBowling('Left-Arm Fast')} />
            <SelectionChip label="Right-Arm Spin" icon="rotate-right" isSelected={bowling === 'Right-Arm Spin' || bowling === 'Right Arm Spin'} onPress={() => setBowling('Right-Arm Spin')} />
            <SelectionChip label="Left-Arm Spin" icon="rotate-left" isSelected={bowling === 'Left-Arm Spin' || bowling === 'Left Arm Spin'} onPress={() => setBowling('Left-Arm Spin')} />
            <SelectionChip label="Off Spin" icon="sync" isSelected={bowling === 'Off Spin'} onPress={() => setBowling('Off Spin')} />
            <SelectionChip label="Leg Spin" icon="sync" isSelected={bowling === 'Leg Spin'} onPress={() => setBowling('Leg Spin')} />
          </View>
        </View>

        {/* 5. Experience */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="5" title="Experience" />
          <View className="flex-row flex-wrap">
            {['College', 'Club', 'Turf', 'College • Club • Turf', 'Beginner', 'Advanced'].map((level) => (
              <SelectionChip 
                key={level} 
                label={level} 
                isSelected={experience === level} 
                onPress={() => setExperience(level)} 
              />
            ))}
          </View>
        </View>

        {/* 6. Teams */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <SectionHeader num="6" title="Teams You Are Part Of" />

          {/* Quick select suggestions */}
          <Text className="text-xs mb-2" style={{ color: theme.subText }}>Popular Teams (Tap to add):</Text>
          <View className="flex-row flex-wrap mb-3">
            {['Warriors XI', 'Falcons CC', 'Royal Strikers', 'Titans CC'].map((teamName) => (
              <TouchableOpacity
                key={teamName}
                onPress={() => handleQuickAddTeam(teamName)}
                className="mr-2 mb-2 px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: teams.some(t => t.name === teamName) ? 'rgba(50, 215, 75, 0.15)' : theme.background,
                  borderColor: teams.some(t => t.name === teamName) ? theme.primary : theme.inputBorder
                }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: teams.some(t => t.name === teamName) ? theme.primary : theme.text }}
                >
                  {teams.some(t => t.name === teamName) ? '✓ ' : '+ '}{teamName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {teams.map((team, index) => (
            <TeamCard key={index} name={team.name} location={team.location} />
          ))}

          {isSearchingTeam ? (
            <View className="flex-row items-center mt-2">
              <TextInput
                className="flex-1 h-11 border rounded-lg px-3 mr-2"
                style={{ backgroundColor: theme.background, borderColor: theme.inputBorder, color: theme.text }}
                placeholder="Search or enter team name..."
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

        {/* 7. Cricket Interests */}
        <View className="mb-6 p-4 rounded-xl border" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder }}>
          <View className="flex-row items-center mb-4">
            <Text className="text-sm font-semibold mr-[6px]" style={{ color: theme.text }}>7. Cricket Interests <Text className="font-normal text-xs" style={{ color: theme.subText }}>(Select all that apply)</Text></Text>
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
          <PrimaryButton 
            title={isSubmitting ? "Creating Profile..." : "Continue"} 
            onPress={handleContinue}
            disabled={isSubmitting}
          />
          
          <TouchableOpacity className="mt-4 p-2" onPress={handleContinue}>
            <Text className="text-[13px]" style={{ color: theme.subText }}>Skip for now</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}