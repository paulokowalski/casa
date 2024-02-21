import { useEffect, useState, useContext } from "react";
import { Container } from "./styles";
import { api } from "../../../services/api";
import { FinancaContext } from "../../../contexts/FinancaContext";
import { DespesaContext } from "../../../contexts/DespesaContext";
import { Dropdown } from 'primereact/dropdown';
import Item from "../../../interface/Item";
import { Button } from "primereact/button";

const itemVazio: Item = { codigo: 'TODOS', descricao: 'TODOS' };

export function Filtro() {

    const { buscarFinancas } = useContext(FinancaContext);
    const { buscarDespesa } = useContext(DespesaContext);

    const [anoSelecionado, setAnoSelecionado] = useState<Item>();
    const [mesSelecionado, setMesSelecionado] = useState<Item>();
    const [pessoaSelecionado, setPessoaSelecionado] = useState<Item>();
    const [cartaoSelecionado, setCartaoSelecionado] = useState<Item>();
    const [ultimaParcelaSelecionado, setUltimaParcelaSelecionado] = useState<Item>();

    const [itemsAnos, setItemsAnos] = useState<Item[]>([]);
    const [itemsMeses, setItemsMeses] = useState<Item[]>([]);
    const [itemsPessoas, setItemsPessoas] = useState<Item[]>([]);
    const [itemsCartoes, setItemsCartoes] = useState<Item[]>([]);

    const itemsUltimaParcela : Item[] = [
        { codigo: 'SIM', descricao: 'SIM' },
        { codigo: 'NAO', descricao: 'NÃO' }
    ]

    itemsUltimaParcela.push(itemVazio);    

    useEffect(() => {
        api.get('/v1/filtro/anos')
        .then(response => setItemsAnos(response.data))
    }, []);

    function selecionarAno(item: Item){
        setAnoSelecionado(item);
        api.get('/v1/filtro/meses/'+ item.codigo)
        .then(response => setItemsMeses(response.data));
    }

    function selecionarMes(item: Item){
        setMesSelecionado(item);
        api.get('/v1/filtro/pessoas/'+ anoSelecionado?.codigo + '/' + item.codigo)
        .then(response => setItemsPessoas(response.data))
        .catch(err => console.log(err));
    }

    function selecionarPessoa(item: Item){
        setPessoaSelecionado(item);
        api.get('/v1/filtro/cartao/'+ anoSelecionado?.codigo + '/' + mesSelecionado?.codigo + '/' + item.codigo)
        .then(response => setItemsCartoes(response.data))
        .catch(err => console.log(err));
        itemsCartoes.push(itemVazio);
    }

    function selecionarCartao(item: Item) {
        setCartaoSelecionado(item);
    }

    function selecionarUltimaParcela(item: Item){
        setUltimaParcelaSelecionado(item);
    }

    function buscar(){
        if (
            anoSelecionado &&
            mesSelecionado &&
            pessoaSelecionado
        ) {
            buscarFinancas(
                anoSelecionado,
                mesSelecionado,
                pessoaSelecionado,
                cartaoSelecionado || itemVazio, // Se cartaoSelecionado for nulo, passa um objeto com código nulo
                ultimaParcelaSelecionado || itemVazio // Se ultimaParcelaSelecionado for nulo, passa um objeto com código nulo
            );
            buscarDespesa(anoSelecionado, mesSelecionado, pessoaSelecionado);
        }
    }

    return (
        <>
            <Container>
                <Dropdown options={itemsAnos} value={anoSelecionado} onChange={(e) => selecionarAno(e.value)} optionLabel="descricao" placeholder="Selecione o ano"/>
                <Dropdown options={itemsMeses} value={mesSelecionado} onChange={(e) => selecionarMes(e.value)} optionLabel="descricao" placeholder="Selecione o Mês"/>
                <Dropdown options={itemsPessoas} value={pessoaSelecionado} onChange={(e) => selecionarPessoa(e.value)} optionLabel="descricao" placeholder="Selecione Pessoa"/>
                <Dropdown options={itemsCartoes} value={cartaoSelecionado} onChange={(e) => selecionarCartao(e.value)} optionLabel="descricao" placeholder="Selecione Cartão"/>
                <Dropdown options={itemsUltimaParcela} value={ultimaParcelaSelecionado} onChange={(e) => selecionarUltimaParcela(e.value)} optionLabel="descricao" placeholder="Selecione Ultima Parcela"/>
                <Button label="Pesquisar" onClick={buscar}></Button>
            </Container>
        </>
    )
}