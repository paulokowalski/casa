import { createContext, useState } from "react";
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

interface GestaoCartaoProviderProps {
    children: React.ReactNode;
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
    removerCompra: (idCompra: string) => void;
    consultar: (ano: string, mes: string, pessoa: string, cartao: string, ultimaParcelaSelecionado: string) => void;
    buscarGestaoCartao: (ano: Item, mes: Item, pessoa: Item, cartao: Item, ultimaParcelaSelecionado: Item) => void;
    cadastrarCompra: (nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) => void;
    excluirCompra: (id: string) => void;
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
        api.get(API_URLS.COMPRA(ano, mes, pessoa, cartaoParam, ultimaParcelaParam))
            .then(response => {
                setCompras(response.data.compras);
                setChartData(response.data.data);
            });
    }

    function cadastrarCompra(nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string){
        api.post(API_URLS.COMPRA_ID(''),{
            nomeProduto: nomeProduto,
            valorProduto: valorProduto,
            dataCompra: dataCompra,
            numeroParcelas: numeroParcelas,
            nomePessoaCompra: nomePessoaCompra,
            nomeCartao: nomeCartao
        });
    }

    function removerCompra(idCompra: string){
        api.delete(API_URLS.COMPRA_ID(idCompra));
    }

    async function excluirCompra(id: string) {
        try {
            await api.delete(API_URLS.COMPRA_ID(id));
            const response = await api.get(
                API_URLS.COMPRA(ultimosFiltros.ano, ultimosFiltros.mes, ultimosFiltros.pessoa, ultimosFiltros.cartao, ultimosFiltros.ultimaParcela)
            );
            setCompras(response.data.compras);
            setChartData(response.data.data);
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    return (
        <GestaoCartaoContext.Provider value={{
            compras,
            chartData,
            ultimosFiltros,
            buscarGestaoCartao,
            cadastrarCompra,
            removerCompra,
            consultar,
            excluirCompra
        }}>
            {children}
        </GestaoCartaoContext.Provider>
    );
}