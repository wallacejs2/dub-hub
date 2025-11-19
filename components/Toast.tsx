import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center p-4 mb-2 w-80 max-w-full text-sm rounded-lg shadow-lg border transition-all transform translate-y-0 ${
              toast.type === 'success' ? 'bg-white border-green-200 text-green-800' :
              toast.type === 'error' ? 'bg-white border-red-200 text-red-800' :
              'bg-white border-blue-200 text-blue-800'
            }`}
            role="alert"
          >
            <div className="flex-shrink-0 mr-3">
               {toast.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
               {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
               {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
            </div>
            <div className="flex-1">{toast.message}</div>
            <button onClick={() => removeToast(toast.id)} className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8 hover:bg-gray-100">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};