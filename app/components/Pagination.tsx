'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];
  if (currentPage > 3) pages.push('...');

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (currentPage < totalPages - 2) pages.push('...');
  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-600 hover:border-amber-300 hover:text-amber-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-neutral-400 text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`min-w-9 px-2.5 py-2 rounded-lg border text-sm font-semibold transition-all ${
              page === currentPage
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25'
                : 'bg-white text-neutral-600 border-neutral-200 hover:border-amber-300 hover:text-amber-600'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className="flex items-center gap-1 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm font-medium text-neutral-600 hover:border-amber-300 hover:text-amber-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
