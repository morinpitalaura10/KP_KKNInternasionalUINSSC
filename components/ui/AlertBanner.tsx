'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertMessageObj {
  type: AlertType | string;
  text: string;
}

export interface AlertBannerProps {
  message?: AlertMessageObj | string | null;
  type?: AlertType;
  onClose?: () => void;
  className?: string;
  autoClose?: boolean;
  duration?: number;
  floating?: boolean;
}

export default function AlertBanner({
  message,
  type = 'info',
  onClose,
  className = '',
  autoClose = true,
  duration = 5000,
  floating = true,
}: AlertBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const isPausedRef = useRef(false);

  const alertText = typeof message === 'string' ? message : message?.text || '';
  const alertType = (typeof message === 'string' ? type : message?.type || type) as string;

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setProgress(100);

      if (!autoClose) return;

      const startTime = Date.now();
      const intervalTime = 50;

      const timer = setInterval(() => {
        if (isPausedRef.current) return;
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          setIsVisible(false);
          if (onClose) onClose();
        }
      }, intervalTime);

      return () => clearInterval(timer);
    } else {
      setIsVisible(false);
    }
  }, [message, duration, autoClose, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  if (!message || !isVisible || !alertText) return null;

  // Visual configuration based on alert type
  let title = 'Informasi';
  let IconComponent = Info;
  let borderColor = 'border-sky-300';
  let badgeBg = 'bg-sky-100 text-sky-800';
  let iconBg = 'bg-sky-50 text-sky-600 border-sky-200';
  let btnClass = 'bg-sky-600 hover:bg-sky-700 text-white';
  let progressBarColor = 'bg-sky-500';

  if (alertType === 'success') {
    title = 'Berhasil';
    IconComponent = CheckCircle2;
    borderColor = 'border-emerald-300';
    badgeBg = 'bg-emerald-100 text-emerald-800';
    iconBg = 'bg-emerald-50 text-emerald-600 border-emerald-200';
    btnClass = 'bg-[#0E4A3E] hover:bg-[#09352c] text-white';
    progressBarColor = 'bg-[#0E4A3E]';
  } else if (alertType === 'error' || alertType === 'danger') {
    title = 'Gagal / Perhatian';
    IconComponent = AlertCircle;
    borderColor = 'border-red-300';
    badgeBg = 'bg-red-100 text-red-800';
    iconBg = 'bg-red-50 text-red-600 border-red-200';
    btnClass = 'bg-red-600 hover:bg-red-700 text-white';
    progressBarColor = 'bg-red-500';
  } else if (alertType === 'warning') {
    title = 'Peringatan';
    IconComponent = AlertTriangle;
    borderColor = 'border-amber-300';
    badgeBg = 'bg-amber-100 text-amber-800';
    iconBg = 'bg-amber-50 text-amber-600 border-amber-200';
    btnClass = 'bg-amber-600 hover:bg-amber-700 text-white';
    progressBarColor = 'bg-amber-500';
  }

  const alertContent = (
    <div
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
      className={`bg-white rounded-2xl border-2 ${borderColor} shadow-2xl p-4 sm:p-5 relative overflow-hidden transition-all duration-300 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        {/* Leading Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconBg} shadow-xs`}>
          <IconComponent className="w-5 h-5 stroke-[2.5]" />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${badgeBg}`}>
              {title}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug break-words">
            {alertText}
          </p>

          {/* Action Button: Tutup */}
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-102 active:scale-98 ${btnClass}`}
            >
              <X className="w-3.5 h-3.5" />
              <span>Tutup</span>
            </button>
          </div>
        </div>

        {/* Top-Right Quick Close 'X' */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Tutup pesan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Auto-Close Progress Bar */}
      {autoClose && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${progressBarColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );

  if (!floating) {
    return alertContent;
  }

  return (
    <div className="fixed top-6 right-6 z-[99999] max-w-md w-[calc(100%-3rem)] sm:w-[420px] pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
      {alertContent}
    </div>
  );
}
