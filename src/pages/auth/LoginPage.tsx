import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { useKanbanStore } from '@/store/kanban';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const { setUser, loadBoard } = useKanbanStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      setUser(user);
      await loadBoard();
      
      toast.success(t('auth.loginSuccess'));
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      // Extrair mensagem de erro - ApiError já tem message diretamente
      let errorMessage = t('auth.loginError');
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Toast específico baseado no tipo de erro
      if (errorMessage.toLowerCase().includes('credenciais') || 
          errorMessage.toLowerCase().includes('invalid') ||
          errorMessage.toLowerCase().includes('incorrect')) {
        toast.error(t('auth.invalidPassword'));
      } else if (errorMessage.toLowerCase().includes('email') || 
                 errorMessage.toLowerCase().includes('user') ||
                 errorMessage.toLowerCase().includes('usuário')) {
        toast.error(t('auth.invalidEmail'));
      } else if (errorMessage.toLowerCase().includes('not found') || 
                 errorMessage.toLowerCase().includes('não encontrado')) {
        toast.error(t('auth.userNotFound'));
      } else {
        toast.error(t('auth.loginError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div className="text-center">
        <CardTitle className="text-2xl font-bold text-foreground">
          {t('auth.welcomeBack')}
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-2">
          {t('auth.loginDescription')}
        </CardDescription>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            {t('auth.email')}
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-foreground">
            {t('auth.password')}
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChange={handleInputChange}
              className="pl-10 pr-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:border-border transition-all duration-200"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 h-12 w-12 p-0 hover:bg-transparent"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              {t('auth.loggingIn')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              {t('auth.login')}
            </div>
          )}
        </Button>
      </form>

      <div className="relative">
        <Separator className="my-6" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-card px-4 text-xs text-muted-foreground">
            {t('auth.or')}
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {t('auth.noAccount')}{' '}
          <Link
            to="/auth/register"
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            {t('auth.createAccount')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
