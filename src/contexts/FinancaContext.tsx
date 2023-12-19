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
    buscarFinancas: (ano: string, mes: string, pessoa: string, ultimaParcelaSelecionado: string) => void;
    cadastrarCompra: (nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) => void;
}

export const FinancaContext = createContext<FinancaContextData>(
    {} as FinancaContextData
);

export function FinancaProvider({ children }: Readonly<FinancaProviderProps>) {

    const [compras, setCompras] = useState<Compra[]>([]);
    const currentDate = new Date();

     // Adiciona um mês à data atual
    const nextMonthDate = addMonths(currentDate, 1);
    const month = format(nextMonthDate, 'MM');
    const year = format(nextMonthDate, 'yyyy');

    useEffect(() => {
        api.get('/v1/compra/'+year+'/'+month+'/paulo/SELECIONE')
        .then(response => {
            setCompras(response.data.compras);
        })
        
    }, []);

    function buscarFinancas(ano: string, mes: string, pessoa: string, ultimaParcelaSelecionado: string){
        api.get('/v1/compra/'+ano+'/'+mes+'/'+pessoa+'/'+ultimaParcelaSelecionado)
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
        })
        .then(response => console.log(response.data.compras))
    }

    return (
        <FinancaContext.Provider value={{compras, buscarFinancas, cadastrarCompra}}>
        { children }
        </FinancaContext.Provider>
    )
   
}