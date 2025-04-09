
import React from 'react';
import { Link } from 'react-router-dom';
import { AnimeType } from '../integrations/supabase/types';
import { Skeleton } from './ui/skeleton';
import { AlertCircle, Star, Clock } from 'lucide-react';

type SearchResultsProps = {
  results: AnimeType[] | null;
  isLoading: boolean;
  closeDialog: () => void;
};

const SearchResults = ({ results, isLoading, closeDialog }: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-2">
            <Skeleton className="w-16 h-16 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-full max-w-[200px]" />
              <Skeleton className="h-4 w-full max-w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="py-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/70 mb-2" />
        <p className="text-muted-foreground font-medium">Tidak ada hasil yang ditemukan</p>
        <p className="text-muted-foreground/60 text-sm mt-1">
          Coba kata kunci lain atau cek ejaan
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 divide-y divide-border/60">
      {results.map((anime) => (
        <Link
          key={anime.id}
          to={`/anime/${anime.id}`}
          onClick={closeDialog}
          className="flex gap-3 p-3 hover:bg-muted/50 transition-colors rounded-md group"
        >
          <div className="flex-shrink-0">
            <img
              src={anime.image_url || '/placeholder.svg'}
              alt={anime.title}
              className="w-16 h-20 object-cover rounded-md shadow-sm group-hover:shadow transition-all"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-base group-hover:text-primary transition-colors truncate">
              {anime.title}
            </h4>
            <p className="text-muted-foreground text-sm line-clamp-1">
              {anime.description || "Tidak ada deskripsi"}
            </p>
            <div className="flex items-center gap-x-4 mt-1.5">
              <div className="flex items-center text-amber-500 gap-1 text-xs">
                <Star size={14} />
                <span>{anime.rating || "N/A"}</span>
              </div>
              <div className="flex items-center text-muted-foreground gap-1 text-xs">
                <Clock size={14} />
                <span>{anime.release_year || "N/A"}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SearchResults;
