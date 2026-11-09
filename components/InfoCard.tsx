import React from 'react';
import Image from 'next/image';

interface QuickStatProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}

export function QuickStatItem({ icon, label, value, subValue }: QuickStatProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-1.5">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white mb-1 shadow-xs">
        {icon}
      </div>
      <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
        {label}
      </h4>
      <p className="text-xs sm:text-sm font-bold text-white">
        {value}
      </p>
      {subValue && (
        <p className="text-[11px] text-emerald-100/80 leading-snug">
          {subValue}
        </p>
      )}
    </div>
  );
}

interface LocationCardProps {
  country: string;
  imageSrc: string;
}

export function LocationCard({ country, imageSrc }: LocationCardProps) {
  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center transition-transform duration-300 hover:-translate-y-1 w-full">
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-gray-100">
        <Image
          src={imageSrc}
          alt={country}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <h4 className="text-base sm:text-lg font-bold text-[#0E4A3E] text-center py-1">
        {country}
      </h4>
    </div>
  );
}
