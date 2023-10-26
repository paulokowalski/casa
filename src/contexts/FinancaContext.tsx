import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";

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
    buscarFinancas: (ano: string, mes: string, pessoa: string) => void;
    cadastrarCompra: (nomeProduto: string, valorProduto: string, dataCompra: string, numeroParcelas: string, nomePessoaCompra: string, nomeCartao: string) => void;
}

export const FinancaContext = createContext<FinancaContextData>(
    {} as FinancaContextData
);

export function FinancaProvider({ children }: FinancaProviderProps) {

    const [compras, setCompras] = useState<Compra[]>([]);

    useEffect(() => {
        api.get('/v1/compra/2023/11/paulo')
        .then(response => {
            setCompras(response.data.compras);
            console.log(response.data);
        })
        
    }, []);

    function buscarFinancas(ano: string, mes: string, pessoa: string){
        api.get('/v1/compra/'+ano+'/'+mes+'/'+pessoa)
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
