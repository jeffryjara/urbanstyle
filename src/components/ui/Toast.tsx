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
      <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#141620]/95 border border-white/20 backdrop-blur-3xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(0,122,255,0.15)] max-w-md">
        <div className="w-8 h-8 rounded-xl bg-[#30D158]/15 border border-[#30D158]/30 flex items-center justify-center shrink-0">
          {type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-[#FF9F0A]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#30D158]" />
          )}
        </div>
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[11px] font-bold text-apple-blue tracking-wide uppercase leading-none">
            Urban Style POS
          </span>
          <span className="text-xs text-[#F5F5F7] font-medium leading-snug mt-1 truncate">
            {message}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#86868B] hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-auto"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>,
    document.body
  );
};
