import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, AlertTriangle, ShieldAlert, Info } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastState {
  message: string;
  count: number;
  key: number;
  type: ToastType;
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
    (msg: string, type: ToastType = 'success') => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast((prev) => {
        if (prev && prev.message === msg) {
          return {
            message: msg,
            count: prev.count + 1,
            key: prev.key + 1,
            type,
          };
        }
        return {
          message: msg,
          count: 1,
          key: (prev?.key ?? 0) + 1,
          type,
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
  type?: ToastType;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, count: externalCount, type: externalType }) => {
  const [mounted, setMounted] = useState(false);
  const [visibleToast, setVisibleToast] = useState<{
    text: string;
    count: number;
    key: number;
    type: ToastType;
  } | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);
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
      setIsAnimatedIn(false);

      if (typeof message === 'object') {
        setVisibleToast({
          text: message.message,
          count: message.count,
          key: message.key,
          type: message.type || 'success',
        });
      } else {
        setVisibleToast((prev) => {
          const nextCount = externalCount ?? (prev && prev.text === message ? prev.count + 1 : 1);
          return {
            text: message,
            count: nextCount,
            key: (prev?.key ?? 0) + 1,
            type: externalType || 'success',
          };
        });
      }
    } else if (visibleToast) {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setVisibleToast(null);
        setIsExiting(false);
        setIsAnimatedIn(false);
      }, 270);
    }
  }, [message, externalCount, externalType]);

  const handleManualClose = () => {
    setIsExiting(true);
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setVisibleToast(null);
      setIsExiting(false);
      setIsAnimatedIn(false);
      onClose();
    }, 260);
  };

  if (!visibleToast || !mounted) return null;

  const currentType = visibleToast.type || 'success';

  return createPortal(
    <div className="fixed top-5 sm:top-6 inset-x-0 z-[9999] pointer-events-none flex justify-center items-start px-3 sm:px-4">
      <div
        onAnimationEnd={() => {
          if (!isExiting) {
            setIsAnimatedIn(true);
          }
        }}
        className={`pointer-events-auto select-none ${
          isExiting ? 'animate-toast-out' : isAnimatedIn ? '' : 'animate-toast-in'
        }`}
      >
        <div className="toast-pill-blur flex items-center gap-3 sm:gap-4 px-4 py-3 sm:px-6 sm:py-3.5 md:px-7 md:py-4 rounded-full text-white max-w-[94vw] sm:max-w-xl">
          {/* Dynamic Semantic Indicator Icon */}
          {currentType === 'warning' && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF9F0A] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,159,10,0.5)]">
              <AlertTriangle className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-black stroke-[2.8]" />
            </div>
          )}
          {currentType === 'error' && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF453A] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(255,69,58,0.5)]">
              <ShieldAlert className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white stroke-[2.8]" />
            </div>
          )}
          {currentType === 'info' && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(0,122,255,0.4)]">
              <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white stroke-[2.8]" />
            </div>
          )}
          {currentType === 'success' && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(0,122,255,0.4)]">
              <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white stroke-[2.8]" />
            </div>
          )}

          {/* Responsive Pill Text */}
          <span className="text-sm sm:text-base md:text-lg font-bold font-display text-white tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
            {visibleToast.text}
          </span>

          {/* Multiplier Counter Badge (x2, x3, x4...) with semantic color matching */}
          {visibleToast.count > 1 && (
            <span
              key={visibleToast.key}
              className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-extrabold font-mono tracking-tight shrink-0 animate-badge-pop ${
                currentType === 'warning'
                  ? 'bg-[#FF9F0A] text-black shadow-[0_0_12px_rgba(255,159,10,0.5)]'
                  : currentType === 'error'
                  ? 'bg-[#FF453A] text-white shadow-[0_0_12px_rgba(255,69,58,0.5)]'
                  : 'bg-[#007AFF] text-white shadow-[0_0_12px_rgba(0,122,255,0.4)]'
              }`}
            >
              x{visibleToast.count}
            </span>
          )}

          {/* Subtle Close Button */}
          <button
            onClick={handleManualClose}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-[#A1A1A6] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 ml-0.5 active:scale-90"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
