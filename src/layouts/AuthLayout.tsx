import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 bg-background ${theme}`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
      
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
              Kanban de Ideias
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Gerencie suas ideias de forma colaborativa
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
              © 2024 Kanban de Ideias. Todos os direitos reservados.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
