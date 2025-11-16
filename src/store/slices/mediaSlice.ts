import type { StateCreator } from 'zustand';
import { mediaItems } from '../../data/media';
import type { MediaItem } from '../../types';
import { config } from '../../lib/config';
import {
  upsertMediaItemToSupabase,
  syncMediaItemsFromSupabase,
  syncAllMediaItemsToSupabase
} from '../../utils/supabaseMediaSync';

const MEDIA_ITEMS_KEY = 'virtual_zone_media_items';

function loadMedia(defaultItems: MediaItem[]): MediaItem[] {
  try {
    const raw = localStorage.getItem(MEDIA_ITEMS_KEY);
    if (!raw) return defaultItems;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as MediaItem[];
    return defaultItems;
  } catch {
    return defaultItems;
  }
}

function saveMedia(items: MediaItem[]): void {
  try {
    localStorage.setItem(MEDIA_ITEMS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving media items to localStorage:', error);
  }
}

export interface MediaSlice {
  mediaItems: MediaItem[];
  mediaLoading: boolean;
  addMediaItem: (item: MediaItem) => Promise<void>;
  updateMediaItems: (items: MediaItem[]) => void;
  syncMediaItems: () => Promise<void>;
  initializeMediaItems: () => Promise<void>;
}

export const createMediaSlice: StateCreator<MediaSlice, [], [], MediaSlice> = (set, get) => ({
  mediaItems: [],
  mediaLoading: false,

  addMediaItem: async (item) => {
    set({ mediaLoading: true });

    try {
      // Agregar a estado local
      const currentItems = get().mediaItems;
      const next = [item, ...currentItems];

      // Guardar localmente
      saveMedia(next);
      set({ mediaItems: next });

      // Sincronizar con Supabase si está habilitado
      if (config.useSupabase) {
        await upsertMediaItemToSupabase(item);
      }
    } catch (error) {
      console.error('Error adding media item:', error);
    } finally {
      set({ mediaLoading: false });
    }
  },

  updateMediaItems: (items) => {
    saveMedia(items);
    set({ mediaItems: items });
  },

  syncMediaItems: async () => {
    if (!config.useSupabase) return;

    try {
      const remoteItems = await syncMediaItemsFromSupabase();
      if (remoteItems.length > 0) {
        saveMedia(remoteItems);
        set({ mediaItems: remoteItems });
        console.log('✅ Media items synced from Supabase');
      }
    } catch (error) {
      console.error('Error syncing media items:', error);
    }
  },

  initializeMediaItems: async () => {
    set({ mediaLoading: true });

    try {
      let items: MediaItem[];

      if (config.useSupabase) {
        // Intentar cargar desde Supabase primero
        try {
          const remoteItems = await syncMediaItemsFromSupabase();
          if (remoteItems.length > 0) {
            items = remoteItems;
            saveMedia(items);
            console.log('✅ Loaded media items from Supabase');
          } else {
            // Si no hay datos en Supabase, usar datos locales
            items = loadMedia(mediaItems);
            // Sincronizar datos locales a Supabase
            await syncAllMediaItemsToSupabase(items);
            console.log('📤 Synced local media items to Supabase');
          }
        } catch (error) {
          console.warn('Failed to load from Supabase, using local data:', error);
          items = loadMedia(mediaItems);
        }
      } else {
        // Solo usar datos locales
        items = loadMedia(mediaItems);
      }

      set({ mediaItems: items });
    } catch (error) {
      console.error('Error initializing media items:', error);
      // Fallback a datos por defecto
      set({ mediaItems: mediaItems });
    } finally {
      set({ mediaLoading: false });
    }
  },
});
