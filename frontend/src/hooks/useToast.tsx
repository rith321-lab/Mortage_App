import React, { createContext, useContext, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (props: { type: ToastType; title: string; message?: string }) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(({ type, title, message }: { type: ToastType; title: string; message?: string }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((currentToasts) => [...currentToasts, { id, type, title, message }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    toasts: context.toasts,
    showToast: context.showToast,
    dismissToast: context.dismissToast
  };
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <FiCheck className="w-5 h-5 text-green-400" />;
      case 'error':
        return <FiX className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <FiAlertCircle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <FiInfo className="w-5 h-5 text-blue-400" />;
    }
  };

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed bottom-0 right-0 p-6 z-50 space-y-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto max-w-sm w-full shadow-lg rounded-lg border
              ${getToastColors(toast.type)}
            `}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">{getToastIcon(toast.type)}</div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                  {toast.message && (
                    <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => onDismiss(toast.id)}
                    className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Close</span>
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}; 