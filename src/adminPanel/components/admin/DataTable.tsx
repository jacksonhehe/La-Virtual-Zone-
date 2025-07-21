import React, { useState, useMemo } from 'react';
import Skeleton from '../../../components/ui/Skeleton';

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode | string | number;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  pageSize?: number;
  onSelectionChange?: (ids: string[]) => void;
  loading?: boolean;
}

function DataTable<T>({ data, columns, keyExtractor, pageSize = 10, onSelectionChange, loading=false }: DataTableProps<T>) {
  const [sort, setSort] = useState<{ id: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  const toggleSelectAll = (rows: T[]) => {
    const allIds = rows.map(r => keyExtractor(r));
    const next = new Set(selected);
    const allSelected = allIds.every(id => next.has(id));
    if (allSelected) {
      allIds.forEach(id => next.delete(id));
    } else {
      allIds.forEach(id => next.add(id));
    }
    setSelected(next);
    onSelectionChange?.(Array.from(next));
  };

  const sortedData = useMemo(() => {
    if (!sort) return data;
    const col = columns.find(c => c.id === sort.id);
    if (!col) return data;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const v1 = col.accessor(a) as any;
      const v2 = col.accessor(b) as any;
      if (v1 === v2) return 0;
      return (v1 > v2 ? 1 : -1) * dir;
    });
  }, [data, sort, columns]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const visibleRows = sortedData.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-sm text-gray-300">
        <thead>
          <tr className="bg-gray-800/60">
            <th className="p-3 w-10">
              <input
                type="checkbox"
                checked={visibleRows.length>0 && visibleRows.every(r=>selected.has(keyExtractor(r)))}
                onChange={()=>toggleSelectAll(visibleRows)}
              />
            </th>
            {columns.map(col => (
              <th
                key={col.id}
                className={`p-3 text-left font-semibold cursor-pointer ${col.width??''}`}
                onClick={() => col.sortable && setSort(prev => {
                  if (!prev || prev.id!==col.id) return { id: col.id, dir: 'asc' };
                  return { id: col.id, dir: prev.dir==='asc'? 'desc':'asc' };
                })}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {sort?.id===col.id && (sort.dir==='asc' ? '▲':'▼')}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <tr key={i} className="border-b border-gray-700">
                <td className="p-3"><Skeleton width={20} height={20} /></td>
                {columns.map(col => (
                  <td key={col.id} className="p-3"><Skeleton height={16} /></td>
                ))}
              </tr>
            ))
          ) : (
          visibleRows.map(row => {
            const id = keyExtractor(row);
            return (
              <tr key={id} className="border-b border-gray-700 hover:bg-gray-700/30">
                <td className="p-3">
                  <input type="checkbox" checked={selected.has(id)} onChange={()=>toggleSelect(id)} />
                </td>
                {columns.map(col => (
                  <td key={col.id} className="p-3 whitespace-nowrap">
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            );
          })
          )}
          {!loading && visibleRows.length===0 && (
            <tr><td colSpan={columns.length+1} className="p-4 text-center text-gray-500">Sin resultados</td></tr>
          )}
        </tbody>
      </table>

      {/* pagination */}
      { !loading && totalPages>1 && (
        <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
          <span>Página {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button className="btn-outline" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</button>
            <button className="btn-outline" disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable; 