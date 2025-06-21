import { useContext, useState, ChangeEvent } from "react";
import { FinancaContext } from "../../../contexts/FinancaContext";
import { 
    Box, 
    TextField, 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    Typography,
    Icon,
    Fab,
    MenuItem,
    InputAdornment,
    Snackbar,
    Alert,
} from '@mui/material';
import { format } from 'date-fns';

interface CadastroModalProps {
    open: boolean;
    onClose: () => void;
}

export function CadastroModal({ open, onClose }: CadastroModalProps) {
    const { cadastrarCompra, consultar } = useContext(FinancaContext);
    const [produto, setProduto] = useState('');
    const [valorProduto, setValorProduto] = useState('');
    const [dataCompra, setDataCompra] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [parcela, setParcela] = useState('1');
    const [pessoa, setPessoa] = useState('');
    const [cartao, setCartao] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);

    function limparFormulario() {
        setProduto('');
        setValorProduto('');
        setDataCompra(format(new Date(), 'yyyy-MM-dd'));
        setParcela('1');
        setPessoa('');
        setCartao('');
    }

    const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    function handleSubmit() {
        const valorNumerico = valorProduto.replace(/[R$\s.]/g, '').replace(',', '.');
        const valor = valorNumerico;
        const dataFormatada = format(new Date(dataCompra), 'yyyy-MM-dd');

        cadastrarCompra(
            produto.trim(),
            valor,
            dataFormatada,
            parcela,
            pessoa.trim(),
            cartao.trim()
        );
        
        consultar('2024', '06', pessoa, 'TODOS', 'TODOS');
        limparFormulario();
        setOpenSnackbar(true);
        onClose();
    }

    const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
        let valor = e.target.value.replace(/\D/g, '');
        valor = (Number(valor) / 100).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        setValorProduto(valor);
    };

    const handleDataChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDataCompra(e.target.value);
    };

    const parcelasOptions = Array.from({ length: 24 }, (_, i) => i + 1);

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                maxWidth="md"
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

                <DialogTitle sx={{ 
                    pb: 1,
                    pt: 3,
                }}>
                    <Typography variant="h5" component="div" fontWeight="500">
                        Nova Transação
                    </Typography>
                </DialogTitle>

                <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                        gap: { xs: 1, md: 2 },
                        mt: 1,
                        width: '100%',
                    }}>
                        <TextField
                            fullWidth
                            label="Produto"
                            value={produto}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setProduto(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            fullWidth
                            label="Valor Compra"
                            value={valorProduto}
                            onChange={handleValorChange}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Data Compra"
                            value={dataCompra}
                            onChange={handleDataChange}
                            variant="outlined"
                            size="small"
                            type="date"
                            InputLabelProps={{ 
                                shrink: true,
                                sx: { color: 'rgba(0, 0, 0, 0.6)' }
                            }}
                            inputProps={{
                                max: format(new Date(), 'yyyy-MM-dd')
                            }}
                            sx={{
                                '& input::-webkit-calendar-picker-indicator': {
                                    cursor: 'pointer'
                                }
                            }}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Parcelas"
                            value={parcela}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setParcela(e.target.value)}
                            variant="outlined"
                            size="small"
                        >
                            {parcelasOptions.map((num) => (
                                <MenuItem key={num} value={num}>
                                    {num}x
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="Pessoa"
                            value={pessoa}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setPessoa(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                        <TextField
                            fullWidth
                            label="Cartão"
                            value={cartao}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCartao(e.target.value)}
                            variant="outlined"
                            size="small"
                        />
                    </Box>
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
                        onClick={handleSubmit}
                        color="primary"
                        size="large"
                        sx={{ 
                            minWidth: 100,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            }
                        }}
                    >
                        Cadastrar
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity="success" 
                    variant="filled"
                    sx={{ 
                        width: '100%',
                        bgcolor: 'primary.main',
                        '& .MuiAlert-icon': {
                            color: 'white'
                        }
                    }}
                >
                    Transação cadastrada com sucesso!
                </Alert>
            </Snackbar>
        </>
    );
} 