import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";

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
    valorTotal: number
}

interface FinancaProviderProps {
    children: React.ReactNode;
}

interface FinancaContextData {
    compras: Compra[],
    buscarFinancas: (ano: string, mes: string, pessoa: string) => void;
}

export const FinancaContext = createContext<FinancaContextData>(
    {} as FinancaContextData
);

export function FinancaProvider({ children }: FinancaProviderProps) {

    const [compras, setCompras] = useState<Compra[]>([]);

    useEffect(() => {
        api.get('/v1/compra/11/mae')
        .then(response => setCompras(response.data.compras))
    }, []);

    function buscarFinancas(ano: string, mes: string, pessoa: string){
        api.get('/v1/compra/'+ano+'/'+mes+'/'+pessoa)
        .then(response => setCompras(response.data.compras))
    }

    return (
        <FinancaContext.Provider value={{compras, buscarFinancas}}>
        { children }
        </FinancaContext.Provider>
    )
    
}
