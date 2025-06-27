import { useContext, useState } from "react";
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Table } from '../../../components/ui/Table';
import { FormatNumber } from '../../../functions/global';
import { format } from 'date-fns';
import { ExclusaoModal } from '../ExclusaoModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import EditIcon from '@mui/icons-material/Edit';

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
    acoes?: never;
}

interface TabelaTransacaoProps {
    onEditCompra?: (compra: any) => void;
}

export function TabelaTransacao({ onEditCompra }: TabelaTransacaoProps) {
    const { compras, loading } = useContext(GestaoCartaoContext);
    const [itemParaExcluir, setItemParaExcluir] = useState<CompraRow | null>(null);

    const handleExcluir = (item: CompraRow) => {
        setItemParaExcluir(item);
    };

    const handleFecharModalExclusao = () => {
        setItemParaExcluir(null);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'dd/MM/yyyy');
    };

    const columns = [
        {
            id: 'nomeCompra',
            label: 'Nome da Compra',
            render: (value: CompraRow['nomeCompra']) => (
                <Box sx={{ fontWeight: 500, color: '#2c3e50' }}>{value}</Box>
            ),
        },
        {
            id: 'dataCompra',
            label: 'Data',
            align: 'center' as const,
            render: (value: CompraRow['dataCompra']) => (
                <Chip
                    label={formatDate(value)}
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
            ),
        },
        {
            id: 'ultimaParcela',
            label: 'Status',
            align: 'center' as const,
            render: (value: CompraRow['ultimaParcela']) => (
                <Chip
                    label={value === 'SIM' ? 'Finalizado' : 'Em andamento'}
                    size="small"
                    sx={{
                        background:
                            value === 'SIM'
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        minWidth: 80,
                        borderRadius: '6px',
                        height: '18px',
                        boxShadow:
                            value === 'SIM'
                                ? '0 2px 4px rgba(16, 185, 129, 0.2)'
                                : '0 2px 4px rgba(245, 158, 11, 0.2)',
                        '& .MuiChip-label': {
                            padding: '0 6px',
                        },
                    }}
                />
            ),
        },
        {
            id: 'numeroParcela',
            label: 'Parcela',
            align: 'center' as const,
            render: (_: CompraRow['numeroParcela'], row: CompraRow) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontWeight: 600, color: '#2c3e50', fontSize: '0.75rem' }}>
                    {`${row.numeroParcela} de ${row.numeroTotalParcela}`}
                </Box>
            ),
        },
        { id: 'nomeCartao', label: 'Cartão' },
        {
            id: 'valorParcela',
            label: 'Valor Parcela',
            render: (value: CompraRow['valorParcela']) => FormatNumber(value),
        },
        {
            id: 'valorFaltante',
            label: 'Valor Faltante',
            render: (value: CompraRow['valorFaltante']) => FormatNumber(value),
        },
        {
            id: 'valorTotal',
            label: 'Valor Total',
            render: (value: CompraRow['valorTotal']) => FormatNumber(value),
        },
        {
            id: 'acoes',
            label: 'Ações',
            align: 'right' as const,
            render: (_: CompraRow['acoes'], row: CompraRow) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Editar">
                        <IconButton color="primary" onClick={() => onEditCompra && onEditCompra(row)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                        <IconButton color="error" onClick={() => handleExcluir(row)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const data = compras;

    return (
        <Box>
            <LoadingOverlay loading={loading}>
                <Table<CompraRow>
                    columns={columns}
                    data={data}
                    emptyMessage="Nenhuma compra encontrada."
                    rowsPerPageOptions={[5, 10, 25]}
                    defaultRowsPerPage={10}
                />
            </LoadingOverlay>
            <ExclusaoModal
                open={!!itemParaExcluir}
                item={itemParaExcluir}
                onClose={handleFecharModalExclusao}
                onSuccess={handleFecharModalExclusao}
            />
        </Box>
    );
} 