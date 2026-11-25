import React from 'react';

interface SectionTitleProps {
  prefixTitle: string;
  subtitle?: string;
  description?: string;
  metaInfo?: string;
}

export default function SectionTitle({
  prefixTitle,
  subtitle = "UNIVERSITAS ISLAM NEGERI SIBER SYEKH NURJATI CIREBON",
  description,
  metaInfo,
}: SectionTitleProps) {
  return (
    <div className="text-left space-y-1.5 sm:space-y-2 mb-6 sm:mb-10 pl-0 sm:pl-2 md:pl-6 lg:pl-[68px]">
      <h1 className="text-xl sm:text-3xl md:text-4xl font-archivo text-[#0E4A3E] tracking-tight leading-tight uppercase">
        {prefixTitle} <br className="hidden sm:block" />
        KULIAH KERJA NYATA INTERNASIONAL
      </h1>
      {subtitle && (
        <h2 className="text-xs sm:text-base md:text-lg font-archivo text-[#0E4A3E] uppercase">
          {subtitle}
        </h2>
      )}
      {metaInfo && (
        <p className="text-[11px] sm:text-sm font-semibold text-gray-500 pt-0.5 sm:pt-1">
          {metaInfo}
        </p>
      )}
      {description && (
        <p className="text-xs sm:text-sm text-gray-600 max-w-2xl text-left pt-1 sm:pt-2 font-normal leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
