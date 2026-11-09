import React from 'react';

interface ContentCardProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export default function ContentCard({
  title,
  action,
  children,
  className = '',
  headerClassName = '',
}: ContentCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs ${className}`}
    >
      {title && (
        <div className={`flex items-center justify-between mb-4 sm:mb-6 ${headerClassName}`}>
          <h3 className="text-sm sm:text-base font-black text-[#0E4A3E] uppercase tracking-wider font-archivo">
            {title}
          </h3>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
