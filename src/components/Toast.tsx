import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, Loader2 } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    if (type !== 'loading') {
      setTimeout(() => {
        hideToast(id);
      }, 3000);
    }
    
    return id;
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[300px] ${
                toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                toast.type === 'loading' ? 'bg-indigo-50 border-indigo-100 text-indigo-800' :
                'bg-white border-slate-200 text-slate-800'
              }`}
            >
              {toast.type === 'success' && <CheckCircle className="size-5 text-emerald-500" />}
              {toast.type === 'error' && <XCircle className="size-5 text-rose-500" />}
              {toast.type === 'info' && <Info className="size-5 text-blue-500" />}
              {toast.type === 'loading' && <Loader2 className="size-5 text-indigo-500 animate-spin" />}
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
