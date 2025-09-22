import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { kanbanService } from '@/services/kanbanService';

interface UserFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelected: string[]; // user IDs
  onApply: (userIds: string[]) => void;
}

export function UserFilterModal({ isOpen, onClose, initialSelected, onApply }: UserFilterModalProps) {
  const { t } = useTranslation();
  const [userSearch, setUserSearch] = useState('');
  const [allUsers, setAllUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(initialSelected || []);

  useEffect(() => {
    setSelectedUsers(initialSelected || []);
  }, [initialSelected, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let ignore = false;
    const fetchUsers = async () => {
      try {
        const users = await kanbanService.getUsers(userSearch || undefined);
        if (!ignore) setAllUsers(users);
      } catch (e) {
        console.error('Erro carregando usuários:', e);
      }
    };
    fetchUsers();
    const id = setTimeout(fetchUsers, 0);
    return () => { ignore = true; clearTimeout(id); };
  }, [userSearch, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        className={`${isOpen ? 'pointer-events-auto' : 'pointer-events-none'} fixed inset-0 z-40 bg-background/60`}
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-start justify-center mt-28">
        <div className="w-full max-w-lg bg-card border border-border/50 rounded-lg shadow-xl">
          <div className="p-4 border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="text-sm font-semibold">{t('kanban.selectUsers')}</h3>
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>{t('common.close') || 'Fechar'}</Button>
          </div>
          <div className="p-4 space-y-3">
            <Input
              placeholder={t('kanban.searchUsersPlaceholder')}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <div className="max-h-64 overflow-auto space-y-1">
              {allUsers.map(u => {
                const checked = selectedUsers.includes(u.id);
                return (
                  <label key={u.id} className="flex items-center gap-2 p-2 rounded hover:bg-secondary/30 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedUsers(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id));
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.email}</span>
                    </div>
                  </label>
                );
              })}
            </div>

            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(id => {
                  const u = allUsers.find(x => x.id === id);
                  if (!u) return null;
                  return (
                    <Badge key={id} variant="secondary" className="flex items-center gap-1">
                      {u.name}
                      <button className="ml-1 text-xs" onClick={() => setSelectedUsers(prev => prev.filter(x => x !== id))}>×</button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-border/40 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedUsers([])}>{t('kanban.clearFilters') || 'Limpar'}</Button>
            <Button onClick={() => { onApply(selectedUsers); onClose(); }}>{t('kanban.applyFilters') || 'Aplicar'}</Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserFilterModal;


