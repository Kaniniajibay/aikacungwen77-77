import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase, type Anime, type Episode } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash } from 'lucide-react';

const AdminEpisodes = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [episodeToDelete, setEpisodeToDelete] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Partial<Episode>>({
    anime_id: id,
    title: '',
    episode_number: 1,
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration: 0,
  });
  const [formLoading, setFormLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate('/admin');
        return;
      }
      
      // Verify if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('role')
        .eq('email', data.session.user.email)
        .single();
        
      if (adminError || !adminData || adminData.role !== 'admin') {
        await supabase.auth.signOut();
        navigate('/admin');
      }
    };
    
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
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
        
        setAnime(animeData as Anime);
        setEpisodes(episodesData as Episode[] || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Could not load data. Please try again later.",
          variant: "destructive",
        });
        navigate('/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, toast, navigate]);

  const handleOpenDialog = (episode?: Episode) => {
    if (episode) {
      setCurrentEpisode(episode);
      setIsEditing(true);
    } else {
      // For new episode, set the next episode number
      const nextEpisodeNumber = episodes.length > 0
        ? Math.max(...episodes.map(ep => ep.episode_number)) + 1
        : 1;
      
      setCurrentEpisode({
        anime_id: id,
        title: '',
        episode_number: nextEpisodeNumber,
        description: '',
        video_url: '',
        thumbnail_url: '',
        duration: 0,
      });
      setIsEditing(false);
    }
    
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentEpisode({
      anime_id: id,
      title: '',
      episode_number: 1,
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'episode_number' || name === 'duration') {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        setCurrentEpisode({ ...currentEpisode, [name]: numValue });
      }
    } else {
      setCurrentEpisode({ ...currentEpisode, [name]: value });
    }
  };

  const handleSaveEpisode = async () => {
    // Validation
    if (
      !currentEpisode.title || 
      !currentEpisode.video_url || 
      !currentEpisode.thumbnail_url || 
      !currentEpisode.description
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setFormLoading(true);
      
      if (isEditing && currentEpisode.id) {
        // Update existing episode
        const { error } = await supabase
          .from('episodes')
          .update({
            title: currentEpisode.title,
            episode_number: currentEpisode.episode_number,
            description: currentEpisode.description,
            video_url: currentEpisode.video_url,
            thumbnail_url: currentEpisode.thumbnail_url,
            duration: currentEpisode.duration,
          })
          .eq('id', currentEpisode.id);
          
        if (error) throw error;
        
        // Update local state
        setEpisodes(episodes.map(ep => 
          ep.id === currentEpisode.id ? { ...ep, ...currentEpisode as Episode } : ep
        ));
        
        toast({
          title: "Episode updated",
          description: "The episode has been updated successfully",
        });
      } else {
        // Create new episode
        const { data, error } = await supabase
          .from('episodes')
          .insert({
            anime_id: id,
            title: currentEpisode.title,
            episode_number: currentEpisode.episode_number,
            description: currentEpisode.description,
            video_url: currentEpisode.video_url,
            thumbnail_url: currentEpisode.thumbnail_url,
            duration: currentEpisode.duration,
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Add to local state
        setEpisodes([...episodes, data as Episode]);
        
        toast({
          title: "Episode added",
          description: "The episode has been added successfully",
        });
      }
      
      handleCloseDialog();
    } catch (error: any) {
      console.error('Save episode error:', error);
      toast({
        title: isEditing ? "Update failed" : "Creation failed",
        description: error.message || "Failed to save episode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDelete = (id: string) => {
    setEpisodeToDelete(id);
  };

  const handleDelete = async () => {
    if (!episodeToDelete) return;
    
    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeToDelete);
        
      if (error) throw error;
      
      setEpisodes(episodes.filter(episode => episode.id !== episodeToDelete));
      
      toast({
        title: "Episode deleted",
        description: "The episode has been deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete episode. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEpisodeToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-anime-background">
      <header className="bg-anime-card shadow-md">
        <div className="container px-4 mx-auto py-4">
          <div className="flex items-center">
            <Link to="/admin/dashboard" className="text-anime-primary mr-2">
              ← Back
            </Link>
            <h1 className="text-xl font-bold">
              {isLoading ? 'Loading...' : anime ? `Episodes for ${anime.title}` : 'Episodes'}
            </h1>
          </div>
        </div>
      </header>
      
      <main className="container px-4 mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Episodes List</h2>
          <Button 
            className="bg-anime-primary hover:bg-anime-primary/90"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Episode
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : episodes.length > 0 ? (
          <div className="bg-anime-card rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ep #</TableHead>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {episodes.map((episode) => (
                  <TableRow key={episode.id}>
                    <TableCell>{episode.episode_number}</TableCell>
                    <TableCell>
                      <img 
                        src={episode.thumbnail_url} 
                        alt={episode.title} 
                        className="w-24 h-16 object-cover rounded-md" 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{episode.title}</TableCell>
                    <TableCell>{formatDuration(episode.duration)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDialog(episode)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => confirmDelete(episode.id)}
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="bg-anime-card rounded-lg p-8 text-center">
            <p className="text-anime-muted mb-4">No episodes found for this anime.</p>
            <Button 
              className="bg-anime-primary hover:bg-anime-primary/90"
              onClick={() => handleOpenDialog()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Episode
            </Button>
          </div>
        )}
      </main>
      
      {/* Episode Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-anime-card border-anime-primary/20 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Episode' : 'Add New Episode'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update the details for this episode.' 
                : 'Fill in the details to add a new episode.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="episode_number" className="block text-sm font-medium mb-1">
                  Episode Number <span className="text-red-500">*</span>
                </label>
                <Input
                  id="episode_number"
                  name="episode_number"
                  type="number"
                  value={currentEpisode.episode_number}
                  onChange={handleInputChange}
                  className="bg-anime-background border-anime-primary/20"
                  min={1}
                  required
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium mb-1">
                  Duration (seconds) <span className="text-red-500">*</span>
                </label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  value={currentEpisode.duration}
                  onChange={handleInputChange}
                  className="bg-anime-background border-anime-primary/20"
                  min={1}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                name="title"
                value={currentEpisode.title}
                onChange={handleInputChange}
                className="bg-anime-background border-anime-primary/20"
                required
              />
            </div>
            
            <div>
              <label htmlFor="video_url" className="block text-sm font-medium mb-1">
                Video URL <span className="text-red-500">*</span>
              </label>
              <Input
                id="video_url"
                name="video_url"
                value={currentEpisode.video_url}
                onChange={handleInputChange}
                className="bg-anime-background border-anime-primary/20"
                placeholder="Enter video embed URL"
                required
              />
            </div>
            
            <div>
              <label htmlFor="thumbnail_url" className="block text-sm font-medium mb-1">
                Thumbnail URL <span className="text-red-500">*</span>
              </label>
              <Input
                id="thumbnail_url"
                name="thumbnail_url"
                value={currentEpisode.thumbnail_url}
                onChange={handleInputChange}
                className="bg-anime-background border-anime-primary/20"
                required
              />
              {currentEpisode.thumbnail_url && (
                <div className="mt-2">
                  <img 
                    src={currentEpisode.thumbnail_url} 
                    alt="Thumbnail preview" 
                    className="h-24 object-cover rounded-md"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/640x360?text=Error+Loading+Image')}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                name="description"
                value={currentEpisode.description}
                onChange={handleInputChange}
                className="bg-anime-background border-anime-primary/20"
                rows={3}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCloseDialog}
              className="border-anime-primary/20 text-anime-text"
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEpisode}
              className="bg-anime-primary hover:bg-anime-primary/90"
              disabled={formLoading}
            >
              {formLoading 
                ? "Saving..." 
                : isEditing ? "Update Episode" : "Add Episode"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!episodeToDelete} onOpenChange={() => setEpisodeToDelete(null)}>
        <AlertDialogContent className="bg-anime-card border-anime-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this episode. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-anime-primary/20 text-anime-text">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export default AdminEpisodes;
