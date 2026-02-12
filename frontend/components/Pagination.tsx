"use client";

import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Show max 5 page numbers, hide middle ones with ellipsis if needed
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return pages;
    }

    const visiblePages = [];
    const maxVisible = 5;
    const sideCount = 2;

    if (page <= sideCount + 1) {
      // Near the start
      for (let i = 1; i <= maxVisible; i++) {
        visiblePages.push(i);
      }
    } else if (page >= totalPages - sideCount) {
      // Near the end
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
        visiblePages.push(i);
      }
    } else {
      // In the middle
      for (let i = page - sideCount; i <= page + sideCount; i++) {
        visiblePages.push(i);
      }
    }

    return visiblePages;
  };

  const visiblePages = getVisiblePages();

  return (
    <PaginationComponent>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className={
              page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
            }
          />
        </PaginationItem>

        {/* First page if not visible */}
        {visiblePages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(1)}
                className="cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>
            {visiblePages[0] > 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
          </>
        )}

        {/* Page numbers */}
        {visiblePages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              onClick={() => onPageChange(p)}
              isActive={p === page}
              className="cursor-pointer"
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Last page if not visible */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                onClick={() => onPageChange(totalPages)}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className={
              page === totalPages
                ? "pointer-events-none opacity-50"
                : "cursor-pointer"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationComponent>
  );
}
