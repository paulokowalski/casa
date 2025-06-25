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
    loading: boolean;
    setLoading: (v: boolean) => void;
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

    const [loading, setLoading] = useState(false);

    function buscarDespesa(ano: Item, mes: Item, pessoa: Item) {
        setLoading(true);
        api.get(`/v1/despesa/${ano.codigo}/${mes.codigo}/${pessoa.codigo}`)
        .then(response => setDespesa(response.data))
        .finally(() => setLoading(false));
    }

    return (
        <DespesaContext.Provider value={{despesa, buscarDespesa, loading, setLoading}}>
            { children }
        </DespesaContext.Provider>
    )
}