import { supabase } from '../supabaseClient';

/**
 * Upload a file to Supabase Storage and return the public URL.
 * @param file File object to upload
 * @param bucket Name of the storage bucket
 * @returns public URL of the uploaded file
 */
export const uploadImage = async (
  file: File | Blob,
  bucket: string
): Promise<string> => {
  const ext = file instanceof File && file.name.includes('.')
    ? file.name.split('.').pop()!
    : 'png';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, { upsert: false });
  if (error) {
    throw error;
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
};
