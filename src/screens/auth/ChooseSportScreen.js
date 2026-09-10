import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Header & Progress */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.topProgressWrapper}>
           <ProgressIndicator totalSteps={4} currentStep={2} />
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.text }]}>Choose Your Sport</Text>
        <Text style={[styles.subtitle, { color: theme.subText }]}>Select the sport you're most passionate about.</Text>

        <View style={styles.list}>
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
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <PrimaryButton 
          title="Continue" 
          onPress={() => navigation.navigate('CricketProfile')} 
          disabled={!selectedSport}
        />
        <View style={styles.bottomProgressWrapper}>
           <ProgressIndicator totalSteps={4} currentStep={3} />
        </View>
        
        {/* Footer Info Area */}
        <View style={styles.footerInfo}>
           <Feather name="activity" size={40} color={theme.primary} style={styles.footerIcon} />
           <View style={{flex: 1}}>
             <Text style={[styles.footerTitle, { color: theme.text }]}>CHOOSE YOUR SPORT</Text>
             <Text style={[styles.footerDesc, { color: theme.subText }]}>Pick the sport you love. More sports coming soon.</Text>
             <Text style={[styles.footerCheck, { color: theme.subText }]}><Feather name="check" size={14} color={theme.primary}/> Multiple sports to choose from</Text>
             <Text style={[styles.footerCheck, { color: theme.subText }]}><Feather name="check" size={14} color={theme.primary}/> Cricket-first approach</Text>
             <Text style={[styles.footerCheck, { color: theme.subText }]}><Feather name="check" size={14} color={theme.primary}/> Easy selection</Text>
           </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    marginBottom: 16,
  },
  topProgressWrapper: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 32,
  },
  list: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
  },
  bottomProgressWrapper: {
    marginTop: 32,
  },
  footerInfo: {
    flexDirection: 'row',
    marginTop: 16,
  },
  footerIcon: {
    marginRight: 16,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  footerDesc: {
    fontSize: 12,
    marginBottom: 8,
  },
  footerCheck: {
    fontSize: 12,
    marginBottom: 4,
  }
});