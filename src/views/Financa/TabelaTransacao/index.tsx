import { useContext, useState, useMemo } from "react";
import { FinancaContext } from "../../../contexts/FinancaContext";
import { Box } from "@mui/material";
import { 
    DataGrid, 
    GridColDef, 
    GridRenderCellParams,
    GridFooterContainer,
    GridFooter
} from "@mui/x-data-grid";
import { FormatNumber } from '../../../functions/global';
import { format } from 'date-fns';
import { IconButton, Icon, Typography, Snackbar } from "@mui/material";
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

function CustomFooter() {
    const { compras } = useContext(FinancaContext);

    const getFooterValue = (field: 'valorTotal' | 'valorParcela') => {
        if (!compras || compras.length === 0) return 0;
        return compras.reduce((sum, row) => {
            const value = Number(row[field]);
            return sum + (isNaN(value) ? 0 : value);
        }, 0);
    };

    return (
        <GridFooterContainer>
            <Box sx={{ p: 1, display: 'flex', gap: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                    Total: {FormatNumber(getFooterValue('valorTotal'))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total Parcelas: {FormatNumber(getFooterValue('valorParcela'))}
                </Typography>
            </Box>
            <GridFooter />
        </GridFooterContainer>
    );
}

export function TabelaTransacao() {
    const { compras } = useContext(FinancaContext);
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
            headerName: 'Nome', 
            flex: 1,
            minWidth: 150 
        },
        { 
            field: 'dataCompra', 
            headerName: 'Data', 
            width: 120,
            renderCell: (params) => formatDate(params.row.dataCompra)
        },
        { 
            field: 'numeroParcela', 
            headerName: 'Parcela', 
            width: 100,
            renderCell: (params) => 
                `${params.row.numeroParcela}/${params.row.numeroTotalParcela}`
        },
        { 
            field: 'nomeCartao', 
            headerName: 'Cartão', 
            width: 150 
        },
        { 
            field: 'valorParcela', 
            headerName: 'Valor Parcela', 
            width: 130,
            renderCell: (params) => FormatNumber(params.row.valorParcela)
        },
        { 
            field: 'valorTotal', 
            headerName: 'Valor Total', 
            width: 130,
            renderCell: (params) => FormatNumber(params.row.valorTotal)
        },
        {
            field: 'acoes',
            headerName: 'Ações',
            width: 100,
            sortable: false,
            renderCell: (params: GridRenderCellParams<CompraRow>) => (
                <IconButton
                    color="error"
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
        valorTotal: compra.valorTotal
    })), [compras]);

    return (
        <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            flex: 1,
            minHeight: 0
        }}>
            <DataGrid<CompraRow>
                rows={rows}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10, 25, 50, 100]}
                pagination
                disableRowSelectionOnClick
                slots={{
                    footer: CustomFooter
                }}
                density="compact"
                autoHeight
                sx={{
                    '& .MuiDataGrid-cell:focus': {
                        outline: 'none'
                    },
                    '& .MuiDataGrid-row': {
                        minHeight: '48px'
                    },
                    '& .MuiDataGrid-columnHeaders': {
                        minHeight: '48px'
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
                message="Transação excluída com sucesso!"
            />
        </Box>
    );
}