import type { StateCreator } from 'zustand';
import { tournaments, clubs as seedClubs, players as seedPlayers } from '../../data/mockData';
import { listPlayers, regeneratePlayers as regeneratePlayersFromService, clearAllCache as clearAllCacheFromService, savePlayers, initializePlayers } from '../../utils/playerService';
import { listPosts, initializePosts, clearPosts } from '../../utils/postService';
import { posts as seedPosts } from '../../data/posts';
import { listClubs, saveClubs, updateClub as updateClubService, deleteClub as deleteClubService, mergeClubsPreservingCustom } from '../../utils/clubService';
import { listTournaments } from '../../utils/tournamentService';
import { initializePlayerMarketData } from '../../utils/marketRules';
import type { Club, Player, Tournament, BlogPost } from '../../types';

// Import generateMatches function (defined in mockData.ts)
const generateMatches = (teams: string[], tournamentId: string, preseason: boolean = false) => {
  const matches: any[] = [];
  const rounds = preseason ? 1 : 2;
  const pastMatches = 6;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (pastMatches * 7));

  let matchId = 1;

  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        const homeTeam = round === 1 ? teams[i] : teams[j];
        const awayTeam = round === 1 ? teams[j] : teams[i];

        const matchDate = new Date(startDate);
        matchDate.setDate(startDate.getDate() + (matchId - 1) * 7);

        const isPastMatch = matchId <= pastMatches;

        const match: any = {
          id: `match${matchId}`,
          tournamentId,
          round: Math.ceil(matchId / (teams.length * (teams.length - 1) / 2)),
          date: matchDate.toISOString(),
          homeTeam,
          awayTeam,
          status: isPastMatch ? 'finished' : 'scheduled'
        };

        if (isPastMatch) {
          match.homeScore = Math.floor(Math.random() * 5);
          match.awayScore = Math.floor(Math.random() * 5);
          match.scorers = [];
        }

        matches.push(match);
        matchId++;
      }
    }
  }

  return matches;
};

export interface BaseSlice {
  clubs: Club[];
  players: Player[];
  tournaments: Tournament[];
  posts: BlogPost[];
  postsLoading: boolean;
  isDataLoaded: boolean;

  updateClubs: (newClubs: Club[]) => Promise<void>;
  updateClub: (updatedClub: Club) => Promise<void>;
  removeClub: (clubId: string) => Promise<void>;
  updatePlayers: (newPlayers: Player[]) => Promise<void>;
  updateTournaments: (newTournaments: Tournament[]) => void;
  updatePosts: (newPosts: BlogPost[]) => void;
  refreshPlayers: (options?: { skipSupabase?: boolean }) => Promise<void>;
  refreshClubs: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  initializePosts: () => Promise<void>;
  clearPosts: () => Promise<void>;
  regenerateAllPlayers: () => Promise<void>;
  clearAllDataCache: () => Promise<void>;
  forceUpdateFromSeedData: () => Promise<void>;
  refreshClubsFromSeed: () => Promise<void>;
  refreshPlayersFromSeed: () => Promise<void>;
  syncTournamentTeams: () => Promise<void>;
  initializeTournamentSync: () => void;
  initializeDataFromService: () => Promise<void>;
}

export const createBaseSlice: StateCreator<BaseSlice, [], [], BaseSlice> = (set, get) => ({
  clubs: [], // Will be initialized asynchronously
  players: [], // Will be initialized asynchronously
  tournaments: [], // Will be initialized asynchronously from IndexedDB
  posts: [], // Will be initialized asynchronously from Supabase
  postsLoading: false,
  isDataLoaded: false,


  // Initialize clubs, players, tournaments and posts asynchronously
  initializeDataFromService: async () => {
    try {
      console.log('dataStore - Starting data initialization...');
      const [clubsFromStorage, playersFromStorage, tournamentsFromStorage, postsFromSupabase] = await Promise.all([
        listClubs(),
        listPlayers(),
        listTournaments(),
        listPosts()
      ]);

      console.log(`dataStore - Loaded ${clubsFromStorage.length} clubs, ${playersFromStorage.length} players, ${tournamentsFromStorage.length} tournaments and ${postsFromSupabase.length} posts`);

      // Always update state with loaded data or fallbacks
      set({
        clubs: clubsFromStorage.length > 0 ? clubsFromStorage : seedClubs as Club[],
        players: playersFromStorage.length > 0 ? playersFromStorage : seedPlayers as Player[],
        tournaments: tournamentsFromStorage, // Always use what's loaded from IndexedDB (includes seed data if empty)
        posts: postsFromSupabase.length > 0 ? postsFromSupabase : seedPosts,
        isDataLoaded: true
      });

      console.log(`dataStore - State updated. Tournaments: ${tournamentsFromStorage.length}, Posts: ${postsFromSupabase.length}`);
    } catch (error) {
      console.error('dataStore - Error initializing data from service:', error);
      // Fallback to seed data
      console.log('dataStore - Using seed data as fallback');
      set({
        clubs: seedClubs as Club[],
        players: seedPlayers as Player[],
        tournaments: tournaments, // Use seed tournaments as fallback
        posts: seedPosts,
        isDataLoaded: true
      });
    }
  },

  // Initialize tournament sync on app start
  initializeTournamentSync: () => {
    // Sync tournament teams with current clubs to ensure Fixtures page works correctly
    get().syncTournamentTeams();
  },

  updateClubs: async (newClubs) => {
    try {
      await saveClubs(newClubs);
    } catch { /* ignore */ }
    set({ clubs: newClubs });
    // Sync tournament teams when clubs change
    get().syncTournamentTeams();
  },

  updateClub: async (updatedClub) => {
    try {
      // Save to database first
      await updateClubService(updatedClub);

      // Then update local state
      set((state) => ({
        clubs: state.clubs.map(club =>
          club.id === updatedClub.id ? updatedClub : club
        )
      }));

      // Sync tournament teams when clubs change
      get().syncTournamentTeams();
    } catch (error) {
      console.error('âŒ Error updating club in store:', error);
      throw error;
    }
  },

  removeClub: async (clubId) => {
    try {
      // Delete from database first
      await deleteClubService(clubId);

      // Then update local state
      set((state) => ({
        clubs: state.clubs.filter(club => club.id !== clubId)
      }));

      // Sync tournament teams when clubs change
      get().syncTournamentTeams();
    } catch (error) {
      console.error('âŒ Error removing club from store:', error);
      throw error;
    }
  },
  updatePlayers: async (newPlayers) => {
    try {
      // Save to IndexedDB and update state
      await savePlayers(newPlayers);
      set({ players: newPlayers });
    } catch (error) {
      console.error('dataStore - Error updating players:', error);
    }
  },
  updateTournaments: (newTournaments) => set({ tournaments: newTournaments }),
  updatePosts: (newPosts) => {
    set({ posts: newPosts });
  },

  // Refresh players from playerService
  refreshPlayers: async (options) => {
    try {
      const playersFromStorage = await listPlayers(options);

      if (playersFromStorage && playersFromStorage.length > 0) {
        // Check if salaries need to be updated (only if we have very few players, suggesting seed data)
        const salaryUpdateKey = 'virtual_zone_salaries_updated';
        const salariesUpdated = localStorage.getItem(salaryUpdateKey);
        const hasSignificantData = playersFromStorage.some(p => (p.contract?.salary || 0) > 100000 || (p.transferValue || 0) > 500000);

        // Only initialize market data if we don't have the flag AND we don't have significant edited data
        if (!salariesUpdated && !hasSignificantData) {
          console.log('ðŸ”„ Inicializando datos de mercado para datos seed...');
          initializePlayerMarketData();
          localStorage.setItem(salaryUpdateKey, 'true');
        } else if (!salariesUpdated && hasSignificantData) {
          // Mark as updated to prevent future initialization
          console.log('âœ… Datos editados detectados - preservando cambios del usuario');
          localStorage.setItem(salaryUpdateKey, 'true');
        }

        set({ players: playersFromStorage });
      } else {
        // If no players in IndexedDB, initialize with seed data
        try {
          await initializePlayers();
          const initializedPlayers = await listPlayers(options);

          // Update market data for newly initialized players (seed data)
          initializePlayerMarketData();

          set({ players: initializedPlayers });
        } catch (initError) {
          console.error('dataStore - Error during initialization:', initError);
          // As fallback, use seed players directly
          set({ players: seedPlayers });
        }
      }
    } catch (error) {
      console.error('dataStore - Error refreshing players:', error);
      // If there's an error, try to initialize with seed data
      try {
        await initializePlayers();
        const fallbackPlayers = await listPlayers(options);
        set({ players: fallbackPlayers });
      } catch (fallbackError) {
        console.error('dataStore - Error in fallback initialization:', fallbackError);
        // As last resort, use seed players
        set({ players: seedPlayers });
      }
    }
  },

  // Refresh posts from Supabase
  refreshPosts: async () => {
    set({ postsLoading: true });
    try {
      const postsFromSupabase = await listPosts();
      set({ posts: postsFromSupabase, postsLoading: false });
    } catch (error) {
      console.error('dataStore - Error refreshing posts:', error);
      set({ posts: [], postsLoading: false });
    }
  },

  // Initialize posts with seed data
  initializePosts: async () => {
    try {
      await initializePosts();
      await get().refreshPosts(); // Refresh after initialization
    } catch (error) {
      console.error('dataStore - Error initializing posts:', error);
    }
  },

  // Clear all posts
  clearPosts: async () => {
    try {
      await clearPosts();
      set({ posts: [] });
    } catch (error) {
      console.error('dataStore - Error clearing posts:', error);
    }
  },

  // Refresh clubs from clubService
  refreshClubs: async () => {
    const freshClubs = await listClubs();
    set({ clubs: freshClubs });
    // Sync tournament teams when clubs are refreshed
    get().syncTournamentTeams();
  },

  // Force refresh clubs from seed data
    refreshClubsFromSeed: async () => {
    // Merge seed with existing clubs, preserving admin customizations (like logos)
    const existing = await listClubs();
    const merged = mergeClubsPreservingCustom(existing as any, seedClubs as any);
    await saveClubs(merged as any);
    set({ clubs: merged as any });
    // Sync tournament teams when clubs are reset to seed data
    get().syncTournamentTeams();
  },

  // Sync tournament teams with current clubs (important for Fixtures page)
  syncTournamentTeams: async () => {
    const currentClubs = await listClubs();
    const currentClubNames = currentClubs.map(club => club.name);
    const currentTournaments = get().tournaments; // Use current state, not imported seed data

    // Update Liga Master teams to match current clubs (only if it exists in current tournaments)
    const updatedTournaments = currentTournaments.map(tournament => {
      if (tournament.id === 'tournament1') { // Liga Master
        return {
          ...tournament,
          teams: currentClubNames,
          matches: generateMatches(currentClubNames, tournament.id, false)
        };
      }
      return tournament;
    });

    set({ tournaments: updatedTournaments });
  },

  // Force refresh players from seed data
  refreshPlayersFromSeed: async () => {
    await savePlayers(seedPlayers);
    initializePlayerMarketData();
    set({ players: seedPlayers });
  },

  // Regenerate players with correct positions
  regenerateAllPlayers: async () => {
    const regeneratedPlayers = await regeneratePlayersFromService();
    await savePlayers(regeneratedPlayers);

    // Update market data after regeneration
    initializePlayerMarketData();

    // Get updated players after salary adjustment
    const updatedPlayers = await listPlayers();
    set({ players: updatedPlayers });
  },

  // Complete cache cleanup
  clearAllDataCache: async () => {
    console.log('dataStore - clearAllDataCache called');

    // Clear posts from Supabase
    await clearPosts();

    // Clear players IndexedDB
    const clearedPlayers = await clearAllCacheFromService();
    await savePlayers(clearedPlayers);

    // Update market data for cleared players
    initializePlayerMarketData();

    // Get updated players after salary adjustment
    const updatedPlayers = await listPlayers();

    // Reset state with updated players and empty posts
    set({ players: updatedPlayers, posts: [] });
  },

  // Force update all data from seed data (for admin purposes)
  forceUpdateFromSeedData: async () => {
    console.log('dataStore - Forcing update from seed data');

    try {
      // Clear all localStorage data first
      localStorage.removeItem('virtual_zone_clubs');
      localStorage.removeItem('virtual_zone_players');
      localStorage.removeItem('virtual_zone_initialized');

      // Clear any other potential keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('virtual_zone') || key.includes('player') || key.includes('club'))) {
          localStorage.removeItem(key);
        }
      }

      // Update clubs with fresh seed data
      await saveClubs(mergeClubsPreservingCustom(await listClubs() as any, seedClubs as any) as any);

      // Update players with fresh seed data
      await savePlayers(seedPlayers);

      // Initialize posts with seed data in Supabase
      await initializePosts();

      // Update market data for new players
      initializePlayerMarketData();

      // Refresh posts from Supabase after initialization
      const postsFromSupabase = await listPosts();

      // Update state with fresh data
      set({
        clubs: seedClubs,
        players: seedPlayers,
        posts: postsFromSupabase
      });

      console.log('dataStore - Successfully updated all data from seed');
      console.log(`- Clubs: ${seedClubs.length}`);
      console.log(`- Players: ${seedPlayers.length}`);
      console.log(`- Posts: ${postsFromSupabase.length}`);

    } catch (error) {
      console.error('dataStore - Error updating from seed data:', error);
    }
  },
});




