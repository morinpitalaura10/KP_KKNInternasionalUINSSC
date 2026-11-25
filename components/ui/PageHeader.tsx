'use client';

import React from 'react';
import HeroBanner from './HeroBanner';
import { ShieldCheck } from 'lucide-react';

export interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  aside?: React.ReactNode;
  badgeIcon?: React.ReactNode;
  badgeText?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  description,
  action,
  aside,
  badgeIcon,
  badgeText,
  className = '',
}: PageHeaderProps) {
  const resolvedBadgeText =
    badgeText ||
    (typeof subtitle === 'string' && subtitle.length > 0 && subtitle.length < 50
      ? subtitle
      : 'Portal Administrator LP2M');

  const resolvedDesc =
    description ||
    (typeof subtitle === 'string' && subtitle.length >= 50 ? subtitle : undefined);

  return (
    <HeroBanner
      badgeIcon={badgeIcon || <ShieldCheck className="w-3.5 h-3.5 text-[#C0E6D8]" />}
      badgeText={resolvedBadgeText}
      title={title}
      description={resolvedDesc}
      aside={aside}
      action={action}
      className={className}
    />
  );
}
