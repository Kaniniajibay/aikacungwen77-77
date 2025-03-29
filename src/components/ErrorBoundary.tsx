
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
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full shadow-lg">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            
            {isSupabaseError ? (
              <>
                <p className="mb-4 text-gray-300">
                  We're having trouble connecting to the database. This demo requires Supabase configuration.
                </p>
                <div className="bg-gray-900 p-4 rounded text-left mb-4 overflow-auto">
                  <p className="text-green-400 text-sm font-mono">
                    # Create a .env file in your project root with:<br/>
                    VITE_SUPABASE_URL=your_supabase_url<br/>
                    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                  </p>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  You can find these values in your Supabase project dashboard under Project Settings &gt; API.
                </p>
                <p className="text-gray-300 mb-6">
                  To try this demo without setting up Supabase, you can view the UI in read-only mode:
                </p>
              </>
            ) : (
              <p className="mb-4 text-gray-300">{this.state.error?.message || 'An unknown error occurred'}</p>
            )}
            
            <Button 
              onClick={() => window.location.href = '/?demo=true'} 
              className="bg-blue-600 hover:bg-blue-700 text-white w-full mb-3"
            >
              View Demo Mode
            </Button>
            
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="w-full"
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
