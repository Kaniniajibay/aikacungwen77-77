
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import RecentlyAdded from "./pages/RecentlyAdded";
import NotFound from "./pages/NotFound";
import AnimeDetail from "./pages/AnimeDetail";
import Watch from "./pages/Watch";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNewAnime from "./pages/AdminNewAnime";
import AdminEditAnime from "./pages/AdminEditAnime";
import AdminEpisodes from "./pages/AdminEpisodes";
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Check if we're in demo mode
const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true';

// Create a context provider for demo mode
function DemoModeWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [showDemoNotice, setShowDemoNotice] = useState(isDemoMode);
  
  useEffect(() => {
    // Show demo notice for 5 seconds when first loading in demo mode
    if (isDemoMode) {
      const timer = setTimeout(() => {
        setShowDemoNotice(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Redirect from admin pages in demo mode
  useEffect(() => {
    if (isDemoMode && location.pathname.startsWith('/admin')) {
      window.location.href = '/';
    }
  }, [location.pathname]);

  return (
    <>
      {children}
      
      {showDemoNotice && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-600 text-white p-3 text-center z-50">
          Running in demo mode. Database features are disabled.
        </div>
      )}
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/recently-added" element={<RecentlyAdded />} />
      <Route path="/anime/:id" element={<AnimeDetail />} />
      <Route path="/watch/:animeId/:episodeId" element={<Watch />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/anime/new" element={<AdminNewAnime />} />
      <Route path="/admin/anime/:id/edit" element={<AdminEditAnime />} />
      <Route path="/admin/anime/:id/episodes" element={<AdminEpisodes />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DemoModeWrapper>
              <AppRoutes />
            </DemoModeWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
