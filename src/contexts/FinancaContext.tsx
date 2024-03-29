import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { format, addMonths } from 'date-fns';
import Item from "../interface/Item";

interface CompraCartao {
    nomeCartao: string,
    valorTotal: number
}

interface Compra {
    dataParcela: string,
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

        api.get('/v1/compra/'+ano+'/'+mes+'/paulo/SELECIONE/SELECIONE')
        .then(response => {
            setCompras(response.data.compras);
        })
        
    }, []);

    function buscarFinancas(ano: Item, mes: Item, pessoa: Item, cartao: Item, ultimaParcelaSelecionado: Item){
        api.get(`/v1/compra/${ano.codigo}/${mes.codigo}/${pessoa.codigo}/${cartao.codigo}/${ultimaParcelaSelecionado.codigo}`)
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

    return (
        <FinancaContext.Provider value={{compras, chartData, buscarFinancas, cadastrarCompra}}>
        { children }
        </FinancaContext.Provider>
    )
   
}