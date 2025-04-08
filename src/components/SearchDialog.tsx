
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandInput, CommandList } from '@/components/ui/command';
import { useNavigate } from 'react-router-dom';
import SearchResults from './SearchResults';
import { useAnimeSearch, updateAnimeCache } from '@/hooks/useAnimeSearch';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Re-export updateAnimeCache for Index.tsx to use
export { updateAnimeCache };

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm, searchResults, isLoading } = useAnimeSearch(open);

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
            <SearchResults 
              isLoading={isLoading}
              searchTerm={searchTerm}
              searchResults={searchResults}
              onSelectItem={handleSelect}
            />
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
