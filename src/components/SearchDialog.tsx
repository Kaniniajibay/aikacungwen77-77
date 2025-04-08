
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
import { Anime } from '@/lib/supabase'; // Import the Anime type

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

// Create a cache to store anime data
let animeCache: SimpleAnimeResult[] = [];

// Export the updateAnimeCache function that Index.tsx is trying to import
export const updateAnimeCache = (
  recentAnime: Anime[] = [], 
  popularAnime: Anime[] = []
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

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SimpleAnimeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch all anime titles when dialog opens
  useEffect(() => {
    if (open) {
      fetchAnimeTitles();
    }
  }, [open]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSearchResults([]);
    }
  }, [open]);

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

  // Search functionality - directly search from Supabase if needed
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
