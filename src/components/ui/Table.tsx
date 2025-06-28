import React from 'react';

export interface TableProps {
  headers: string[];
  data: React.ReactNode[][];
  className?: string;
}

const Table: React.FC<TableProps> = ({ headers, data, className = '' }) => {
  return (
    <table className={`min-w-full text-sm ${className}`.trim()}>
      <thead className="bg-vz-overlay">
        <tr>
          {headers.map((h) => (
            <th key={h} className="px-s-3 py-s-2 text-left font-heading">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="even:bg-vz-overlay/50">
            {row.map((cell, j) => (
              <td key={j} className="px-s-3 py-s-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
