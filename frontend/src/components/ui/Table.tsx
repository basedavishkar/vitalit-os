"use client";

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export type Column<T> = {
  key: keyof T | string;
  header: React.ReactNode;
  width?: string | number;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  density?: 'comfortable' | 'compact';
  selectable?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 10,
  density = 'comfortable',
  selectable = false,
  loading = false,
  emptyMessage = 'No records found',
  className,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [selected, setSelected] = useState<Record<string | number, boolean>>({});

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const { key, dir } = sort;
    const copy = [...rows];
    copy.sort((a: any, b: any) => {
      const av = a[key];
      const bv = b[key];
      if (av === bv) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return dir === 'asc' ? av - bv : bv - av;
      }
      return dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const toggleSort = (key: string, sortable?: boolean) => {
    if (!sortable) return;
    setPage(1);
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' };
      if (prev.dir === 'asc') return { key, dir: 'desc' };
      return null;
    });
  };

  const allSelectedOnPage = current.length > 0 && current.every((r) => selected[rowKey(r)]);
  const toggleSelectAll = () => {
    const next = { ...selected };
    if (allSelectedOnPage) {
      current.forEach((r) => delete next[rowKey(r)]);
    } else {
      current.forEach((r) => (next[rowKey(r)] = true));
    }
    setSelected(next);
  };

  const rowPad = density === 'compact' ? 'py-2' : 'py-3';

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-card border-b border-border z-10">
            <tr>
              {selectable && (
                <th className="w-10 px-3 text-left">
                  <input type="checkbox" checked={allSelectedOnPage} onChange={toggleSelectAll} />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={String(c.key)}
                  style={{ width: c.width }}
                  className={cn('px-3 py-2 text-xs font-medium text-muted-foreground', c.align === 'right' && 'text-right', c.align === 'center' && 'text-center', 'select-none')}
                >
                  <button
                    className={cn('inline-flex items-center gap-1', c.sortable ? 'hover:text-foreground' : 'cursor-default')}
                    onClick={() => toggleSort(String(c.key), c.sortable)}
                  >
                    {c.header}
                    {sort?.key === c.key && (
                      <span aria-hidden className="text-muted-foreground">{sort.dir === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              [...Array(pageSize)].map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {selectable && <td className={cn('px-3', rowPad)}><div className="h-4 w-4 bg-muted rounded" /></td>}
                  {columns.map((c) => (
                    <td key={String(c.key)} className={cn('px-3', rowPad)}>
                      <div className="h-4 w-2/3 bg-muted rounded" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {!loading && current.length === 0 && (
              <tr>
                <td colSpan={(columns.length + (selectable ? 1 : 0))} className={cn('px-3 py-10 text-center text-sm text-muted-foreground')}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading && current.map((r) => (
              <tr key={rowKey(r)} className="border-b border-border hover:bg-muted/60 transition-colors">
                {selectable && (
                  <td className={cn('px-3', rowPad)}>
                    <input
                      type="checkbox"
                      checked={!!selected[rowKey(r)]}
                      onChange={() => setSelected({ ...selected, [rowKey(r)]: !selected[rowKey(r)] })}
                    />
                  </td>
                )}
                {columns.map((c) => (
                  <td key={String(c.key)} className={cn('px-3 text-sm', rowPad, c.align === 'right' && 'text-right', c.align === 'center' && 'text-center')}>
                    {c.render ? c.render(r) : (r as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span>Rows per page</span>
          <select className="input" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span>{(rows.length === 0) ? 0 : (page - 1) * pageSize + 1}-{Math.min(page * pageSize, rows.length)} of {rows.length}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage(1)} disabled={page === 1}>⏮</Button>
          <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>◀</Button>
          <Button variant="ghost" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>▶</Button>
          <Button variant="ghost" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>⏭</Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable; 