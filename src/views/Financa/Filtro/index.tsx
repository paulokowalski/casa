import { useEffect, useState, useContext } from "react";
import { Container } from "./styles";
import { api } from "../../../services/api";
import { FinancaContext } from "../../../contexts/FinancaContext";
import { DespesaContext } from "../../../contexts/DespesaContext";
import Select from "../../../components/Select";

export function Filtro() {

    interface Item {
        codigo: string,
        descricao: string
    };

    const SELECIONE = 'SELECIONE';

    const { buscarFinancas } = useContext(FinancaContext);
    const { buscarDespesa } = useContext(DespesaContext);

    const [anoSelecionado, setAnoSelecionado] = useState(SELECIONE);
    const [mesSelecionado, setMesSelecionado] = useState(SELECIONE);
    const [pessoaSelecionado, setPessoaSelecionado] = useState(SELECIONE);
    const [cartaoSelecionado, setCartaoSelecionado] = useState(SELECIONE);
    const [ultimaParcelaSelecionado, setUltimaParcelaSelecionado] = useState(SELECIONE);

    const [itemsAnos, setItemsAnos] = useState<Item[]>([]);
    const [itemsMeses, setItemsMeses] = useState<Item[]>([]);
    const [itemsPessoas, setItemsPessoas] = useState<Item[]>([]);
    const [itemsCartoes, setItemsCartoes] = useState<Item[]>([]);

    useEffect(() => {
        api.get('/v1/filtro/anos')
        .then(response => setItemsAnos(response.data))
    }, []);

    function selecionarAno(value: string){
        setAnoSelecionado(value);
        setMesSelecionado(SELECIONE);
        setPessoaSelecionado(SELECIONE);
        setCartaoSelecionado(SELECIONE);
        api.get('/v1/filtro/meses/'+ value)
        .then(response => setItemsMeses(response.data));
    }

    function selecionarMes(value: string){
        setMesSelecionado(value);
        setPessoaSelecionado(SELECIONE);
        setCartaoSelecionado(SELECIONE);
        api.get('/v1/filtro/pessoas/'+ anoSelecionado + '/' + value)
        .then(response => setItemsPessoas(response.data));
    }

    function selecionarPessoa(value: string){
        setPessoaSelecionado(value);
        setCartaoSelecionado(SELECIONE);
        api.get('/v1/filtro/cartao/'+ anoSelecionado + '/' + mesSelecionado + '/' + value)
        .then(response => setItemsCartoes(response.data));
    }

    function selecionarCartao(value: string) {
        setCartaoSelecionado(value);
    }

    function selecionarUltimaParcela(value: string){
        setUltimaParcelaSelecionado(value);
    }

    function findFunction(){
        buscarFinancas(anoSelecionado, mesSelecionado, pessoaSelecionado, cartaoSelecionado, ultimaParcelaSelecionado);
        buscarDespesa(anoSelecionado, mesSelecionado, pessoaSelecionado);
    }

    return (
        <>
            <Container>
                <Select
                    label="Ano"
                    value={anoSelecionado}
                    onChange={selecionarAno}
                    items={itemsAnos}
                    required
                />
                <Select
                    label="Mês"
                    value={mesSelecionado}
                    onChange={selecionarMes}
                    items={itemsMeses}
                    required
                />
                <Select
                    label="Pessoa"
                    value={pessoaSelecionado}
                    onChange={selecionarPessoa}
                    items={itemsPessoas}
                    required
                />
                <Select
                    label="Cartão"
                    value={cartaoSelecionado}
                    onChange={selecionarCartao}
                    items={itemsCartoes}
                    required
                />
                <Select
                    label="Última Parcela ?"
                    value={ultimaParcelaSelecionado}
                    onChange={selecionarUltimaParcela}
                    options={['SIM', 'NÃO']}
                />

                <button  className="button" onClick={findFunction}>Pesquisar</button>
            </Container>
        </>
    )
}