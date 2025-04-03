import { useEffect, useState } from 'react';
import { supabase, type Anime } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import AnimeCard from '@/components/AnimeCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { updateAnimeCache } from '@/components/SearchDialog';

const Index = () => {
  const [featuredAnime, setFeaturedAnime] = useState<Anime | null>(null);
  const [recentAnime, setRecentAnime] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firstEpisodeId, setFirstEpisodeId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnimeData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch recently added anime
        const { data: recentData, error: recentError } = await supabase
          .from('anime')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(6);
          
        if (recentError) throw recentError;
        
        // Fetch popular anime
        const { data: popularData, error: popularError } = await supabase
          .from('anime')
          .select('*')
          .order('release_year', { ascending: false })
          .limit(12);
          
        if (popularError) throw popularError;
        
        // Set a featured anime (first in the recent list for demo purposes)
        const featured = recentData && recentData.length > 0 ? recentData[0] as Anime : null;
        
        setFeaturedAnime(featured);
        setRecentAnime(recentData as Anime[] || []);
        setPopularAnime(popularData as Anime[] || []);
        
        // Immediately update the anime cache for search functionality
        console.log('Updating anime cache from Index.tsx');
        updateAnimeCache(recentData as Anime[], popularData as Anime[]);
        
        // Fetch the first episode for the featured anime to make Watch Now button work
        if (featured) {
          const { data: episodesData, error: episodesError } = await supabase
            .from('episodes')
            .select('id')
            .eq('anime_id', featured.id)
            .order('episode_number', { ascending: true })
            .limit(1);
            
          if (!episodesError && episodesData && episodesData.length > 0) {
            // Fix: Add proper type checking for the episode ID
            const episodeId = episodesData[0]?.id;
            if (typeof episodeId === 'string') {
              setFirstEpisodeId(episodeId);
            }
          }
        }
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
        {/* Featured Anime Section */}
        {isLoading ? (
          <Skeleton className="w-full h-[400px] rounded-xl mb-8" />
        ) : featuredAnime ? (
          <div className="w-full h-[400px] relative rounded-xl overflow-hidden mb-8">
            <img 
              src={featuredAnime.image_url} 
              alt={featuredAnime.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
              <div className="animate-fade-in">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{featuredAnime.title}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {featuredAnime.genres.map((genre, index) => (
                    <span key={index} className="text-xs text-white px-2 py-1 rounded-full bg-white/20">
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="text-sm md:text-base text-gray-300 mb-4 max-w-2xl line-clamp-2">
                  {featuredAnime.description}
                </p>
                {firstEpisodeId ? (
                  <Link to={`/watch/${featuredAnime.id}/${firstEpisodeId}`}>
                    <button className="bg-anime-primary hover:bg-anime-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors">
                      Watch Now
                    </button>
                  </Link>
                ) : (
                  <Link to={`/anime/${featuredAnime.id}`}>
                    <button className="bg-anime-primary hover:bg-anime-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors">
                      View Details
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Card className="w-full h-[400px] rounded-xl mb-8 flex items-center justify-center">
            <p className="text-anime-muted">No featured anime available</p>
          </Card>
        )}
        
        {/* Recently Added Section */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Recently Added</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, index) => (
                <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : recentAnime.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentAnime.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          ) : (
            <p className="text-anime-muted">No recent anime available</p>
          )}
        </section>
        
        {/* Popular Anime Section */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Popular Anime</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array(12).fill(0).map((_, index) => (
                <Skeleton key={index} className="aspect-[2/3] rounded-lg" />
              ))}
            </div>
          ) : popularAnime.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularAnime.slice(0, 10).map((anime, index) => (
                <div key={anime.id} className="relative">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-anime-primary rounded-full flex items-center justify-center z-10 shadow-lg">
                    <span className="text-white font-bold text-sm">#{index + 1}</span>
                  </div>
                  <AnimeCard anime={anime} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-anime-muted">No popular anime available</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
