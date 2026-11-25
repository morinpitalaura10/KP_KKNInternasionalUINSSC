'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';

export interface SelectFilterOption {
  value: string;
  label: string;
}

export interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  selectValue?: string;
  onSelectChange?: (val: string) => void;
  selectOptions?: SelectFilterOption[];
  selectMinWidth?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function SearchFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  selectValue,
  onSelectChange,
  selectOptions,
  selectMinWidth = 'min-w-[200px]',
  children,
  className = '',
}: SearchFilterBarProps) {
  return (
    <div className={`kkn-search-filter-bar ${className}`}>
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="kkn-input-search shadow-2xs"
        />
      </div>

      {selectOptions && onSelectChange && selectValue !== undefined && (
        <div className={`relative ${selectMinWidth}`}>
          <select
            value={selectValue}
            onChange={(e) => onSelectChange(e.target.value)}
            className="kkn-select-filter shadow-2xs"
          >
            {selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}

      {children}
    </div>
  );
}
