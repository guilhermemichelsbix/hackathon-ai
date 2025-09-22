import { createBrowserRouter } from 'react-router-dom';
import { appRoutes } from './app.routes';
import { authRoutes } from './auth.routes';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  ...appRoutes,
  ...authRoutes,
  {
    path: '*',
    element: <NotFound />,
  },
]);
