import React from "react";

export default function Table({
  headers,
  children,
  className = "",
}: {
  headers: React.ReactNode[];
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full rounded-xl text-sm">
        <thead className="bg-emerald-100">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-5 py-3 font-bold text-emerald-900 text-left tracking-wide uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-emerald-50">
          {React.Children.map(children, (row) => {
            if (React.isValidElement(row) && row.type === 'tr') {
              const r = row as React.ReactElement<React.ComponentPropsWithRef<'tr'>>;
              return React.cloneElement(r, {
                className: `even:bg-white odd:bg-emerald-50 hover:bg-emerald-100 transition-colors ${r.props.className || ''}`,
              });
            }
            return row;
          })}
        </tbody>
      </table>
    </div>
  );
} 