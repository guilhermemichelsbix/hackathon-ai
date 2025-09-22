import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useSocket } from '@/hooks/useSocket';
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  LogOut, 
  Settings,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  Eye,
  EyeOff,
  BarChart3,
  MessageSquare,
  Heart,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useKanbanStore } from '@/store/kanban';
import { authService } from '@/services/authService';
import UserFilterModal from './UserFilterModal';
import { toast } from 'sonner';
import { CardFormModal } from './CardFormModal';
import { ColumnFormModal } from './ColumnFormModal';

export function KanbanHeader() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedColumnId, 
    setSelectedColumnId,
    selectedCreators,
    setSelectedCreators,
    visibleColumns,
    columnOrder,
    board,
    user,
    setUser,
    loadBoard,
    toggleColumnVisibility,
    resetColumnVisibility
  } = useKanbanStore();

  // Modal states
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [isUserFilterOpen, setIsUserFilterOpen] = useState(false);
  const [pendingSelected, setPendingSelected] = useState<string[]>([]);

  // apply from modal only
  

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success(t('auth.logoutSuccess'));
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem('i18nextLng', locale);
  };

  // Modal handlers
  const handleAddCard = () => {
    setIsCardModalOpen(true);
  };

  const handleCreateColumn = () => {
    setEditingColumn(null);
    setIsColumnModalOpen(true);
  };

  const handleCloseCardModal = () => {
    setIsCardModalOpen(false);
  };

  const handleCloseColumnModal = () => {
    setIsColumnModalOpen(false);
    setEditingColumn(null);
  };



  const totalCards = board.cards.length;
  const totalVotes = board.cards.reduce((sum, card) => sum + card.votes.length, 0);
  const totalComments = board.cards.reduce((sum, card) => sum + card.comments.length, 0);

  return (
    <>
      {/* Clean Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 w-full border-b border-border/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm"
      >
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="flex items-center space-x-3"
            >
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <span className="font-bold text-sm">K</span>
              </div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">{t('kanban.title')}</h1>
              
              {/* Socket.IO Connection Status */}
              <Badge 
                variant={isConnected ? "default" : "destructive"}
                className="flex items-center gap-1.5 px-2 py-1 text-xs"
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                  </>
                )}
              </Badge>
              {/* Users filter trigger is in the toolbar below */}
            </motion.div>

            {/* Right Side Options */}

            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0 hover:bg-secondary/50 transition-all duration-200"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Language Selector */}
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-16 h-9 bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50">
                  <SelectItem value="pt-BR">PT</SelectItem>
                  <SelectItem value="en">EN</SelectItem>
                </SelectContent>
              </Select>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 h-9 px-3 hover:bg-secondary/50 transition-all duration-200">
                      <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                        <User className="h-3 w-3" />
                      </div>
                      <span className="hidden sm:block font-medium text-sm">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover border-border/50 shadow-lg">
                    <DropdownMenuLabel className="text-foreground font-semibold text-sm">{t('auth.myAccount')}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem className="hover:bg-secondary/50 transition-colors duration-200">
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('auth.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-secondary/50 transition-colors duration-200">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('auth.settings')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10 transition-colors duration-200">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('auth.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Toolbar */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="sticky top-16 z-40 w-full border-b border-border/30 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
      >
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Search and Filters */}
            <div className="flex items-center gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('kanban.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3 bg-background/50 border-border/50 hover:bg-background hover:border-border transition-all duration-200"
                onClick={() => { setPendingSelected(selectedCreators || []); setIsUserFilterOpen(true); }}
              >
                <User className="h-4 w-4 mr-2" />
                {t('kanban.users')}
              </Button>
              
              <Select value={selectedColumnId || 'all'} onValueChange={(value) => setSelectedColumnId(value === 'all' ? null : value)}>
                <SelectTrigger className="w-40 h-9 bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder={t('kanban.filterByColumn')} />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/50">
                  <SelectItem value="all">{t('kanban.allColumns')}</SelectItem>
                  {board.columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Advanced Column Visibility Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-3 bg-background/50 border-border/50 hover:bg-background hover:border-border transition-all duration-200"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t('kanban.columns')}
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-popover border-border/50">
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                    {t('kanban.columnVisibility')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columnOrder.map((columnId) => {
                    const column = board.columns.find(col => col.id === columnId);
                    if (!column) return null;
                    
                    const isVisible = visibleColumns.includes(columnId);
                    const isOnlyVisible = visibleColumns.length === 1 && isVisible;
                    
                    return (
                      <DropdownMenuItem
                        key={columnId}
                        onClick={() => toggleColumnVisibility(columnId)}
                        className="flex items-center justify-between cursor-pointer"
                        disabled={isOnlyVisible}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isVisible ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-sm">{column.name}</span>
                        </div>
                        <EyeOff className={`h-3 w-3 ${isVisible ? 'text-green-600' : 'text-gray-400'}`} />
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={resetColumnVisibility}
                    className="text-xs text-muted-foreground cursor-pointer"
                  >
                    {t('kanban.showAllColumns')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Center space (stats moved to right) */}
            <div className="hidden md:flex items-center space-x-2" />

            {/* Right: Stats */}
            <div className="hidden md:flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1 bg-secondary/50 text-secondary-foreground border-border/50 text-xs">
                <span className="font-semibold">{totalCards}</span>
                <span className="opacity-75">{t('kanban.cards')}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1 bg-secondary/50 text-secondary-foreground border-border/50 text-xs">
                <span className="font-semibold">{totalVotes}</span>
                <span className="opacity-75">{t('kanban.votes')}</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1 bg-secondary/50 text-secondary-foreground border-border/50 text-xs">
                <span className="font-semibold">{totalComments}</span>
                <span className="opacity-75">{t('kanban.comments')}</span>
              </Badge>
            </div>

            {/* Right: Actions */}
            {user && (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleCreateColumn} 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-3 border-border/50 hover:bg-secondary/50 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('kanban.addColumn')}
                </Button>
                
                <Button 
                  onClick={handleAddCard} 
                  size="sm" 
                  className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('kanban.newIdea')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Active filters compact row below toolbar */}
      {(searchQuery || selectedColumnId || (selectedCreators && selectedCreators.length > 0)) && (
        <div className="px-6 pt-1 pb-2 mt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {(() => {
              const chips: JSX.Element[] = [];
              if (searchQuery) {
                chips.push(
                  <Badge key="search" variant="secondary" className="gap-2 text-xs py-1">
                    {t('kanban.searchLabel')}: "{searchQuery}"
                    <button className="text-xs" onClick={() => setSearchQuery('')}>×</button>
                  </Badge>
                );
              }
              if (selectedColumnId) {
                const colName = board.columns.find(c => c.id === selectedColumnId)?.name || '—';
                chips.push(
                  <Badge key="column" variant="secondary" className="gap-2 text-xs py-1">
                    {t('kanban.column')}: {colName}
                    <button className="text-xs" onClick={() => setSelectedColumnId(null)}>×</button>
                  </Badge>
                );
              }
              (selectedCreators || []).forEach((id) => {
                const u = board.cards.find(c => c.createdBy === id)?.creator;
                chips.push(
                  <Badge key={`author-${id}`} variant="secondary" className="gap-2 text-xs py-1">
                    {t('kanban.author')}: {u?.name || id}
                    <button className="text-xs" onClick={() => setSelectedCreators(selectedCreators.filter(x => x !== id))}>×</button>
                  </Badge>
                );
              });

              const MAX_CHIPS = 5;
              const chipsToShow = chips.slice(0, MAX_CHIPS);
              const hidden = chips.length - chipsToShow.length;
              return (
                <>
                  {chipsToShow}
                  {hidden > 0 && (
                    <span className="text-muted-foreground text-[11px]">+{hidden} ...</span>
                  )}
                </>
              );
            })()}
            <button
              className="ml-2 text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
              onClick={() => { setSearchQuery(''); setSelectedColumnId(null); setSelectedCreators([]); }}
            >
              {t('kanban.clearFilters')}
            </button>
          </div>
        </div>
      )}

      <UserFilterModal
        isOpen={isUserFilterOpen}
        initialSelected={pendingSelected}
        onClose={() => setIsUserFilterOpen(false)}
        onApply={(ids) => setSelectedCreators(ids)}
      />

      {/* Modals */}
      <CardFormModal
        isOpen={isCardModalOpen}
        onClose={handleCloseCardModal}
      />

      <ColumnFormModal
        column={editingColumn}
        isOpen={isColumnModalOpen}
        onClose={handleCloseColumnModal}
      />
    </>
  );
}