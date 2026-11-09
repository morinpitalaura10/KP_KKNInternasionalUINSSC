import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  description,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0E4A3E] tracking-tight leading-tight uppercase font-archivo sm:whitespace-nowrap">
          {title}
        </h1>
        {subtitle && (
          <h2 className="text-xs sm:text-sm lg:text-base font-bold text-[#0E4A3E]/80 tracking-wide uppercase font-archivo mt-0.5 sm:whitespace-nowrap">
            {subtitle}
          </h2>
        )}
        {description && (
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 flex items-center gap-2.5">{action}</div>}
    </div>
  );
}
