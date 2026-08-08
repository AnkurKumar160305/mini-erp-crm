import React from 'react';
import { useToastStore } from '../../hooks/useToast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex w-96 items-start gap-3 rounded-lg border p-4 shadow-lg pointer-events-auto transition-all animate-in slide-in-from-right-full',
            {
              'border-success-200 bg-success-50 text-success-800': toast.type === 'success',
              'border-error-200 bg-error-50 text-error-800': toast.type === 'error',
              'border-warning-200 bg-warning-50 text-warning-800': toast.type === 'warning',
              'border-blue-200 bg-blue-50 text-blue-800': toast.type === 'info',
            }
          )}
        >
          {toast.type === 'success' && <CheckCircle className="mt-0.5 h-5 w-5 text-success-500 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="mt-0.5 h-5 w-5 text-error-500 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="mt-0.5 h-5 w-5 text-warning-500 shrink-0" />}
          {toast.type === 'info' && <Info className="mt-0.5 h-5 w-5 text-blue-500 shrink-0" />}
          
          <div className="flex-1 text-sm font-medium">
            {toast.message}
          </div>
          
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 text-slate-500 hover:text-slate-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
}
