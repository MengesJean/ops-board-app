"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

type ProjectsPaginationProps = {
  meta: PaginationMeta;
};

export function ProjectsPagination({ meta }: ProjectsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (meta.last_page <= 1) return null;

  const goTo = (page: number) => {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    if (page > 1) next.set("page", String(page));
    else next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const canPrev = meta.current_page > 1;
  const canNext = meta.current_page < meta.last_page;

  return (
    <div
      className="flex items-center justify-between gap-4 pt-2"
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canPrev}
          onClick={() => goTo(meta.current_page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {meta.current_page} of {meta.last_page}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!canNext}
          onClick={() => goTo(meta.current_page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
