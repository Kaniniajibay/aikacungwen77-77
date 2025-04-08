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
};

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SimpleAnimeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Clear search state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [open]);

  // Load initial data when dialog opens
  useEffect(() => {
    if (open) {
      const fetchInitialData = async () => {
        try {
          setIsLoading(true);
          
          // If we already have cache, use it
          if (cachedAnimeResults.length > 0) {
            console.log('Using cached anime results:', cachedAnimeResults.length);
            setIsLoading(false);
            return;
          }
          
          // Otherwise fetch fresh data
          const { data, error } = await supabase
            .from('anime')
            .select('id, title, image_url, release_year')
            .limit(20);
            
          if (error) throw error;
          
          if (data) {
            const formattedData = data.map(anime => ({
              id: String(anime.id),
              title: String(anime.title),
              image_url: String(anime.image_url),
              release_year: Number(anime.release_year)
            }));
            
            cachedAnimeResults = formattedData;
            console.log('Initial anime data loaded:', formattedData.length);
          }
        } catch (error) {
          console.error('Error fetching initial anime data:', error);
          toast({
            title: "Error",
            description: "Gagal mengambil data anime awal",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchInitialData();
    }
  }, [open, toast]);

  // Handle search input changes
  useEffect(() => {
    const performSearch = async () => {
      // If search term is empty, clear results
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const query = searchTerm.toLowerCase();
        console.log('Searching for:', query);
        
        // First check cache
        if (cachedAnimeResults.length > 0) {
          const results = cachedAnimeResults.filter(anime => 
            anime.title.toLowerCase().includes(query)
          );
          
          console.log('Cache search results:', results.length);
          
          // If we found results in cache, use them
          if (results.length > 0) {
            setSearchResults(results);
            setIsLoading(false);
            return;
          }
        }
        
        // If no results in cache, query the database
        console.log('Querying database...');
        const { data, error } = await supabase
          .from('anime')
          .select('id, title, image_url, release_year')
          .ilike('title', `%${query}%`)
          .limit(10);
        
        if (error) throw error;
        
        if (data) {
          const results = data.map(anime => ({
            id: String(anime.id),
            title: String(anime.title),
            image_url: String(anime.image_url),
            release_year: Number(anime.release_year)
          }));
          
          setSearchResults(results);
          console.log('Database search results:', results.length);
          
          // Add new results to cache
          const newCacheEntries = results.filter(
            result => !cachedAnimeResults.some(cached => cached.id === result.id)
          );
          
          if (newCacheEntries.length > 0) {
            cachedAnimeResults = [...cachedAnimeResults, ...newCacheEntries];
            console.log('Added new entries to cache:', newCacheEntries.length);
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Pencarian gagal",
          description: "Gagal mendapatkan hasil pencarian. Silakan coba lagi.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [searchTerm, toast]);

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
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-12"
            autoFocus
          />
          <CommandList className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-anime-muted" />
              </div>
            ) : searchTerm.trim() !== "" ? (
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
