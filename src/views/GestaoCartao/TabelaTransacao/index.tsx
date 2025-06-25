import { useContext, useState, useMemo } from "react";
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { Box, Chip, Tooltip } from "@mui/material";
import { 
    DataGrid, 
    GridColDef, 
    GridRenderCellParams
} from "@mui/x-data-grid";
import { FormatNumber } from '../../../functions/global';
import { format } from 'date-fns';
import { IconButton, Icon, Snackbar } from "@mui/material";
import { ExclusaoModal } from '../ExclusaoModal';

interface CompraRow {
    id: string;
    nomeCompra: string;
    dataCompra: string;
    numeroParcela: number;
    numeroTotalParcela: number;
    ultimaParcela: string;
    nomeCartao: string;
    valorParcela: number;
    valorFaltante: number;
    valorTotal: number;
}

const localeTextPtBR = {
    noRowsLabel: 'Nenhuma compra encontrada',
    noResultsOverlayLabel: 'Nenhum resultado encontrado',
    toolbarColumns: 'Colunas',
    toolbarColumnsLabel: 'Selecionar colunas',
    toolbarFilters: 'Filtros',
    toolbarFiltersLabel: 'Mostrar filtros',
    toolbarDensity: 'Densidade',
    toolbarDensityLabel: 'Densidade',
    toolbarDensityCompact: 'Compacta',
    toolbarDensityStandard: 'Padrão',
    toolbarDensityComfortable: 'Confortável',
    filterPanelAddFilter: 'Adicionar filtro',
    filterPanelDeleteIconLabel: 'Excluir',
    filterPanelOperatorAnd: 'E',
    filterPanelOperatorOr: 'Ou',
    filterPanelColumns: 'Colunas',
    filterPanelInputLabel: 'Valor',
    filterPanelInputPlaceholder: 'Valor do filtro...',
    filterOperatorContains: 'contém',
    filterOperatorEquals: 'igual a',
    filterOperatorStartsWith: 'começa com',
    filterOperatorEndsWith: 'termina com',
    filterOperatorIs: 'é',
    filterOperatorNot: 'não é',
    filterOperatorAfter: 'depois de',
    filterOperatorOnOrAfter: 'em ou depois de',
    filterOperatorBefore: 'antes de',
    filterOperatorOnOrBefore: 'em ou antes de',
    filterOperatorIsEmpty: 'está vazio',
    filterOperatorIsNotEmpty: 'não está vazio',
    filterOperatorIsAnyOf: 'é qualquer um de',
    columnMenuLabel: 'Menu',
    columnMenuShowColumns: 'Mostrar colunas',
    columnMenuFilter: 'Filtrar',
    columnMenuHideColumn: 'Ocultar',
    columnMenuUnsort: 'Desfazer ordenação',
    columnMenuSortAsc: 'Ordenar crescente',
    columnMenuSortDesc: 'Ordenar decrescente',
    columnHeaderSortIconLabel: 'Ordenar',
    footerRowSelected: (count: number) =>
        count !== 1
            ? `${count.toLocaleString()} linhas selecionadas`
            : `${count.toLocaleString()} linha selecionada`,
    footerTotalRows: 'Total de linhas:',
    footerTotalVisibleRows: (visibleCount: number, totalCount: number) =>
        `${visibleCount.toLocaleString()} de ${totalCount.toLocaleString()}`,
    checkboxSelectionHeaderName: 'Seleção',
    booleanCellTrueLabel: 'sim',
    booleanCellFalseLabel: 'não',
    labelRowsPerPage: 'Linhas por página',
};

export function TabelaTransacao() {
    const { compras } = useContext(GestaoCartaoContext);
    const [itemParaExcluir, setItemParaExcluir] = useState<CompraRow | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 10,
        page: 0
    });

    const handleExcluir = (item: CompraRow) => {
        setItemParaExcluir(item);
    };

    const handleFecharModalExclusao = () => {
        setItemParaExcluir(null);
    };

    const handleExclusaoSucesso = () => {
        setOpenSnackbar(true);
        handleFecharModalExclusao();
    };

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    const columns: GridColDef<CompraRow>[] = useMemo(() => [
        { 
            field: 'nomeCompra', 
            headerName: 'Nome da Compra', 
            flex: 1,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ 
                    fontWeight: 500,
                    color: '#2c3e50',
                }}>
                    {params.value}
                </Box>
            )
        },
        { 
            field: 'dataCompra', 
            headerName: 'Data', 
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip 
                    label={formatDate(params.row.dataCompra)}
                    size="small"
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        borderRadius: '6px',
                        height: '18px',
                        boxShadow: '0 2px 4px rgba(102, 126, 234, 0.2)',
                        '& .MuiChip-label': {
                            padding: '0 6px',
                        },
                    }}
                />
            )
        },
        { 
            field: 'ultimaParcela', 
            headerName: 'Status', 
            minWidth: 140,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip 
                    label={params.value === 'SIM' ? 'Finalizado' : 'Em andamento'}
                    size="small"
                    sx={{
                        background: params.value === 'SIM' 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        minWidth: 80,
                        borderRadius: '6px',
                        height: '18px',
                        boxShadow: params.value === 'SIM' 
                            ? '0 2px 4px rgba(16, 185, 129, 0.2)'
                            : '0 2px 4px rgba(245, 158, 11, 0.2)',
                        '& .MuiChip-label': {
                            padding: '0 6px',
                        },
                    }}
                />
            )
        },
        { 
            field: 'numeroParcela', 
            headerName: 'Parcela', 
            width: 100,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%',
                    fontWeight: 600,
                    color: '#2c3e50',
                    fontSize: '0.75rem',
                }}>
                    {`${params.row.numeroParcela} de ${params.row.numeroTotalParcela}`}
                </Box>
            )
        },
        { 
            field: 'valorParcela', 
            headerName: 'Valor Parcela', 
            width: 140,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Tooltip title={`Total: ${FormatNumber(params.row.valorTotal)} em ${params.row.numeroTotalParcela}x`} arrow>
                  <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: '100%',
                      fontWeight: 600,
                      color: '#2c3e50',
                      fontSize: '0.75rem',
                  }}>
                      {FormatNumber(params.row.valorParcela)}
                  </Box>
                </Tooltip>
            )
        },
        { 
            field: 'nomeCartao', 
            headerName: 'Cartão', 
            width: 150,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Chip 
                    label={params.value}
                    size="small"
                    sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        borderRadius: '6px',
                        height: '18px',
                        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
                        '& .MuiChip-label': {
                            padding: '0 6px',
                        },
                    }}
                />
            )
        },
        {
            field: 'acoes',
            headerName: 'Ações',
            width: 80,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            renderCell: (params: GridRenderCellParams<CompraRow>) => (
                <IconButton
                    sx={{
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '6px',
                        '&:hover': {
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.3) 100%)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleExcluir(params.row)}
                    size="small"
                >
                    <Icon>delete</Icon>
                </IconButton>
            )
        }
    ], []);

    const rows = useMemo(() => compras.map(compra => ({
        id: compra.id,
        nomeCompra: compra.nomeCompra,
        dataCompra: compra.dataCompra,
        numeroParcela: compra.numeroParcela,
        numeroTotalParcela: compra.numeroTotalParcela,
        ultimaParcela: compra.ultimaParcela,
        nomeCartao: compra.nomeCartao,
        valorParcela: compra.valorParcela,
        valorFaltante: compra.valorFaltante,
        valorTotal: compra.valorTotal,
    })), [compras]);

    return (
        <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            flex: 1,
            minHeight: 0,
            overflowX: { xs: 'auto', md: 'visible' },
            pb: { xs: 2, md: 0 },
        }}>
            <DataGrid<CompraRow>
                rows={rows}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                pagination
                disableRowSelectionOnClick
                density="compact"
                autoHeight
                localeText={localeTextPtBR}
                sx={{
                    minWidth: 600,
                    maxWidth: '100%',
                    border: 'none',
                    borderRadius: 2,
                    background: '#ffffff',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    borderTop: '4px solid #667eea',
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none'
                    },
                    '& .MuiDataGrid-row': {
                        minHeight: '32px !important',
                        maxHeight: '32px !important',
                        height: '32px !important',
                        borderBottom: '1px solid #f1f3f4',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%)',
                            transform: 'translateX(2px)',
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
                        },
                        '&:nth-of-type(even)': {
                            background: '#fafbfc',
                        },
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        minHeight: '36px !important',
                        maxHeight: '36px !important',
                        height: '36px !important',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderBottom: 'none',
                        borderRadius: '4px 4px 0 0',
                        '& .MuiDataGrid-columnHeader': {
                            fontWeight: 700,
                            color: '#ffffff',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                            fontWeight: 700,
                        },
                    },
                    '& .MuiDataGrid-columnHeader': {
                        borderRight: '1px solid rgba(255, 255, 255, 0.2)',
                        '&:last-child': {
                            borderRight: 'none',
                        },
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                        },
                    },
                    '& .MuiDataGrid-cell': {
                        borderRight: '1px solid #f1f3f4',
                        '&:last-child': {
                            borderRight: 'none',
                        },
                        padding: '4px 8px !important',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        lineHeight: '1.2 !important',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderTop: '2px solid #f1f3f4',
                        borderRadius: '0 0 4px 4px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
                        minHeight: '36px !important',
                        maxHeight: '36px !important',
                        height: '36px !important',
                        '& .MuiTablePagination-root': {
                            color: '#2c3e50',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            fontWeight: 600,
                            color: '#667eea',
                            fontSize: '0.75rem',
                        },
                    },
                    '& .MuiDataGrid-virtualScroller': {
                        borderRadius: '0 0 4px 4px',
                    },
                    '& .MuiDataGrid-virtualScrollerContent': {
                        borderRadius: '0 0 4px 4px',
                    },
                    '& .MuiDataGrid-virtualScrollerRenderZone': {
                        borderRadius: '0 0 4px 4px',
                    },
                    flex: 1
                }}
            />
            <ExclusaoModal
                open={!!itemParaExcluir}
                onClose={handleFecharModalExclusao}
                onSuccess={handleExclusaoSucesso}
                item={itemParaExcluir}
            />
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Compra removida com sucesso!"
            />
        </Box>
    );
} 