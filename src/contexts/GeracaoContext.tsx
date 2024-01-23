import { createContext, useEffect, useState } from "react";
import { api } from "../services/api";
import { format } from 'date-fns';

interface Geracao {
    geracao: string,
    dataGeracao: string
}

interface GeracaoProviderProps {
    children: React.ReactNode;
}

interface GeracaoContextData {
    geracao: Geracao | undefined,
    geracaoMes: Geracao | undefined
}

export const GeracaoContext = createContext<GeracaoContextData>(
    {} as GeracaoContextData
);

export function GeracaoProvider({ children }: Readonly<GeracaoProviderProps>) {

    const [geracao, setGeracao] = useState<Geracao>();
    const [geracaoMes, setGeracaoMes] = useState<Geracao>();


    useEffect(() => {
        api.get('/v1/geracao')
        .then(response => {
            setGeracao(response.data);
        })

        const currentDate = new Date();
        const mes = format(currentDate, 'MM');

        console.log(mes);

        api.get('/v1/geracao/mestotal/'+mes)
        .then(response => {
            setGeracaoMes(response.data);
        })
    }, []);

    return (
        <GeracaoContext.Provider value={{ geracao, geracaoMes }}>
            { children }
        </GeracaoContext.Provider>
    )

}