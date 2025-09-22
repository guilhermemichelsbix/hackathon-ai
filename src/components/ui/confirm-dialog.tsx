import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConfirmDialogOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

interface ConfirmDialogState {
  isOpen: boolean;
  options: ConfirmDialogOptions;
  resolve?: (value: boolean) => void;
}

let confirmDialogState: ConfirmDialogState = {
  isOpen: false,
  options: {},
};

let setConfirmDialogState: ((state: ConfirmDialogState) => void) | null = null;

export function ConfirmDialog() {
  const [state, setState] = useState<ConfirmDialogState>(confirmDialogState);
  setConfirmDialogState = setState;

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false, options: {} });
    confirmDialogState = { isOpen: false, options: {} };
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false, options: {} });
    confirmDialogState = { isOpen: false, options: {} };
  }, [state.resolve]);

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop - sem onClick para não interferir com o sheet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm"
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border border-border/50 rounded-lg shadow-xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    state.options.variant === 'destructive' 
                      ? "bg-destructive/10 text-destructive" 
                      : "bg-orange-500/10 text-orange-500"
                  )}>
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {state.options.title || 'Confirmar ação'}
                    </h3>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0 hover:bg-secondary/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {state.options.description || 'Esta ação não pode ser desfeita.'}
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="px-6"
                  >
                    {state.options.cancelText || 'Cancelar'}
                  </Button>
                  <Button
                    variant={state.options.variant === 'destructive' ? 'destructive' : 'default'}
                    onClick={handleConfirm}
                    className="px-6"
                  >
                    {state.options.confirmText || 'Confirmar'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook para usar o confirm dialog
export function useConfirm() {
  return useCallback(async (options: ConfirmDialogOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      const newState: ConfirmDialogState = {
        isOpen: true,
        options,
        resolve,
      };
      
      confirmDialogState = newState;
      setConfirmDialogState?.(newState);
    });
  }, []);
}

// Função global para compatibilidade com confirm() nativo
export async function confirmDialog(options: ConfirmDialogOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    const newState: ConfirmDialogState = {
      isOpen: true,
      options,
      resolve,
    };
    
    confirmDialogState = newState;
    setConfirmDialogState?.(newState);
  });
}
