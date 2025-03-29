
import { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const isSupabaseError = this.state.error?.message.includes('Supabase');
      
      return (
        <div className="min-h-screen bg-anime-background flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-anime-card p-8 rounded-lg max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            
            {isSupabaseError ? (
              <>
                <p className="mb-4 text-anime-muted">
                  The application couldn't connect to Supabase. Please make sure you've set up the required environment variables.
                </p>
                <div className="bg-gray-800 p-4 rounded text-left mb-4 overflow-auto">
                  <p className="text-green-400 text-sm font-mono">
                    # Create a .env file in your project root with:<br/>
                    VITE_SUPABASE_URL=your_supabase_url<br/>
                    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                  </p>
                </div>
                <p className="text-sm text-anime-muted mb-4">
                  You can find these values in your Supabase project dashboard under Project Settings &gt; API.
                </p>
              </>
            ) : (
              <p className="mb-4 text-anime-muted">{this.state.error?.message || 'An unknown error occurred'}</p>
            )}
            
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-anime-primary hover:bg-anime-primary/90 w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
