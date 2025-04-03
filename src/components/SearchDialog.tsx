
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import { Loader2, SearchX } from 'lucide-react';
import { DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SimpleAnimeResult {
  id: string;
  title: string;
  image_url: string;
  release_year: number;
}

// Global cache for anime data
let cachedAnimeResults: SimpleAnimeResult[] = [];

// Function to update the cache
export const updateAnimeCache = (recentAnime: any[] = [], popularAnime: any[] = []) => {
  try {
    // Combine recent and popular anime, removing duplicates by ID
    const allAnime = [...recentAnime, ...popularAnime];
    const uniqueAnimeMap = new Map();
    
    allAnime.forEach(anime => {
      if (!uniqueAnimeMap.has(anime.id)) {
        uniqueAnimeMap.set(anime.id, {
          id: String(anime.id),
          title: String(anime.title),
          image_url: String(anime.image_url),
          release_year: Number(anime.release_year)
        });
      }
    });
    
    cachedAnimeResults = Array.from(uniqueAnimeMap.values());
    console.log('Anime cache updated:', cachedAnimeResults.length, 'entries');
  } catch (error) {
    console.error('Error updating anime cache:', error);
  }
};

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimpleAnimeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Clear search state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  // Directly fetch fresh anime data when dialog is opened
  useEffect(() => {
    if (open) {
      const fetchDirectAnimeData = async () => {
        try {
          setIsLoading(true);
          // Direct database query for fresh data
          const { data, error } = await supabase
            .from('anime')
            .select('id, title, image_url, release_year')
            .limit(20);
            
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            // Update both the local cache and the global cache
            cachedAnimeResults = data as SimpleAnimeResult[];
            console.log('Direct fetch anime data successful:', data.length, 'entries');
          }
        } catch (error) {
          console.error('Error fetching anime data directly:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchDirectAnimeData();
    }
  }, [open]);

  // Search functionality
  useEffect(() => {
    if (!open || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    
    const performSearch = () => {
      try {
        const query = searchQuery.toLowerCase();
        console.log('Searching for:', query);
        
        // First try to search from the cache
        const results = cachedAnimeResults
          .filter(anime => anime.title.toLowerCase().includes(query))
          .slice(0, 10); // Limit to 10 results
        
        console.log('Search results:', results);
        setSearchResults(results);
        
        // If cache is empty or no results found, try direct database search
        if (results.length === 0) {
          searchFromDatabase(query);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce search
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, open]);
  
  // Function to search directly from the database
  const searchFromDatabase = async (query: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('anime')
        .select('id, title, image_url, release_year')
        .ilike('title', `%${query}%`)
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setSearchResults(data as SimpleAnimeResult[]);
        console.log('Database search results:', data);
      }
    } catch (error) {
      console.error('Database search error:', error);
      toast({
        title: "Pencarian gagal",
        description: "Gagal mendapatkan hasil pencarian. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (animeId: string) => {
    navigate(`/anime/${animeId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden">
        <DialogTitle className="sr-only">Cari Anime</DialogTitle>
        <DialogDescription className="sr-only">
          Masukkan judul anime untuk mencari
        </DialogDescription>
        <Command className="rounded-lg border-none">
          <CommandInput 
            placeholder="Cari anime..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-12"
            autoFocus
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-anime-muted" />
              </div>
            ) : searchQuery.length > 0 ? (
              <>
                {searchResults.length > 0 ? (
                  <CommandGroup>
                    {searchResults.map((anime) => (
                      <CommandItem 
                        key={anime.id}
                        onSelect={() => handleSelect(anime.id)}
                        className="flex items-center gap-2 p-2 cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={anime.image_url} 
                            alt={anime.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium truncate">{anime.title}</p>
                          <p className="text-xs text-anime-muted">{anime.release_year}</p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty className="py-6 flex flex-col items-center justify-center">
                    <SearchX className="h-10 w-10 text-anime-muted mb-2" />
                    <p className="text-anime-muted">Tidak ada hasil ditemukan.</p>
                  </CommandEmpty>
                )}
              </>
            ) : (
              <div className="py-6 text-center text-sm text-anime-muted">
                Ketik judul anime untuk mencari...
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
