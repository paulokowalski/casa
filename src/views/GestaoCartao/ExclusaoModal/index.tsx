import { 
    Button, 
    Typography,
    Alert
} from '@mui/material';
import { Modal } from '../../../components/ui/Modal';
import { format } from 'date-fns';
import { useContext, useState } from 'react';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';

interface ExclusaoModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    item: {
        id: string;
        nomeCompra: string;
        valorTotal: number;
        dataCompra: string;
        numeroTotalParcela: number;
        nomeCartao: string;
    } | null;
}

export function ExclusaoModal({ open, onClose, onSuccess, item }: ExclusaoModalProps) {
    const { excluirCompra } = useContext(GestaoCartaoContext);
    const [error, setError] = useState<string | null>(null);

    const handleConfirmarExclusao = async () => {
        if (item) {
            try {
                await excluirCompra(item.id);
                setError(null);
                onSuccess();
            } catch (error: any) {
                setError(error?.response?.data?.message || 'Erro ao excluir compra.');
            }
        }
    };

    const handleClose = () => {
        setError(null);
        onClose();
    };

    if (!item) return null;

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Excluir Compra"
            maxWidth="xs"
            actions={
                <>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleConfirmarExclusao} color="error" variant="contained">Excluir</Button>
                </>
            }
        >
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Typography>Tem certeza que deseja excluir esta compra?</Typography>
            <Typography><strong>Produto:</strong> {item.nomeCompra}</Typography>
            <Typography><strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valorTotal)}</Typography>
            <Typography><strong>Data:</strong> {format(new Date(item.dataCompra), 'dd/MM/yyyy')}</Typography>
            <Typography><strong>Parcelas:</strong> {item.numeroTotalParcela}x</Typography>
            <Typography><strong>Cartão:</strong> {item.nomeCartao}</Typography>
        </Modal>
    );
} 