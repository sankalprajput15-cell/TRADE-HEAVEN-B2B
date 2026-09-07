import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowRight } from 'lucide-react';

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  itemLabel?: string;
  scrollTargetId?: string;
  className?: string;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [12, 24, 48],
  itemLabel = 'results',
  scrollTargetId,
  className = ''
}) => {
  const [jumpPageInput, setJumpPageInput] = useState('');

  if (totalItems <= 0) return null;

  const handlePageSelect = (pageNum: number) => {
    const validPage = Math.max(1, Math.min(totalPages, pageNum));
    if (validPage === currentPage) return;
    onPageChange(validPage);
    if (scrollTargetId) {
      const el = document.getElementById(scrollTargetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(jumpPageInput, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= totalPages) {
      handlePageSelect(parsed);
      setJumpPageInput('');
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate compact page range with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2;
      for (let i = 1; i <= leftItemCount; i++) {
        pages.push(i);
      }
      pages.push('DOTS_RIGHT');
      pages.push(totalPages);
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2;
      pages.push(1);
      pages.push('DOTS_LEFT');
      for (let i = totalPages - rightItemCount + 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      pages.push(1);
      pages.push('DOTS_LEFT');
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        pages.push(i);
      }
      pages.push('DOTS_RIGHT');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`pt-6 border-t border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-4 select-none ${className}`}>
      {/* Results summary counter */}
      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap justify-center lg:justify-start">
        <div>
          Showing <span className="font-bold text-slate-900 font-mono">{startItem}</span> to{' '}
          <span className="font-bold text-slate-900 font-mono">{endItem}</span> of{' '}
          <span className="font-black text-slate-900 font-mono">{totalItems.toLocaleString()}</span> {itemLabel}
        </div>

        {/* Optional Page Size Selector */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span className="text-slate-500">Per page:</span>
            <div className="flex items-center gap-1">
              {itemsPerPageOptions.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => {
                    onItemsPerPageChange(size);
                    onPageChange(1);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                    itemsPerPage === size
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination controls & Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {/* First Page */}
        {totalPages > 5 && (
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => handlePageSelect(1)}
            title="First Page"
            aria-label="Go to first page"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-600 cursor-pointer transition-colors shadow-2xs"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
        )}

        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => handlePageSelect(currentPage - 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((item, idx) => {
            if (item === 'DOTS_LEFT') {
              return (
                <button
                  key={`dots-left-${idx}`}
                  type="button"
                  onClick={() => handlePageSelect(Math.max(1, currentPage - 5))}
                  title="Jump back 5 pages"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-colors"
                >
                  ...
                </button>
              );
            }
            if (item === 'DOTS_RIGHT') {
              return (
                <button
                  key={`dots-right-${idx}`}
                  type="button"
                  onClick={() => handlePageSelect(Math.min(totalPages, currentPage + 5))}
                  title="Jump forward 5 pages"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-colors"
                >
                  ...
                </button>
              );
            }

            const pageNum = item as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => handlePageSelect(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-8 h-8 min-w-[32px] flex items-center justify-center rounded-lg text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-600/30'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageSelect(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        {totalPages > 5 && (
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => handlePageSelect(totalPages)}
            title="Last Page"
            aria-label="Go to last page"
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-600 cursor-pointer transition-colors shadow-2xs"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        )}

        {/* Direct Page Jump */}
        {totalPages > 3 && (
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1 pl-2 border-l border-slate-200 ml-1">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Go to:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={`${currentPage}`}
              className="w-12 h-8 px-1.5 py-1 text-xs text-center font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <button
              type="submit"
              disabled={!jumpPageInput}
              className="h-8 px-2 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-[11px] font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer flex items-center gap-0.5"
            >
              <span>Go</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
