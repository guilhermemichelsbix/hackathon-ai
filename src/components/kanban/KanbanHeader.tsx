import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
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
  Heart
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
import { AuthModal } from '@/components/auth/AuthModal';
import { useKanbanStore } from '@/store/kanban';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

interface KanbanHeaderProps {
  onAddCard?: (columnId?: string) => void;
  onCreateColumn?: () => void;
}

export function KanbanHeader({ onAddCard, onCreateColumn }: KanbanHeaderProps) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedColumnId, 
    setSelectedColumnId,
    visibleColumns,
    columnOrder,
    board,
    user,
    setUser,
    loadBoard,
    connectToRealtime,
    toggleColumnVisibility,
    resetColumnVisibility
  } = useKanbanStore();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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


  const handleAuthSuccess = async () => {
    // Load board data and connect to real-time after successful auth
    await loadBoard();
    connectToRealtime();
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

              {user ? (
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
                    <DropdownMenuLabel className="text-foreground font-semibold text-sm">Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem className="hover:bg-secondary/50 transition-colors duration-200">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-secondary/50 transition-colors duration-200">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Configurações</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10 transition-colors duration-200">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('auth.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setIsAuthModalOpen(true)} 
                  size="sm" 
                  className="h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  {t('auth.login')}
                </Button>
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
                    Colunas
                    <ChevronDown className="h-3 w-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-popover border-border/50">
                  <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                    Visibilidade das Colunas
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
                    Mostrar todas as colunas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Center: Stats */}
            <div className="hidden md:flex items-center space-x-3">
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1 bg-secondary/50 text-secondary-foreground border-border/50 text-xs">
                <span className="font-semibold">{totalCards}</span>
                <span className="opacity-75">cards</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1 bg-secondary/50 text-secondary-foreground border-border/50 text-xs">
                <span className="font-semibold">{totalVotes}</span>
                <span className="opacity-75">votos</span>
              </Badge>
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1 bg-secondary/50 text-secondary-foreground border-border/50 text-xs">
                <span className="font-semibold">{totalComments}</span>
                <span className="opacity-75">comentários</span>
              </Badge>
            </div>

            {/* Right: Actions */}
            {user && (
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => onCreateColumn?.()} 
                  variant="outline" 
                  size="sm" 
                  className="h-9 px-3 border-border/50 hover:bg-secondary/50 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Coluna
                </Button>
                
                <Button 
                  onClick={() => onAddCard?.()} 
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}