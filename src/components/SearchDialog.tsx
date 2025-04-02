
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import { Loader2 } from 'lucide-react';
import { DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define a simplified anime interface for search results
interface AnimeSearchResult {
  id: string;
  title: string;
  image_url: string;
  release_year: number;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AnimeSearchResult[]>([]);
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

  // Handle search as user types
  useEffect(() => {
    if (!open) return;
    
    // Don't search if query is empty
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        console.log('Searching for:', searchQuery);
        const { data, error } = await supabase
          .from('anime')
          .select('id, title, image_url, release_year')
          .ilike('title', `%${searchQuery}%`)
          .order('title')
          .limit(10);

        if (error) {
          console.error('Search error:', error);
          throw error;
        }
        
        console.log('Search results:', data);

        // Safely cast and transform the data to ensure it matches our interface
        if (data) {
          const validResults: AnimeSearchResult[] = data.map(item => ({
            id: String(item.id),
            title: String(item.title),
            image_url: String(item.image_url),
            release_year: Number(item.release_year)
          }));
          
          setSearchResults(validResults);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Pencarian gagal",
          description: "Gagal mendapatkan hasil pencarian. Silakan coba lagi.",
          variant: "destructive",
        });
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, open, toast]);

  const handleSelect = (animeId: string) => {
    navigate(`/anime/${animeId}`);
    onOpenChange(false);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
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
            onValueChange={handleSearchQueryChange}
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
                <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>
                <CommandGroup>
                  {searchResults.map((anime) => (
                    <CommandItem 
                      key={anime.id}
                      onSelect={() => handleSelect(anime.id)}
                      className="flex items-center gap-2 p-2 cursor-pointer"
                    >
                      <img 
                        src={anime.image_url} 
                        alt={anime.title}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{anime.title}</p>
                        <p className="text-xs text-anime-muted">{anime.release_year}</p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
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
