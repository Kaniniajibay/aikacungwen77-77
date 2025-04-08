
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Define the types
export interface SimpleAnimeResult {
  id: string;
  title: string;
  image_url: string;
  release_year: number;
}

// Create a cache to store anime data
let animeCache: SimpleAnimeResult[] = [];

// Export the updateAnimeCache function for Index.tsx
export const updateAnimeCache = (
  recentAnime: any[] = [], 
  popularAnime: any[] = []
) => {
  console.log('Updating anime cache with data from Index.tsx');
  
  // Convert Anime[] to SimpleAnimeResult[]
  const convertedAnime: SimpleAnimeResult[] = [...recentAnime, ...popularAnime].map(anime => ({
    id: anime.id,
    title: anime.title,
    image_url: anime.image_url,
    release_year: anime.release_year
  }));
  
  // Remove duplicates by ID
  const uniqueIds = new Set();
  animeCache = [
    ...animeCache,
    ...convertedAnime.filter(anime => {
      if (!uniqueIds.has(anime.id)) {
        uniqueIds.add(anime.id);
        return true;
      }
      return false;
    })
  ];
  
  console.log('Anime cache updated, total entries:', animeCache.length);
};

export const useAnimeSearch = (isDialogOpen: boolean) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SimpleAnimeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch anime titles when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchAnimeTitles();
    }
  }, [isDialogOpen]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [isDialogOpen]);

  const fetchAnimeTitles = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching anime titles from Supabase...');
      
      const { data, error } = await supabase
        .from('anime')
        .select('id, title, image_url, release_year')
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log('Anime titles fetched successfully:', data.length, 'entries');
        animeCache = data as SimpleAnimeResult[];
        
        // If search term is already entered, filter results immediately
        if (searchTerm.trim() !== '') {
          const query = searchTerm.toLowerCase();
          const filtered = animeCache.filter(anime => 
            anime.title.toLowerCase().includes(query)
          );
          setSearchResults(filtered);
        }
      } else {
        console.log('No anime data returned from Supabase');
      }
    } catch (error) {
      console.error('Error fetching anime titles:', error);
      toast({
        title: "Error",
        description: "Gagal mengambil data judul anime",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const query = searchTerm.toLowerCase();
    console.log('Searching for:', query);
    
    // Filter anime based on search term from cache
    if (animeCache.length > 0) {
      const filtered = animeCache.filter(anime => 
        anime.title.toLowerCase().includes(query)
      );
      console.log('Search results:', filtered.length);
      setSearchResults(filtered);
    } else {
      // If anime cache is empty, perform a direct database search
      performDatabaseSearch(query);
    }
  }, [searchTerm]);

  const performDatabaseSearch = async (query: string) => {
    try {
      setIsLoading(true);
      console.log('Performing direct database search for:', query);
      
      const { data, error } = await supabase
        .from('anime')
        .select('id, title, image_url, release_year')
        .ilike('title', `%${query}%`)
        .limit(20);
      
      if (error) throw error;
      
      if (data) {
        console.log('Database search results:', data.length);
        setSearchResults(data as SimpleAnimeResult[]);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Pencarian gagal",
        description: "Gagal mendapatkan hasil pencarian",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isLoading
  };
};
