import { Navigate } from 'react-router-dom';
import { useKanbanStore } from '@/store/kanban';
import AppLayout from '@/layouts/AppLayout';
import KanbanPage from '@/pages/KanbanPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useKanbanStore();
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
}

export const appRoutes = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/',
        element: <KanbanPage />,
      },
      {
        path: '/kanban',
        element: <KanbanPage />,
      },
    ],
  },
];
