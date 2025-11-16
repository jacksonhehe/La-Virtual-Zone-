import { getSupabaseClient } from '../lib/supabase';
import { config } from '../lib/config';

const BUCKET_NAME = 'media';

const isSupabaseEnabled = (): boolean => {
  return config.useSupabase && !!config.supabase.url && !!config.supabase.anonKey;
};

const safeSupabase = () => {
  if (!isSupabaseEnabled()) return null;
  try {
    return getSupabaseClient();
  } catch (error) {
    console.warn('supabaseStorage: Supabase not configured:', error);
    return null;
  }
};

/**
 * Sube un archivo a Supabase Storage y devuelve la URL pública
 */
export const uploadFileToSupabase = async (
  file: File,
  folder: string = 'gallery'
): Promise<{ url: string; fileName: string }> => {
  const supabase = safeSupabase();
  if (!supabase) {
    throw new Error('Supabase no está configurado');
  }

  // Generar nombre único para el archivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  try {
    // Subir el archivo
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Error al subir archivo: ${error.message}`);
    }

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    if (!urlData.publicUrl) {
      throw new Error('No se pudo obtener la URL pública del archivo');
    }

    return {
      url: urlData.publicUrl,
      fileName
    };
  } catch (error) {
    console.error('supabaseStorage: Error uploading file:', error);
    throw error;
  }
};

/**
 * Convierte un archivo multimedia (File o base64 string) a File y la sube a Supabase Storage
 */
export const uploadMediaToSupabase = async (
  mediaInput: File | string,
  folder: string = 'gallery'
): Promise<{ url: string; fileName: string; fileSize: number; mimeType: string }> => {
  let file: File;

  if (typeof mediaInput === 'string') {
    // Convertir base64 a File
    const response = await fetch(mediaInput);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    const fileName = `media-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`;
    file = new File([blob], fileName, { type: mimeType });
  } else {
    file = mediaInput;
  }

  // Validar que sea imagen o video
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    throw new Error('El archivo debe ser una imagen o video');
  }

  // Validar tamaño máximo (videos: 50MB, imágenes: 10MB)
  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB para videos, 10MB para imágenes
  if (file.size > maxSize) {
    const maxSizeText = isVideo ? '50MB' : '10MB';
    throw new Error(`El ${isVideo ? 'video' : 'archivo'} no puede ser mayor a ${maxSizeText}`);
  }

  const result = await uploadFileToSupabase(file, folder);

  return {
    url: result.url,
    fileName: result.fileName,
    fileSize: file.size,
    mimeType: file.type
  };
};

/**
 * Elimina un archivo de Supabase Storage
 */
export const deleteFileFromSupabase = async (fileName: string): Promise<void> => {
  const supabase = safeSupabase();
  if (!supabase) return;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting file:', error);
    }
  } catch (error) {
    console.error('supabaseStorage: Error deleting file:', error);
  }
};

/**
 * Verifica si Supabase Storage está disponible
 */
export const isStorageAvailable = (): boolean => {
  return isSupabaseEnabled();
};
