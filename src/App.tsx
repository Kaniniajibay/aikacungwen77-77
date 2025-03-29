import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnimeDetail from "./pages/AnimeDetail";
import Watch from "./pages/Watch";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminNewAnime from "./pages/AdminNewAnime";
import AdminEditAnime from "./pages/AdminEditAnime";
import AdminEpisodes from "./pages/AdminEpisodes";
import ErrorBoundary from '@/components/ErrorBoundary';

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/anime/:id" element={<AnimeDetail />} />
              <Route path="/watch/:animeId/:episodeId" element={<Watch />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/anime/new" element={<AdminNewAnime />} />
              <Route path="/admin/anime/:id/edit" element={<AdminEditAnime />} />
              <Route path="/admin/anime/:id/episodes" element={<AdminEpisodes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
