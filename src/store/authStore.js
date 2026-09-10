import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuthStore = create(
  persist(
    (set) => ({
      // --- 1. CORE AUTH STATE ---
      isAuthenticated: false,

      // --- 2. GLOBAL ACCOUNT DATA ---
      // (Name, Username, Email, Core Settings)
      accountData: null,

      // --- 3. MODULAR SPORT PROFILES ---
      // (Array containing Cricket Profile, Badminton Profile, etc.)
      sportProfiles: [],

      // --- 4. ACTIVE SPORT (The Lens) ---
      // (e.g., 'Cricket' or 'Badminton')
      activeSport: null,


      // --- ACTIONS ---

      // Log the user in with their full account and profiles
      login: (account, profiles, active) => set({ 
        isAuthenticated: true, 
        accountData: account,
        sportProfiles: profiles || [],
        activeSport: active || null
      }),

      // Switch the active sport without logging out (Rule 5 & 6)
      setActiveSport: (sportName) => set({
        activeSport: sportName
      }),

      // Add a newly created sport profile to the existing account
      addSportProfile: (newProfile) => set((state) => ({
        sportProfiles: [...state.sportProfiles, newProfile]
      })),

      // Complete system wipe for log out
      logout: () => set({ 
        isAuthenticated: false, 
        accountData: null,
        sportProfiles: [],
        activeSport: null
      }),
    }),
    {
      name: 'sports-app-auth', 
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);