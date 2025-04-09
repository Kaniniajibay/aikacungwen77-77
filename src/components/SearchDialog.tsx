
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SearchIcon, X } from 'lucide-react';
import SearchResults from './SearchResults';
import { useAnimeSearch } from '../hooks/useAnimeSearch';
import { Anime } from '@/lib/supabase';

// Cache for anime data to improve search performance
let animeCache: Anime[] = [];

// Function to update the anime cache
export const updateAnimeCache = (recentAnime: Anime[], popularAnime: Anime[]) => {
  // Combine and deduplicate anime by ID
  const uniqueMap = new Map<string, Anime>();
  
  [...recentAnime, ...popularAnime].forEach(anime => {
    if (!uniqueMap.has(anime.id)) {
      uniqueMap.set(anime.id, anime);
    }
  });
  
  animeCache = Array.from(uniqueMap.values());
  console.log(`Anime cache updated with ${animeCache.length} entries`);
};

// Export the anime cache for potential use in other components
export const getAnimeCache = () => animeCache;

interface SearchDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { searchAnime, results, isLoading } = useAnimeSearch();

  // Use the provided open state if available, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length >= 2) {
      searchAnime(value);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-background/80 backdrop-blur-md border-muted-foreground/20 hover:bg-background/90">
          <SearchIcon size={16} />
          <span className="hidden sm:inline">Cari Anime...</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-lg font-medium flex items-center gap-2">
            <SearchIcon size={20} />
            Pencarian Anime
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Input
              placeholder="Masukkan judul anime..."
              className="pr-10 h-12 text-base"
              value={query}
              onChange={handleSearch}
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {query.length >= 2 && (
            <div className="max-h-[60vh] overflow-y-auto">
              <SearchResults results={results} isLoading={isLoading} closeDialog={() => setDialogOpen(false)} />
            </div>
          )}
          
          {query.length > 0 && query.length < 2 && (
            <p className="text-sm text-muted-foreground text-center py-2">
              Ketik minimal 2 karakter untuk memulai pencarian
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
