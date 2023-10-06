import { useEffect, useState } from "react";
import { Container } from "./styles";
import { api } from "../../../services/api";

export function Filtro() {

    interface Item {
        codigo: string,
        descricao: string
    };

    const [anoSelecionado, setAnoSelecionado] = useState('');
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [pessoaSelecionado, setPessoaSelecionado] = useState('');

    const [itemsAnos, setItemsAnos] = useState<Item[]>([]);
    const [itemsMeses, setItemsMeses] = useState<Item[]>([]);
    const [itemsPessoas, setItemsPessoas] = useState<Item[]>([]);

    useEffect(() => {
        api.get('/v1/filtro/anos')
        .then(response => setItemsAnos(response.data))
    }, []);

    function selecionarAno(value: string){
        setAnoSelecionado(value);
        api.get('/v1/filtro/meses/'+ value)
        .then(response => setItemsMeses(response.data));
    }

    function selecionarMes(value: string){
        setMesSelecionado(value);
        api.get('/v1/filtro/pessoas/'+ anoSelecionado + '/' + mesSelecionado)
        .then(response => setItemsPessoas(response.data));
    }

    return (
        <>
            <Container>
                <select value={anoSelecionado} onChange={e => {selecionarAno(e.target.value)}}>
                    {itemsAnos?.map(item =>
                        <option value={item.codigo}>{item.descricao}</option>
                    )}
                </select>

                <select value={mesSelecionado} onChange={e => {selecionarMes(e.target.value)}}>
                    {itemsMeses?.map(item =>
                        <option value={item.codigo}>{item.descricao}</option>
                    )}
                </select>

                <select value={pessoaSelecionado} onChange={e => {setPessoaSelecionado(e.target.value)}}>
                    {itemsPessoas?.map(item =>
                        <option value={item.codigo}>{item.descricao}</option>
                    )}
                </select>
            </Container>
        </>
    )
}