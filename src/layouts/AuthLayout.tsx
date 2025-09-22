import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Sun, Moon } from 'lucide-react';

export default function AuthLayout() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale);
    localStorage.setItem('i18nextLng', locale);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-background ${theme}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="absolute top-6 right-6 z-10"
      >
        <div className="flex items-center space-x-2 bg-background/30 backdrop-blur-xl border border-border/30 rounded-lg p-2 shadow-lg">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0 hover:bg-secondary/50 transition-all duration-200"
            title={theme === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Language Selector */}
          <Select value={i18n.language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-14 h-8 bg-transparent border-none focus:bg-secondary/50 transition-all duration-200">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/50 backdrop-blur-xl">
              <SelectItem value="pt-BR">PT</SelectItem>
              <SelectItem value="en">EN</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg mb-4">
              <span className="text-2xl font-bold text-primary-foreground">K</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {t('kanban.title')}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {t('kanban.subtitle')}
            </p>
          </motion.div>

          {/* Auth Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8"
          >
            <Outlet />
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mt-8"
          >
            <p className="text-xs text-muted-foreground">
              © 2024 {t('kanban.title')}. {t('common.allRightsReserved')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
