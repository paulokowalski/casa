import React, { useState } from 'react';
import { Table as MuiTable, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, TablePagination } from '@mui/material';

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
    <TableContainer component={Paper} sx={{
      borderRadius: 1,
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      background: '#23263a',
    }}>
      <MuiTable stickyHeader>
        <TableHead>
          <TableRow sx={{ background: '#181a20', backdropFilter: 'blur(4px)' }}>
            {columns.map((col, idx) => (
              <TableCell
                key={col.id}
                align={'center'}
                sx={{ fontWeight: 700, fontSize: 15, background: '#181a20', color: '#f5f6fa', borderBottom: '2px solid #23263a', letterSpacing: 0.5 }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6, color: '#a0aec0', fontWeight: 500, background: '#23263a' }}>
                {emptyMessage || 'Nenhum dado encontrado.'}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, idx) => (
              <TableRow
                key={row.id || idx}
                sx={{
                  background: idx % 2 === 0 ? 'rgba(35,38,58,0.95)' : 'rgba(35,38,58,0.85)',
                  transition: 'background 0.2s',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.13)',
                  },
                }}
              >
                {columns.map((col, idx) => (
                  <TableCell
                    key={col.id}
                    align={idx === 0 ? 'left' : (col.align || 'center')}
                    sx={{
                      borderBottom: '1px solid #23263a',
                      fontSize: 15,
                      minWidth: col.minWidth,
                      paddingX: 1,
                      paddingY: 0.5,
                      color: '#f5f6fa',
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
        sx={{ background: '#181a20', color: '#f5f6fa', borderTop: '1px solid #23263a' }}
      />
    </TableContainer>
  );
} 