
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, type Anime, type Episode } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavBar from '@/components/NavBar';

const Watch = () => {
  const { animeId, episodeId } = useParams<{ animeId: string, episodeId: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
  const [prevEpisode, setPrevEpisode] = useState<Episode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEpisodeData = async () => {
      if (!animeId || !episodeId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch anime details
        const { data: animeData, error: animeError } = await supabase
          .from('anime')
          .select('*')
          .eq('id', animeId)
          .single();
          
        if (animeError) throw animeError;
        
        // Fetch current episode
        const { data: episodeData, error: episodeError } = await supabase
          .from('episodes')
          .select('*')
          .eq('id', episodeId)
          .single();
          
        if (episodeError) throw episodeError;
        
        // Fetch all episodes for navigation
        const { data: allEpisodesData, error: allEpisodesError } = await supabase
          .from('episodes')
          .select('*')
          .eq('anime_id', animeId)
          .order('episode_number', { ascending: true });
          
        if (allEpisodesError) throw allEpisodesError;
        
        setAnime(animeData as Anime);
        setEpisode(episodeData as Episode);
        setAllEpisodes(allEpisodesData as Episode[] || []);
        
        // Find previous and next episodes
        if (allEpisodesData) {
          const typedEpisodes = allEpisodesData as Episode[];
          const currentIndex = typedEpisodes.findIndex(ep => ep.id === episodeId);
          
          if (currentIndex > 0) {
            setPrevEpisode(typedEpisodes[currentIndex - 1]);
          } else {
            setPrevEpisode(null);
          }
          
          if (currentIndex < typedEpisodes.length - 1) {
            setNextEpisode(typedEpisodes[currentIndex + 1]);
          } else {
            setNextEpisode(null);
          }
        }
      } catch (error) {
        console.error('Error fetching episode data:', error);
        toast({
          title: "Error loading episode",
          description: "Could not load the episode. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEpisodeData();
  }, [animeId, episodeId, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col">
        <NavBar />
        <div className="pt-16">
          <Skeleton className="w-full aspect-video" />
          <div className="container px-4 mx-auto py-6">
            <Skeleton className="w-48 h-6 mb-2" />
            <Skeleton className="w-64 h-4 mb-4" />
            <Skeleton className="w-full h-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!anime || !episode) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <NavBar />
        <div className="pt-24">
          <h1 className="text-2xl font-bold mb-4">Episode Not Found</h1>
          <p className="text-anime-muted mb-6">The episode you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="bg-anime-primary hover:bg-anime-primary/90 text-white px-6 py-2 rounded-md font-medium transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <NavBar />
      
      {/* Video Player */}
      <div className="w-full aspect-video bg-black relative mt-16">
        <iframe 
          src={episode.video_url} 
          className="w-full h-full"
          allowFullScreen 
          title={episode.title}
        ></iframe>
      </div>
      
      {/* Episode Info */}
      <div className="container px-4 mx-auto py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{anime.title} - Episode {episode.episode_number}</h1>
            <h2 className="text-sm text-anime-muted">{episode.title}</h2>
          </div>
          <div className="flex gap-2">
            {prevEpisode && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white flex items-center gap-1"
                onClick={() => navigate(`/watch/${animeId}/${prevEpisode.id}`)}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
            )}
            
            {nextEpisode && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white flex items-center gap-1"
                onClick={() => navigate(`/watch/${animeId}/${nextEpisode.id}`)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="episodes">Episodes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description">
            <div className="bg-anime-card p-4 rounded-lg mb-6">
              <p className="text-sm">{episode.description}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="episodes">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {allEpisodes.map((ep) => (
                <Link 
                  key={ep.id} 
                  to={`/watch/${animeId}/${ep.id}`}
                  className={`block relative rounded-md overflow-hidden ${ep.id === episodeId ? 'ring-2 ring-anime-primary' : ''}`}
                >
                  <div className="aspect-video bg-anime-card relative group">
                    <img 
                      src={ep.thumbnail_url} 
                      alt={`Episode ${ep.episode_number}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
                      <p className="text-xs font-medium truncate">Ep {ep.episode_number}: {ep.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-4">
          <Link 
            to={`/anime/${animeId}`} 
            className="bg-anime-primary/10 hover:bg-anime-primary/20 text-anime-primary px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            All Episodes
          </Link>
          <Link 
            to="/" 
            className="bg-anime-card hover:bg-anime-card/80 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Watch;
