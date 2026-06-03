import { useContext } from "react";
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Table } from '../../../components/ui/Table';
import { formatCurrency, toBRDate } from '../../../functions/global';
import { ExclusaoModal } from '../ExclusaoModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import EditIcon from '@mui/icons-material/Edit';
import { colors } from '../../../styles/colors';

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
    categoriaId?: string;
    categoria?: string;
    acoes?: never;
}

interface TabelaTransacaoProps {
    onEditCompra?: (compra: any) => void;
    itemParaExcluir: CompraRow | null;
    setItemParaExcluir: (item: CompraRow | null) => void;
    handleExclusaoSuccess: () => void;
    categoriaSelecionada?: string | null;
    onToggleCategoria?: (categoria?: string | null) => void;
}

export function TabelaTransacao({ onEditCompra, itemParaExcluir, setItemParaExcluir, handleExclusaoSuccess, categoriaSelecionada, onToggleCategoria }: TabelaTransacaoProps) {
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
                <Box sx={{ fontWeight: 500, color: colors.text.primary }}>{value}</Box>
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
                        backgroundColor: colors.primary.main,
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        borderRadius: '6px',
                        height: '20px',
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
                        backgroundColor: value === 'SIM' ? colors.semantic.success : colors.semantic.warning,
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        minWidth: 60,
                        borderRadius: '6px',
                        height: '20px',
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontWeight: 600, color: colors.text.primary, fontSize: '0.75rem' }}>
                    {`${row.numeroParcela} de ${row.numeroTotalParcela}`}
                </Box>
            ),
        },
        { id: 'nomeCartao', label: 'Cartão', minWidth: 80 },
        {
            id: 'categoria',
            label: 'Categoria',
            minWidth: 100,
            render: (value: CompraRow['categoria']) => {
                return (
                    <Chip
                        label={value || 'Sem categoria'}
                        size="small"
                        onClick={() => onToggleCategoria && onToggleCategoria(value || 'Sem categoria')}
                        sx={{
                            backgroundColor: categoriaSelecionada && categoriaSelecionada === (value || 'Sem categoria')
                                ? colors.semantic.success
                                : colors.primary.main,
                            cursor: 'pointer',
                            color: '#ffffff',
                            fontWeight: 600,
                            fontSize: '0.65rem',
                            borderRadius: '6px',
                            height: '20px',
                            '& .MuiChip-label': {
                                padding: '0 6px',
                            },
                        }}
                    />
                );
            },
        },
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

    const data = (compras || []).filter(c => {
        if (!categoriaSelecionada) return true;
        const categoria = c.categoria || 'Sem categoria';
        return categoria === categoriaSelecionada;
    });

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