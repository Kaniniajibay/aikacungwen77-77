
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type Anime, type Episode } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import NavBar from '@/components/NavBar';
import EpisodeCard from '@/components/EpisodeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';

const AnimeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnimeDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch anime details
        const { data: animeData, error: animeError } = await supabase
          .from('anime')
          .select('*')
          .eq('id', id)
          .single();
          
        if (animeError) throw animeError;
        
        // Fetch episodes
        const { data: episodesData, error: episodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('anime_id', id)
          .order('episode_number', { ascending: true });
          
        if (episodesError) throw episodesError;
        
        setAnime(animeData);
        setEpisodes(episodesData || []);
      } catch (error) {
        console.error('Error fetching anime details:', error);
        toast({
          title: "Error fetching anime details",
          description: "Could not load the anime details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnimeDetails();
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container px-4 mx-auto pt-24">
          <Skeleton className="w-full h-[300px] rounded-xl mb-8" />
          <Skeleton className="w-64 h-8 mb-4" />
          <Skeleton className="w-full h-32 mb-8" />
          <Skeleton className="w-48 h-8 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, index) => (
              <Skeleton key={index} className="aspect-video rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="container px-4 mx-auto pt-24 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
          <p className="text-anime-muted mb-6">The anime you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="bg-anime-primary hover:bg-anime-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <NavBar />
      
      <div className="container px-4 mx-auto pt-24">
        {/* Hero Section */}
        <div className="w-full h-[300px] relative rounded-xl overflow-hidden mb-8">
          <img 
            src={anime.image_url} 
            alt={anime.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6">
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{anime.title}</h1>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs text-white px-2 py-1 rounded-full bg-anime-primary/80">
                  {anime.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                </span>
                <span className="text-xs text-white px-2 py-1 rounded-full bg-white/20">
                  {anime.release_year}
                </span>
                {anime.genres.map((genre, index) => (
                  <span key={index} className="text-xs text-white px-2 py-1 rounded-full bg-white/20">
                    {genre}
                  </span>
                ))}
              </div>
              {episodes.length > 0 && (
                <Link 
                  to={`/watch/${anime.id}/${episodes[0].id}`}
                  className="bg-anime-primary hover:bg-anime-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors inline-block"
                >
                  Watch Now
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="episodes">
            <h2 className="text-xl font-bold mb-4">Episodes</h2>
            {episodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {episodes.map((episode) => (
                  <EpisodeCard key={episode.id} episode={episode} animeId={anime.id} />
                ))}
              </div>
            ) : (
              <p className="text-anime-muted">No episodes available for this anime yet.</p>
            )}
          </TabsContent>
          
          <TabsContent value="details">
            <h2 className="text-xl font-bold mb-4">Details</h2>
            <div className="bg-anime-card p-4 rounded-lg">
              <p className="text-sm md:text-base mb-4">{anime.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="text-anime-muted mb-1">Status</h3>
                  <p className="capitalize">{anime.status}</p>
                </div>
                <div>
                  <h3 className="text-anime-muted mb-1">Release Year</h3>
                  <p>{anime.release_year}</p>
                </div>
                <div className="col-span-2">
                  <h3 className="text-anime-muted mb-1">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map((genre, index) => (
                      <span key={index} className="text-xs px-2 py-1 rounded-full bg-anime-primary/20 text-anime-primary">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnimeDetail;
