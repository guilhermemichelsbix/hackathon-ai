import { KanbanHeader } from "@/components/kanban/KanbanHeader";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CardFormModal } from '@/components/kanban/CardFormModal';
import { useState } from 'react';

const Index = () => {
  const [isCardFormOpen, setIsCardFormOpen] = useState(false);
  const [selectedColumnForNew, setSelectedColumnForNew] = useState<string | null>(null);

  const handleAddCard = (columnId?: string) => {
    setSelectedColumnForNew(columnId || null);
    setIsCardFormOpen(true);
  };

  const handleCreateColumn = () => {
    // TODO: Implement column creation
    console.log('Create column');
  };

  const handleCloseCardForm = () => {
    setIsCardFormOpen(false);
    setSelectedColumnForNew(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <KanbanHeader 
        onAddCard={handleAddCard}
        onCreateColumn={handleCreateColumn}
      />
      <main className="flex-1">
        <KanbanBoard />
      </main>

      {/* Card Form Modal */}
      <CardFormModal
        columnId={selectedColumnForNew}
        isOpen={isCardFormOpen}
        onClose={handleCloseCardForm}
      />
    </div>
  );
};

export default Index;
