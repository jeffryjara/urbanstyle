import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  type?: 'success' | 'info' | 'warning';
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, type = 'success' }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!message || !mounted) return null;

  return createPortal(
    <div className="fixed top-6 right-6 z-[9999] pointer-events-auto animate-scale-in">
      <div className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-[#121212]/98 border border-white/15 backdrop-blur-3xl text-white shadow-[0_24px_60px_rgba(0,0,0,0.9)] max-w-md">
        <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
        <span className="text-sm text-white font-semibold leading-snug pr-2">
          {message}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#86868B] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};
