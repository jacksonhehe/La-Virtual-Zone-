import { create } from 'zustand'
import { SupabaseAuthService, AuthUser } from '../services/supabaseAuth'
import { SupabaseDataService, Club, Player, Match, Transfer, News } from '../services/supabaseData'
import { toast } from 'react-hot-toast'

interface SupabaseState {
  // Auth state
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // Data state
  clubs: Club[]
  players: Player[]
  matches: Match[]
  transfers: Transfer[]
  news: News[]

  // Auth actions
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (updates: Partial<AuthUser>) => Promise<void>
  checkAuth: () => Promise<void>

  // Data actions
  fetchClubs: () => Promise<void>
  fetchPlayers: () => Promise<void>
  fetchMatches: () => Promise<void>
  fetchTransfers: () => Promise<void>
  fetchNews: () => Promise<void>

  // CRUD actions
  createClub: (clubData: Omit<Club, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateClub: (id: number, updates: Partial<Club>) => Promise<void>
  deleteClub: (id: number) => Promise<void>

  createPlayer: (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updatePlayer: (id: number, updates: Partial<Player>) => Promise<void>
  deletePlayer: (id: number) => Promise<void>

  createMatch: (matchData: Omit<Match, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateMatch: (id: number, updates: Partial<Match>) => Promise<void>

  createTransfer: (transferData: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  createNews: (newsData: Omit<News, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

export const useSupabaseStore = create<SupabaseState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  clubs: [],
  players: [],
  matches: [],
  transfers: [],
  news: [],

  // Auth actions
  login: async (email: string, password: string) => {
    set({ isLoading: true })
    try {
      const user = await SupabaseAuthService.login(email, password)
      set({ user, isAuthenticated: true })
      toast.success('¡Inicio de sesión exitoso!')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión')
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true })
    try {
      const user = await SupabaseAuthService.register(email, username, password)
      set({ user, isAuthenticated: true })
      toast.success('¡Registro exitoso!')
    } catch (error) {
      console.error('Register error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al registrarse')
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await SupabaseAuthService.logout()
      set({ user: null, isAuthenticated: false })
      toast.success('Sesión cerrada')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error al cerrar sesión')
    } finally {
      set({ isLoading: false })
    }
  },

  updateUser: async (updates: Partial<AuthUser>) => {
    const { user } = get()
    if (!user) return

    try {
      const updatedUser = await SupabaseAuthService.updateUser(user.id, updates)
      set({ user: updatedUser })
      toast.success('Usuario actualizado')
    } catch (error) {
      console.error('Update user error:', error)
      toast.error('Error al actualizar usuario')
    }
  },

  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const user = await SupabaseAuthService.getCurrentUser()
      set({ user, isAuthenticated: !!user })
    } catch (error) {
      console.error('Check auth error:', error)
      set({ user: null, isAuthenticated: false })
    } finally {
      set({ isLoading: false })
    }
  },

  // Data actions
  fetchClubs: async () => {
    try {
      const clubs = await SupabaseDataService.getClubs()
      set({ clubs })
    } catch (error) {
      console.error('Fetch clubs error:', error)
      toast.error('Error al cargar clubes')
    }
  },

  fetchPlayers: async () => {
    try {
      const players = await SupabaseDataService.getPlayers()
      set({ players })
    } catch (error) {
      console.error('Fetch players error:', error)
      toast.error('Error al cargar jugadores')
    }
  },

  fetchMatches: async () => {
    try {
      const matches = await SupabaseDataService.getMatches()
      set({ matches })
    } catch (error) {
      console.error('Fetch matches error:', error)
      toast.error('Error al cargar partidos')
    }
  },

  fetchTransfers: async () => {
    try {
      const transfers = await SupabaseDataService.getTransfers()
      set({ transfers })
    } catch (error) {
      console.error('Fetch transfers error:', error)
      toast.error('Error al cargar transferencias')
    }
  },

  fetchNews: async () => {
    try {
      const news = await SupabaseDataService.getNews()
      set({ news })
    } catch (error) {
      console.error('Fetch news error:', error)
      toast.error('Error al cargar noticias')
    }
  },

  // CRUD actions
  createClub: async (clubData) => {
    try {
      const newClub = await SupabaseDataService.createClub(clubData)
      set(state => ({ clubs: [...state.clubs, newClub] }))
      toast.success('Club creado exitosamente')
    } catch (error) {
      console.error('Create club error:', error)
      toast.error('Error al crear club')
      throw error
    }
  },

  updateClub: async (id: number, updates: Partial<Club>) => {
    try {
      const updatedClub = await SupabaseDataService.updateClub(id, updates)
      set(state => ({
        clubs: state.clubs.map(club => 
          club.id === id ? updatedClub : club
        )
      }))
      toast.success('Club actualizado exitosamente')
    } catch (error) {
      console.error('Update club error:', error)
      toast.error('Error al actualizar club')
      throw error
    }
  },

  deleteClub: async (id: number) => {
    try {
      await SupabaseDataService.deleteClub(id)
      set(state => ({
        clubs: state.clubs.filter(club => club.id !== id)
      }))
      toast.success('Club eliminado exitosamente')
    } catch (error) {
      console.error('Delete club error:', error)
      toast.error('Error al eliminar club')
      throw error
    }
  },

  createPlayer: async (playerData) => {
    try {
      const newPlayer = await SupabaseDataService.createPlayer(playerData)
      set(state => ({ players: [...state.players, newPlayer] }))
      toast.success('Jugador creado exitosamente')
    } catch (error) {
      console.error('Create player error:', error)
      toast.error('Error al crear jugador')
      throw error
    }
  },

  updatePlayer: async (id: number, updates: Partial<Player>) => {
    try {
      const updatedPlayer = await SupabaseDataService.updatePlayer(id, updates)
      set(state => ({
        players: state.players.map(player => 
          player.id === id ? updatedPlayer : player
        )
      }))
      toast.success('Jugador actualizado exitosamente')
    } catch (error) {
      console.error('Update player error:', error)
      toast.error('Error al actualizar jugador')
      throw error
    }
  },

  deletePlayer: async (id: number) => {
    try {
      await SupabaseDataService.deletePlayer(id)
      set(state => ({
        players: state.players.filter(player => player.id !== id)
      }))
      toast.success('Jugador eliminado exitosamente')
    } catch (error) {
      console.error('Delete player error:', error)
      toast.error('Error al eliminar jugador')
      throw error
    }
  },

  createMatch: async (matchData) => {
    try {
      const newMatch = await SupabaseDataService.createMatch(matchData)
      set(state => ({ matches: [newMatch, ...state.matches] }))
      toast.success('Partido creado exitosamente')
    } catch (error) {
      console.error('Create match error:', error)
      toast.error('Error al crear partido')
      throw error
    }
  },

  updateMatch: async (id: number, updates: Partial<Match>) => {
    try {
      const updatedMatch = await SupabaseDataService.updateMatch(id, updates)
      set(state => ({
        matches: state.matches.map(match => 
          match.id === id ? updatedMatch : match
        )
      }))
      toast.success('Partido actualizado exitosamente')
    } catch (error) {
      console.error('Update match error:', error)
      toast.error('Error al actualizar partido')
      throw error
    }
  },

  createTransfer: async (transferData) => {
    try {
      const newTransfer = await SupabaseDataService.createTransfer(transferData)
      set(state => ({ transfers: [newTransfer, ...state.transfers] }))
      toast.success('Transferencia creada exitosamente')
    } catch (error) {
      console.error('Create transfer error:', error)
      toast.error('Error al crear transferencia')
      throw error
    }
  },

  createNews: async (newsData) => {
    try {
      const newNews = await SupabaseDataService.createNews(newsData)
      set(state => ({ news: [newNews, ...state.news] }))
      toast.success('Noticia creada exitosamente')
    } catch (error) {
      console.error('Create news error:', error)
      toast.error('Error al crear noticia')
      throw error
    }
  }
}))

// Inicializar el store cuando se carga la aplicación
export const initializeSupabaseStore = async () => {
  const store = useSupabaseStore.getState()
  
  // Verificar autenticación
  await store.checkAuth()
  
  // Cargar datos iniciales
  await Promise.all([
    store.fetchClubs(),
    store.fetchPlayers(),
    store.fetchMatches(),
    store.fetchTransfers(),
    store.fetchNews()
  ])
} 