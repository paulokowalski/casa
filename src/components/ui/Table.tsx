import React, { useState } from 'react';
import { Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination } from '@mui/material';
import { colors } from '../../styles/colors';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'right' | 'left' | 'center';
  minWidth?: number;
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T extends { [key: string]: any }> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
}

export function Table<T extends { [key: string]: any }>({
  columns,
  data,
  emptyMessage = 'Nenhum dado encontrado.',
  rowsPerPageOptions = [5, 10, 25],
  defaultRowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
}: TableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
    if (onPageChange) onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRows = parseInt(event.target.value, 10);
    setRowsPerPage(newRows);
    setPage(0);
    if (onRowsPerPageChange) onRowsPerPageChange(newRows);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer component={Paper} elevation={0} sx={{
      borderRadius: 2,
      border: `1px solid ${colors.border.default}`,
      background: colors.bg.paper,
      overflow: 'hidden',
    }}>
      <MuiTable stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={'center'}
                sx={{
                  fontWeight: 600,
                  fontSize: 13,
                  background: colors.bg.elevated,
                  color: colors.text.secondary,
                  borderBottom: `1px solid ${colors.border.default}`,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: colors.text.muted, fontWeight: 500, background: colors.bg.paper }}>
                {emptyMessage || 'Nenhum dado encontrado.'}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, idx) => (
              <TableRow
                key={row.id || idx}
                sx={{
                  background: idx % 2 === 0 ? colors.bg.paper : colors.bg.elevated,
                  transition: 'background 0.15s',
                  '&:hover': {
                    background: colors.primary.subtle,
                  },
                }}
              >
                {columns.map((col, colIdx) => (
                  <TableCell
                    key={col.id}
                    align={colIdx === 0 ? 'left' : (col.align || 'center')}
                    sx={{
                      borderBottom: `1px solid ${colors.border.default}`,
                      fontSize: 14,
                      minWidth: col.minWidth,
                      px: 1.5,
                      py: 1,
                      color: colors.text.primary,
                    }}
                  >
                    {col.render ? col.render(row[col.id], row) : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage="Linhas por página"
        sx={{
          background: colors.bg.elevated,
          color: colors.text.primary,
          borderTop: `1px solid ${colors.border.default}`,
          '& .MuiTablePagination-selectIcon, & .MuiTablePagination-displayedRows, & .MuiTablePagination-select': {
            color: colors.text.secondary,
          },
        }}
      />
    </TableContainer>
  );
}
