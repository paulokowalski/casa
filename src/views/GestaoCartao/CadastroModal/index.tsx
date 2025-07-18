import { useContext, useState, ChangeEvent, useEffect } from "react";
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { usePessoa } from '../../../contexts/PessoaContext';
import { 
    Box, 
    TextField, 
    Button, 
    MenuItem,
    InputAdornment,
} from '@mui/material';
import { formatCurrency, parseCurrency, toISODate, formatCurrencyInput } from '../../../functions/global';
import { Modal } from '../../../components/ui/Modal';

interface CadastroModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    compra?: any; // Compra a ser editada (opcional)
    onEdit?: () => void; // Callback para sucesso na edição
}

export function CadastroModal({ open, onClose, onSuccess, compra, onEdit }: CadastroModalProps) {
    const { cadastrarCompra, editarCompra, consultar } = useContext(GestaoCartaoContext);
    const [produto, setProduto] = useState('');
    const [valorProduto, setValorProduto] = useState('');
    const [dataCompra, setDataCompra] = useState(getTodayISO());
    const [parcela, setParcela] = useState('1');
    const [pessoa, setPessoa] = useState('');
    const [cartao, setCartao] = useState('');
    const [success, setSuccess] = useState(false);
    const { pessoas } = usePessoa();
    const [valorEmEdicao, setValorEmEdicao] = useState(false);

    const cartoes = [
        'VIRTUAL C6',
        'PAULO C6',
        'SABRINE C6',
        'INTER',
        'NUBANK',
        'AMAZON',
    ];

    // Preencher o formulário ao abrir para edição
    useEffect(() => {
        if (compra) {
            setProduto(compra.nomeCompra || '');
            setValorProduto(
                formatCurrency(Number(compra.valorTotal || 0))
            );
            setDataCompra(compra.dataCompra ? toISODate(compra.dataCompra) : getTodayISO());
            setParcela(String(compra.numeroTotalParcela || '1'));
            setPessoa(compra.nomePessoa || '');
            setCartao(compra.nomeCartao || '');
        } else {
            setProduto('');
            setValorProduto('');
            setDataCompra(getTodayISO());
            setParcela('1');
            setPessoa('');
            setCartao('');
        }
        setSuccess(false);
    }, [compra, open]);

    function limparFormulario() {
        setProduto('');
        setValorProduto('');
        setDataCompra(getTodayISO());
        setParcela('1');
        setPessoa('');
        setCartao('');
    }

    async function handleSubmit() {
        const valor = parseCurrency(valorProduto);
        const dataFormatada = dataCompra;

        const pessoaSelecionada = pessoas.find(p => p.nome === pessoa);
        const nomePessoa = pessoaSelecionada ? pessoaSelecionada.nome : pessoa;
        try {
            if (compra && compra.id) {
                // Edição
                await editarCompra(
                    compra.id,
                    produto.trim(),
                    String(valor),
                    dataFormatada,
                    parcela,
                    nomePessoa,
                    cartao.trim()
                );
                consultar('2024', '06', pessoa, 'TODOS', 'TODOS');
                setSuccess(true);
                if (onEdit) onEdit();
            } else {
                // Cadastro
                await cadastrarCompra(
                    produto.trim(),
                    String(valor),
                    dataFormatada,
                    parcela,
                    nomePessoa,
                    cartao.trim()
                );
                consultar('2024', '06', pessoa, 'TODOS', 'TODOS');
                setSuccess(true);
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            setSuccess(false);
        }
    }

    const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
        let valor = e.target.value;
        // Permite apenas números e o sinal de menos no início
        valor = valor.replace(/(?!^-)[^\d]/g, '');
        let negativo = false;
        if (valor.startsWith('-')) {
            negativo = true;
            valor = valor.substring(1);
        }
        if (valor === '') {
            setValorProduto(negativo ? '-' : '');
            return;
        }
        let numero = parseInt(valor, 10);
        if (isNaN(numero)) numero = 0;
        let valorFormatado = (numero / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (negativo) valorFormatado = '-' + valorFormatado;
        setValorProduto(valorFormatado);
    };

    const handleValorBlur = () => {
        if (valorProduto === '' || valorProduto === '-') return;
        const num = parseFloat(valorProduto.replace(',', '.'));
        if (!isNaN(num)) setValorProduto((num < 0 ? '-' : '') + String(Math.abs(num)).replace('.', ','));
        setValorEmEdicao(false);
    };

    const handleValorFocus = () => {
        setValorEmEdicao(true);
    };

    const handleDataChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDataCompra(e.target.value);
    };

    const parcelasOptions = Array.from({ length: 24 }, (_, i) => i + 1);

    const handleCloseModal = () => {
        setSuccess(false);
        limparFormulario();
        onClose();
    };

    function getTodayISO() {
        return toISODate(new Date().toISOString());
    }

    return (
        <>
            <Modal
                open={open}
                onClose={handleCloseModal}
                title={compra ? 'Editar Transação' : 'Cadastrar Transação'}
                maxWidth="sm"
                actions={
                    <>
                        <Button onClick={handleCloseModal}>Cancelar</Button>
                        {!success && <Button onClick={handleSubmit} variant="contained">{compra ? 'Salvar' : 'Cadastrar'}</Button>}
                        {success && <Button onClick={handleCloseModal} variant="contained">OK</Button>}
                    </>
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                    {!success && (
                        <>
                            <TextField
                                label="Produto"
                                value={produto}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setProduto(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Valor Compra"
                                value={valorProduto}
                                onChange={handleValorChange}
                                fullWidth
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9,.\-]*' }}
                            />
                            <TextField
                                label="Data Compra"
                                value={dataCompra}
                                onChange={handleDataChange}
                                fullWidth
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ max: getTodayISO() }}
                            />
                            <TextField
                                select
                                label="Parcelas"
                                value={parcela}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setParcela(e.target.value)}
                                fullWidth
                            >
                                {parcelasOptions.map((num) => (
                                    <MenuItem key={num} value={num}>{num}x</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Pessoa"
                                value={pessoa}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setPessoa(e.target.value)}
                                fullWidth
                            >
                                {pessoas.map((p) => (
                                    <MenuItem key={p.id} value={p.nome}>{p.nome.toUpperCase()}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Cartão"
                                value={cartao}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCartao(e.target.value)}
                                fullWidth
                            >
                                {cartoes.map((c) => (
                                    <MenuItem key={c} value={c}>{c.toUpperCase()}</MenuItem>
                                ))}
                            </TextField>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
} 