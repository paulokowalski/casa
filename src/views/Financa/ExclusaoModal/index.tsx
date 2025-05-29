import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Typography, 
    Box,
    Fab,
    Icon
} from '@mui/material';
import { format } from 'date-fns';
import { useContext } from 'react';
import { FinancaContext } from '../../../contexts/FinancaContext';

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
    const { excluirCompra } = useContext(FinancaContext);

    const handleConfirmarExclusao = async () => {
        if (item) {
            try {
                await excluirCompra(item.id);
                onSuccess();
            } catch (error) {
                console.error('Erro ao excluir transação:', error);
            }
        }
    };

    if (!item) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    position: 'relative',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    overflow: 'visible'
                }
            }}
        >
            <Box sx={{ position: 'absolute', right: -20, top: -20, zIndex: 1 }}>
                <Fab
                    size="small"
                    color="default"
                    onClick={onClose}
                    sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 2,
                        '&:hover': {
                            bgcolor: 'background.paper',
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s'
                        }
                    }}
                >
                    <Icon>close</Icon>
                </Fab>
            </Box>

            <DialogTitle sx={{ pb: 1, pt: 3 }}>
                <Typography variant="h5" component="div" fontWeight="500" color="error">
                    Confirmar Exclusão
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Você está prestes a excluir a seguinte transação:
                </Typography>
                
                <Box sx={{ 
                    mt: 2,
                    p: 2,
                    bgcolor: 'grey.50',
                    borderRadius: 2,
                    display: 'grid',
                    gap: 1
                }}>
                    <Typography><strong>Produto:</strong> {item.nomeCompra}</Typography>
                    <Typography>
                        <strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                        }).format(item.valorTotal)}
                    </Typography>
                    <Typography>
                        <strong>Data:</strong> {format(new Date(item.dataCompra), 'dd/MM/yyyy')}
                    </Typography>
                    <Typography><strong>Parcelas:</strong> {item.numeroTotalParcela}x</Typography>
                    <Typography><strong>Cartão:</strong> {item.nomeCartao}</Typography>
                </Box>

                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                    Esta ação não pode ser desfeita.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button 
                    onClick={onClose}
                    color="inherit"
                    size="large"
                    sx={{ 
                        minWidth: 100,
                        bgcolor: 'grey.100',
                        '&:hover': {
                            bgcolor: 'grey.200'
                        }
                    }}
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleConfirmarExclusao}
                    color="error"
                    size="large"
                    sx={{ 
                        minWidth: 100,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'error.dark'
                        }
                    }}
                >
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>
    );
} 