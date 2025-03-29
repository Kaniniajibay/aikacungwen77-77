
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkAdminAuth } from '@/lib/supabase';
import AnimeForm from '@/components/AnimeForm';
import { Loader2 } from 'lucide-react';

const AdminNewAnime = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAdmin = async () => {
      setIsLoading(true);
      const { authenticated } = await checkAdminAuth();
      
      if (!authenticated) {
        navigate('/admin');
        return;
      }
      
      setIsLoading(false);
    };
    
    verifyAdmin();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-anime-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-anime-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-anime-background">
      <header className="bg-anime-card shadow-md">
        <div className="container px-4 mx-auto py-4">
          <h1 className="text-xl font-bold">Add New Anime</h1>
        </div>
      </header>
      
      <main className="container px-4 mx-auto py-8">
        <div className="bg-anime-card rounded-lg p-6">
          <AnimeForm />
        </div>
      </main>
    </div>
  );
};

export default AdminNewAnime;
