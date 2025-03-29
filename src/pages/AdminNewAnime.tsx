
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import AnimeForm from '@/components/AnimeForm';

const AdminNewAnime = () => {
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
