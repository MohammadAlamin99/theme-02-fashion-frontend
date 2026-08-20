import React from "react";

interface Column<T> {
  header: string;
  key: string;
  render?: (item: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T;
  gradiant?: boolean;
}

const DataTable = <T,>({
  data,
  columns,
  rowKey,
  gradiant = false,
}: DataTableProps<T>) => {
  return (
    <div className="w-full overflow-x-auto px-[18px] font-poppins">
      <table className="w-full text-left border-separate border-spacing-0 min-w-[1000px] xl:min-w-full">
        <thead>
          <tr
            className={
              gradiant
                ? "bg-[linear-gradient(180deg,_rgba(56,189,248,0.27)_0%,_rgba(30,144,255,0.27)_100%)]"
                : "bg-[#E8F6FE]"
            }
          >
            {columns.map((col, index) => (
              <th
                key={col.key}
                className={`py-3 px-4 text-[13px] xl:text-[15px] font-semibold text-[#023337] 
                  ${index === 0 ? "rounded-l-[8px]" : ""} 
                  ${index === columns.length - 1 ? "rounded-r-[8px] text-right" : ""} 
                  ${col.headerClassName || ""}`}
              >
                {/* Uses headerRender if provided, otherwise defaults to text string */}
                {col.headerRender ? col.headerRender() : col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(185,185,185,0.3)]">
          {data.map((item, rowIndex) => {
            const rowKeyValue = item[rowKey]
              ? String(item[rowKey])
              : `row-${rowIndex}`;
            return (
              <tr
                key={rowKeyValue}
                className="hover:bg-[#F8FBFF] transition-colors group"
                style={{
                  zIndex: data.length - rowIndex,
                }}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={`${rowKeyValue}-${col.key}`}
                    className={`py-4 px-4 border-b border-[#B9B9B9]/50 
                                        ${colIndex === columns.length - 1 ? "text-right" : ""} 
                                        ${col.className || ""}`}
                  >
                    {col.render
                      ? col.render(item, rowIndex)
                      : (item[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            );
          })}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
