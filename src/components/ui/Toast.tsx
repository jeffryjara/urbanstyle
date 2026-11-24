import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';

export interface ToastState {
  message: string;
  count: number;
  key: number;
}

export function useToastNotification(durationMs = 2600) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showNotification = useCallback(
    (msg: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast((prev) => {
        if (prev && prev.message === msg) {
          return {
            message: msg,
            count: prev.count + 1,
            key: prev.key + 1,
          };
        }
        return {
          message: msg,
          count: 1,
          key: (prev?.key ?? 0) + 1,
        };
      });

      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, durationMs);
    },
    [durationMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { toast, showNotification, clearToast };
}

interface ToastProps {
  message: string | ToastState | null;
  onClose: () => void;
  count?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, count: externalCount }) => {
  const [mounted, setMounted] = useState(false);
  const [visibleToast, setVisibleToast] = useState<{ text: string; count: number; key: number } | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (message) {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setIsExiting(false);

      if (typeof message === 'object') {
        setVisibleToast({
          text: message.message,
          count: message.count,
          key: message.key,
        });
      } else {
        setVisibleToast((prev) => {
          const nextCount = externalCount ?? (prev && prev.text === message ? prev.count + 1 : 1);
          return {
            text: message,
            count: nextCount,
            key: (prev?.key ?? 0) + 1,
          };
        });
      }
    } else if (visibleToast) {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setVisibleToast(null);
        setIsExiting(false);
      }, 270);
    }
  }, [message, externalCount]);

  const handleManualClose = () => {
    setIsExiting(true);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setVisibleToast(null);
      setIsExiting(false);
      onClose();
    }, 260);
  };

  if (!visibleToast || !mounted) return null;

  return createPortal(
    <div
      className={`fixed top-7 left-1/2 z-[9999] pointer-events-auto select-none ${
        isExiting ? 'animate-toast-out' : 'animate-toast-in'
      }`}
    >
      <div className="toast-pill-blur flex items-center gap-4 px-6 py-3.5 md:px-7 md:py-4 rounded-full text-white max-w-[92vw] sm:max-w-xl">
        {/* Solid Accent Check Circle */}
        <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0">
          <Check className="w-4.5 h-4.5 text-white stroke-[2.8]" />
        </div>

        {/* Large Pill Text */}
        <span className="text-base md:text-lg font-bold font-display text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
          {visibleToast.text}
        </span>

        {/* Multiplier Counter Badge (x2, x3, x4...) when triggered repeatedly */}
        {visibleToast.count > 1 && (
          <span
            key={visibleToast.key}
            className="px-3 py-1 rounded-full bg-[#007AFF] text-white text-sm font-extrabold font-mono tracking-tight shrink-0 animate-badge-pop"
          >
            x{visibleToast.count}
          </span>
        )}

        {/* Subtle Close Button */}
        <button
          onClick={handleManualClose}
          className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-[#A1A1A6] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ml-1 active:scale-90"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
};
