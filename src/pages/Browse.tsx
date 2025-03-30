
import { useEffect, useState } from 'react';
import { supabase, type Anime } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import AnimeCard from '@/components/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';

const Browse = () => {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all anime
        const { data, error } = await supabase
          .from('anime')
          .select('*')
          .order('title', { ascending: true });
          
        if (error) throw error;
        
        setAnime(data as Anime[] || []);
      } catch (error) {
        console.error('Error fetching anime data:', error);
        toast({
          title: "Error fetching anime",
          description: "Could not load anime data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnimeData();
  }, [toast]);

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      
      <main className="container px-4 mx-auto pt-24">
        <h1 className="text-2xl font-bold mb-8">Browse All Anime</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, index) => (
              <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : anime.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {anime.map((animeItem) => (
              <AnimeCard key={animeItem.id} anime={animeItem} />
            ))}
          </div>
        ) : (
          <p className="text-anime-muted text-center py-10">No anime found</p>
        )}
      </main>
    </div>
  );
};

export default Browse;
