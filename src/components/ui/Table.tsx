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
    <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)' }}>
      <MuiTable>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={String(column.id)}
                align={column.align || 'left'}
                sx={{ fontWeight: 700, color: '#667eea', fontSize: '1rem', background: 'rgba(102,126,234,0.05)' }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center">
                <Box py={4}>
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, idx) => (
              <TableRow key={idx} hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(102,126,234,0.07)' } }}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    {column.render ? column.render(row[column.id], row) : row[column.id]}
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
      />
    </TableContainer>
  );
} 