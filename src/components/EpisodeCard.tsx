
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Play } from "lucide-react";
import { cn } from '@/lib/utils';
import type { Episode } from '@/lib/supabase';

interface EpisodeCardProps {
  episode: Episode;
  animeId: string;
  className?: string;
}

const EpisodeCard = ({ episode, animeId, className }: EpisodeCardProps) => {
  return (
    <Link to={`/watch/${animeId}/${episode.id}`} className={cn("block", className)}>
      <Card className="anime-card border-0 group">
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={episode.thumbnail_url} 
            alt={episode.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-anime-primary/80 flex items-center justify-center">
              <Play className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
            {formatDuration(episode.duration)}
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1">Episode {episode.episode_number}: {episode.title}</h3>
        </CardContent>
      </Card>
    </Link>
  );
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export default EpisodeCard;
