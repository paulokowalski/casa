import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { format, addMonths } from 'date-fns';

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
    buscarFinancas: (ano: string, mes: string, pessoa: string, cartao: string, ultimaParcelaSelecionado: string) => void;
    cadastrarCompra: (nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) => void;
}

export const FinancaContext = createContext<FinancaContextData>(
    {} as FinancaContextData
);

export function FinancaProvider({ children }: Readonly<FinancaProviderProps>) {

    const [compras, setCompras] = useState<Compra[]>([]);

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

    function buscarFinancas(ano: string, mes: string, pessoa: string, cartao: string, ultimaParcelaSelecionado: string){
        api.get('/v1/compra/'+ano+'/'+mes+'/'+pessoa+'/'+cartao+'/'+ultimaParcelaSelecionado)
        .then(response => setCompras(response.data.compras))
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
        <FinancaContext.Provider value={{compras, buscarFinancas, cadastrarCompra}}>
        { children }
        </FinancaContext.Provider>
    )
   
}