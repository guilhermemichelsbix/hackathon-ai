import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import "@/lib/i18n";
import { useKanbanStore } from "@/store/kanban";
import { authService } from "@/services/authService";
import { useTheme } from "@/hooks/useTheme";
import { useSocket } from "@/hooks/useSocket";
import { router } from "@/routes/router";

const queryClient = new QueryClient();

const App = () => {
  const { setUser, loadBoard } = useKanbanStore();
  const { theme } = useTheme();
  
  // Initialize Socket.IO connection for real-time updates
  const { joinBoard, isConnected } = useSocket();

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Check if user is already authenticated
        const user = await authService.getCurrentUser();
        if (user) {
          setUser(user);
          // Load board data
          await loadBoard();
          
          // Join default board for real-time updates
          joinBoard('default');
          
          console.log('🔍 Socket.IO connection status:', isConnected);
        }
      } catch (error) {
        console.log('User not authenticated, will show login page');
      }
    };

    initializeApp();
  }, [setUser, loadBoard, joinBoard]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div 
          className={`min-h-screen transition-all duration-300 bg-background text-foreground ${theme}`}
          data-theme={theme}
        >
          <RouterProvider router={router} />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
