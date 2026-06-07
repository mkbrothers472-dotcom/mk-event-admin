import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

// ── Global event bus ───────────────────────────────────────────────────────
const listeners: ((t: Toast) => void)[] = [];

export function toast(message: string, type: ToastType = 'success') {
  const t: Toast = { id: Date.now() + Math.random(), message, type };
  listeners.forEach(fn => fn(t));
}

toast.success = (msg: string) => toast(msg, 'success');
toast.error   = (msg: string) => toast(msg, 'error');
toast.warning = (msg: string) => toast(msg, 'warning');
toast.info    = (msg: string) => toast(msg, 'info');

// ── Toast Container ────────────────────────────────────────────────────────
const ICONS = {
  success: <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />,
  error:   <XCircle    className="w-4 h-4 text-red-500 flex-shrink-0" />,
  warning: <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />,
  info:    <Info        className="w-4 h-4 text-blue-500 flex-shrink-0" />,
};

const COLORS = {
  success: 'border-l-4 border-green-500 bg-white dark:bg-gray-800',
  error:   'border-l-4 border-red-500 bg-white dark:bg-gray-800',
  warning: 'border-l-4 border-yellow-500 bg-white dark:bg-gray-800',
  info:    'border-l-4 border-blue-500 bg-white dark:bg-gray-800',
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((t: Toast) => {
    setToasts(p => [...p, t]);
    setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3500);
  }, []);

  useEffect(() => {
    listeners.push(add);
    return () => { const i = listeners.indexOf(add); if (i > -1) listeners.splice(i, 1); };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-[320px] w-full pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-in ${COLORS[t.type]}`}
          style={{ animation: 'slideIn 0.2s ease-out' }}
        >
          {ICONS[t.type]}
          <p className="text-sm text-gray-800 dark:text-gray-100 flex-1 leading-snug">{t.message}</p>
          <button
            onClick={() => setToasts(p => p.filter(x => x.id !== t.id))}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
