import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

// Reusable Components
import ProgressIndicator from '../../components/ProgressIndicator';
import SportCard from '../../components/SportCard';
import PrimaryButton from '../../components/PrimaryButton';

export default function ChooseSportScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  // Cricket is selected by default based on your UI prompt
  const [selectedSport, setSelectedSport] = useState('Cricket');

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      
      {/* Header & Progress */}
      <View className="flex-row items-center px-6 pt-2 mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View className="flex-1 px-8 pt-2">
           <ProgressIndicator totalSteps={4} currentStep={2} />
        </View>
        <View className="w-6" />
      </View>

      <ScrollView contentContainerClassName="px-6 pb-6" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold mb-2" style={{ color: theme.text }}>Choose Your Sport</Text>
        <Text className="text-sm mb-8" style={{ color: theme.subText }}>Select the sport you're most passionate about.</Text>

        <View className="flex-1">
          <SportCard 
            sport="Cricket" 
            description="Join matches, tournaments and build your cricket journey." 
            icon="baseball-outline"
            isSelected={selectedSport === 'Cricket'}
            onPress={() => setSelectedSport('Cricket')}
          />
          <SportCard 
            sport="Badminton" 
            description="Play, compete and connect with badminton players." 
            icon="tennisball-outline"
            isSelected={selectedSport === 'Badminton'}
            onPress={() => setSelectedSport('Badminton')}
          />
          <SportCard 
            sport="Football" 
            description="Join games, leagues and football communities." 
            icon="football-outline"
            isSelected={selectedSport === 'Football'}
            onPress={() => setSelectedSport('Football')}
          />
          <SportCard 
            sport="Basketball" 
            description="Compete, connect and improve your game." 
            icon="basketball-outline"
            isSelected={selectedSport === 'Basketball'}
            onPress={() => setSelectedSport('Basketball')}
          />
          <SportCard 
            sport="Volleyball" 
            description="Join matches and tournaments with volleyball players." 
            icon="aperture-outline"
            isSelected={selectedSport === 'Volleyball'}
            onPress={() => setSelectedSport('Volleyball')}
          />
          <SportCard 
            sport="More Coming Soon" 
            description="More sports are on the way. Stay tuned!" 
            icon="ellipsis-horizontal"
            isSelected={false}
            onPress={() => {}}
          />
        </View>
      </ScrollView>

      {/* Footer Area */}
      <View className="px-6 pb-8 pt-4" style={{ backgroundColor: theme.background }}>
        <PrimaryButton 
          title="Continue" 
          onPress={() => navigation.navigate('CricketProfile')} 
          disabled={!selectedSport}
        />
        <View className="mt-8">
           <ProgressIndicator totalSteps={4} currentStep={3} />
        </View>
        
        {/* Footer Info Area */}
        <View className="flex-row mt-4">
           <Feather name="activity" size={40} color={theme.primary} className="mr-4" />
           <View className="flex-1">
             <Text className="text-sm font-bold mb-1" style={{ color: theme.text }}>CHOOSE YOUR SPORT</Text>
             <Text className="text-xs mb-2" style={{ color: theme.subText }}>Pick the sport you love. More sports coming soon.</Text>
             <Text className="text-xs mb-1" style={{ color: theme.subText }}><Feather name="check" size={14} color={theme.primary}/> Multiple sports to choose from</Text>
             <Text className="text-xs mb-1" style={{ color: theme.subText }}><Feather name="check" size={14} color={theme.primary}/> Cricket-first approach</Text>
             <Text className="text-xs mb-1" style={{ color: theme.subText }}><Feather name="check" size={14} color={theme.primary}/> Easy selection</Text>
           </View>
        </View>
      </View>
    </SafeAreaView>
  );
}