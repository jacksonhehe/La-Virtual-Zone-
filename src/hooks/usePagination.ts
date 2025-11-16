import { useMemo, useState } from 'react';

export interface UsePaginationOptions<T> {
  items: T[];
  perPage?: number;
  initialPage?: number;
}

export function usePagination<T>({ items, perPage = 20, initialPage = 1 }: UsePaginationOptions<T>) {
  const [page, setPage] = useState(initialPage);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), totalPages);

  const pageItems = useMemo(() => {
    const start = (current - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, current, perPage]);

  const next = () => setPage(p => Math.min(totalPages, p + 1));
  const prev = () => setPage(p => Math.max(1, p - 1));
  const set = (n: number) => setPage(Math.min(totalPages, Math.max(1, n)));

  return { page: current, perPage, total, totalPages, items: pageItems, next, prev, set };
}

