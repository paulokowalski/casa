import { useContext, useState } from "react";
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Table } from '../../../components/ui/Table';
import { formatCurrency, toBRDate } from '../../../functions/global';
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
    itemParaExcluir: CompraRow | null;
    setItemParaExcluir: (item: CompraRow | null) => void;
    handleExclusaoSuccess: () => void;
}

export function TabelaTransacao({ onEditCompra, itemParaExcluir, setItemParaExcluir, handleExclusaoSuccess }: TabelaTransacaoProps) {
    const { compras, loading } = useContext(GestaoCartaoContext);

    const handleExcluir = (item: CompraRow) => {
        setItemParaExcluir(item);
    };

    const handleFecharModalExclusao = () => {
        setItemParaExcluir(null);
    };

    const columns = [
        {
            id: 'nomeCompra',
            label: 'Nome',
            minWidth: 320,
            render: (value: CompraRow['nomeCompra']) => (
                <Box sx={{ fontWeight: 500, color: '#f5f6fa' }}>{value}</Box>
            ),
        },
        {
            id: 'dataCompra',
            label: 'Data',
            align: 'center' as const,
            minWidth: 70,
            render: (value: CompraRow['dataCompra']) => (
                <Chip
                    label={toBRDate(value)}
                    size="small"
                    sx={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        borderRadius: '6px',
                        height: '18px',
                        boxShadow: '0 2px 4px rgba(139, 92, 246, 0.3)',
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
            minWidth: 80,
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
                        minWidth: 60,
                        borderRadius: '6px',
                        height: '18px',
                        boxShadow:
                            value === 'SIM'
                                ? '0 2px 4px rgba(16, 185, 129, 0.3)'
                                : '0 2px 4px rgba(245, 158, 11, 0.3)',
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
            minWidth: 60,
            render: (_: CompraRow['numeroParcela'], row: CompraRow) => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontWeight: 600, color: '#f5f6fa', fontSize: '0.75rem' }}>
                    {`${row.numeroParcela} de ${row.numeroTotalParcela}`}
                </Box>
            ),
        },
        { id: 'nomeCartao', label: 'Cartão', minWidth: 80 },
        {
            id: 'valorParcela',
            label: 'Valor Parcela',
            minWidth: 40,
            render: (value: CompraRow['valorParcela']) => formatCurrency(value),
        },
        {
            id: 'acoes',
            label: 'Ações',
            minWidth: 20,
            render: (_: CompraRow['acoes'], row: CompraRow) => (
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
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
                onSuccess={() => {
                    handleFecharModalExclusao();
                    handleExclusaoSuccess();
                }}
            />
        </Box>
    );
} 