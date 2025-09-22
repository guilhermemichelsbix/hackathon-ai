import { Navigate } from 'react-router-dom';
import { useKanbanStore } from '@/store/kanban';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Public Route Component (redirect if already authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useKanbanStore();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

export const authRoutes = [
  {
    path: '/auth',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: '/auth/login',
        element: <LoginPage />,
      },
      {
        path: '/auth/register',
        element: <RegisterPage />,
      },
      {
        path: '/auth',
        element: <Navigate to="/auth/login" replace />,
      },
    ],
  },
];
