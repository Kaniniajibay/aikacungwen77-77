
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      anime: {
        Row: Anime;
        Insert: Omit<Anime, 'id' | 'created_at'>;
        Update: Partial<Omit<Anime, 'id' | 'created_at'>>;
      };
      episodes: {
        Row: Episode;
        Insert: Omit<Episode, 'id' | 'created_at'>;
        Update: Partial<Omit<Episode, 'id' | 'created_at'>>;
      };
      admins: {
        Row: Admin;
        Insert: Omit<Admin, 'id' | 'created_at'>;
        Update: Partial<Omit<Admin, 'id' | 'created_at'>>;
      };
    };
  };
};

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

// Helper function to check if user is authenticated as admin
export const checkAdminAuth = async () => {
  const { data } = await supabase.auth.getSession();
  
  if (!data.session) {
    return { authenticated: false, admin: null };
  }
  
  // Verify if the user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('*')
    .eq('email', data.session.user.email)
    .single();
    
  if (adminError || !adminData || adminData.role !== 'admin') {
    return { authenticated: false, admin: null };
  }
  
  return { authenticated: true, admin: adminData };
};
