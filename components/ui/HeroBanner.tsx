'use client';

import React from 'react';

export interface HeroBannerProps {
  badgeIcon?: React.ReactNode;
  badgeText?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export interface HeroAsideCardProps {
  label: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  showPulse?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function HeroAsideCard({
  label,
  title,
  subtitle,
  showPulse = true,
  className = '',
  children,
}: HeroAsideCardProps) {
  return (
    <div className={`kkn-hero-aside-card space-y-1.5 self-start md:self-auto max-w-full ${className}`}>
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C0E6D8] block">
        {label}
      </span>
      <div className="font-extrabold text-base sm:text-lg leading-tight text-white break-words">
        {title}
      </div>
      {subtitle && (
        <div className="flex items-center gap-2 text-xs text-emerald-100/90 pt-1 border-t border-white/15">
          {showPulse && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
          <span>{subtitle}</span>
        </div>
      )}
      {children}
    </div>
  );
}

export default function HeroBanner({
  badgeIcon,
  badgeText,
  title,
  description,
  aside,
  action,
  footer,
  className = '',
}: HeroBannerProps) {
  return (
    <div className={`kkn-hero-banner ${className}`}>
      <div className="kkn-hero-glow-top" />
      <div className="kkn-hero-glow-bottom" />

      <div className="kkn-hero-inner">
        <div className="space-y-3 max-w-2xl min-w-0 flex-1">
          {(badgeIcon || badgeText) && (
            <div className="kkn-hero-badge">
              {badgeIcon}
              {badgeText && <span>{badgeText}</span>}
            </div>
          )}

          <h1 className="kkn-hero-title">{title}</h1>

          {description && <p className="kkn-hero-desc">{description}</p>}
        </div>

        {(aside || action) && (
          <div className="w-full md:w-auto flex flex-col 2xl:flex-row flex-wrap items-stretch md:items-end 2xl:items-center gap-2.5 self-stretch md:self-auto min-w-0 max-w-full shrink-0">
            {aside}
            {action}
          </div>
        )}
      </div>

      {footer && <div className="relative z-10 mt-6">{footer}</div>}
    </div>
  );
}
