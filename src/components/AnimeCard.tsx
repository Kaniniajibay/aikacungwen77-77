
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import type { Anime } from '@/lib/supabase';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
}

const AnimeCard = ({ anime, className }: AnimeCardProps) => {
  return (
    <Link to={`/anime/${anime.id}`} className={cn("block", className)}>
      <Card className="anime-card border-0 group">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img 
            src={anime.image_url} 
            alt={anime.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-anime-primary/80 w-fit mb-2">
              {anime.status === 'ongoing' ? 'Ongoing' : 'Completed'}
            </span>
            <div className="flex flex-wrap gap-1 mb-2">
              {anime.genres.slice(0, 2).map((genre, index) => (
                <span key={index} className="text-xs text-white/80 px-2 py-0.5 rounded-full bg-white/10">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1">{anime.title}</h3>
          <p className="text-xs text-anime-muted">{anime.release_year}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default AnimeCard;
