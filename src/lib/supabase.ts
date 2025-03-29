
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Anime = {
  id: string;
  created_at?: string;
  title: string;
  description: string;
  image_url: string;
  genres: string[];
  release_year: number;
  status: 'ongoing' | 'completed';
};

export type Episode = {
  id: string;
  created_at?: string;
  anime_id: string;
  title: string;
  episode_number: number;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
};

export type Admin = {
  id: string;
  created_at?: string;
  username: string;
  email: string;
  role: 'admin';
};
