import { createContext, useState } from "react";
import { api } from "../services/api";

interface Despesa {
    valorMes: number,
    valorProximoMes: number,
    valorSaindo: number
}

interface DespesaProviderProps {
    children: React.ReactNode;
}

interface DespesaContextData {
    despesa: Despesa | undefined,
    buscarDespesa: (ano: string, mes: string, pessoa: string) => void;
}

export const DespesaContext = createContext<DespesaContextData>(
    {} as DespesaContextData
);

export function DespesaProvider({ children }: Readonly<DespesaProviderProps>) {

    const [despesa, setDespesa] = useState<Despesa>();

    function buscarDespesa(ano: string, mes: string, pessoa: string) {
        api.get('/v1/despesa/'+ano+'/'+mes+'/'+pessoa)
        .then(response => setDespesa(response.data))
    }

    return (
        <DespesaContext.Provider value={{despesa, buscarDespesa}}>
            { children }
        </DespesaContext.Provider>
    )
    
}
