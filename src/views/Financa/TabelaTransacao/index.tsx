import { useContext, useState, useMemo } from "react";
import { FinancaContext } from "../../../contexts/FinancaContext";
import { Box } from "@mui/material";
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
            headerName: 'Data da Compra', 
            width: 120,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    {formatDate(params.row.dataCompra)}
                </Box>
            )
        },
        { 
            field: 'ultimaParcela', 
            headerName: 'Última Parcela ?', 
            minWidth: 120,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%',
                    gap: 1 
                }}>
                    {params.value === 'SIM' && <Icon fontSize="small" color="success">done</Icon>}
                    {params.value === 'NÃO' && <Icon fontSize="small" color="error">close</Icon>}
                </Box>
            )
        },
        { 
            field: 'numeroParcela', 
            headerName: 'Parcela', 
            width: 100,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    {`${params.row.numeroParcela}/${params.row.numeroTotalParcela}`}
                </Box>
            )
        },
        { 
            field: 'valorParcela', 
            headerName: 'Valor da Parcela', 
            width: 130,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    {FormatNumber(params.row.valorParcela)}
                </Box>
            )
        },
        { 
            field: 'valorTotal', 
            headerName: 'Valor da Compra', 
            width: 130,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    {FormatNumber(params.row.valorTotal)}
                </Box>
            )
        },
        { 
            field: 'nomeCartao', 
            headerName: 'Cartão', 
            width: 150,
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    {params.value}
                </Box>
            )
        },
        {
            field: 'acoes',
            headerName: 'Ações',
            width: 100,
            headerAlign: 'center',
            sortable: false,
            renderCell: (params: GridRenderCellParams<CompraRow>) => (
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '100%'
                }}>
                    <IconButton
                        color="error"
                        onClick={() => handleExcluir(params.row)}
                        size="small"
                    >
                        <Icon>delete</Icon>
                    </IconButton>
                </Box>
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