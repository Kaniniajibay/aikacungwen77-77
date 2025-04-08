
import { Loader2, SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from '@/components/ui/command';
import { SimpleAnimeResult } from '@/hooks/useAnimeSearch';

interface SearchResultsProps {
  isLoading: boolean;
  searchTerm: string;
  searchResults: SimpleAnimeResult[];
  onSelectItem: (animeId: string) => void;
}

const SearchResults = ({ 
  isLoading, 
  searchTerm, 
  searchResults, 
  onSelectItem 
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-anime-muted" />
      </div>
    );
  }

  if (searchTerm.trim() === "") {
    return (
      <div className="py-6 text-center text-sm text-anime-muted">
        Ketik judul anime untuk mencari...
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <CommandEmpty className="py-6 flex flex-col items-center justify-center">
        <SearchX className="h-10 w-10 text-anime-muted mb-2" />
        <p className="text-anime-muted">Tidak ada hasil ditemukan.</p>
      </CommandEmpty>
    );
  }

  return (
    <CommandGroup>
      {searchResults.map((anime) => (
        <CommandItem 
          key={anime.id}
          onSelect={() => onSelectItem(anime.id)}
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
  );
};

export default SearchResults;
