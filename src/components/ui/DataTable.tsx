import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  useMediaQuery,
  useTheme,
  type SxProps,
  type Theme,
} from '@mui/material';
import { EmptyState } from './EmptyState';

export interface DataColumn<T> {
  id: string;
  header: ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: number | string;
  /** Conteúdo da célula. Sem ele, usa `row[id]`. */
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;
  /** Como cada linha aparece no celular. Sem ele, mostra pares rótulo/valor. */
  renderMobileRow?: (row: T) => ReactNode;
  rowSx?: (row: T) => SxProps<Theme> | undefined;
  minWidth?: number;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  /** Conteúdo à esquerda da paginação (ex.: total filtrado) */
  footer?: ReactNode;
}

/**
 * Tabela padrão do app.
 * - Desktop/iPad: tabela com cabeçalho cinza e rolagem horizontal se faltar espaço.
 * - Celular: vira uma lista de itens, fácil de tocar.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  loading,
  emptyMessage = 'Nenhum registro encontrado.',
  renderMobileRow,
  rowSx,
  minWidth = 720,
  rowsPerPageOptions = [10, 25, 50],
  defaultRowsPerPage = 10,
  footer,
}: Readonly<DataTableProps<T>>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);

  const lastPage = Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1);
  const currentPage = Math.min(page, lastPage);
  const visible = useMemo(
    () => rows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage),
    [rows, currentPage, rowsPerPage],
  );

  const cell = (col: DataColumn<T>, row: T): ReactNode =>
    col.render ? col.render(row) : ((row as Record<string, unknown>)[col.id] as ReactNode);

  return (
    <Box>
      {loading && <LinearProgress sx={{ height: 2, borderRadius: 0 }} aria-label="Carregando" />}

      {!loading && rows.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : isMobile ? (
        <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, opacity: loading ? 0.6 : 1 }}>
          {visible.map((row, i) => (
            <Box
              component="li"
              key={getRowKey(row, i)}
              sx={
                [
                  { px: 2, py: 1.5, borderTop: 1, borderColor: 'divider' },
                  ...[rowSx?.(row) ?? {}].flat(),
                ] as SxProps<Theme>
              }
            >
              {renderMobileRow ? (
                renderMobileRow(row)
              ) : (
                <Box
                  component="dl"
                  sx={{ m: 0, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 2, rowGap: 0.5 }}
                >
                  {columns.map((col) => (
                    <Box key={col.id} sx={{ display: 'contents' }}>
                      <Box component="dt" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                        {col.header}
                      </Box>
                      <Box component="dd" sx={{ m: 0, textAlign: 'right', fontSize: '0.875rem' }}>
                        {cell(col, row)}
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      ) : (
        <TableContainer sx={{ overflowX: 'auto', opacity: loading ? 0.6 : 1 }}>
          <Table size="medium" sx={{ minWidth }}>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    sx={{ width: col.width, '&:first-of-type': { pl: 3 }, '&:last-of-type': { pr: 3 } }}
                  >
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visible.map((row, i) => (
                <TableRow key={getRowKey(row, i)} hover sx={rowSx?.(row)}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align}
                      sx={{ '&:first-of-type': { pl: 3 }, '&:last-of-type': { pr: 3 } }}
                    >
                      {cell(col, row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {rows.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            borderTop: 1,
            borderColor: 'divider',
            pl: { xs: 2, md: 3 },
            pr: 1,
          }}
        >
          <Box sx={{ fontSize: '0.8125rem', color: 'text.secondary', py: 1 }}>{footer}</Box>
          <TablePagination
            component="div"
            count={rows.length}
            page={currentPage}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={isMobile ? [] : rowsPerPageOptions}
            labelRowsPerPage="Por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </Box>
      )}
    </Box>
  );
}
