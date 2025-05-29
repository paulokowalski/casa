import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { format, addMonths } from 'date-fns';
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
    comprasCartao: CompraCartao[]
}

interface FinancaProviderProps {
    children: React.ReactNode;
}

interface FinancaContextData {
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
    buscarFinancas: (ano: Item, mes: Item, pessoa: Item, cartao: Item, ultimaParcelaSelecionado: Item) => void;
    cadastrarCompra: (nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) => void;
    excluirCompra: (id: string) => void;
}

export const FinancaContext = createContext<FinancaContextData>(
    {} as FinancaContextData
);

export function FinancaProvider({ children }: Readonly<FinancaProviderProps>) {
    const [compras, setCompras] = useState<Compra[]>([]);
    const [chartData, setChartData] = useState(null);
    const [ultimosFiltros, setUltimosFiltros] = useState({
        ano: '',
        mes: '',
        pessoa: 'TODOS',
        cartao: 'TODOS',
        ultimaParcela: 'TODOS'
    });

    useEffect(() => {
        const currentDate = new Date();
        const proximoMes = addMonths(currentDate, 1);
        const mes = format(proximoMes, 'MM');
        const ano = format(proximoMes, 'yyyy');
        consultar(ano, mes, 'paulo', 'SELECIONE', 'SELECIONE');
        setUltimosFiltros({
            ano,
            mes,
            pessoa: 'paulo',
            cartao: 'SELECIONE',
            ultimaParcela: 'SELECIONE'
        });
    }, []);

    function buscarFinancas(ano: Item, mes: Item, pessoa: Item, cartao: Item, ultimaParcelaSelecionado: Item) {
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
        api.get(`/v1/compra/${ano}/${mes}/${pessoa}/${cartao}/${ultimaParcelaSelecionado}`)
            .then(response => {
                setCompras(response.data.compras);
                setChartData(response.data.data);
            });
    }

    function cadastrarCompra(nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string){
        api.post('/v1/compra',{
            nomeProduto: nomeProduto,
            valorProduto: valorProduto,
            dataCompra: dataCompra,
            numeroParcelas: numeroParcelas,
            nomePessoaCompra: nomePessoaCompra,
            nomeCartao:nomeCartao
        });
    }

    function removerCompra(idCompra: String){
        api.delete(`/v1/compra/${idCompra}`)
    }

    async function excluirCompra(id: string) {
        try {
            await api.delete(`/v1/compra/${id}`);
            const response = await api.get(
                `/v1/compra/${ultimosFiltros.ano}/${ultimosFiltros.mes}/${ultimosFiltros.pessoa}/${ultimosFiltros.cartao}/${ultimosFiltros.ultimaParcela}`
            );
            setCompras(response.data.compras);
            setChartData(response.data.data);
            return Promise.resolve();
        } catch (error) {
            console.error('Erro ao excluir compra:', error);
            return Promise.reject(error);
        }
    }

    return (
        <FinancaContext.Provider value={{
            compras,
            chartData,
            ultimosFiltros,
            buscarFinancas,
            cadastrarCompra,
            removerCompra,
            consultar,
            excluirCompra
        }}>
            {children}
        </FinancaContext.Provider>
    );
}