import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function uploadVideo(file: File): Promise<string> {
  const fileName = Date.now() + '-' + file.name;
  const { error } = await supabase.storage
    .from('videos')
    .upload(fileName, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName);

  return data.publicUrl;
}