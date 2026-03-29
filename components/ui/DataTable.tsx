import { ReactNode } from "react";
import { Card } from "./Card";

interface TableColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  title: string;
  columns: Array<TableColumn<T>>;
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  title,
  columns,
  data,
  loading = false,
  emptyMessage = "Sem registros para exibir."
}: DataTableProps<T>) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border)] px-5 py-4">
        <h2 className="font-[var(--font-heading)] text-lg font-semibold text-brand-900">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-50 text-brand-800">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className="px-4 py-3 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] bg-white">
            {loading ? (
              <tr>
                <td className="px-4 py-5 text-[var(--muted)]" colSpan={columns.length}>
                  Carregando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-[var(--muted)]" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="hover:bg-brand-50/40">
                  {columns.map((column) => (
                    <td key={column.header} className="px-4 py-3 text-slate-700">
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

