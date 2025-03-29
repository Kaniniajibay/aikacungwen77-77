
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, type Anime } from '@/lib/supabase';
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
import { LogOut, Plus, Edit, Trash } from 'lucide-react';

const AdminDashboard = () => {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animeToDelete, setAnimeToDelete] = useState<string | null>(null);
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
    const fetchAnimeList = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('anime')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setAnimeList(data as Anime[] || []);
      } catch (error) {
        console.error('Error fetching anime list:', error);
        toast({
          title: "Error fetching anime",
          description: "Could not load anime list. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnimeList();
  }, [toast]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (id: string) => {
    setAnimeToDelete(id);
  };

  const handleDelete = async () => {
    if (!animeToDelete) return;
    
    try {
      // First delete related episodes
      const { error: episodesError } = await supabase
        .from('episodes')
        .delete()
        .eq('anime_id', animeToDelete);
        
      if (episodesError) throw episodesError;
      
      // Then delete the anime
      const { error } = await supabase
        .from('anime')
        .delete()
        .eq('id', animeToDelete);
        
      if (error) throw error;
      
      setAnimeList(animeList.filter(anime => anime.id !== animeToDelete));
      
      toast({
        title: "Anime deleted",
        description: "The anime and its episodes have been deleted successfully",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete anime. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnimeToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-anime-background">
      <header className="bg-anime-card shadow-md">
        <div className="container px-4 mx-auto py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-anime-muted"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container px-4 mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Anime List</h2>
          <Link to="/admin/anime/new">
            <Button className="bg-anime-primary hover:bg-anime-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add New Anime
            </Button>
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-anime-muted">Loading anime list...</p>
          </div>
        ) : animeList.length > 0 ? (
          <div className="bg-anime-card rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Episodes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {animeList.map((anime) => (
                  <TableRow key={anime.id}>
                    <TableCell>
                      <img 
                        src={anime.image_url} 
                        alt={anime.title} 
                        className="w-16 h-20 object-cover rounded-md" 
                      />
                    </TableCell>
                    <TableCell className="font-medium">{anime.title}</TableCell>
                    <TableCell>{anime.release_year}</TableCell>
                    <TableCell className="capitalize">{anime.status}</TableCell>
                    <TableCell>
                      <Link 
                        to={`/admin/anime/${anime.id}/episodes`}
                        className="text-anime-primary hover:underline"
                      >
                        Manage Episodes
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/admin/anime/${anime.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => confirmDelete(anime.id)}
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
            <p className="text-anime-muted mb-4">No anime found in the database.</p>
            <Link to="/admin/anime/new">
              <Button className="bg-anime-primary hover:bg-anime-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Anime
              </Button>
            </Link>
          </div>
        )}
      </main>
      
      <AlertDialog open={!!animeToDelete} onOpenChange={() => setAnimeToDelete(null)}>
        <AlertDialogContent className="bg-anime-card border-anime-primary/20">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this anime and all its episodes. This action cannot be undone.
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

export default AdminDashboard;
