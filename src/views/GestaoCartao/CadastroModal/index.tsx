import { useContext, useState, ChangeEvent } from "react";
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { usePessoa } from '../../../contexts/PessoaContext';
import { 
    Box, 
    TextField, 
    Button, 
    MenuItem,
    InputAdornment,
    Snackbar,
} from '@mui/material';
import { format } from 'date-fns';
import { Modal } from '../../../components/ui/Modal';
import { Alert as CustomAlert } from '../../../components/ui/Alert';

interface CadastroModalProps {
    open: boolean;
    onClose: () => void;
}

interface Pessoa {
    id: number;
    nome: string;
}

export function CadastroModal({ open, onClose }: CadastroModalProps) {
    const { cadastrarCompra, consultar } = useContext(GestaoCartaoContext);
    const [produto, setProduto] = useState('');
    const [valorProduto, setValorProduto] = useState('');
    const [dataCompra, setDataCompra] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [parcela, setParcela] = useState('1');
    const [pessoa, setPessoa] = useState('');
    const [cartao, setCartao] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const { pessoas } = usePessoa();

    const cartoes = [
        'VIRTUAL C6',
        'PAULO C6',
        'SABRINE C6',
        'INTER',
        'NUBANK',
        'AMAZON',
    ];

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

        const pessoaSelecionada = pessoas.find(p => p.nome === pessoa);
        const nomePessoa = pessoaSelecionada ? pessoaSelecionada.nome : pessoa;
        cadastrarCompra(
            produto.trim(),
            valor,
            dataFormatada,
            parcela,
            nomePessoa,
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
            <Modal
                open={open}
                onClose={onClose}
                title="Nova Transação"
                maxWidth="sm"
                actions={
                    <>
                        <Button onClick={onClose} color="secondary" variant="contained">
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} color="primary" variant="contained">
                            Cadastrar
                        </Button>
                    </>
                }
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
                        select
                        fullWidth
                        label="Pessoa"
                        value={pessoa}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPessoa(e.target.value)}
                        variant="outlined"
                        size="small"
                    >
                        {pessoas.map((p) => (
                            <MenuItem key={p.id} value={p.nome}>
                                {p.nome.toUpperCase()}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        fullWidth
                        label="Cartão"
                        value={cartao}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setCartao(e.target.value)}
                        variant="outlined"
                        size="small"
                    >
                        {cartoes.map((c) => (
                            <MenuItem key={c} value={c}>
                                {c.toUpperCase()}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>
            </Modal>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <CustomAlert 
                    onClose={handleCloseSnackbar} 
                    severity="success"
                >
                    Transação cadastrada com sucesso!
                </CustomAlert>
            </Snackbar>
        </>
    );
} 