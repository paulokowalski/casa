import { createContext, useState } from "react";
import { api } from "../services/api";
import Item from "../interface/Item";

interface Despesa {
    valorMes: number,
    valorProximoMes: number,
    valorSaindo: number,
    valorParcelaSaindo: number,
    valorSaindoTotal: number
}

interface DespesaProviderProps {
    children: React.ReactNode;
}

interface DespesaContextData {
    despesa: Despesa | undefined,
    buscarDespesa: (ano: Item, mes: Item, pessoa: Item) => void;
}

export const DespesaContext = createContext<DespesaContextData>(
    {} as DespesaContextData
);

export function DespesaProvider({ children }: Readonly<DespesaProviderProps>) {

    const [despesa, setDespesa] = useState<Despesa>({
        valorMes: 0,
        valorProximoMes: 0,
        valorSaindo: 0,
        valorParcelaSaindo: 0,
        valorSaindoTotal: 0
    });

    function buscarDespesa(ano: Item, mes: Item, pessoa: Item) {
        api.get(`/v1/despesa/${ano.codigo}/${mes.codigo}/${pessoa.codigo}`)
        .then(response => setDespesa(response.data))
    }

    return (
        <DespesaContext.Provider value={{despesa, buscarDespesa}}>
            { children }
        </DespesaContext.Provider>
    )
}