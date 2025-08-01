import { createContext, useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { API_URLS } from "../config/urls";
import Item from "../interface/Item";

interface CompraCartao {
    nomeCartao: string,
    valorTotal: number
}

interface Compra {
    id: string,
    dataParcela: string,
    dataCompra: string,
    nomeCompra: string,
    nomeCartao: string,
    nomePessoa: string,
    numeroParcela: number,
    numeroTotalParcela: number,
    ultimaParcela: string,
    valorFaltante: number,
    valorParcela: number,
    valorTotal: number,
    comprasCartao: CompraCartao[],
    categoria?: string
}

interface DadosGrafico {
    mes: string;
    valorMes: number;
}

interface ValorMesAPI {
    valorMes: number;
    valorProximoMes: number;
    valorSaindo: number;
    valorParcelaSaindo: number;
    valorSaindoTotal: number;
}

interface RespostaAPI {
    pessoa: string;
    ano: string;
    despesasPorMes: Record<string, ValorMesAPI>;
}

interface GestaoCartaoProviderProps {
    children: React.ReactNode;
}

interface Despesa {
    valorMes: number,
    valorProximoMes: number,
    valorSaindo: number,
    valorParcelaSaindo: number,
    valorSaindoTotal: number
}

interface GestaoCartaoContextData {
    compras: Compra[],
    chartData: any,
    ultimosFiltros: {
        ano: string;
        mes: string;
        pessoa: string;
        cartao: string;
        ultimaParcela: string;
    };
    loading: boolean;
    setLoading: (v: boolean) => void;
    
    itemsAnos: Item[];
    itemsMeses: Item[];
    itemsPessoas: Item[];
    itemsCartoes: Item[];
    loadingFiltros: boolean;
    
    anoSelecionado: string;
    mesSelecionado: string;
    pessoaSelecionado: string;
    cartaoSelecionado: string;
    ultimaParcelaSelecionado: string;
    
    dadosGrafico: DadosGrafico[];
    loadingGrafico: boolean;
    
    removerCompra: (idCompra: string) => void;
    consultar: (ano: string, mes: string, pessoa: string, cartao: string, ultimaParcelaSelecionado: string) => void;
    buscarGestaoCartao: (ano: Item, mes: Item, pessoa: Item, cartao: Item, ultimaParcelaSelecionado: Item) => void;
    cadastrarCompra: (nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) => void;
    editarCompra: (id: string, nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) => Promise<void>;
    excluirCompra: (id: string) => void;
    buscarDespesa: (ano: string, mes: string, pessoa: string) => void;
    
    carregarAnos: () => void;
    selecionarAno: (codigo: string) => void;
    selecionarMes: (codigo: string) => void;
    selecionarPessoa: (codigo: string) => void;
    selecionarCartao: (codigo: string) => void;
    selecionarUltimaParcela: (codigo: string) => void;
    buscar: () => void;
    
    carregarDadosGrafico: () => void;

    despesa: Despesa | undefined,
}

export const GestaoCartaoContext = createContext<GestaoCartaoContextData>(
    {} as GestaoCartaoContextData
);

export function GestaoCartaoProvider({ children }: Readonly<GestaoCartaoProviderProps>) {
    const [compras, setCompras] = useState<Compra[]>([]);
    const [chartData, setChartData] = useState(null);
    const [ultimosFiltros, setUltimosFiltros] = useState({
        ano: '',
        mes: '',
        pessoa: 'TODOS',
        cartao: 'TODOS',
        ultimaParcela: 'TODOS'
    });
    const [loading, setLoading] = useState(false);

    const [itemsAnos, setItemsAnos] = useState<Item[]>([]);
    const [itemsMeses, setItemsMeses] = useState<Item[]>([]);
    const [itemsPessoas, setItemsPessoas] = useState<Item[]>([]);
    const [itemsCartoes, setItemsCartoes] = useState<Item[]>([]);
    const [loadingFiltros, setLoadingFiltros] = useState(false);
    
    const [anoSelecionado, setAnoSelecionado] = useState('');
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [pessoaSelecionado, setPessoaSelecionado] = useState('');
    const [cartaoSelecionado, setCartaoSelecionado] = useState('');
    const [ultimaParcelaSelecionado, setUltimaParcelaSelecionado] = useState('TODOS');
    
    const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico[]>([]);
    const [loadingGrafico, setLoadingGrafico] = useState(false);

    const itemVazio: Item = { codigo: '', descricao: 'Selecione...' };
    const itemsUltimaParcela: Item[] = [
        { codigo: 'SIM', descricao: 'SIM' },
        { codigo: 'NAO', descricao: 'NÃO' },
        itemVazio
    ];

    const [despesa, setDespesa] = useState<Despesa>({
        valorMes: 0,
        valorProximoMes: 0,
        valorSaindo: 0,
        valorParcelaSaindo: 0,
        valorSaindoTotal: 0
    });

    const carregarAnos = useCallback(async () => {
        setLoadingFiltros(true);
        try {
            const response = await api.get(API_URLS.FILTRO_ANOS);
            setItemsAnos(response.data);
        } catch (error) {
            setItemsAnos([]);
        } finally {
            setLoadingFiltros(false);
        }
    }, []);

    const selecionarAno = useCallback(async (codigo: string) => {
        setAnoSelecionado(codigo);
        setLoadingFiltros(true);
        try {
            const response = await api.get(API_URLS.FILTRO_MESES(codigo));
            setItemsMeses(response.data);
        } catch (error) {
            setItemsMeses([]);
        } finally {
            setLoadingFiltros(false);
        }
    }, []);

    const selecionarMes = useCallback(async (codigo: string) => {
        setMesSelecionado(codigo);
        setLoadingFiltros(true);
        try {
            const response = await api.get(API_URLS.FILTRO_PESSOAS(anoSelecionado, codigo));
            setItemsPessoas(response.data);
            if (response.data.length > 0) {
                setPessoaSelecionado(response.data[0].codigo);
            }
        } catch (error) {
            setItemsPessoas([]);
        } finally {
            setLoadingFiltros(false);
        }
    }, [anoSelecionado]);

    const selecionarPessoa = useCallback(async (codigo: string) => {
        setPessoaSelecionado(codigo);
        setLoadingFiltros(true);
        try {
            const response = await api.get(API_URLS.FILTRO_CARTAO(anoSelecionado, mesSelecionado, codigo));
            setItemsCartoes([...response.data, itemVazio]);
        } catch (error) {
            setItemsCartoes([itemVazio]);
        } finally {
            setLoadingFiltros(false);
        }
    }, [anoSelecionado, mesSelecionado]);

    const selecionarCartao = useCallback((codigo: string) => {
        setCartaoSelecionado(codigo);
    }, []);

    const selecionarUltimaParcela = useCallback((codigo: string) => {
        setUltimaParcelaSelecionado(codigo);
    }, []);

    const buscar = useCallback(() => {
        if (anoSelecionado && mesSelecionado && pessoaSelecionado) {
            const anoItem = itemsAnos.find(i => i.codigo === anoSelecionado) || itemVazio;
            const mesItem = itemsMeses.find(i => i.codigo === mesSelecionado) || itemVazio;
            const pessoaItem = itemsPessoas.find(i => i.codigo === pessoaSelecionado) || itemVazio;
            const cartaoItem = itemsCartoes.find(i => i.codigo === cartaoSelecionado) || itemVazio;
            const ultimaParcelaItem = itemsUltimaParcela.find(i => i.codigo === ultimaParcelaSelecionado) || itemVazio;
            
            buscarGestaoCartao(anoItem, mesItem, pessoaItem, cartaoItem, ultimaParcelaItem);
            buscarDespesa(anoItem.codigo, mesItem.codigo, pessoaItem.codigo);
        }
    }, [anoSelecionado, mesSelecionado, pessoaSelecionado, cartaoSelecionado, ultimaParcelaSelecionado, itemsAnos, itemsMeses, itemsPessoas, itemsCartoes]);

    const carregarDadosGrafico = useCallback(async () => {
        if (
            ultimosFiltros.ano &&
            ultimosFiltros.pessoa &&
            ultimosFiltros.pessoa !== 'TODOS'
        ) {
            setLoadingGrafico(true);
            try {
                const response = await api.get(API_URLS.DESPESA_SEM_MES(ultimosFiltros.ano, ultimosFiltros.pessoa));
                const respostaAPI = response.data as RespostaAPI;
                if (respostaAPI.despesasPorMes) {
                    const dadosFormatados = Object.entries(respostaAPI.despesasPorMes)
                        .map(([chave, valorObj]) => ({
                            mes: chave.padStart(2, '0'),
                            valorMes: valorObj?.valorMes ?? 0
                        }))
                        .sort((a, b) => parseInt(a.mes) - parseInt(b.mes));
                    setDadosGrafico(dadosFormatados);
                } else {
                    setDadosGrafico([]);
                }
            } catch (error) {
                setDadosGrafico([]);
            } finally {
                setLoadingGrafico(false);
            }
        } else {
            setDadosGrafico([]);
        }
    }, [ultimosFiltros]);

    useEffect(() => {
        carregarAnos();
    }, [carregarAnos]);

    useEffect(() => {
        carregarDadosGrafico();
    }, [carregarDadosGrafico]);

    function buscarGestaoCartao(ano: Item, mes: Item, pessoa: Item, cartao: Item, ultimaParcelaSelecionado: Item) {
        const novosFiltros = {
            ano: ano.codigo,
            mes: mes.codigo,
            pessoa: pessoa.codigo,
            cartao: cartao.codigo,
            ultimaParcela: ultimaParcelaSelecionado.codigo
        };
        setUltimosFiltros(novosFiltros);
        consultar(
            novosFiltros.ano,
            novosFiltros.mes,
            novosFiltros.pessoa,
            novosFiltros.cartao,
            novosFiltros.ultimaParcela
        );
    }

    function consultar(ano: string, mes: string, pessoa: string, cartao: string, ultimaParcelaSelecionado: string) {
        const cartaoParam = !cartao || cartao === 'TODOS' ? 'TODOS' : cartao;
        const ultimaParcelaParam = !ultimaParcelaSelecionado || ultimaParcelaSelecionado === 'TODOS' ? 'TODOS' : ultimaParcelaSelecionado;
        setLoading(true);
        api.get(API_URLS.COMPRA(ano, mes, pessoa, cartaoParam, ultimaParcelaParam))
            .then(response => {
                setCompras(response.data.compras);
                setChartData(response.data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }

    async function cadastrarCompra(nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) {
        try {
            const response = await api.post(API_URLS.COMPRA_ID(), {
                nomeProduto,
                valorProduto: Number(valorProduto),
                dataCompra,
                numeroParcelas: Number(numeroParcelas),
                nomePessoaCompra,
                nomeCartao
            });
            if (response.status === 201) {
                consultar(
                    ultimosFiltros.ano,
                    ultimosFiltros.mes,
                    ultimosFiltros.pessoa,
                    ultimosFiltros.cartao,
                    ultimosFiltros.ultimaParcela
                );
            }
        } catch (error) {
        }
    }

    function removerCompra(idCompra: string){
        setCompras(prev => prev.filter(compra => compra.id !== idCompra));
    }

    function buscarDespesa(ano: string, mes: string, pessoa: string) {
        setLoading(true);
        api.get(API_URLS.DESPESA(ano, mes, pessoa))
        .then(response => setDespesa(response.data))
        .finally(() => setLoading(false));
    }    

    async function excluirCompra(id: string) {
        try {
            await api.delete(API_URLS.COMPRA_ID(id));
            consultar(
                ultimosFiltros.ano,
                ultimosFiltros.mes,
                ultimosFiltros.pessoa,
                ultimosFiltros.cartao,
                ultimosFiltros.ultimaParcela
            );
        } catch (error) {
        }
    }

    async function editarCompra(id: string, nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) {
        try {
            const response = await api.put(API_URLS.COMPRA_ID(id), {
                nomeProduto,
                valorProduto: Number(valorProduto),
                dataCompra,
                numeroParcelas: Number(numeroParcelas),
                nomePessoaCompra,
                nomeCartao
            });
            if (response.status === 200) {
                consultar(
                    ultimosFiltros.ano,
                    ultimosFiltros.mes,
                    ultimosFiltros.pessoa,
                    ultimosFiltros.cartao,
                    ultimosFiltros.ultimaParcela
                );
            }
        } catch (error) {
        }
    }

    return (
        <GestaoCartaoContext.Provider value={{
            compras,
            despesa,
            chartData,
            ultimosFiltros,
            loading,
            setLoading,
            
            itemsAnos,
            itemsMeses,
            itemsPessoas,
            itemsCartoes,
            loadingFiltros,
            
            anoSelecionado,
            mesSelecionado,
            pessoaSelecionado,
            cartaoSelecionado,
            ultimaParcelaSelecionado,
            
            dadosGrafico,
            loadingGrafico,
            
            removerCompra,
            consultar,
            buscarGestaoCartao,
            cadastrarCompra,
            editarCompra,
            excluirCompra,

            carregarAnos,
            selecionarAno,
            selecionarMes,
            selecionarPessoa,
            selecionarCartao,
            selecionarUltimaParcela,
            buscar,
            buscarDespesa,
            
            carregarDadosGrafico,
        }}>
            {children}
        </GestaoCartaoContext.Provider>
    );
}