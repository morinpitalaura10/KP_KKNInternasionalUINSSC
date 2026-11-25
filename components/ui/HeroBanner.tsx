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
    <div className={`kkn-hero-aside-card space-y-1.5 self-start md:self-auto ${className}`}>
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C0E6D8] block">
        {label}
      </span>
      <div className="font-extrabold text-base sm:text-lg leading-tight text-white">
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
        <div className="space-y-3 max-w-2xl">
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
          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-stretch md:self-auto min-w-0 max-w-full">
            {aside}
            {action}
          </div>
        )}
      </div>

      {footer && <div className="relative z-10 mt-6">{footer}</div>}
    </div>
  );
}
