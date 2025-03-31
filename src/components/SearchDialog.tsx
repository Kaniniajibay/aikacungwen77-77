
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, type Anime } from '@/lib/supabase';
import { Dialog, DialogContent } from '@/components/ui/dialog';
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

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset search state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Focus the input when dialog opens
      setTimeout(() => {
        const input = document.querySelector('[cmdk-input]') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    } else {
      // Clear search when dialog closes
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [open]);

  // Handle search query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('anime')
          .select('*')
          .ilike('title', `%${searchQuery}%`)
          .order('title')
          .limit(10);

        if (error) throw error;
        setSearchResults(data as Anime[] || []);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search failed",
          description: "Failed to load search results. Please try again.",
          variant: "destructive",
        });
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      if (open && searchQuery.trim()) {
        fetchSearchResults();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, open, toast]);

  const handleSelect = (animeId: string) => {
    navigate(`/anime/${animeId}`);
    onOpenChange(false);
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl">
        <DialogTitle className="sr-only">Search Anime</DialogTitle>
        <Command className="rounded-lg border-none">
          <CommandInput 
            placeholder="Search for anime..." 
            value={searchQuery}
            onValueChange={handleInputChange}
            className="h-12"
            autoFocus
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-anime-muted" />
              </div>
            ) : searchQuery.length > 0 ? (
              <>
                <CommandEmpty>No results found.</CommandEmpty>
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
                Start typing to search...
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
