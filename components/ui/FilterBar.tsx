'use client';

import React from 'react';
import { Search, ChevronDown, RotateCcw, RefreshCw, X } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownItem {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export interface FilterBarProps {
  // Search Configuration
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  onSearchSubmit?: (e: React.FormEvent) => void;
  showSearchButton?: boolean;
  searchButtonText?: string;
  searchWidth?: string;

  // Dropdown Filters
  filters?: FilterDropdownItem[];

  // Reset Button
  onReset?: () => void;
  showReset?: boolean;
  resetText?: string;

  // Refresh Button
  onRefresh?: () => void;
  isRefreshing?: boolean;
  refreshTitle?: string;

  // Counter / Result Badge
  countBadge?: string | number;
  countLabel?: string;

  // Custom Actions (e.g., Export Excel button, Tambah button)
  actions?: React.ReactNode;

  // Arbitrary additional content
  children?: React.ReactNode;

  className?: string;
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Cari data...',
  onSearchSubmit,
  showSearchButton = false,
  searchButtonText = 'Cari',
  searchWidth = 'flex-1 min-w-[220px]',
  filters = [],
  onReset,
  showReset = false,
  resetText = 'Reset Filter',
  onRefresh,
  isRefreshing = false,
  refreshTitle = 'Muat Ulang Data',
  countBadge,
  countLabel = '',
  actions,
  children,
  className = '',
}: FilterBarProps) {
  const hasSearch = searchValue !== undefined && onSearchChange !== undefined;

  const renderSearchForm = () => {
    if (!hasSearch) return null;

    const searchInput = (
      <div className="relative w-full sm:flex-1 sm:min-w-[220px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2]" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full h-10 pl-9 pr-9 bg-white border border-[#C0E6D8] hover:border-[#0E4A3E] focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E] rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium transition-all outline-hidden shadow-2xs"
        />
        {searchValue ? (
          <button
            type="button"
            onClick={() => onSearchChange?.('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
            title="Hapus pencarian"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>
    );

    if (onSearchSubmit || showSearchButton) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit?.(e);
          }}
          className="flex items-center gap-2 w-full sm:flex-1 sm:min-w-[220px]"
        >
          {searchInput}
          {showSearchButton && (
            <button
              type="submit"
              className="h-10 px-4 bg-[#0E4A3E] hover:bg-[#09352c] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 cursor-pointer shadow-2xs"
            >
              {searchButtonText}
            </button>
          )}
        </form>
      );
    }

    return searchInput;
  };

  return (
    <div className={`kkn-search-filter-bar ${className}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 w-full min-w-0">
        {renderSearchForm()}

        {filters && filters.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {filters.map((filter, idx) => (
              <div
                key={filter.id || idx}
                className={`relative ${filter.className || 'w-full sm:w-auto sm:min-w-[160px]'}`}
              >
                {filter.icon && (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    {filter.icon}
                  </span>
                )}
                <select
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  aria-label={filter.label || filter.placeholder || `Filter ${idx + 1}`}
                  className={`w-full h-10 ${
                    filter.icon ? 'pl-9' : 'pl-3.5'
                  } pr-9 bg-white border border-[#C0E6D8] hover:border-[#0E4A3E] focus:border-[#0E4A3E] focus:ring-1 focus:ring-[#0E4A3E] rounded-xl text-xs sm:text-sm text-slate-700 font-semibold appearance-none cursor-pointer transition-all outline-hidden shadow-2xs`}
                >
                  {filter.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {showReset && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="h-10 px-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-[#C0E6D8] rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{resetText}</span>
          </button>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            title={refreshTitle}
            className="h-10 w-10 bg-white hover:bg-slate-50 text-slate-600 border border-[#C0E6D8] rounded-xl inline-flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0E4A3E]' : ''}`} />
          </button>
        )}

        {children}
      </div>

      {(countBadge !== undefined || actions) && (
        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#C0E6D8]/50">
          {countBadge !== undefined && (
            <span className="text-xs font-bold text-[#0E4A3E] bg-white border border-[#C0E6D8] px-3 py-1.5 rounded-full shadow-2xs">
              {countBadge} {countLabel}
            </span>
          )}
          {actions}
        </div>
      )}
    </div>
  );
}
