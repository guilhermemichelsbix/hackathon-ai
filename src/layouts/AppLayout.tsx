import { Outlet } from 'react-router-dom';
import { KanbanHeader } from '@/components/kanban/KanbanHeader';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <KanbanHeader />
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
