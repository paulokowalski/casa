import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { format, addMonths } from 'date-fns';
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

    const [despesa, setDespesa] = useState<Despesa>();
    const currentDate = new Date();

    // Adiciona um mês à data atual
    const proximoMes = addMonths(currentDate, 1);
    const mes = format(proximoMes, 'MM');
    const ano = format(proximoMes, 'yyyy');
    
    useEffect(() => {
        api.get('/v1/despesa/'+ano+'/'+mes+'/paulo')
        .then(response => {
            setDespesa(response.data);
        })        
    }, [ano, mes]);

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
