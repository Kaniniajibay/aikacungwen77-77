
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-anime-background flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-anime-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
        <p className="text-anime-muted mb-8">The page you are looking for doesn't exist or has been moved.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button className="bg-anime-primary hover:bg-anime-primary/90 w-full sm:w-auto">
              Go to Home
            </Button>
          </Link>
          <Link to="/browse">
            <Button variant="outline" className="border-anime-primary/20 text-anime-primary w-full sm:w-auto">
              Browse Anime
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
