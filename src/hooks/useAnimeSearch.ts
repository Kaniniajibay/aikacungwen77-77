
import { useState, useCallback } from 'react';
import { supabase, Anime } from '../lib/supabase';
import { toast } from '../hooks/use-toast';

export const useAnimeSearch = () => {
  const [results, setResults] = useState<Anime[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const searchAnime = useCallback(async (query: string) => {
    if (query.length < 2) return;
    
    setIsLoading(true);
    
    try {
      // Search in title with partial match
      const { data, error } = await supabase
        .from('anime')
        .select('*')
        .ilike('title', `%${query}%`)
        .order('title', { ascending: true })
        .limit(10);
        
      if (error) {
        throw new Error(error.message);
      }
      
      console.info(`Found ${data.length} results for query: ${query}`);
      setResults(data as Anime[]);
      
    } catch (error) {
      console.error('Error searching anime:', error);
      toast({
        title: "Pencarian gagal",
        description: "Terjadi kesalahan saat mencari anime",
        variant: "destructive"
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { searchAnime, results, isLoading };
};
