
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, type Anime } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import AnimeForm from '@/components/AnimeForm';
import { Skeleton } from '@/components/ui/skeleton';

const AdminEditAnime = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchAnime = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('anime')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setAnime(data as Anime);
      } catch (error) {
        console.error('Error fetching anime:', error);
        toast({
          title: "Error",
          description: "Could not load anime data. Please try again later.",
          variant: "destructive",
        });
        navigate('/admin/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnime();
  }, [id, toast, navigate]);

  return (
    <div className="min-h-screen bg-anime-background">
      <header className="bg-anime-card shadow-md">
        <div className="container px-4 mx-auto py-4">
          <h1 className="text-xl font-bold">Edit Anime</h1>
        </div>
      </header>
      
      <main className="container px-4 mx-auto py-8">
        <div className="bg-anime-card rounded-lg p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : anime ? (
            <AnimeForm anime={anime} isEdit />
          ) : (
            <div className="text-center py-8">
              <p className="text-anime-muted">Anime not found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEditAnime;
