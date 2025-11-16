import { getSupabaseClient } from '../lib/supabase';
import { config } from '../lib/config';
import type { MediaItem } from '../types';

const isSupabaseEnabled = (): boolean => {
  return config.useSupabase && !!config.supabase.url && !!config.supabase.anonKey;
};

const safeSupabase = () => {
  if (!isSupabaseEnabled()) return null;
  try {
    return getSupabaseClient();
  } catch (error) {
    console.warn('supabaseMediaSync: Supabase not configured:', error);
    return null;
  }
};

/**
 * Convierte un MediaItem local a formato Supabase
 */
const convertMediaItemToSupabase = (item: MediaItem) => {
  return {
    id: item.id,
    title: item.title,
    description: item.description || null,
    type: item.type,
    url: item.url,
    thumbnail_url: item.thumbnailUrl || null,
    category: item.category || 'General',
    uploader: item.uploader || item.author || 'anon',
    upload_date: item.uploadDate || item.date || new Date().toISOString(),
    likes: item.likes || 0,
    views: item.views || 0,
    file_size: item.fileSize || null,
    mime_type: item.mimeType || null,
  };
};

/**
 * Convierte un item de Supabase a MediaItem local
 */
const convertSupabaseToMediaItem = (item: any): MediaItem => {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    url: item.url,
    thumbnailUrl: item.thumbnail_url,
    category: item.category,
    uploader: item.uploader,
    uploadDate: item.upload_date,
    likes: item.likes || 0,
    views: item.views || 0,
    fileSize: item.file_size,
    mimeType: item.mime_type,
    // Mantener compatibilidad con campos antiguos
    image: item.url,
    author: item.uploader,
    date: item.upload_date,
  };
};

/**
 * Sube un elemento multimedia a Supabase
 */
export const upsertMediaItemToSupabase = async (item: MediaItem): Promise<void> => {
  const supabase = safeSupabase();
  if (!supabase) return;

  try {
    const normalized = convertMediaItemToSupabase(item);

    const { error } = await supabase
      .from('media')
      .upsert(normalized, { onConflict: 'id' });

    if (error) {
      console.error('supabaseMediaSync: Error upserting media item:', error);
    } else {
      console.log('✅ Media item synced to Supabase:', item.id);
    }
  } catch (error) {
    console.error('supabaseMediaSync: Error in upsertMediaItemToSupabase:', error);
  }
};

/**
 * Obtiene todos los elementos multimedia de Supabase
 */
export const fetchMediaItemsFromSupabase = async (): Promise<MediaItem[]> => {
  const supabase = safeSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('upload_date', { ascending: false });

    if (error) {
      console.error('supabaseMediaSync: Error fetching media items:', error);
      return [];
    }

    return (data || []).map(convertSupabaseToMediaItem);
  } catch (error) {
    console.error('supabaseMediaSync: Error in fetchMediaItemsFromSupabase:', error);
    return [];
  }
};

/**
 * Elimina un elemento multimedia de Supabase
 */
export const deleteMediaItemFromSupabase = async (id: string): Promise<void> => {
  const supabase = safeSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('supabaseMediaSync: Error deleting media item:', error);
    } else {
      console.log('✅ Media item deleted from Supabase:', id);
    }
  } catch (error) {
    console.error('supabaseMediaSync: Error in deleteMediaItemFromSupabase:', error);
  }
};

/**
 * Sincroniza todos los elementos multimedia locales con Supabase
 */
export const syncAllMediaItemsToSupabase = async (localItems: MediaItem[]): Promise<void> => {
  const supabase = safeSupabase();
  if (!supabase) return;

  try {
    console.log('🔄 Starting media sync to Supabase...');

    const supabaseItems = await fetchMediaItemsFromSupabase();
    const supabaseIds = new Set(supabaseItems.map(item => item.id));

    // Subir elementos que no existen en Supabase
    const itemsToUpload = localItems.filter(item => !supabaseIds.has(item.id));

    for (const item of itemsToUpload) {
      await upsertMediaItemToSupabase(item);
    }

    // Eliminar elementos de Supabase que ya no existen localmente
    const localIds = new Set(localItems.map(item => item.id));
    const itemsToDelete = supabaseItems.filter(item => !localIds.has(item.id));

    for (const item of itemsToDelete) {
      await deleteMediaItemFromSupabase(item.id);
    }

    console.log(`✅ Media sync completed. Uploaded: ${itemsToUpload.length}, Deleted: ${itemsToDelete.length}`);
  } catch (error) {
    console.error('supabaseMediaSync: Error in syncAllMediaItemsToSupabase:', error);
  }
};

/**
 * Sincroniza elementos multimedia desde Supabase hacia local
 */
export const syncMediaItemsFromSupabase = async (): Promise<MediaItem[]> => {
  const supabase = safeSupabase();
  if (!supabase) return [];

  try {
    console.log('🔄 Syncing media items from Supabase...');
    const remoteItems = await fetchMediaItemsFromSupabase();
    console.log(`✅ Fetched ${remoteItems.length} media items from Supabase`);
    return remoteItems;
  } catch (error) {
    console.error('supabaseMediaSync: Error in syncMediaItemsFromSupabase:', error);
    return [];
  }
};
