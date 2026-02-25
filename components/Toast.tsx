import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType>({ showToast: () => { } });

export const useToast = () => React.useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 3500);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const icon = toast.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
        toast.type === 'error' ? <AlertCircle size={16} className="text-red-500" /> :
            <Info size={16} className="text-blue-500" />;
    const bg = toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
        toast.type === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200';

    return (
        <div className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg ${bg} animate-in slide-in-from-right-5 duration-300 max-w-sm`}>
            {icon}
            <span className="text-sm font-medium text-gray-800 flex-1">{toast.message}</span>
            <button onClick={() => onRemove(toast.id)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
            </button>
        </div>
    );
};
