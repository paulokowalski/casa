import { useContext, useState, ChangeEvent, useEffect } from "react";
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { usePessoa } from '../../../contexts/PessoaContext';
import { 
    TextField, 
    Button, 
    MenuItem
} from '@mui/material';
import { formatCurrency, parseCurrency, toISODate } from '../../../functions/global';
import { Modal } from '../../../components/ui/Modal';
import Item from '../../../interface/Item';

function resolveTipoLancamentoId(compra: Record<string, unknown>, tipos: Item[]): string {
    const id = compra.tipoLancamentoId;
    if (id != null && id !== '') {
        return String(id);
    }

    const candidatos = [compra.tipoLancamento, compra.nomeCartao].filter(Boolean);
    for (const valor of candidatos) {
        const texto = String(valor);
        const porCodigo = tipos.find((t) => String(t.codigo) === texto);
        if (porCodigo) return String(porCodigo.codigo);

        const porDescricao = tipos.find(
            (t) => t.descricao?.toUpperCase() === texto.toUpperCase()
        );
        if (porDescricao) return String(porDescricao.codigo);
    }

    return '';
}

function resolveCategoriaId(compra: Record<string, unknown>, categorias: Item[]): string {
    const id = compra.categoriaId;
    if (id != null && id !== '') {
        return String(id);
    }

    if (compra.categoria) {
        const porDescricao = categorias.find(
            (c) => c.descricao?.toUpperCase() === String(compra.categoria).toUpperCase()
        );
        if (porDescricao) return String(porDescricao.codigo);
    }

    return '';
}

interface CadastroModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    compra?: any; // Compra a ser editada (opcional)
    onEdit?: () => void; // Callback para sucesso na edição
}

export function CadastroModal({ open, onClose, onSuccess, compra, onEdit }: CadastroModalProps) {
    const { cadastrarCompra, editarCompra, itemsCategorias, itemsTiposLancamentos } = useContext(GestaoCartaoContext);
    const [produto, setProduto] = useState('');
    const [valorProduto, setValorProduto] = useState('');
    const [dataCompra, setDataCompra] = useState(getTodayISO());
    const [parcela, setParcela] = useState('1');
    const [pessoasSelecionadas, setPessoasSelecionadas] = useState<string[]>([]);
    const [categoriaId, setCategoriaId] = useState('');
    const [tipoLancamentoId, setTipoLancamentoId] = useState('');
    const [success, setSuccess] = useState(false);
    const { pessoas } = usePessoa();

    const tiposLancamentos = itemsTiposLancamentos;
    const categorias = itemsCategorias;

    // Preencher o formulário ao abrir para edição
    useEffect(() => {
        if (!open) return;

        if (compra) {
            setProduto(compra.nomeCompra || '');
            setValorProduto(
                formatCurrency(Number(compra.valorTotal || 0))
            );
            setDataCompra(compra.dataCompra ? toISODate(compra.dataCompra) : getTodayISO());
            setParcela(String(compra.numeroTotalParcela || '1'));
            setPessoasSelecionadas(
                compra.nomePessoa
                    ? compra.nomePessoa.split(',').map((p: string) => p.trim()).filter(Boolean)
                    : []
            );
            setTipoLancamentoId(resolveTipoLancamentoId(compra, itemsTiposLancamentos));
            setCategoriaId(resolveCategoriaId(compra, itemsCategorias));
        } else {
            setProduto('');
            setValorProduto('');
            setDataCompra(getTodayISO());
            setParcela('1');
            setPessoasSelecionadas([]);
            setTipoLancamentoId('');
            setCategoriaId('');
        }
        setSuccess(false);
    }, [compra, open, itemsTiposLancamentos, itemsCategorias]);

    function limparFormulario() {
        setProduto('');
        setValorProduto('');
        setDataCompra(getTodayISO());
        setParcela('1');
        setPessoasSelecionadas([]);
        setTipoLancamentoId('');
        setCategoriaId('');
    }

    async function handleSubmit() {
        const valor = parseCurrency(valorProduto);
        const dataFormatada = dataCompra;

        const nomesPessoasSelecionadas = pessoasSelecionadas
            .map((nome) => {
                const pessoaSelecionada = pessoas.find((p) => p.nome === nome);
                return pessoaSelecionada ? pessoaSelecionada.nome : nome;
            })
            .filter(Boolean);
        const nomePessoas = nomesPessoasSelecionadas.join(',');
        try {
            if (compra && compra.id) {
                // Edição
                await editarCompra(
                    compra.id,
                    produto.trim(),
                    String(valor),
                    dataFormatada,
                    parcela,
                    nomePessoas,
                    tipoLancamentoId,
                    categoriaId
                );
                setSuccess(true);
                if (onEdit) onEdit();
            } else {
                // Cadastro
                await cadastrarCompra(
                    produto.trim(),
                    String(valor),
                    dataFormatada,
                    parcela,
                    nomePessoas,
                    tipoLancamentoId,
                    categoriaId
                );
                setSuccess(true);
                if (onSuccess) onSuccess();
            }
        } catch (error: any) {
            setSuccess(false);
        }
    }

    const handleValorChange = (e: ChangeEvent<HTMLInputElement>) => {
        let valor = e.target.value;

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
                                value={pessoasSelecionadas}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPessoasSelecionadas(
                                        typeof value === 'string'
                                            ? value.split(',').map((p) => p.trim()).filter(Boolean)
                                            : value
                                    );
                                }}
                                fullWidth
                                SelectProps={{
                                    multiple: !compra,
                                    renderValue: (selected) =>
                                        Array.isArray(selected) ? selected.join(', ') : String(selected ?? '')
                                }}
                            >
                                {pessoas.map((p) => (
                                    <MenuItem key={p.id} value={p.nome}>{p.nome.toUpperCase()}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Tipo de Lançamento"
                                value={tipoLancamentoId}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setTipoLancamentoId(e.target.value)}
                                fullWidth
                            >
                                {tiposLancamentos.map((tl) => (
                                    <MenuItem key={tl.codigo} value={tl.codigo}>{tl.descricao.toUpperCase()}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                label="Categoria"
                                value={categoriaId}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setCategoriaId(e.target.value)}
                                fullWidth
                            >
                                {categorias.map((cat) => (
                                    <MenuItem key={cat.codigo} value={cat.codigo}>{cat.descricao}</MenuItem>
                                ))}
                            </TextField>
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
} 