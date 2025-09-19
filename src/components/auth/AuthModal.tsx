import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Eye, EyeOff, User, Mail, Lock } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { useKanbanStore } from '@/store/kanban';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { setUser } = useKanbanStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await authService.login(loginData);
      setUser(user);
      toast.success(t('auth.loginSuccess'));
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Senhas não coincidem');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authService.register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        locale: 'pt-BR',
      });
      setUser(user);
      toast.success('Conta criada com sucesso!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setLoginData({ email: '', password: '' });
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className={`border-2 shadow-xl ${
              theme === 'dark' ? 'bg-black border-gray-700' : 'bg-white border-gray-300'
            }`}>
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-4"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle className={`text-2xl text-center ${
                  theme === 'dark' ? 'text-white' : 'text-black'
                }`}>
                  {t('kanban.title')}
                </CardTitle>
                <CardDescription className={`text-center ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {t('kanban.subtitle')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
                    <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="space-y-4 mt-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email" className={theme === 'dark' ? 'text-white' : 'text-black'}>
                          {t('auth.email')}
                        </Label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-3 h-4 w-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder={t('auth.email')}
                            value={loginData.email}
                            onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                            className={`pl-10 ${
                              theme === 'dark'
                                ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                                : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                            }`}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password" className={theme === 'dark' ? 'text-white' : 'text-black'}>
                          {t('auth.password')}
                        </Label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-3 h-4 w-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <Input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('auth.password')}
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                            className={`pl-10 pr-10 ${
                              theme === 'dark'
                                ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                                : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                            }`}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className={`w-full ${
                          theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? t('common.loading') : t('auth.login')}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register" className="space-y-4 mt-6">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name" className={theme === 'dark' ? 'text-white' : 'text-black'}>
                          {t('auth.name')}
                        </Label>
                        <div className="relative">
                          <User className={`absolute left-3 top-3 h-4 w-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <Input
                            id="register-name"
                            type="text"
                            placeholder={t('auth.name')}
                            value={registerData.name}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                            className={`pl-10 ${
                              theme === 'dark'
                                ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                                : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                            }`}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-email" className={theme === 'dark' ? 'text-white' : 'text-black'}>
                          {t('auth.email')}
                        </Label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-3 h-4 w-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder={t('auth.email')}
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                            className={`pl-10 ${
                              theme === 'dark'
                                ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                                : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                            }`}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password" className={theme === 'dark' ? 'text-white' : 'text-black'}>
                          {t('auth.password')}
                        </Label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-3 h-4 w-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <Input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('auth.password')}
                            value={registerData.password}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                            className={`pl-10 pr-10 ${
                              theme === 'dark'
                                ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                                : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                            }`}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password" className={theme === 'dark' ? 'text-white' : 'text-black'}>
                          Confirmar senha
                        </Label>
                        <div className="relative">
                          <Lock className={`absolute left-3 top-3 h-4 w-4 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                          <Input
                            id="register-confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirmar senha"
                            value={registerData.confirmPassword}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className={`pl-10 ${
                              theme === 'dark'
                                ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400'
                                : 'bg-white border-gray-300 text-black placeholder:text-gray-500'
                            }`}
                            required
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className={`w-full ${
                          theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? t('common.loading') : t('auth.register')}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
