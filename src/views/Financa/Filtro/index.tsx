import { useEffect, useState, useContext } from "react";
import { Container } from "./styles";
import { api } from "../../../services/api";
import { FinancaContext } from "../../../contexts/FinancaContext";
import { DespesaContext } from "../../../contexts/DespesaContext";

export function Filtro() {

    const { buscarFinancas } = useContext(FinancaContext);
    const { buscarDespesa } = useContext(DespesaContext);

    interface Item {
        codigo: string,
        descricao: string
    };

    const [anoSelecionado, setAnoSelecionado] = useState('');
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [pessoaSelecionado, setPessoaSelecionado] = useState('');
    const [ultimaParcelaSelecionado, setUltimaParcelaSelecionado] = useState('');

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
        api.get('/v1/filtro/pessoas/'+ anoSelecionado + '/' + value)
        .then(response => setItemsPessoas(response.data));
    }

    function selecionarPessoa(value: string){
        setPessoaSelecionado(value);
    }

    function selecionarUltimaParcela(value: string){
        setUltimaParcelaSelecionado(value);
    }

    function findFunction(){
        buscarFinancas(anoSelecionado, mesSelecionado, pessoaSelecionado, ultimaParcelaSelecionado);
        buscarDespesa(anoSelecionado, mesSelecionado, pessoaSelecionado);
    }

    return (
        <>
            <Container>
                <label>Ano:{' '}
                    <select value={anoSelecionado} onChange={e => {selecionarAno(e.target.value)}} required>
                    <option>SELECIONE</option>
                        {itemsAnos?.map(item =>
                            <option value={item.codigo}>{item.descricao}</option>
                        )}
                    </select>
                </label>

                <label>Mês:{' '}
                    <select value={mesSelecionado} onChange={e => {selecionarMes(e.target.value)}} required>
                    <option>SELECIONE</option>
                        {itemsMeses?.map(item =>
                            <option value={item.codigo}>{item.descricao}</option>
                        )}
                    </select>
                </label>

                <label>Pessoa:{' '}
                    <select value={pessoaSelecionado} onChange={e => {selecionarPessoa(e.target.value)}} required>
                    <option>SELECIONE</option>
                        {itemsPessoas?.map(item =>
                            <option value={item.codigo}>{item.descricao}</option>
                        )}
                    </select>
                </label>

                <label>Última Parcela ?:{' '}
                    <select value={ultimaParcelaSelecionado} onChange={e => {selecionarUltimaParcela(e.target.value)}}>
                        <option>SELECIONE</option>
                        <option>SIM</option>
                        <option>NÃO</option>
                    </select>
                </label>

                <button onClick={findFunction}>Pesquisar</button>
            </Container>
        </>
    )
}