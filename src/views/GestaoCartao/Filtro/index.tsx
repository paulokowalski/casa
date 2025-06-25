import { useEffect, useState, useContext } from "react";
import { api } from "../../../services/api";
import { API_URLS } from '../../../config/urls';
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { DespesaContext } from "../../../contexts/DespesaContext";
import Item from "../../../interface/Item";
import { Filter } from '../../../components/ui/Filter';
import { usePessoa } from '../../../contexts/PessoaContext';

const itemVazio: Item = { codigo: 'TODOS', descricao: 'TODOS' };

export function Filtro() {
    const { buscarGestaoCartao } = useContext(GestaoCartaoContext);
    const { buscarDespesa } = useContext(DespesaContext);
    const { pessoas } = usePessoa();
    const pessoasItem: Item[] = pessoas.map(p => ({ codigo: p.nome, descricao: p.nome }));

    const [anoSelecionado, setAnoSelecionado] = useState<string>('');
    const [mesSelecionado, setMesSelecionado] = useState<string>('');
    const [pessoaSelecionado, setPessoaSelecionado] = useState<string>('');
    const [cartaoSelecionado, setCartaoSelecionado] = useState<string>('');
    const [ultimaParcelaSelecionado, setUltimaParcelaSelecionado] = useState<string>('');

    const [itemsAnos, setItemsAnos] = useState<Item[]>([]);
    const [itemsMeses, setItemsMeses] = useState<Item[]>([]);
    const [itemsCartoes, setItemsCartoes] = useState<Item[]>([]);

    const itemsUltimaParcela: Item[] = [
        { codigo: 'SIM', descricao: 'SIM' },
        { codigo: 'NAO', descricao: 'NÃO' },
        itemVazio
    ];

    useEffect(() => {
        api.get(API_URLS.FILTRO_ANOS)
            .then(response => setItemsAnos(response.data))
    }, []);

    function selecionarAno(codigo: string) {
        setAnoSelecionado(codigo);
        api.get(API_URLS.FILTRO_MESES(codigo))
            .then(response => setItemsMeses(response.data));
    }

    function selecionarMes(codigo: string) {
        setMesSelecionado(codigo);
        api.get(API_URLS.FILTRO_PESSOAS(anoSelecionado, codigo))
            .then(response => setPessoaSelecionado(response.data[0].codigo));
    }

    function selecionarPessoa(codigo: string) {
        setPessoaSelecionado(codigo);
        api.get(API_URLS.FILTRO_CARTAO(anoSelecionado, mesSelecionado, codigo))
            .then(response => setItemsCartoes(response.data))
            .catch(() => {/* erro tratado */});
        setItemsCartoes(prev => [...prev, itemVazio]);
    }

    function selecionarCartao(codigo: string) {
        setCartaoSelecionado(codigo);
    }

    function selecionarUltimaParcela(codigo: string) {
        setUltimaParcelaSelecionado(codigo);
    }

    function buscar() {
        if (anoSelecionado && mesSelecionado && pessoaSelecionado) {
            buscarGestaoCartao(
                itemsAnos.find(i => i.codigo === anoSelecionado) || itemVazio,
                itemsMeses.find(i => i.codigo === mesSelecionado) || itemVazio,
                pessoasItem.find(i => i.codigo === pessoaSelecionado) || itemVazio,
                itemsCartoes.find(i => i.codigo === cartaoSelecionado) || itemVazio,
                itemsUltimaParcela.find(i => i.codigo === ultimaParcelaSelecionado) || itemVazio
            );
            buscarDespesa(
                itemsAnos.find(i => i.codigo === anoSelecionado) || itemVazio,
                itemsMeses.find(i => i.codigo === mesSelecionado) || itemVazio,
                pessoasItem.find(i => i.codigo === pessoaSelecionado) || itemVazio
            );
        }
    }

    const fields = [
        {
            id: 'ano',
            label: 'Ano',
            type: 'select' as const,
            value: anoSelecionado,
            onChange: selecionarAno,
            options: itemsAnos.map(item => ({ value: item.codigo, label: item.descricao })),
        },
        {
            id: 'mes',
            label: 'Mês',
            type: 'select' as const,
            value: mesSelecionado,
            onChange: selecionarMes,
            options: itemsMeses.map(item => ({ value: item.codigo, label: item.descricao })),
        },
        {
            id: 'pessoa',
            label: 'Pessoa',
            type: 'select' as const,
            value: pessoaSelecionado,
            onChange: selecionarPessoa,
            options: pessoasItem.map(item => ({ value: item.codigo, label: item.descricao })),
        },
        {
            id: 'cartao',
            label: 'Cartão',
            type: 'select' as const,
            value: cartaoSelecionado,
            onChange: selecionarCartao,
            options: itemsCartoes.map(item => ({ value: item.codigo, label: item.descricao })),
        },
        {
            id: 'ultimaParcela',
            label: 'Última Parcela',
            type: 'select' as const,
            value: ultimaParcelaSelecionado,
            onChange: selecionarUltimaParcela,
            options: itemsUltimaParcela.map(item => ({ value: item.codigo, label: item.descricao })),
        },
    ];

    return (
        <Filter fields={fields} onFilter={buscar} filterLabel="Pesquisar" />
    );
}