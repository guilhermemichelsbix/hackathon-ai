import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import "@/lib/i18n";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useKanbanStore } from "@/store/kanban";
import { authService } from "@/services/authService";
import { useTheme } from "@/hooks/useTheme";

const queryClient = new QueryClient();

const App = () => {
  const { setUser, loadBoard, connectToRealtime } = useKanbanStore();
  const { theme } = useTheme();

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Check if user is already authenticated
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
          // Load board data and connect to real-time
          await loadBoard();
          connectToRealtime();
        }
      } catch (error) {
        console.log('User not authenticated, will show login modal');
      }
    };

    initializeApp();
  }, [setUser, loadBoard, connectToRealtime]);

        return (
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className={`min-h-screen transition-colors duration-300 bg-background ${theme}`}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        );
};

export default App;
