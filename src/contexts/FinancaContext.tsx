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
    removerCompra: (idCompra: string) => void;
    consultar: (ano: string, mes: string, pessoa: string, cartao: string, ultimaParcelaSelecionado: string) => void;
    buscarFinancas: (ano: Item, mes: Item, pessoa: Item, cartao: Item, ultimaParcelaSelecionado: Item) => void;
    cadastrarCompra: (nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) => void;
}

export const FinancaContext = createContext<FinancaContextData>(
    {} as FinancaContextData
);

export function FinancaProvider({ children }: Readonly<FinancaProviderProps>) {

    const [compras, setCompras] = useState<Compra[]>([]);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const currentDate = new Date();
        const proximoMes = addMonths(currentDate, 1);
        const mes = format(proximoMes, 'MM');
        const ano = format(proximoMes, 'yyyy');
        consultar(ano, mes, 'paulo', 'SELECIONE', 'SELECIONE');        
    }, []);

    function buscarFinancas(ano: Item, mes: Item, pessoa: Item, cartao: Item, ultimaParcelaSelecionado: Item){
        consultar(ano.codigo, mes.codigo, pessoa.codigo, cartao.codigo, ultimaParcelaSelecionado.codigo);
    }

    function consultar(ano: string, mes: string, pessoa: string, cartao: string, ultimaParcelaSelecionado: string){
        api.get(`/v1/compra/${ano}/${mes}/${pessoa}/${cartao}/${ultimaParcelaSelecionado}`)
        .then(response => {
            setCompras(response.data.compras);
            setChartData(response.data.data);
        })
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

    return (
        <FinancaContext.Provider value={{compras, chartData, buscarFinancas, cadastrarCompra, removerCompra, consultar}}>
            { children }
        </FinancaContext.Provider>
    )
   
}