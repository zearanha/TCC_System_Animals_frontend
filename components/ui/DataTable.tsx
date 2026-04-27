import { ReactNode } from "react";
import { Box, Text } from "@chakra-ui/react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

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
    <Paper sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #d5e1d8" }}>
      <Box borderBottom="1px solid" borderColor="gray.200" px={5} py={4} bg="white">
        <Text as="h2" fontFamily="heading" fontSize="lg" fontWeight="semibold" color="brand.900">
          {title}
        </Text>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f4f9f5" }}>
              {columns.map((column) => (
                <TableCell key={column.header} sx={{ fontWeight: 700, color: "#2e4532" }}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 3, color: "#60756a" }}>
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 3, color: "#60756a" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index} hover>
                  {columns.map((column) => (
                    <TableCell key={column.header} sx={{ py: 1.5, color: "#334155" }}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
